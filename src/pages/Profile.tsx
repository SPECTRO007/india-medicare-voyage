import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Upload, FileText, Trash2, Download, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MedicalDocument {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  record_type: string;
  description: string;
  created_at: string;
}

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    country: '',
    country_code: '+1'
  });
  
  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  // Document upload
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        country: profile.country || '',
        country_code: profile.country_code || '+1'
      });
      setAvatarPreview(profile.avatar_url || '');
    }
    
    fetchDocuments();
  }, [user, profile, navigate]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('uploaded_by', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let avatarUrl = profile?.avatar_url;
      
      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('profile-images')
          .upload(fileName, avatarFile, { upsert: true });
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('profile-images')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          country: formData.country,
          country_code: formData.country_code,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });
      
      setAvatarFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Avatar must be less than 5MB",
        });
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentFile || !user) return;
    
    setUploading(true);
    
    try {
      // Upload to medical-records bucket
      const fileExt = documentFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${documentFile.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-records')
        .upload(fileName, documentFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('medical-records')
        .getPublicUrl(fileName);
      
      // Create a temporary consultation for standalone medical records
      let consultationId = null;
      const { data: tempConsultation, error: consultError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          doctor_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          status: 'pending',
          medical_condition: 'General medical record'
        })
        .select()
        .single();
      
      if (consultError) throw consultError;
      consultationId = tempConsultation.id;
      
      // Save document metadata
      const { error: dbError } = await supabase
        .from('medical_records')
        .insert({
          consultation_id: consultationId,
          uploaded_by: user.id,
          file_name: documentFile.name,
          file_type: documentFile.type,
          file_size: documentFile.size,
          file_url: publicUrl,
          record_type: documentType,
          description: documentDescription
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Document Uploaded",
        description: "Your medical document has been uploaded successfully",
      });
      
      // Reset form
      setDocumentFile(null);
      setDocumentType('');
      setDocumentDescription('');
      (document.getElementById('document-upload') as HTMLInputElement).value = '';
      
      // Refresh documents
      fetchDocuments();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: string, fileUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/medical-records/');
      const filePath = urlParts[1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('medical-records')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', documentId);
      
      if (dbError) throw dbError;
      
      toast({
        title: "Document Deleted",
        description: "Document has been removed successfully",
      });
      
      fetchDocuments();
    } catch (error: any) {
      console.error('Error deleting document:', error);
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message || "Failed to delete document",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and medical documents</p>
      </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">
            <User className="h-4 w-4 mr-2" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Medical Documents
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-2xl">
                      {formData.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-center gap-2">
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:opacity-90 transition-opacity">
                        <Upload className="h-4 w-4" />
                        Change Photo
                      </div>
                      <Input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">Max size: 5MB</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="country-code"
                        value={formData.country_code}
                        onChange={(e) => setFormData({ ...formData, country_code: e.target.value })}
                        className="w-20"
                        placeholder="+1"
                      />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Phone number"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Your country"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="w-full md:w-auto">
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Documents Tab */}
        <TabsContent value="documents">
          <div className="space-y-6">
            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Medical Document</CardTitle>
                <CardDescription>Upload medical reports, prescriptions, or other health documents</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDocumentUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="document-upload">Select File (PDF, Images, etc.)</Label>
                    <Input
                      id="document-upload"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Input
                      id="document-type"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      placeholder="e.g., Blood Test, X-Ray, Prescription"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="document-description">Description (Optional)</Label>
                    <Textarea
                      id="document-description"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      placeholder="Add any notes about this document"
                      rows={3}
                    />
                  </div>

                  <Button type="submit" disabled={uploading || !documentFile}>
                    {uploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card>
              <CardHeader>
                <CardTitle>My Medical Documents</CardTitle>
                <CardDescription>All your uploaded medical documents</CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No documents uploaded yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="h-8 w-8 text-primary" />
                          <div className="flex-1">
                            <h4 className="font-medium">{doc.file_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {doc.record_type} • {formatFileSize(doc.file_size)}
                            </p>
                            {doc.description && (
                              <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              Uploaded {new Date(doc.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(doc.file_url, '_blank')}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id, doc.file_url)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled className="bg-muted" />
              </div>
              
              <div className="space-y-2">
                <Label>Account Created</Label>
                <Input 
                  value={user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''} 
                  disabled 
                  className="bg-muted" 
                />
              </div>

              <div className="pt-4">
                <p className="text-sm text-muted-foreground mb-4">
                  To change your password, you'll need to reset it via email.
                </p>
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const { error } = await supabase.auth.resetPasswordForEmail(
                        user?.email || '',
                        { redirectTo: `${window.location.origin}/auth` }
                      );
                      
                      if (error) throw error;
                      
                      toast({
                        title: "Email Sent",
                        description: "Check your email for password reset instructions",
                      });
                    } catch (error: any) {
                      toast({
                        variant: "destructive",
                        title: "Error",
                        description: error.message,
                      });
                    }
                  }}
                >
                  Request Password Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
