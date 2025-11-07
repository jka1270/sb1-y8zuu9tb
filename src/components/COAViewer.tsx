import { useState } from 'react';
import { Download, FileText, Shield, Calendar, User, Beaker, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { CertificateOfAnalysis, useCOA } from '../hooks/useCOA';
import { useNotification } from '../contexts/NotificationContext';

interface COAViewerProps {
  coa: CertificateOfAnalysis;
  onClose?: () => void;
  orderId?: string;
}

export default function COAViewer({ coa, onClose, orderId }: COAViewerProps) {
  const [downloading, setDownloading] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<'PDF' | 'JSON' | 'XML'>('PDF');
  const { downloadCOA } = useCOA();
  const { showNotification } = useNotification();

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const content = await downloadCOA(coa.id, downloadFormat, orderId);
      
      // Create download link
      const blob = new Blob([content], { 
        type: downloadFormat === 'PDF' ? 'text/html' : 
              downloadFormat === 'JSON' ? 'application/json' : 'application/xml'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `COA_${coa.batch_number}.${downloadFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to download COA. Please try again.',
        duration: 5000
      });
    } finally {
      setDownloading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Certificate of Analysis</h2>
                <p className="text-gray-600">Batch: {coa.batch_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={downloadFormat}
                onChange={(e) => setDownloadFormat(e.target.value as 'PDF' | 'JSON' | 'XML')}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="PDF">PDF</option>
                <option value="JSON">JSON</option>
                <option value="XML">XML</option>
              </select>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4 mr-2" />
                {downloading ? 'Downloading...' : 'Download'}
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg border-2 ${
              coa.specifications_met 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                {coa.specifications_met ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                )}
                <div>
                  <h3 className={`font-semibold ${
                    coa.specifications_met ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {coa.specifications_met ? 'Specifications Met' : 'Specifications Not Met'}
                  </h3>
                  <p className={`text-sm ${
                    coa.specifications_met ? 'text-green-700' : 'text-red-700'
                  }`}>
                    This batch has {coa.specifications_met ? 'passed' : 'failed'} all quality control tests
                  </p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Product Information
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">{coa.sku}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Batch Number:</span>
                    <span className="font-medium">{coa.batch_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manufacturing Date:</span>
                    <span className="font-medium">{formatDate(coa.manufacturing_date)}</span>
                  </div>
                  {coa.expiry_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Expiry Date:</span>
                      <span className="font-medium">{formatDate(coa.expiry_date)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Quality Control
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Analysis Date:</span>
                    <span className="font-medium">{formatDate(coa.analysis_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Analyst:</span>
                    <span className="font-medium">{coa.analyst_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Laboratory:</span>
                    <span className="font-medium">{coa.laboratory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved By:</span>
                    <span className="font-medium">{coa.qc_approved_by}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approval Date:</span>
                    <span className="font-medium">{formatDate(coa.qc_approved_date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purity Analysis */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Beaker className="h-5 w-5 mr-2" />
                Purity Analysis
              </h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        HPLC Purity
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coa.purity_hplc}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ≥ 95%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coa.purity_hplc >= 95 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coa.purity_hplc >= 95 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Mass Spectrometry
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coa.purity_ms}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Confirmed
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Pass
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Water Content
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coa.water_content}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ≤ 10%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coa.water_content <= 10 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coa.water_content <= 10 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Acetate Content
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coa.acetate_content}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ≤ 15%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coa.acetate_content <= 15 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coa.acetate_content <= 15 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Peptide Content
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {coa.peptide_content}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ≥ 80%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          coa.peptide_content >= 80 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {coa.peptide_content >= 80 ? 'Pass' : 'Fail'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Molecular Weight */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Molecular Weight Analysis</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Found:</span>
                    <span className="ml-2 font-medium">{coa.molecular_weight_found} Da</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected:</span>
                    <span className="ml-2 font-medium">{coa.molecular_weight_expected} Da</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Microbiological Tests */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Microbiological Testing</h3>
              <div className="bg-white border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Test
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Result
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Object.entries(coa.microbiological_tests).map(([test, result]) => (
                      <tr key={test}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {test.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Pass
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Physical Properties */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Properties</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div>
                  <span className="text-gray-600">Appearance:</span>
                  <span className="ml-2 font-medium">{coa.appearance}</span>
                </div>
                <div>
                  <span className="text-gray-600">Solubility:</span>
                  <span className="ml-2 font-medium">{coa.solubility}</span>
                </div>
                <div>
                  <span className="text-gray-600">pH Value:</span>
                  <span className="ml-2 font-medium">{coa.ph_value}</span>
                </div>
              </div>
            </div>

            {/* Storage Conditions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Storage Conditions</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-900">{coa.storage_conditions}</p>
              </div>
            </div>

            {/* Test Methods */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytical Methods</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {Object.entries(coa.test_methods).map(([method, description]) => (
                  <div key={method}>
                    <span className="text-gray-600 font-medium">
                      {method.toUpperCase()}:
                    </span>
                    <span className="ml-2 text-gray-900">{description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            {coa.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h3>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-900">{coa.notes}</p>
                </div>
              </div>
            )}

            {/* Research Use Disclaimer */}
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-red-800">
                  <strong>For Research Use Only</strong>
                  <p className="text-sm mt-1">
                    This product is intended for research use only and not for human consumption. 
                    This certificate applies only to the batch tested and may not be used for other batches.
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