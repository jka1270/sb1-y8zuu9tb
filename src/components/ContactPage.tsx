import { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, CheckCircle, AlertTriangle, Building, User, MessageSquare, HelpCircle, Shield } from 'lucide-react';

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
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, this would send to your backend
      console.log('Contact form submitted:', formData);
      
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
      icon: Phone,
      title: 'Phone Support',
      primary: '1-800-PEPTIDE (1-800-738-8433)',
      secondary: 'International: +1-858-555-0123',
      hours: 'Mon-Fri: 8:00 AM - 6:00 PM PST',
      color: 'text-blue-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      primary: 'support@peptidetechresearch.com',
      secondary: 'Technical: tech@peptidetechresearch.com',
      hours: 'Response within 24 hours',
      color: 'text-green-600'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      primary: 'Available on website',
      secondary: 'Instant technical assistance',
      hours: 'Mon-Fri: 9:00 AM - 5:00 PM PST',
      color: 'text-purple-600'
    }
  ];

  const departments = [
    {
      name: 'Technical Support',
      email: 'tech@researchraws.com',
      description: 'Product specifications, usage guidelines, analytical data',
      icon: HelpCircle,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      name: 'Quality Assurance',
      email: 'quality@researchraws.com',
      description: 'COA requests, quality concerns, batch information',
      icon: Shield,
      color: 'bg-green-50 text-green-600'
    },
    {
      name: 'Custom Synthesis',
      email: 'custom@researchraws.com',
      description: 'Custom peptide projects, quotes, synthesis timelines',
      icon: Building,
      color: 'bg-purple-50 text-purple-600'
    },
    {
      name: 'Research Partnerships',
      email: 'partnerships@researchraws.com',
      description: 'Collaboration opportunities, bulk orders, academic discounts',
      icon: User,
      color: 'bg-orange-50 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get in touch with our expert team for technical support, custom synthesis, 
            or research collaboration opportunities.
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {contactMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.title} className="bg-white p-6 rounded-lg shadow-sm text-center">
                <Icon className={`h-12 w-12 mx-auto mb-4 ${method.color}`} />
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{method.title}</h3>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900">{method.primary}</p>
                  <p className="text-gray-600 text-sm">{method.secondary}</p>
                  <div className="flex items-center justify-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {method.hours}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Department Contacts */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Department Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <div key={dept.name} className="border rounded-lg p-6">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg ${dept.color} mr-4`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{dept.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{dept.description}</p>
                      <a 
                        href={`mailto:${dept.email}`}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        {dept.email}
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
                  placeholder="Please provide detailed information about your inquiry, including specific peptides, research objectives, or technical questions..."
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
                    <strong>Research Use Only:</strong> By submitting this form, you confirm that any peptides 
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

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Office Location */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Visit Our Facility</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">PeptideTech Research Headquarters</h4>
                    <div className="text-gray-600 mt-1">
                      <p>10520 Science Center Drive</p>
                      <p>Suite 300</p>
                      <p>San Diego, CA 92121</p>
                      <p>United States</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Business Hours</h4>
                    <div className="text-gray-600 mt-1">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM PST</p>
                      <p>Saturday: 9:00 AM - 2:00 PM PST</p>
                      <p>Sunday: Closed</p>
                      <p className="text-sm text-blue-600 mt-2">Emergency support available 24/7</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Response Times */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Response Times</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-900">General Inquiries</span>
                  <span className="text-green-700">Within 24 hours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Technical Support</span>
                  <span className="text-blue-700">Within 4 hours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-900">Custom Synthesis</span>
                  <span className="text-purple-700">Within 48 hours</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-900">Quality Issues</span>
                  <span className="text-red-700">Within 2 hours</span>
                </div>
              </div>
            </div>

            {/* Quality Assurance Contact */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quality Assurance</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Shield className="h-6 w-6 text-green-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quality Control Laboratory</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Direct line to our QC team for Certificate of Analysis requests, 
                      batch inquiries, and quality concerns.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm"><strong>Email:</strong> quality@peptidetechresearch.com</p>
                      <p className="text-sm"><strong>Phone:</strong> 1-800-738-8433 ext. 2</p>
                      <p className="text-sm"><strong>Emergency QC Line:</strong> 1-858-555-0199</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-start">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Emergency Contact</h4>
                  <p className="text-red-800 text-sm mt-1">
                    For chemical emergencies, spills, or safety incidents involving our products:
                  </p>
                  <div className="mt-3 space-y-1">
                    <p className="text-sm font-medium text-red-900">CHEMTREC: 1-800-424-9300</p>
                    <p className="text-sm text-red-800">24/7 Emergency Response</p>
                    <p className="text-sm text-red-800">International: +1-703-527-3887</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What is your typical lead time for standard peptides?</h4>
                <p className="text-gray-600 text-sm">
                  Most standard peptides ship within 1-3 business days. Custom synthesis typically takes 2-4 weeks 
                  depending on complexity and sequence length.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do you provide Certificates of Analysis?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, every peptide shipment includes a comprehensive Certificate of Analysis with purity data, 
                  analytical methods, and quality control information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What are your shipping options?</h4>
                <p className="text-gray-600 text-sm">
                  We offer standard and express cold chain shipping worldwide. All peptides are shipped with 
                  temperature monitoring to ensure product integrity.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can you synthesize custom peptides?</h4>
                <p className="text-gray-600 text-sm">
                  Yes, we offer custom peptide synthesis services from mg to gram scale. Contact our custom 
                  synthesis team for quotes and timelines.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer academic discounts?</h4>
                <p className="text-gray-600 text-sm">
                  We provide special pricing for academic institutions and non-profit research organizations. 
                  Contact our partnerships team for more information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What quality standards do you follow?</h4>
                <p className="text-gray-600 text-sm">
                  We maintain ISO 9001:2015 certification and follow GMP guidelines. All peptides undergo 
                  comprehensive analytical testing before release.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}