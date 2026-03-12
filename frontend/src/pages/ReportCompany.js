import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { complaintAPI } from '../utils/api';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const ReportCompany = () => {
  const [formData, setFormData] = useState({
    company_name: '',
    complainant_name: '',
    complainant_email: '',
    complainant_phone: '',
    state: '',
    date_of_service: '',
    complaint_details: '',
    person_spoke_to: '',
    complaint_types: [],
    screenshots: [],
    audio_recordings: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      complaint_types: checked
        ? [...prev.complaint_types, value]
        : prev.complaint_types.filter(type => type !== value)
    }));
  };

  const handleFileUpload = async (e, fieldName) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const base64Files = [];
      
      for (const file of files) {
        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Convert to base64
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        base64Files.push(base64);
      }

      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], ...base64Files]
      }));

      toast.success(`${files.length} file(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload files');
      console.error('File upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await complaintAPI.submit(formData);
      toast.success('Thank you! Your complaint has been submitted successfully.');
      setSubmitted(true);
      setFormData({
        company_name: '',
        complainant_name: '',
        complainant_email: '',
        complainant_phone: '',
        state: '',
        date_of_service: '',
        complaint_details: '',
        person_spoke_to: '',
        complaint_types: [],
        screenshots: [],
        audio_recordings: []
      });
    } catch (error) {
      toast.error('Failed to submit complaint. Please try again.');
      console.error('Complaint submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-secondary-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-secondary-green" />
            </div>
            <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4">
              Complaint Submitted Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for reporting this company. We take consumer protection seriously and will investigate your complaint. We may use this information to help educate others about credit repair scams and unethical practices.
            </p>
            <Button
              onClick={() => setSubmitted(false)}
              className="bg-primary-blue hover:bg-primary-blue/90 text-white"
            >
              Submit Another Complaint
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="report-company-page">
      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-yellow-300" />
            </div>
            <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">
              Report a Credit Repair Company
            </h1>
            <p className="text-xl text-gray-100">
              Help protect other consumers by reporting unethical credit repair companies. Your information helps us investigate and expose scams.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            {/* Warning Notice */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-8 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-2">Your Information is Confidential</h3>
                  <p className="text-yellow-800 text-sm">
                    We will use this information to investigate the company and potentially create educational content about credit repair scams. Your personal information will be kept confidential and will not be shared publicly.
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-6">
                Submit Your Complaint
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="company_name" className="text-gray-700 font-semibold">
                    Credit Repair Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company_name"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., ABC Credit Repair"
                    className="mt-2"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="complainant_name" className="text-gray-700 font-semibold">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="complainant_name"
                      name="complainant_name"
                      value={formData.complainant_name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="complainant_email" className="text-gray-700 font-semibold">
                      Your Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="complainant_email"
                      name="complainant_email"
                      type="email"
                      value={formData.complainant_email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="complainant_phone" className="text-gray-700 font-semibold">
                      Your Phone Number (Optional)
                    </Label>
                    <Input
                      id="complainant_phone"
                      name="complainant_phone"
                      type="tel"
                      value={formData.complainant_phone}
                      onChange={handleChange}
                      placeholder="(555) 123-4567"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="person_spoke_to" className="text-gray-700 font-semibold">
                      Person You Spoke To (Optional)
                    </Label>
                    <Input
                      id="person_spoke_to"
                      name="person_spoke_to"
                      value={formData.person_spoke_to}
                      onChange={handleChange}
                      placeholder="e.g., Sales Rep Name"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="state" className="text-gray-700 font-semibold">
                      State (Optional)
                    </Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g., Pennsylvania"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="date_of_service" className="text-gray-700 font-semibold">
                      Date of Service (Optional)
                    </Label>
                    <Input
                      id="date_of_service"
                      name="date_of_service"
                      value={formData.date_of_service}
                      onChange={handleChange}
                      placeholder="e.g., January 2025"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="complaint_details" className="text-gray-700 font-semibold">
                    Complaint Details <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-gray-600 mb-2">
                    Please provide as much detail as possible about your experience, including:
                  </p>
                  <ul className="text-sm text-gray-600 mb-3 ml-4 list-disc space-y-1">
                    <li>What services did they promise?</li>
                    <li>What fees did they charge?</li>
                    <li>What was the issue (misleading claims, poor service, billing problems, etc.)?</li>
                    <li>Any other relevant details</li>
                  </ul>
                  <Textarea
                    id="complaint_details"
                    name="complaint_details"
                    value={formData.complaint_details}
                    onChange={handleChange}
                    required
                    rows={8}
                    placeholder="Describe your experience with this company in detail..."
                    className="mt-2"
                  />
                </div>

                {/* Complaint Types */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">
                    Type of Complaint (Check all that apply)
                  </Label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      { value: 'refund_issue', label: 'Refund Issue' },
                      { value: 'croa_violation', label: 'CROA Violation' },
                      { value: 'tsr_violation', label: 'TSR Violation' },
                      { value: 'customer_service', label: 'Poor Customer Service' },
                      { value: 'billing', label: 'Billing Problem' },
                      { value: 'lack_communication', label: 'Lack of Communication' },
                      { value: 'nothing_done', label: 'No Results/Nothing Done' },
                      { value: 'misleading_claims', label: 'Misleading Claims' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          value={type.value}
                          checked={formData.complaint_types.includes(type.value)}
                          onChange={handleCheckboxChange}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* File Uploads */}
                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">
                    Upload Evidence (Optional)
                  </Label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload screenshots, contracts, emails, or other documents (Max 10MB per file)
                  </p>
                  
                  {/* Screenshots */}
                  <div className="mb-4">
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'screenshots')}
                          className="hidden"
                          disabled={uploading}
                        />
                        <div className="text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload screenshots/documents</span>
                          <p className="text-sm mt-1">PNG, JPG, PDF up to 10MB each</p>
                        </div>
                      </div>
                    </label>
                    
                    {formData.screenshots.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.screenshots.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">File {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('screenshots', index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio Recordings */}
                  <div>
                    <label className="block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition">
                        <input
                          type="file"
                          accept="audio/*"
                          multiple
                          onChange={(e) => handleFileUpload(e, 'audio_recordings')}
                          className="hidden"
                          disabled={uploading}
                        />
                        <div className="text-gray-600">
                          <span className="font-medium text-blue-600">Click to upload audio recordings</span>
                          <p className="text-sm mt-1">MP3, WAV, M4A up to 10MB each</p>
                        </div>
                      </div>
                    </label>
                    
                    {formData.audio_recordings.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {formData.audio_recordings.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-700">Recording {index + 1}</span>
                            <button
                              type="button"
                              onClick={() => removeFile('audio_recordings', index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> By submitting this form, you acknowledge that Credlocity may use this information to investigate the company and create educational content about credit repair scams. Your personal information will remain confidential.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-secondary-green hover:bg-secondary-light text-white py-6 text-lg"
                >
                  {loading ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </form>
            </div>

            {/* Additional Resources */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-cinzel font-semibold text-lg mb-3">Additional Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <strong>FTC Complaints:</strong>{' '}
                  <a href="https://ftc.gov/complaint" target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">
                    ftc.gov/complaint
                  </a> or call 1-877-FTC-HELP
                </li>
                <li>
                  <strong>CFPB Complaints:</strong>{' '}
                  <a href="https://www.consumerfinance.gov/complaint/" target="_blank" rel="noopener noreferrer" className="text-primary-blue hover:underline">
                    consumerfinance.gov/complaint
                  </a>
                </li>
                <li>
                  <strong>State Attorney General:</strong> Contact your state's consumer protection office
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReportCompany;
