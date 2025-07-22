import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Calendar,
  Clock,
  Upload,
  MessageCircle,
  Video,
  Phone,
  FileText,
  User,
  Stethoscope,
  MapPin
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Consultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchConsultations();
  }, [user, navigate]);

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select(`
          *,
          doctors (name, specialization, hospital),
          treatments (title)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations(data || []);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleFileUpload = async (consultationId) => {
    if (!selectedFile) return;

    setUploadingReport(true);
    try {
      // Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${user.id}/${consultationId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-reports')
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Update consultation with report URL
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ 
          report_url: fileName,
          notes: notes 
        })
        .eq('id', consultationId);

      if (updateError) throw updateError;

      toast({
        title: "Report Uploaded",
        description: "Your medical report has been uploaded successfully."
      });

      fetchConsultations();
      setSelectedFile(null);
      setNotes('');
    } catch (error) {
      console.error('Error uploading report:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploadingReport(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">My Consultations</h1>
        <p className="text-muted-foreground">
          Manage your appointments and communicate with doctors
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{consultations.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {consultations.filter(c => c.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
                <p className="text-2xl font-bold text-green-600">
                  {consultations.filter(c => c.status === 'confirmed').length}
                </p>
              </div>
              <User className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-blue-600">
                  {consultations.filter(c => c.status === 'completed').length}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultations List */}
      <div className="space-y-6">
        {consultations.length > 0 ? (
          consultations.map((consultation) => (
            <Card key={consultation.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl">{consultation.doctors?.name}</CardTitle>
                      <Badge className={getStatusColor(consultation.status)}>
                        {consultation.status}
                      </Badge>
                    </div>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        <span>{consultation.doctors?.specialization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{consultation.doctors?.hospital}</span>
                      </div>
                      {consultation.treatments && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Treatment: {consultation.treatments.title}</span>
                        </div>
                      )}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(consultation.consultation_date)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Booked on {new Date(consultation.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {consultation.notes && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <h4 className="font-medium mb-2">Notes:</h4>
                    <p className="text-sm text-muted-foreground">{consultation.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {consultation.status === 'confirmed' && (
                    <>
                      <Button size="sm" className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        Join Video Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        Voice Call
                      </Button>
                    </>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Chat
                  </Button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        Upload Report
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Medical Report</DialogTitle>
                        <DialogDescription>
                          Share your medical reports with Dr. {consultation.doctors?.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="report-file">Medical Report</Label>
                          <Input
                            id="report-file"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setSelectedFile(e.target.files[0])}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Supported formats: PDF, JPG, PNG (Max 10MB)
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="notes">Additional Notes (Optional)</Label>
                          <Textarea
                            id="notes"
                            placeholder="Add any additional information about your condition..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                          />
                        </div>
                        <Button 
                          onClick={() => handleFileUpload(consultation.id)}
                          disabled={!selectedFile || uploadingReport}
                          className="w-full"
                        >
                          {uploadingReport ? 'Uploading...' : 'Upload Report'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {consultation.report_url && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Report Uploaded
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No consultations yet</h3>
              <p className="text-muted-foreground mb-4">
                Book your first consultation with a verified doctor
              </p>
              <Button onClick={() => navigate('/doctors')}>
                Find Doctors
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}