import { useState, useEffect } from 'react';
import { FileText, Upload, Shield, BookOpen, Plus, Edit2, Trash2, Eye, Download, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

type DocumentType = 'technical' | 'safety' | 'protocol';

interface TechnicalDataSheet {
  id: string;
  product_id: string;
  sku: string;
  title: string;
  molecular_formula: string;
  molecular_weight: number;
  purity_specification: string;
  storage_temperature: string;
  created_at: string;
}

interface SafetyDataSheet {
  id: string;
  product_id: string;
  sku: string;
  sds_number: string;
  product_name: string;
  signal_word: string;
  created_at: string;
}

interface ResearchProtocol {
  id: string;
  product_id: string;
  title: string;
  protocol_type: string;
  research_area: string;
  approval_status: string;
  download_count: number;
  rating_average: number;
  created_at: string;
}

export default function AdminDocumentManager() {
  const [activeTab, setActiveTab] = useState<DocumentType>('technical');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [technicalDocs, setTechnicalDocs] = useState<TechnicalDataSheet[]>([]);
  const [safetyDocs, setSafetyDocs] = useState<SafetyDataSheet[]>([]);
  const [protocols, setProtocols] = useState<ResearchProtocol[]>([]);

  useEffect(() => {
    fetchDocuments();
  }, [activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      if (activeTab === 'technical') {
        const { data, error } = await supabase
          .from('technical_data_sheets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTechnicalDocs(data || []);
      } else if (activeTab === 'safety') {
        const { data, error } = await supabase
          .from('safety_data_sheets')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSafetyDocs(data || []);
      } else if (activeTab === 'protocol') {
        const { data, error } = await supabase
          .from('research_protocols')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProtocols(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      let tableName = '';
      if (activeTab === 'technical') tableName = 'technical_data_sheets';
      else if (activeTab === 'safety') tableName = 'safety_data_sheets';
      else if (activeTab === 'protocol') tableName = 'research_protocols';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchDocuments();
      alert('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const tabs = [
    { id: 'technical' as DocumentType, label: 'Technical Data Sheets', icon: FileText, count: technicalDocs.length },
    { id: 'safety' as DocumentType, label: 'Safety Data Sheets', icon: Shield, count: safetyDocs.length },
    { id: 'protocol' as DocumentType, label: 'Research Protocols', icon: BookOpen, count: protocols.length },
  ];

  const filteredTechnicalDocs = technicalDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSafetyDocs = safetyDocs.filter(doc =>
    doc.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sds_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProtocols = protocols.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.research_area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Research Documentation</h2>
          <p className="text-gray-600">Manage technical data sheets, safety information, and research protocols</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add Document</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
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
                  <span className="ml-2 px-2 py-0.5 text-xs bg-gray-100 rounded-full">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="mb-6 flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search documents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading documents..." />
            </div>
          ) : (
            <>
              {activeTab === 'technical' && (
                <div className="space-y-4">
                  {filteredTechnicalDocs.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No technical data sheets found</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Add your first document
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Formula
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date Added
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredTechnicalDocs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doc.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.molecular_formula}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.purity_specification}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(doc.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'safety' && (
                <div className="space-y-4">
                  {filteredSafetyDocs.length === 0 ? (
                    <div className="text-center py-12">
                      <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No safety data sheets found</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Add your first document
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SDS Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              SKU
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Signal Word
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date Added
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredSafetyDocs.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {doc.product_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.sds_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.sku}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  doc.signal_word === 'Danger' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.signal_word || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(doc.created_at)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'protocol' && (
                <div className="space-y-4">
                  {filteredProtocols.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No research protocols found</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Add your first protocol
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Research Area
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Downloads
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredProtocols.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {doc.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.protocol_type}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.research_area}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  doc.approval_status === 'approved'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {doc.approval_status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.download_count}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                  <button className="text-blue-600 hover:text-blue-900">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="text-green-600 hover:text-green-900">
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteDocument(doc.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showUploadModal && (
        <UploadDocumentModal
          documentType={activeTab}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}

interface UploadModalProps {
  documentType: DocumentType;
  onClose: () => void;
  onSuccess: () => void;
}

function UploadDocumentModal({ documentType, onClose, onSuccess }: UploadModalProps) {
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<any>({
    product_id: '',
    sku: '',
    title: '',
    molecular_formula: '',
    molecular_weight: '',
    purity_specification: '',
    appearance: '',
    storage_temperature: '',
    storage_conditions: '',
    shelf_life: '',
    regulatory_status: 'Research Use Only',
    research_applications: [],
    research_areas: [],
    product_name: '',
    sds_number: '',
    signal_word: '',
    ghs_classification: {},
    hazard_statements: [],
    precautionary_statements: [],
    chemical_identity: {},
    first_aid_inhalation: '',
    first_aid_skin_contact: '',
    first_aid_eye_contact: '',
    first_aid_ingestion: '',
    handling_precautions: '',
    storage_requirements: '',
    personal_protective_equipment: {},
    protocol_type: '',
    research_area: '',
    difficulty_level: 'intermediate',
    objective: '',
    procedure_steps: {},
    author: '',
    approval_status: 'pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let tableName = '';
      let dataToInsert: any = {};

      if (documentType === 'technical') {
        tableName = 'technical_data_sheets';
        dataToInsert = {
          product_id: formData.product_id,
          sku: formData.sku,
          title: formData.title,
          molecular_formula: formData.molecular_formula,
          molecular_weight: parseFloat(formData.molecular_weight),
          purity_specification: formData.purity_specification,
          appearance: formData.appearance,
          storage_temperature: formData.storage_temperature,
          storage_conditions: formData.storage_conditions,
          shelf_life: formData.shelf_life,
          regulatory_status: formData.regulatory_status,
          research_applications: formData.research_applications.split(',').map((s: string) => s.trim()).filter(Boolean),
          research_areas: formData.research_areas.split(',').map((s: string) => s.trim()).filter(Boolean),
          solubility: {},
          analytical_methods: {}
        };
      } else if (documentType === 'safety') {
        tableName = 'safety_data_sheets';
        dataToInsert = {
          product_id: formData.product_id,
          sku: formData.sku,
          sds_number: formData.sds_number,
          product_name: formData.product_name,
          signal_word: formData.signal_word,
          ghs_classification: {},
          hazard_statements: formData.hazard_statements.split(',').map((s: string) => s.trim()).filter(Boolean),
          precautionary_statements: formData.precautionary_statements.split(',').map((s: string) => s.trim()).filter(Boolean),
          chemical_identity: {},
          first_aid_inhalation: formData.first_aid_inhalation,
          first_aid_skin_contact: formData.first_aid_skin_contact,
          first_aid_eye_contact: formData.first_aid_eye_contact,
          first_aid_ingestion: formData.first_aid_ingestion,
          handling_precautions: formData.handling_precautions,
          storage_requirements: formData.storage_requirements,
          personal_protective_equipment: {}
        };
      } else if (documentType === 'protocol') {
        tableName = 'research_protocols';
        dataToInsert = {
          product_id: formData.product_id,
          protocol_type: formData.protocol_type,
          title: formData.title,
          research_area: formData.research_area,
          difficulty_level: formData.difficulty_level,
          objective: formData.objective,
          procedure_steps: {},
          author: formData.author,
          approval_status: formData.approval_status,
          required_equipment: {},
          required_reagents: {}
        };
      }

      const { error } = await supabase
        .from(tableName)
        .insert([dataToInsert]);

      if (error) throw error;

      alert('Document uploaded successfully!');
      onSuccess();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Add {documentType === 'technical' ? 'Technical Data Sheet' :
                     documentType === 'safety' ? 'Safety Data Sheet' : 'Research Protocol'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {documentType === 'technical' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                      <input
                        type="text"
                        name="product_id"
                        required
                        value={formData.product_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                      <input
                        type="text"
                        name="sku"
                        required
                        value={formData.sku}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Molecular Formula *</label>
                      <input
                        type="text"
                        name="molecular_formula"
                        required
                        value={formData.molecular_formula}
                        onChange={handleChange}
                        placeholder="e.g., C16H25N5O7"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Molecular Weight *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="molecular_weight"
                        required
                        value={formData.molecular_weight}
                        onChange={handleChange}
                        placeholder="g/mol"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purity *</label>
                      <input
                        type="text"
                        name="purity_specification"
                        required
                        value={formData.purity_specification}
                        onChange={handleChange}
                        placeholder="e.g., ≥98%"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Appearance *</label>
                      <input
                        type="text"
                        name="appearance"
                        required
                        value={formData.appearance}
                        onChange={handleChange}
                        placeholder="e.g., White powder"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Storage Temperature *</label>
                      <input
                        type="text"
                        name="storage_temperature"
                        required
                        value={formData.storage_temperature}
                        onChange={handleChange}
                        placeholder="e.g., -20°C"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Life *</label>
                      <input
                        type="text"
                        name="shelf_life"
                        required
                        value={formData.shelf_life}
                        onChange={handleChange}
                        placeholder="e.g., 2 years"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Conditions *</label>
                    <textarea
                      name="storage_conditions"
                      required
                      value={formData.storage_conditions}
                      onChange={handleChange}
                      rows={2}
                      placeholder="Store in a cool, dry place..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Applications (comma-separated)</label>
                    <input
                      type="text"
                      name="research_applications"
                      value={formData.research_applications}
                      onChange={handleChange}
                      placeholder="e.g., Cell signaling, Apoptosis research"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Research Areas (comma-separated)</label>
                    <input
                      type="text"
                      name="research_areas"
                      value={formData.research_areas}
                      onChange={handleChange}
                      placeholder="e.g., Neuroscience, Immunology"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {documentType === 'safety' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                      <input
                        type="text"
                        name="product_id"
                        required
                        value={formData.product_id}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                      <input
                        type="text"
                        name="sku"
                        required
                        value={formData.sku}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SDS Number *</label>
                      <input
                        type="text"
                        name="sds_number"
                        required
                        value={formData.sds_number}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                      <input
                        type="text"
                        name="product_name"
                        required
                        value={formData.product_name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Signal Word</label>
                    <select
                      name="signal_word"
                      value={formData.signal_word}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">None</option>
                      <option value="Warning">Warning</option>
                      <option value="Danger">Danger</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hazard Statements (comma-separated)</label>
                    <textarea
                      name="hazard_statements"
                      value={formData.hazard_statements}
                      onChange={handleChange}
                      rows={2}
                      placeholder="H302, H315, H319"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precautionary Statements (comma-separated)</label>
                    <textarea
                      name="precautionary_statements"
                      value={formData.precautionary_statements}
                      onChange={handleChange}
                      rows={2}
                      placeholder="P264, P280, P301+P312"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Aid - Inhalation *</label>
                      <textarea
                        name="first_aid_inhalation"
                        required
                        value={formData.first_aid_inhalation}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Aid - Skin Contact *</label>
                      <textarea
                        name="first_aid_skin_contact"
                        required
                        value={formData.first_aid_skin_contact}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Aid - Eye Contact *</label>
                      <textarea
                        name="first_aid_eye_contact"
                        required
                        value={formData.first_aid_eye_contact}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Aid - Ingestion *</label>
                      <textarea
                        name="first_aid_ingestion"
                        required
                        value={formData.first_aid_ingestion}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Handling Precautions *</label>
                    <textarea
                      name="handling_precautions"
                      required
                      value={formData.handling_precautions}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Storage Requirements *</label>
                    <textarea
                      name="storage_requirements"
                      required
                      value={formData.storage_requirements}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              {documentType === 'protocol' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                    <input
                      type="text"
                      name="product_id"
                      required
                      value={formData.product_id}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Protocol Type *</label>
                      <input
                        type="text"
                        name="protocol_type"
                        required
                        value={formData.protocol_type}
                        onChange={handleChange}
                        placeholder="e.g., In Vitro Assay"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Research Area *</label>
                      <input
                        type="text"
                        name="research_area"
                        required
                        value={formData.research_area}
                        onChange={handleChange}
                        placeholder="e.g., Neuroscience"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                      <select
                        name="difficulty_level"
                        value={formData.difficulty_level}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                      <select
                        name="approval_status"
                        value={formData.approval_status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Objective *</label>
                    <textarea
                      name="objective"
                      required
                      value={formData.objective}
                      onChange={handleChange}
                      rows={3}
                      placeholder="Describe the main objective of this protocol..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                    <input
                      type="text"
                      name="author"
                      required
                      value={formData.author}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
