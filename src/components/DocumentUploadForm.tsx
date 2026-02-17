import { useState } from 'react';
import { Upload, FileText, X, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import LoadingSpinner from './LoadingSpinner';
import { useToast } from './ToastContainer';

type DocumentCategory = 'technical' | 'safety' | 'report';

interface DocumentUploadFormProps {
  category: DocumentCategory;
  productId?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DocumentUploadForm({
  category,
  productId = '',
  onSuccess,
  onCancel
}: DocumentUploadFormProps) {
  const toast = useToast();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [associatedProductId, setAssociatedProductId] = useState(productId);

  const getCategoryLabel = () => {
    switch (category) {
      case 'technical':
        return 'Technical Data Sheet';
      case 'safety':
        return 'Safety Data Sheet';
      case 'report':
        return 'Testing Report';
      default:
        return 'Document';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];

      if (!validTypes.includes(selectedFile.type)) {
        toast.error('Invalid file type', 'Please upload a PDF, Word document, or text file');
        return;
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error('File too large', 'File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.warning('No file selected', 'Please select a file to upload');
      return;
    }

    if (!title.trim() && category !== 'report') {
      toast.warning('Title required', 'Please provide a title for the document');
      return;
    }

    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('research_documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('research_documents')
        .getPublicUrl(filePath);

      let tableName = '';
      let documentData: any = {};

      if (category === 'technical') {
        tableName = 'technical_data_sheets';
        documentData = {
          product_id: associatedProductId || 'general',
          sku: associatedProductId || 'general',
          document_version: '1.0',
          title: title.trim(),
          description: description.trim() || null,
          molecular_formula: 'N/A',
          molecular_weight: 0,
          purity_specification: 'See document',
          appearance: 'See document',
          storage_temperature: 'See document',
          storage_conditions: 'See document',
          shelf_life: 'See document',
          research_applications: [],
          research_areas: [],
          solubility: {},
          analytical_methods: {},
          regulatory_status: 'Research Use Only',
          document_url: filePath,
          last_reviewed: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else if (category === 'safety') {
        tableName = 'safety_data_sheets';
        documentData = {
          product_id: associatedProductId || 'general',
          sku: associatedProductId || 'general',
          document_version: '1.0',
          sds_number: `SDS-${Date.now()}`,
          product_name: title.trim(),
          ghs_classification: {},
          hazard_statements: [],
          precautionary_statements: [],
          chemical_identity: {},
          first_aid_inhalation: 'See document',
          first_aid_skin_contact: 'See document',
          first_aid_eye_contact: 'See document',
          first_aid_ingestion: 'See document',
          handling_precautions: 'See document',
          storage_requirements: 'See document',
          personal_protective_equipment: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      } else if (category === 'report') {
        tableName = 'testing_reports';
        const finalTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '') || `Testing Report ${new Date().toLocaleDateString()}`;
        documentData = {
          product_id: associatedProductId || 'general',
          report_type: 'General',
          title: finalTitle,
          description: description.trim() || null,
          research_area: 'General',
          difficulty_level: 'intermediate',
          objective: description.trim() || 'See document',
          procedure_steps: {},
          author: user.email || 'Unknown',
          version: '1.0',
          approval_status: 'pending',
          required_equipment: {},
          required_reagents: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const { error: dbError } = await supabase
        .from(tableName)
        .insert([documentData]);

      if (dbError) {
        await supabase.storage
          .from('research_documents')
          .remove([filePath]);
        throw dbError;
      }

      const uploadedTitle = category === 'report' && !title.trim()
        ? (file.name.replace(/\.[^/.]+$/, '') || `Testing Report ${new Date().toLocaleDateString()}`)
        : title;

      toast.success('Document uploaded successfully!', `${uploadedTitle} has been added to the system`);
      onSuccess();
    } catch (error: any) {
      console.error('Error uploading document:', error);
      toast.error('Upload failed', error.message || 'An error occurred while uploading the document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Upload {getCategoryLabel()}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document File *
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center"
            >
              {file ? (
                <>
                  <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setFile(null);
                    }}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Choose different file
                  </button>
                </>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, Word, or Text files (max 10MB)
                  </p>
                </>
              )}
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Supported formats: PDF (.pdf), Word (.doc, .docx), Text (.txt)
          </p>
        </div>

        {category !== 'report' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., BPC-157 Technical Data Sheet"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Add any additional notes or description about this document..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Associated Product ID (Optional)
              </label>
              <input
                type="text"
                value={associatedProductId}
                onChange={(e) => setAssociatedProductId(e.target.value)}
                placeholder="e.g., bpc-157 (leave empty for general documents)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Link this document to a specific product, or leave empty for general documentation
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
