import { useState } from 'react';
import { Mail, Clock, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ContactPageProps {
  onBack: () => void;
}

interface ContactForm {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  inquiryType: string;
  subject: string;
  message: string;
  researchArea: string;
  urgency: string;
}

export default function ContactPage({ onBack }: ContactPageProps) {
  const [formData, setFormData] = useState<ContactForm>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    subject: '',
    message: '',
    researchArea: '',
    urgency: 'normal'
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const inquiryTypes = [
    { value: 'product', label: 'Product Information' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'custom', label: 'Custom Synthesis' },
    { value: 'quality', label: 'Quality Assurance' },
    { value: 'shipping', label: 'Shipping & Logistics' },
    { value: 'partnership', label: 'Research Partnership' },
    { value: 'billing', label: 'Billing & Orders' },
    { value: 'other', label: 'Other' }
  ];

  const researchAreas = [
    'Therapeutic Research',
    'Cosmetic Research',
    'Biochemical Studies',
    'Cell Biology',
    'Pharmacology',
    'Neuroscience',
    'Oncology',
    'Immunology',
    'Endocrinology',
    'Other'
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low - General inquiry' },
    { value: 'normal', label: 'Normal - Standard response' },
    { value: 'high', label: 'High - Urgent research need' },
    { value: 'critical', label: 'Critical - Research emergency' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone || null,
          inquiry_type: formData.inquiryType,
          subject: formData.subject,
          message: formData.message,
          research_area: formData.researchArea || null,
          urgency: formData.urgency,
          status: 'new'
        });

      if (submitError) {
        throw submitError;
      }

      setSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        phone: '',
        inquiryType: '',
        subject: '',
        message: '',
        researchArea: '',
        urgency: 'normal'
      });
    } catch (err) {
      console.error('Error submitting contact form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      primary: 'support@researchraws.com',
      hours: 'Response within 24 hours',
      color: 'text-green-600'
    }
  ];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our expert team for technical support, custom synthesis, 
            or research collaboration opportunities.
          </p>
        </div>

        {/* Contact Method */}
        <div className="max-w-md mx-auto mb-16">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.title} className="bg-white p-8 rounded-lg shadow-sm text-center">
                <Icon className={`h-16 w-16 mx-auto mb-4 ${method.color}`} />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{method.title}</h3>
                <div className="space-y-2">
                  <a
                    href={`mailto:${method.primary}`}
                    className="font-medium text-blue-600 hover:text-blue-700 text-lg"
                  >
                    {method.primary}
                  </a>
                  <div className="flex items-center justify-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {method.hours}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <p className="text-green-800 font-medium">Message sent successfully!</p>
                  <p className="text-green-700 text-sm">We'll respond within 24 hours.</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="researcher@university.edu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company/Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inquiry Type *
                  </label>
                  <select
                    required
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange('inquiryType', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select inquiry type</option>
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Research Area
                  </label>
                  <select
                    value={formData.researchArea}
                    onChange={(e) => handleInputChange('researchArea', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select research area</option>
                    {researchAreas.map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Brief description of your inquiry"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Please provide detailed information about your inquiry, including specific Amino Acid Chains, research objectives, or technical questions..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency Level
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {urgencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                  <div className="text-sm text-yellow-800">
                    <strong>Research Use Only:</strong> By submitting this form, you confirm that any Amino Acid Chains 
                    discussed are for research purposes only and not for human consumption.
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full flex items-center justify-center px-6 py-3 rounded-lg font-semibold transition-colors ${
                  submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Send className="h-4 w-4 mr-2" />
                {submitting ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>

          {/* Research Use Notice */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Important Notice</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Research Use Only</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      All Amino Acid Chains are intended for research purposes only and are not for human consumption.
                      By contacting us, you confirm your understanding of this policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}