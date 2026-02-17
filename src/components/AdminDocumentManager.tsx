import { useState, useEffect } from 'react';
import { FileText, Upload, Shield, BookOpen, Plus, Edit2, Trash2, Eye, Download, Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import DocumentUploadForm from './DocumentUploadForm';
import { useNotification } from '../contexts/NotificationContext';

type DocumentType = 'technical' | 'safety' | 'report';

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

interface TestingReport {
  id: string;
  product_id: string;
  title: string;
  report_type: string;
  research_area: string;
  approval_status: string;
  download_count: number;
  rating_average: number;
  created_at: string;
}

export default function AdminDocumentManager() {
  const { showNotification } = useNotification();
  const [activeTab, setActiveTab] = useState<DocumentType>('technical');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [technicalDocs, setTechnicalDocs] = useState<TechnicalDataSheet[]>([]);
  const [safetyDocs, setSafetyDocs] = useState<SafetyDataSheet[]>([]);
  const [reports, setReports] = useState<TestingReport[]>([]);

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
      } else if (activeTab === 'report') {
        const { data, error } = await supabase
          .from('testing_reports')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      showNotification({
        type: 'error',
        message: 'Failed to load documents. Please refresh the page.',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;

    try {
      let tableName = '';
      if (activeTab === 'technical') tableName = 'technical_data_sheets';
      else if (activeTab === 'safety') tableName = 'safety_data_sheets';
      else if (activeTab === 'report') tableName = 'testing_reports';

      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      showNotification({
        type: 'success',
        message: 'Document deleted successfully',
        duration: 3000
      });

      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      showNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete document. Please try again.',
        duration: 5000
      });
    }
  };

  const tabs = [
    { id: 'technical' as DocumentType, label: 'Technical Data Sheets', icon: FileText, count: technicalDocs.length },
    { id: 'safety' as DocumentType, label: 'Safety Data Sheets', icon: Shield, count: safetyDocs.length },
    { id: 'report' as DocumentType, label: 'Test Reports', icon: BookOpen, count: reports.length },
  ];

  const filteredTechnicalDocs = technicalDocs.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSafetyDocs = safetyDocs.filter(doc =>
    doc.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sds_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = reports.filter(doc =>
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
          <p className="text-gray-600">Manage technical data sheets, safety information, and testing reports</p>
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

              {activeTab === 'report' && (
                <div className="space-y-4">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No testing reports found</p>
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className="mt-4 text-blue-600 hover:text-blue-800"
                      >
                        Add your first testing report
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
                          {filteredReports.map((doc) => (
                            <tr key={doc.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                {doc.title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {doc.report_type}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <DocumentUploadForm
              category={activeTab}
              onSuccess={() => {
                setShowUploadModal(false);
                fetchDocuments();
              }}
              onCancel={() => setShowUploadModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
