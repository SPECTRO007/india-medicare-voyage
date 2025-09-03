import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Camera, Upload, FileText, ArrowLeft, CheckCircle } from 'lucide-react';
import { countries } from '@/data/countries';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PassportVerification = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [passportFile, setPassportFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [passportPreview, setPassportPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    passportNumber: '',
    passportCountry: '',
    passportExpiry: '',
  });
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'passport' | 'selfie'
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      if (type === 'passport') {
        setPassportFile(file);
        setPassportPreview(preview);
      } else {
        setSelfieFile(file);
        setSelfiePreview(preview);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadToStorage = async (file: File, type: 'passport' | 'selfie') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${user?.id}/${type}_${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('passport-documents')
      .upload(fileName, file);

    if (error) throw error;
    return data.path;
  };

  const handleSubmitVerification = async () => {
    if (!passportFile || !selfieFile) {
      toast.error('Please upload both passport and selfie images');
      return;
    }

    if (!formData.passportNumber || !formData.passportCountry || !formData.passportExpiry) {
      toast.error('Please fill in all passport details');
      return;
    }

    setLoading(true);
    try {
      // Upload files
      const [passportPath, selfiePath] = await Promise.all([
        uploadToStorage(passportFile, 'passport'),
        uploadToStorage(selfieFile, 'selfie'),
      ]);

      // Get public URLs
      const { data: passportUrl } = supabase.storage
        .from('passport-documents')
        .getPublicUrl(passportPath);
      
      const { data: selfieUrl } = supabase.storage
        .from('passport-documents')
        .getPublicUrl(selfiePath);

      // Insert verification record
      const { data, error } = await supabase
        .from('passport_verifications')
        .insert({
          user_id: user?.id,
          passport_image_url: passportUrl.publicUrl,
          selfie_image_url: selfieUrl.publicUrl,
          passport_number: formData.passportNumber,
          passport_country: formData.passportCountry,
          passport_expiry: formData.passportExpiry,
        })
        .select()
        .single();

      if (error) throw error;

      setVerificationId(data.id);
      setStep(3);
      toast.success('Passport verification submitted successfully!');
    } catch (error) {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!reportRef.current) return;

    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`passport-verification-${verificationId}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  const handleProceedToPayment = () => {
    // Navigate to payment page with verification ID
    navigate('/payment', { state: { verificationId } });
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Passport Verification
          </h1>
          <p className="text-muted-foreground">
            Please upload your passport and a selfie for verification. This is required before proceeding to payment.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 space-x-2 sm:space-x-4">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`w-8 sm:w-16 h-1 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Upload clear photos of your passport and a selfie
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Passport Upload */}
              <div className="space-y-2">
                <Label htmlFor="passport">Passport Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {passportPreview ? (
                    <div className="space-y-4">
                      <img
                        src={passportPreview}
                        alt="Passport preview"
                        className="max-w-full h-48 object-contain mx-auto rounded"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setPassportFile(null);
                          setPassportPreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload passport photo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                      <Input
                        id="passport"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'passport')}
                        className="hidden"
                      />
                      <Label htmlFor="passport">
                        <Button variant="outline" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Selfie Upload */}
              <div className="space-y-2">
                <Label htmlFor="selfie">Selfie Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  {selfiePreview ? (
                    <div className="space-y-4">
                      <img
                        src={selfiePreview}
                        alt="Selfie preview"
                        className="max-w-full h-48 object-contain mx-auto rounded"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelfieFile(null);
                          setSelfiePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Upload selfie photo</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                      </div>
                      <Input
                        id="selfie"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'selfie')}
                        className="hidden"
                      />
                      <Label htmlFor="selfie">
                        <Button variant="outline" asChild>
                          <span>Choose File</span>
                        </Button>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!passportFile || !selfieFile}
                className="w-full"
              >
                Next: Passport Details
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Passport Details</CardTitle>
              <CardDescription>
                Enter your passport information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    value={formData.passportNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, passportNumber: e.target.value })
                    }
                    placeholder="Enter passport number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportCountry">Issuing Country</Label>
                  <Select
                    value={formData.passportCountry}
                    onValueChange={(value) =>
                      setFormData({ ...formData, passportCountry: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="passportExpiry">Expiry Date</Label>
                  <Input
                    id="passportExpiry"
                    type="date"
                    value={formData.passportExpiry}
                    onChange={(e) =>
                      setFormData({ ...formData, passportExpiry: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Back
                </Button>
                <Button
                  onClick={handleSubmitVerification}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Submitting...' : 'Submit Verification'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-success">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  Verification Submitted!
                </CardTitle>
                <CardDescription className="text-center">
                  Your passport verification has been submitted and is under review.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  Verification ID: <span className="font-mono">{verificationId}</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={generatePDF} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF Report
                  </Button>
                  <Button onClick={handleProceedToPayment}>
                    Proceed to Payment
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* PDF Report Content (Hidden) */}
            <div ref={reportRef} className="hidden">
              <div className="p-8 bg-white text-black">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold mb-2">Passport Verification Report</h1>
                  <p className="text-gray-600">MedGlobal - Medical Tourism Platform</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold mb-4">Passport Document</h3>
                    {passportPreview && (
                      <img
                        src={passportPreview}
                        alt="Passport"
                        className="w-full h-48 object-contain border"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-4">Identity Verification</h3>
                    {selfiePreview && (
                      <img
                        src={selfiePreview}
                        alt="Selfie"
                        className="w-full h-48 object-contain border"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Passport Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Passport Number:</span> {formData.passportNumber}
                    </div>
                    <div>
                      <span className="font-medium">Issuing Country:</span> {formData.passportCountry}
                    </div>
                    <div>
                      <span className="font-medium">Expiry Date:</span> {formData.passportExpiry}
                    </div>
                    <div>
                      <span className="font-medium">Verification ID:</span> {verificationId}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t text-xs text-gray-500">
                  <p>Generated on: {new Date().toLocaleString()}</p>
                  <p>© 2024 MedGlobal. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportVerification;