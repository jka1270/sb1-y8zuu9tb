import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface CertificateOfAnalysis {
  id: string;
  batch_number: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  manufacturing_date: string;
  expiry_date?: string;
  analysis_date: string;
  analyst_name: string;
  laboratory: string;
  purity_hplc: number;
  purity_ms: string;
  water_content: number;
  acetate_content: number;
  peptide_content: number;
  molecular_weight_found: number;
  molecular_weight_expected: number;
  microbiological_tests: Record<string, string>;
  heavy_metals: Record<string, string>;
  residual_solvents: Record<string, string>;
  appearance: string;
  solubility: string;
  ph_value: number;
  storage_conditions: string;
  test_methods: Record<string, string>;
  specifications_met: boolean;
  notes?: string;
  qc_approved_by: string;
  qc_approved_date: string;
  document_url?: string;
  created_at: string;
  updated_at: string;
}

export interface COADownload {
  id: string;
  coa_id: string;
  user_id?: string;
  order_id?: string;
  download_type: string;
  ip_address?: string;
  user_agent?: string;
  downloaded_at: string;
}

export const useCOA = () => {
  const [coas, setCOAs] = useState<CertificateOfAnalysis[]>([]);
  const [downloads, setDownloads] = useState<COADownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCOAs();
    if (user) {
      fetchDownloads();
    }
  }, [user]);

  const fetchCOAs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates_of_analysis')
        .select('*')
        .order('manufacturing_date', { ascending: false });

      if (error) throw error;

      setCOAs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch COAs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('coa_downloads')
        .select('*')
        .order('downloaded_at', { ascending: false });

      if (error) throw error;

      setDownloads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch downloads');
    }
  };

  const getCOAByProduct = (productId: string, variantId?: string): CertificateOfAnalysis[] => {
    return coas.filter(coa => 
      coa.product_id === productId && 
      (variantId ? coa.variant_id === variantId : true)
    );
  };

  const getCOABySKU = (sku: string): CertificateOfAnalysis[] => {
    return coas.filter(coa => coa.sku === sku);
  };

  const getCOAByBatch = (batchNumber: string): CertificateOfAnalysis | undefined => {
    return coas.find(coa => coa.batch_number === batchNumber);
  };

  const downloadCOA = async (
    coaId: string, 
    format: 'PDF' | 'JSON' | 'XML' = 'PDF',
    orderId?: string
  ): Promise<string> => {
    try {
      const coa = coas.find(c => c.id === coaId);
      if (!coa) throw new Error('COA not found');

      // Track the download
      const { data: downloadRecord, error: trackError } = await supabase
        .rpc('track_coa_download', {
          coa_uuid: coaId,
          user_uuid: user?.id,
          order_uuid: orderId,
          download_format: format,
          client_ip: null, // Would be set by server
          client_user_agent: navigator.userAgent
        });

      if (trackError) {
        console.warn('Failed to track download:', trackError);
      }

      // Generate and return download content based on format
      if (format === 'PDF') {
        return generateCOAPDF(coa);
      } else if (format === 'JSON') {
        return JSON.stringify(coa, null, 2);
      } else if (format === 'XML') {
        return generateCOAXML(coa);
      }

      throw new Error('Unsupported format');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download COA');
      throw err;
    }
  };

  const generateCOAPDF = (coa: CertificateOfAnalysis): string => {
    // In a real implementation, this would generate a proper PDF
    // For now, return a data URL with HTML content that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Analysis - ${coa.batch_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .document-title { font-size: 20px; margin-top: 10px; }
          .section { margin-bottom: 25px; }
          .section-title { font-size: 16px; font-weight: bold; color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 8px; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .test-results { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .test-results th, .test-results td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .test-results th { background-color: #f5f5f5; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
          .signature-section { margin-top: 30px; }
          .signature-line { border-bottom: 1px solid #333; width: 200px; margin: 20px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PeptideTech Research</div>
          <div>Quality Control Laboratory</div>
          <div class="document-title">Certificate of Analysis</div>
        </div>

        <div class="section">
          <div class="section-title">Product Information</div>
          <div class="info-grid">
            <div>
              <div class="info-item"><span class="label">Batch Number:</span><span class="value">${coa.batch_number}</span></div>
              <div class="info-item"><span class="label">Product SKU:</span><span class="value">${coa.sku}</span></div>
              <div class="info-item"><span class="label">Manufacturing Date:</span><span class="value">${new Date(coa.manufacturing_date).toLocaleDateString()}</span></div>
              <div class="info-item"><span class="label">Expiry Date:</span><span class="value">${coa.expiry_date ? new Date(coa.expiry_date).toLocaleDateString() : 'N/A'}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="label">Analysis Date:</span><span class="value">${new Date(coa.analysis_date).toLocaleDateString()}</span></div>
              <div class="info-item"><span class="label">Analyst:</span><span class="value">${coa.analyst_name}</span></div>
              <div class="info-item"><span class="label">Laboratory:</span><span class="value">${coa.laboratory}</span></div>
              <div class="info-item"><span class="label">Approved By:</span><span class="value">${coa.qc_approved_by}</span></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Purity Analysis</div>
          <table class="test-results">
            <tr><th>Test</th><th>Result</th><th>Specification</th></tr>
            <tr><td>HPLC Purity</td><td>${coa.purity_hplc}%</td><td>≥ 95%</td></tr>
            <tr><td>Mass Spectrometry</td><td>${coa.purity_ms}</td><td>Confirmed</td></tr>
            <tr><td>Water Content</td><td>${coa.water_content}%</td><td>≤ 10%</td></tr>
            <tr><td>Acetate Content</td><td>${coa.acetate_content}%</td><td>≤ 15%</td></tr>
            <tr><td>Peptide Content</td><td>${coa.peptide_content}%</td><td>≥ 80%</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Molecular Weight Analysis</div>
          <table class="test-results">
            <tr><th>Parameter</th><th>Found</th><th>Expected</th></tr>
            <tr><td>Molecular Weight (Da)</td><td>${coa.molecular_weight_found}</td><td>${coa.molecular_weight_expected}</td></tr>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Microbiological Testing</div>
          <table class="test-results">
            <tr><th>Test</th><th>Result</th><th>Specification</th></tr>
            ${Object.entries(coa.microbiological_tests).map(([test, result]) => 
              `<tr><td>${test.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td><td>${result}</td><td>Pass</td></tr>`
            ).join('')}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Physical Properties</div>
          <div class="info-item"><span class="label">Appearance:</span><span class="value">${coa.appearance}</span></div>
          <div class="info-item"><span class="label">Solubility:</span><span class="value">${coa.solubility}</span></div>
          <div class="info-item"><span class="label">pH Value:</span><span class="value">${coa.ph_value}</span></div>
        </div>

        <div class="section">
          <div class="section-title">Storage Conditions</div>
          <div class="info-item">${coa.storage_conditions}</div>
        </div>

        ${coa.notes ? `
        <div class="section">
          <div class="section-title">Additional Notes</div>
          <div class="info-item">${coa.notes}</div>
        </div>
        ` : ''}

        <div class="signature-section">
          <div class="info-item"><span class="label">QC Approved By:</span><span class="value">${coa.qc_approved_by}</span></div>
          <div class="info-item"><span class="label">Approval Date:</span><span class="value">${new Date(coa.qc_approved_date).toLocaleDateString()}</span></div>
          <div class="signature-line"></div>
          <div style="text-align: center; margin-top: 5px;">Authorized Signature</div>
        </div>

        <div class="footer">
          <p><strong>For Research Use Only - Not for Human Consumption</strong></p>
          <p>This certificate applies only to the batch tested. Results may not be used for other batches.</p>
          <p>PeptideTech Research | Quality Control Laboratory | San Diego, CA 92121</p>
        </div>
      </body>
      </html>
    `;

    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };

  const generateCOAXML = (coa: CertificateOfAnalysis): string => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<certificate_of_analysis>
  <header>
    <batch_number>${coa.batch_number}</batch_number>
    <product_id>${coa.product_id}</product_id>
    <sku>${coa.sku}</sku>
    <manufacturing_date>${coa.manufacturing_date}</manufacturing_date>
    <analysis_date>${coa.analysis_date}</analysis_date>
    <analyst>${coa.analyst_name}</analyst>
    <laboratory>${coa.laboratory}</laboratory>
  </header>
  <purity_analysis>
    <hplc_purity>${coa.purity_hplc}</hplc_purity>
    <mass_spectrometry>${coa.purity_ms}</mass_spectrometry>
    <water_content>${coa.water_content}</water_content>
    <acetate_content>${coa.acetate_content}</acetate_content>
    <peptide_content>${coa.peptide_content}</peptide_content>
  </purity_analysis>
  <molecular_weight>
    <found>${coa.molecular_weight_found}</found>
    <expected>${coa.molecular_weight_expected}</expected>
  </molecular_weight>
  <microbiological_tests>
    ${Object.entries(coa.microbiological_tests).map(([key, value]) => 
      `<${key}>${value}</${key}>`
    ).join('\n    ')}
  </microbiological_tests>
  <quality_control>
    <specifications_met>${coa.specifications_met}</specifications_met>
    <approved_by>${coa.qc_approved_by}</approved_by>
    <approval_date>${coa.qc_approved_date}</approval_date>
  </quality_control>
</certificate_of_analysis>`;
  };

  const verifyCOA = async (batchNumber: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('certificates_of_analysis')
        .select('id, specifications_met')
        .eq('batch_number', batchNumber)
        .single();

      if (error) return false;
      return data?.specifications_met || false;
    } catch {
      return false;
    }
  };

  return {
    coas,
    downloads,
    loading,
    error,
    getCOAByProduct,
    getCOABySKU,
    getCOAByBatch,
    downloadCOA,
    verifyCOA,
    refetch: fetchCOAs
  };
};