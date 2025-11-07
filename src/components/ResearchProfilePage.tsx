import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, CheckCircle, AlertTriangle, User, Building, GraduationCap, FileText, Shield } from 'lucide-react';
import { useResearchProfile } from '../hooks/useResearchProfile';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import LoadingSpinner from './LoadingSpinner';

interface ResearchProfilePageProps {
  onBack: () => void;
}

export default function ResearchProfilePage({ onBack }: ResearchProfilePageProps) {
  const { profile, loading, error, createProfile, updateProfile, uploadApprovalDocument } = useResearchProfile();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState('basic');
  const [saving, setSaving] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [formData, setFormData] = useState({
    institution_type: '',
    research_areas: [] as string[],
    position_title: '',
    department: '',
    supervisor_name: '',
    supervisor_email: '',
    years_experience: 0,
    education_level: '',
    specializations: [] as string[],
    publications_count: 0,
    orcid_id: '',
    research_interests: '',
    current_projects: '',
    funding_sources: [] as string[],
    ethics_training_completed: false,
    ethics_training_date: '',
    safety_training_completed: false,
    safety_training_date: '',
    institutional_approval: false,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        institution_type: profile.institution_type || '',
        research_areas: profile.research_areas || [],
        position_title: profile.position_title || '',
        department: profile.department || '',
        supervisor_name: profile.supervisor_name || '',
        supervisor_email: profile.supervisor_email || '',
        years_experience: profile.years_experience || 0,
        education_level: profile.education_level || '',
        specializations: profile.specializations || [],
        publications_count: profile.publications_count || 0,
        orcid_id: profile.orcid_id || '',
        research_interests: profile.research_interests || '',
        current_projects: profile.current_projects || '',
        funding_sources: profile.funding_sources || [],
        ethics_training_completed: profile.ethics_training_completed || false,
        ethics_training_date: profile.ethics_training_date || '',
        safety_training_completed: profile.safety_training_completed || false,
        safety_training_date: profile.safety_training_date || '',
        institutional_approval: profile.institutional_approval || false,
      });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      if (profile) {
        await updateProfile(formData);
      } else {
        await createProfile(formData);
      }
      showNotification({
        type: 'success',
        message: 'Research profile saved successfully!',
        duration: 3000
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to save research profile. Please try again.',
        duration: 5000
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingDoc(true);
      await uploadApprovalDocument(file);
      showNotification({
        type: 'success',
        message: 'Approval document uploaded successfully!',
        duration: 3000
      });
    } catch (err) {
      showNotification({
        type: 'error',
        message: 'Failed to upload document. Please try again.',
        duration: 5000
      });
    } finally {
      setUploadingDoc(false);
    }
  };

  const addArrayItem = (field: keyof typeof formData, value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[]), value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index)
    }));
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information', icon: User },
    { id: 'research', label: 'Research Details', icon: GraduationCap },
    { id: 'compliance', label: 'Compliance & Training', icon: Shield },
    { id: 'verification', label: 'Verification', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading research profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </button>
            <div className="flex items-center space-x-4">
              {profile && (
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getVerificationStatusColor(profile.verification_status)}`}>
                  {profile.verification_status === 'verified' && <CheckCircle className="h-4 w-4 inline mr-1" />}
                  {profile.verification_status === 'pending' && <AlertTriangle className="h-4 w-4 inline mr-1" />}
                  {profile.verification_status.charAt(0).toUpperCase() + profile.verification_status.slice(1)}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Profile</h1>
          <p className="text-gray-600">
            Complete your research profile to access specialized peptides and research resources
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Type *
                    </label>
                    <select
                      value={formData.institution_type}
                      onChange={(e) => setFormData({...formData, institution_type: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select institution type</option>
                      <option value="university">University</option>
                      <option value="research_institute">Research Institute</option>
                      <option value="pharmaceutical">Pharmaceutical Company</option>
                      <option value="biotech">Biotech Company</option>
                      <option value="government">Government Agency</option>
                      <option value="hospital">Hospital/Medical Center</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Position Title *
                    </label>
                    <input
                      type="text"
                      value={formData.position_title}
                      onChange={(e) => setFormData({...formData, position_title: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Research Scientist, PhD Student"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Biochemistry, Pharmacology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level *
                    </label>
                    <select
                      value={formData.education_level}
                      onChange={(e) => setFormData({...formData, education_level: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select education level</option>
                      <option value="bachelor">Bachelor's Degree</option>
                      <option value="master">Master's Degree</option>
                      <option value="phd">PhD</option>
                      <option value="postdoc">Postdoctoral</option>
                      <option value="faculty">Faculty</option>
                      <option value="industry">Industry Professional</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      value={formData.years_experience}
                      onChange={(e) => setFormData({...formData, years_experience: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ORCID ID
                    </label>
                    <input
                      type="text"
                      value={formData.orcid_id}
                      onChange={(e) => setFormData({...formData, orcid_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0000-0000-0000-0000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supervisor Name
                    </label>
                    <input
                      type="text"
                      value={formData.supervisor_name}
                      onChange={(e) => setFormData({...formData, supervisor_name: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supervisor Email
                    </label>
                    <input
                      type="email"
                      value={formData.supervisor_email}
                      onChange={(e) => setFormData({...formData, supervisor_email: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'research' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Areas
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.research_areas.map((area, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {area}
                        <button
                          onClick={() => removeArrayItem('research_areas', index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Add research area"
                      className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('research_areas', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <button
                      onClick={(e) => {
                        const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                        addArrayItem('research_areas', input.value);
                        input.value = '';
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Research Interests
                  </label>
                  <textarea
                    value={formData.research_interests}
                    onChange={(e) => setFormData({...formData, research_interests: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your research interests and focus areas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Projects
                  </label>
                  <textarea
                    value={formData.current_projects}
                    onChange={(e) => setFormData({...formData, current_projects: e.target.value})}
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your current research projects..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publications Count
                    </label>
                    <input
                      type="number"
                      value={formData.publications_count}
                      onChange={(e) => setFormData({...formData, publications_count: parseInt(e.target.value) || 0})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specializations
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                        >
                          {spec}
                          <button
                            onClick={() => removeArrayItem('specializations', index)}
                            className="ml-2 text-green-600 hover:text-green-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <input
                      type="text"
                      placeholder="Add specialization"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addArrayItem('specializations', e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Sources
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.funding_sources.map((source, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                      >
                        {source}
                        <button
                          onClick={() => removeArrayItem('funding_sources', index)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add funding source (e.g., NIH, NSF, Industry)"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addArrayItem('funding_sources', e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div className="space-y-6">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Important:</strong> Compliance training and institutional approval are required for purchasing certain research peptides.
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.ethics_training_completed}
                          onChange={(e) => setFormData({...formData, ethics_training_completed: e.target.checked})}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Ethics Training Completed
                        </span>
                      </label>
                    </div>

                    {formData.ethics_training_completed && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ethics Training Date
                        </label>
                        <input
                          type="date"
                          value={formData.ethics_training_date}
                          onChange={(e) => setFormData({...formData, ethics_training_date: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.safety_training_completed}
                          onChange={(e) => setFormData({...formData, safety_training_completed: e.target.checked})}
                          className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Safety Training Completed
                        </span>
                      </label>
                    </div>

                    {formData.safety_training_completed && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Safety Training Date
                        </label>
                        <input
                          type="date"
                          value={formData.safety_training_date}
                          onChange={(e) => setFormData({...formData, safety_training_date: e.target.value})}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.institutional_approval}
                      onChange={(e) => setFormData({...formData, institutional_approval: e.target.checked})}
                      className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Institutional Approval Obtained
                    </span>
                  </label>
                  <p className="text-sm text-gray-600 mt-2 ml-6">
                    Required for certain controlled or restricted peptides
                  </p>
                </div>

                {formData.institutional_approval && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Approval Document
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload institutional approval document (PDF, DOC, or image)
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="approval-upload"
                      />
                      <label
                        htmlFor="approval-upload"
                        className={`cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 ${uploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {uploadingDoc ? 'Uploading...' : 'Choose File'}
                      </label>
                      {profile?.approval_document_url && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ Document uploaded successfully
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'verification' && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-medium border-2 ${getVerificationStatusColor(profile?.verification_status || 'pending')}`}>
                    {profile?.verification_status === 'verified' && <CheckCircle className="h-6 w-6 mr-2" />}
                    {profile?.verification_status === 'pending' && <AlertTriangle className="h-6 w-6 mr-2" />}
                    Verification Status: {profile?.verification_status?.charAt(0).toUpperCase() + profile?.verification_status?.slice(1) || 'Pending'}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-sm font-medium">1</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Complete Profile</h4>
                        <p className="text-sm text-gray-600">Fill out all required information in your research profile</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-sm font-medium">2</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Submit Documentation</h4>
                        <p className="text-sm text-gray-600">Upload institutional approval and training certificates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-sm font-medium">3</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Review Process</h4>
                        <p className="text-sm text-gray-600">Our team reviews your profile and documentation (2-5 business days)</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-white text-sm font-medium">4</span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Verification Complete</h4>
                        <p className="text-sm text-gray-600">Access to all research peptides and specialized features</p>
                      </div>
                    </div>
                  </div>
                </div>

                {profile?.verification_status === 'verified' && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <h4 className="font-medium text-green-900">Profile Verified</h4>
                        <p className="text-sm text-green-700">
                          Your research profile has been verified. You now have access to all peptides and research features.
                        </p>
                        {profile.verified_at && (
                          <p className="text-sm text-green-600 mt-1">
                            Verified on {new Date(profile.verified_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {profile?.verification_status === 'rejected' && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-red-900">Verification Rejected</h4>
                        <p className="text-sm text-red-700">
                          Your profile verification was not approved. Please review the feedback and update your information.
                        </p>
                        <button className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium">
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}