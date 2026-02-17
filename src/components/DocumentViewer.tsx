import { useState, useEffect } from 'react';
import { X, Download, Star, FileText, Shield, BookOpen, Clock, User, Building, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DocumentViewerProps {
  document: any;
  documentType: string;
  onClose: () => void;
  onDownload: (format: 'PDF' | 'DOC' | 'JSON') => void;
}

export default function DocumentViewer({ document, documentType, onClose, onDownload }: DocumentViewerProps) {
  const [downloadFormat, setDownloadFormat] = useState<'PDF' | 'DOC' | 'JSON'>('PDF');
  const [downloading, setDownloading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (document.document_url) {
      const { data } = supabase.storage
        .from('research_documents')
        .getPublicUrl(document.document_url);

      setPdfUrl(data.publicUrl);
    }
  }, [document]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await onDownload(downloadFormat);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloading(false);
    }
  };

  const getDocumentIcon = () => {
    switch (documentType) {
      case 'tds':
        return <FileText className="h-6 w-6 text-blue-600" />;
      case 'sds':
        return <Shield className="h-6 w-6 text-red-600" />;
      case 'report':
        return <BookOpen className="h-6 w-6 text-green-600" />;
      default:
        return <FileText className="h-6 w-6 text-gray-600" />;
    }
  };

  const getDocumentTitle = () => {
    switch (documentType) {
      case 'tds':
        return 'Technical Data Sheet';
      case 'sds':
        return 'Safety Data Sheet';
      case 'report':
        return 'Testing Report';
      default:
        return 'Document';
    }
  };

  if (pdfUrl) {
    return (
      <>
        {/* Overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

        {/* Full-screen PDF Viewer */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full h-full max-w-7xl max-h-[95vh] flex flex-col">
            {/* Minimal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {document.title || document.product_name || 'Document'}
              </h2>
              <div className="flex items-center space-x-3">
                <a
                  href={pdfUrl}
                  download
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </a>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-gray-100">
              <iframe
                src={pdfUrl}
                className="w-full h-full"
                title={document.title || document.product_name || 'Document'}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center">
              {getDocumentIcon()}
              <div className="ml-3">
                <h2 className="text-xl font-semibold text-gray-900">{getDocumentTitle()}</h2>
                <p className="text-gray-600">
                  {documentType === 'tds' && document.title}
                  {documentType === 'sds' && document.product_name}
                  {documentType === 'report' && document.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as 'PDF' | 'DOC' | 'JSON')}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="PDF">PDF</option>
                <option value="DOC">DOC</option>
                <option value="JSON">JSON</option>
              </select>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Technical Data Sheet Content */}
            {documentType === 'tds' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Chemical Properties</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Molecular Formula:</span>
                        <span className="font-mono font-medium">{document.molecular_formula}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Molecular Weight:</span>
                        <span className="font-medium">{document.molecular_weight} Da</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Purity:</span>
                        <span className="font-medium text-green-600">{document.purity_specification}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Appearance:</span>
                        <span className="font-medium">{document.appearance}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Temperature:</span>
                        <span className="font-medium">{document.storage_temperature}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Conditions:</span>
                        <span className="font-medium">{document.storage_conditions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shelf Life:</span>
                        <span className="font-medium">{document.shelf_life}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Solubility Data</h3>
                  <div className="bg-white border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solvent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solubility</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(document.solubility).map(([solvent, solubility]) => (
                          <tr key={solvent}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {solvent.charAt(0).toUpperCase() + solvent.slice(1)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {solubility}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Research Applications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {document.research_applications.map((app: string, index: number) => (
                      <div key={index} className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-sm text-blue-900">{app}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {document.biological_activity && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Biological Activity</h3>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-green-900">{document.biological_activity}</p>
                    </div>
                  </div>
                )}

                {document.reconstitution_guidelines && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconstitution Guidelines</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-900">{document.reconstitution_guidelines}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Safety Data Sheet Content */}
            {documentType === 'sds' && (
              <div className="space-y-8">
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                    <div>
                      <h3 className="font-semibold text-red-900">Safety Information</h3>
                      <p className="text-red-700">SDS Number: {document.sds_number}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hazard Classification</h3>
                    <div className="space-y-3">
                      {document.signal_word && (
                        <div className="bg-orange-100 p-3 rounded-lg">
                          <span className="font-semibold text-orange-900">Signal Word: {document.signal_word}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Hazard Statements:</h4>
                        <ul className="space-y-1">
                          {document.hazard_statements.map((statement: string, index: number) => (
                            <li key={index} className="text-sm text-gray-700">• {statement}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Precautionary Measures</h3>
                    <ul className="space-y-1">
                      {document.precautionary_statements.map((statement: string, index: number) => (
                        <li key={index} className="text-sm text-gray-700">• {statement}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">First Aid Measures</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Inhalation:</h4>
                        <p className="text-sm text-gray-700">{document.first_aid_inhalation}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Skin Contact:</h4>
                        <p className="text-sm text-gray-700">{document.first_aid_skin_contact}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900">Eye Contact:</h4>
                        <p className="text-sm text-gray-700">{document.first_aid_eye_contact}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Ingestion:</h4>
                        <p className="text-sm text-gray-700">{document.first_aid_ingestion}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Protective Equipment</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(document.personal_protective_equipment).map(([type, requirement]) => (
                      <div key={type} className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="font-medium text-blue-900 capitalize">{type}</div>
                        <div className="text-sm text-blue-700 mt-1">{requirement}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Handling and Storage</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900">Handling Precautions:</h4>
                      <p className="text-sm text-gray-700">{document.handling_precautions}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Storage Requirements:</h4>
                      <p className="text-sm text-gray-700">{document.storage_requirements}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Research Protocol Content */}
            {documentType === 'report' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Author</span>
                    </div>
                    <div className="text-sm text-gray-700">{document.author}</div>
                    {document.institution && (
                      <div className="text-xs text-gray-500 mt-1">{document.institution}</div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 text-gray-600 mr-2" />
                      <span className="font-medium text-gray-900">Duration</span>
                    </div>
                    <div className="text-sm text-gray-700">{document.estimated_time || 'Variable'}</div>
                    <div className={`text-xs mt-1 px-2 py-1 rounded ${
                      document.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                      document.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {document.difficulty_level}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Objective</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-900">{document.objective}</p>
                  </div>
                </div>

                {document.background && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Background</h3>
                    <p className="text-gray-700">{document.background}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Equipment</h3>
                    <div className="space-y-2">
                      {Object.entries(document.required_equipment).map(([item, description]) => (
                        <div key={item} className="bg-blue-50 p-3 rounded">
                          <div className="font-medium text-blue-900">{item}</div>
                          <div className="text-sm text-blue-700">{description}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Reagents</h3>
                    <div className="space-y-2">
                      {Object.entries(document.required_reagents).map(([reagent, description]) => (
                        <div key={reagent} className="bg-purple-50 p-3 rounded">
                          <div className="font-medium text-purple-900">{reagent}</div>
                          <div className="text-sm text-purple-700">{description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Procedure</h3>
                  <div className="space-y-4">
                    {Object.entries(document.procedure_steps).map(([step, description], index) => (
                      <div key={step} className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{step}</h4>
                          <p className="text-sm text-gray-700 mt-1">{description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {document.expected_outcomes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Results</h3>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-yellow-900">{document.expected_outcomes}</p>
                    </div>
                  </div>
                )}

                {document.troubleshooting_guide && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting</h3>
                    <div className="space-y-3">
                      {Object.entries(document.troubleshooting_guide).map(([problem, solution]) => (
                        <div key={problem} className="border-l-4 border-orange-400 pl-4">
                          <h4 className="font-medium text-gray-900">Problem: {problem}</h4>
                          <p className="text-sm text-gray-700 mt-1">Solution: {solution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Research Use Disclaimer */}
            <div className="mt-8 bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-red-800">
                  <strong>For Research Use Only</strong>
                  <p className="text-sm mt-1">
                    This documentation is provided for research purposes only. Products are not for human consumption. 
                    Always follow institutional safety protocols and local regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}