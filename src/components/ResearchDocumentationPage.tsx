import { useState, useEffect } from 'react';
import { Download, FileText, Shield, BookOpen, Search, Filter, Star, Eye, ThumbsUp } from 'lucide-react';
import { useResearchDocuments } from '../hooks/useResearchDocuments';
import { useNotification } from '../contexts/NotificationContext';
import DocumentViewer from './DocumentViewer';

interface ResearchDocumentationPageProps {
  onBack: () => void;
  productId?: string;
}

export default function ResearchDocumentationPage({ onBack, productId }: ResearchDocumentationPageProps) {
  const { showNotification } = useNotification();
  const {
    technicalDataSheets,
    safetyDataSheets,
    testingReports,
    loading,
    error,
    getTDSByProduct,
    getSDSByProduct,
    getReportsByProduct,
    downloadDocument,
    searchDocuments
  } = useResearchDocuments();

  const [activeTab, setActiveTab] = useState('tds');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [filterArea, setFilterArea] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (docType: 'tds' | 'sds' | 'report', docId: string, format: 'PDF' | 'DOC' | 'JSON' = 'PDF') => {
    try {
      setDownloading(docId);
      const content = await downloadDocument(docType, docId, format, productId);
      
      // Create download
      const blob = new Blob([content], { 
        type: format === 'PDF' ? 'text/html' : 
              format === 'JSON' ? 'application/json' : 'application/msword'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docType.toUpperCase()}_${docId.slice(0, 8)}.${format.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to download document. Please try again.',
        duration: 5000
      });
    } finally {
      setDownloading(null);
    }
  };

  const handleViewDocument = (doc: any, type: string) => {
    setSelectedDocument(doc);
    setDocumentType(type);
  };

  const searchResults = searchTerm ? searchDocuments(searchTerm) : null;

  const filteredReports = testingReports.filter(report => {
    const matchesArea = !filterArea || report.research_area.toLowerCase().includes(filterArea.toLowerCase());
    const matchesDifficulty = !filterDifficulty || report.difficulty_level === filterDifficulty;
    const matchesProduct = !productId || report.product_id === productId;
    return matchesArea && matchesDifficulty && matchesProduct;
  });

  const productTDS = productId ? getTDSByProduct(productId) : technicalDataSheets;
  const productSDS = productId ? getSDSByProduct(productId) : safetyDataSheets;
  const productReports = productId ? getReportsByProduct(productId) : filteredReports;

  const researchAreas = [...new Set(testingReports.map(p => p.research_area))];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  const tabs = [
    { id: 'tds', label: 'Technical Data Sheets', icon: FileText, count: productTDS.length },
    { id: 'sds', label: 'Safety Data Sheets', icon: Shield, count: productSDS.length },
    { id: 'reports', label: 'Test Reports', icon: BookOpen, count: productReports.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading research documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Documentation</h1>
          <p className="text-gray-600">
            {productId
              ? 'Technical specifications, safety information, and testing reports for this product'
              : 'Comprehensive technical documentation and testing reports for all amino acid chain products'
            }
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults && (
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results for "{searchTerm}"
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Technical Data Sheets ({searchResults.tds.length})</h3>
                <div className="space-y-2">
                  {searchResults.tds.slice(0, 3).map(doc => (
                    <div key={doc.id} className="text-sm">
                      <button
                        onClick={() => handleViewDocument(doc, 'tds')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {doc.title}
                      </button>
                      <div className="text-gray-500">SKU: {doc.sku}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Safety Data Sheets ({searchResults.sds.length})</h3>
                <div className="space-y-2">
                  {searchResults.sds.slice(0, 3).map(doc => (
                    <div key={doc.id} className="text-sm">
                      <button
                        onClick={() => handleViewDocument(doc, 'sds')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {doc.product_name}
                      </button>
                      <div className="text-gray-500">SDS: {doc.sds_number}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Test Reports ({searchResults.reports.length})</h3>
                <div className="space-y-2">
                  {searchResults.reports.slice(0, 3).map(doc => (
                    <div key={doc.id} className="text-sm">
                      <button
                        onClick={() => handleViewDocument(doc, 'report')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {doc.title}
                      </button>
                      <div className="text-gray-500">{doc.research_area}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
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
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Filters for Protocols */}
          {activeTab === 'reports' && (
            <div className="p-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Research Area</label>
                  <select
                    value={filterArea}
                    onChange={(e) => setFilterArea(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Areas</option>
                    {researchAreas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    {difficultyLevels.map(level => (
                      <option key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setFilterArea('');
                      setFilterDifficulty('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Technical Data Sheets */}
          {activeTab === 'tds' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productTDS.map((tds) => (
                <div key={tds.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <FileText className="h-6 w-6 text-blue-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{tds.title}</h3>
                        <p className="text-sm text-gray-500">SKU: {tds.sku}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      v{tds.document_version}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Formula:</span>
                      <span className="ml-2 font-mono text-gray-600">{tds.molecular_formula}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">MW:</span>
                      <span className="ml-2 text-gray-600">{tds.molecular_weight} Da</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Purity:</span>
                      <span className="ml-2 text-green-600">{tds.purity_specification}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Storage:</span>
                      <span className="ml-2 text-gray-600">{tds.storage_temperature}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Applications:</div>
                    <div className="flex flex-wrap gap-1">
                      {tds.research_applications.slice(0, 3).map((app, index) => (
                        <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                          {app}
                        </span>
                      ))}
                      {tds.research_applications.length > 3 && (
                        <span className="text-xs text-gray-400">+{tds.research_applications.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(tds, 'tds')}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload('tds', tds.id)}
                      disabled={downloading === tds.id}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloading === tds.id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Safety Data Sheets */}
          {activeTab === 'sds' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productSDS.map((sds) => (
                <div key={sds.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-red-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{sds.product_name}</h3>
                        <p className="text-sm text-gray-500">SDS: {sds.sds_number}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                      v{sds.document_version}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">SKU:</span>
                      <span className="ml-2 text-gray-600">{sds.sku}</span>
                    </div>
                    {sds.signal_word && (
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Signal Word:</span>
                        <span className="ml-2 font-semibold text-orange-600">{sds.signal_word}</span>
                      </div>
                    )}
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">Classification:</span>
                      <span className="ml-2 text-gray-600">{sds.ghs_classification.category || 'Not classified'}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Key Hazards:</div>
                    <div className="space-y-1">
                      {sds.hazard_statements.slice(0, 2).map((statement, index) => (
                        <div key={index} className="text-xs text-gray-600">• {statement}</div>
                      ))}
                      {sds.hazard_statements.length > 2 && (
                        <div className="text-xs text-gray-400">+{sds.hazard_statements.length - 2} more</div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(sds, 'sds')}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload('sds', sds.id)}
                      disabled={downloading === sds.id}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloading === sds.id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Research Protocols */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {productReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.title}</h3>
                        <p className="text-sm text-gray-500">{report.research_area}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded ${
                        report.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                        report.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {report.difficulty_level}
                      </span>
                      {report.rating_average && (
                        <div className="flex items-center mt-1">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          <span className="text-xs text-gray-600">
                            {report.rating_average.toFixed(1)} ({report.rating_count})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{report.objective}</p>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDocument(report, 'report')}
                      className="flex-1 flex items-center justify-center px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => handleDownload('report', report.id)}
                      disabled={downloading === report.id}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      {downloading === report.id ? 'Downloading...' : 'Download'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Empty States */}
        {activeTab === 'tds' && productTDS.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Technical Data Sheets</h3>
            <p className="text-gray-600">Technical specifications will be available soon.</p>
          </div>
        )}

        {activeTab === 'sds' && productSDS.length === 0 && (
          <div className="text-center py-16">
            <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Safety Data Sheets</h3>
            <p className="text-gray-600">Safety information will be available soon.</p>
          </div>
        )}

        {activeTab === 'protocols' && productProtocols.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Research Protocols</h3>
            <p className="text-gray-600">Research protocols will be available soon.</p>
          </div>
        )}
      </div>

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          documentType={documentType}
          onClose={() => setSelectedDocument(null)}
          onDownload={(format) => handleDownload(documentType as any, selectedDocument.id, format)}
        />
      )}
    </div>
  );
}