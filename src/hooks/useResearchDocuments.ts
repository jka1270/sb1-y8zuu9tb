import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface TechnicalDataSheet {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  document_version: string;
  title: string;
  description?: string;
  molecular_formula: string;
  molecular_weight: number;
  cas_number?: string;
  purity_specification: string;
  appearance: string;
  solubility: Record<string, string>;
  stability_data?: Record<string, any>;
  storage_temperature: string;
  storage_conditions: string;
  shelf_life: string;
  research_applications: string[];
  biological_activity?: string;
  mechanism_of_action?: string;
  target_receptors?: string[];
  research_areas: string[];
  analytical_methods: Record<string, string>;
  reconstitution_guidelines?: string;
  working_concentrations?: string;
  regulatory_status: string;
  references?: string[];
  document_url?: string;
  last_reviewed: string;
  created_at: string;
  updated_at: string;
}

export interface SafetyDataSheet {
  id: string;
  product_id: string;
  variant_id?: string;
  sku: string;
  document_version: string;
  sds_number: string;
  product_name: string;
  ghs_classification: Record<string, any>;
  signal_word?: string;
  hazard_statements: string[];
  precautionary_statements: string[];
  chemical_identity: Record<string, any>;
  first_aid_inhalation: string;
  first_aid_skin_contact: string;
  first_aid_eye_contact: string;
  first_aid_ingestion: string;
  handling_precautions: string;
  storage_requirements: string;
  personal_protective_equipment: Record<string, string>;
  disposal_methods: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchProtocol {
  id: string;
  product_id: string;
  variant_id?: string;
  protocol_type: string;
  title: string;
  description?: string;
  research_area: string;
  difficulty_level: string;
  estimated_time?: string;
  objective: string;
  background?: string;
  required_equipment: Record<string, string>;
  required_reagents: Record<string, string>;
  procedure_steps: Record<string, string>;
  expected_outcomes?: string;
  troubleshooting_guide?: Record<string, string>;
  author: string;
  institution?: string;
  version: string;
  approval_status: string;
  download_count: number;
  rating_average?: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentDownload {
  id: string;
  user_id?: string;
  document_type: string;
  document_id: string;
  product_id?: string;
  download_format: string;
  access_method: string;
  downloaded_at: string;
}

export const useResearchDocuments = () => {
  const [technicalDataSheets, setTechnicalDataSheets] = useState<TechnicalDataSheet[]>([]);
  const [safetyDataSheets, setSafetyDataSheets] = useState<SafetyDataSheet[]>([]);
  const [researchProtocols, setResearchProtocols] = useState<ResearchProtocol[]>([]);
  const [downloads, setDownloads] = useState<DocumentDownload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchDocuments();
    if (user) {
      fetchDownloads();
    }
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      const [tdsResponse, sdsResponse, protocolsResponse] = await Promise.all([
        supabase.from('technical_data_sheets').select('*').order('created_at', { ascending: false }),
        supabase.from('safety_data_sheets').select('*').order('created_at', { ascending: false }),
        supabase.from('research_protocols').select('*').eq('approval_status', 'approved').order('rating_average', { ascending: false })
      ]);

      if (tdsResponse.error) throw tdsResponse.error;
      if (sdsResponse.error) throw sdsResponse.error;
      if (protocolsResponse.error) throw protocolsResponse.error;

      setTechnicalDataSheets(tdsResponse.data || []);
      setSafetyDataSheets(sdsResponse.data || []);
      setResearchProtocols(protocolsResponse.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloads = async () => {
    try {
      const { data, error } = await supabase
        .from('document_downloads')
        .select('*')
        .order('downloaded_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setDownloads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch downloads');
    }
  };

  const getTDSByProduct = (productId: string, variantId?: string): TechnicalDataSheet[] => {
    return technicalDataSheets.filter(tds => 
      tds.product_id === productId && 
      (variantId ? tds.variant_id === variantId : true)
    );
  };

  const getSDSByProduct = (productId: string, variantId?: string): SafetyDataSheet[] => {
    return safetyDataSheets.filter(sds => 
      sds.product_id === productId && 
      (variantId ? sds.variant_id === variantId : true)
    );
  };

  const getProtocolsByProduct = (productId: string): ResearchProtocol[] => {
    return researchProtocols.filter(protocol => protocol.product_id === productId);
  };

  const getProtocolsByArea = (researchArea: string): ResearchProtocol[] => {
    return researchProtocols.filter(protocol => 
      protocol.research_area.toLowerCase().includes(researchArea.toLowerCase())
    );
  };

  const downloadDocument = async (
    documentType: 'tds' | 'sds' | 'protocol',
    documentId: string,
    format: 'PDF' | 'DOC' | 'JSON' | 'HTML' = 'PDF',
    productId?: string
  ): Promise<string> => {
    try {
      // Track the download
      if (user) {
        await supabase.from('document_downloads').insert({
          user_id: user.id,
          document_type: documentType,
          document_id: documentId,
          product_id: productId,
          download_format: format,
          access_method: 'direct',
          user_agent: navigator.userAgent
        });
      }

      // Generate document content based on type and format
      let document: any;
      
      if (documentType === 'tds') {
        document = technicalDataSheets.find(d => d.id === documentId);
        if (!document) throw new Error('Technical Data Sheet not found');
        return generateTDSDocument(document, format);
      } else if (documentType === 'sds') {
        document = safetyDataSheets.find(d => d.id === documentId);
        if (!document) throw new Error('Safety Data Sheet not found');
        return generateSDSDocument(document, format);
      } else if (documentType === 'protocol') {
        document = researchProtocols.find(d => d.id === documentId);
        if (!document) throw new Error('Research Protocol not found');
        return generateProtocolDocument(document, format);
      }

      throw new Error('Invalid document type');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download document');
      throw err;
    }
  };

  const generateTDSDocument = (tds: TechnicalDataSheet, format: string): string => {
    if (format === 'JSON') {
      return JSON.stringify(tds, null, 2);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Technical Data Sheet - ${tds.sku}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #3B82F6; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #3B82F6; }
          .document-title { font-size: 20px; margin-top: 10px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 16px; font-weight: bold; color: #1F2937; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 8px; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-left: 10px; color: #6B7280; }
          .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .table th, .table td { border: 1px solid #D1D5DB; padding: 8px; text-align: left; }
          .table th { background-color: #F9FAFB; font-weight: bold; }
          .warning-box { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PeptideTech Research</div>
          <div>Quality Control Laboratory</div>
          <div class="document-title">Technical Data Sheet</div>
          <div style="margin-top: 10px; font-size: 14px;">Document Version: ${tds.document_version}</div>
        </div>

        <div class="section">
          <div class="section-title">Product Identification</div>
          <div class="info-grid">
            <div>
              <div class="info-item"><span class="label">Product Name:</span><span class="value">${tds.title}</span></div>
              <div class="info-item"><span class="label">SKU:</span><span class="value">${tds.sku}</span></div>
              <div class="info-item"><span class="label">Product ID:</span><span class="value">${tds.product_id}</span></div>
            </div>
            <div>
              <div class="info-item"><span class="label">Document Version:</span><span class="value">${tds.document_version}</span></div>
              <div class="info-item"><span class="label">Last Reviewed:</span><span class="value">${new Date(tds.last_reviewed).toLocaleDateString()}</span></div>
              <div class="info-item"><span class="label">Regulatory Status:</span><span class="value">${tds.regulatory_status}</span></div>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Chemical Properties</div>
          <table class="table">
            <tr><th>Property</th><th>Value</th></tr>
            <tr><td>Molecular Formula</td><td>${tds.molecular_formula}</td></tr>
            <tr><td>Molecular Weight</td><td>${tds.molecular_weight} Da</td></tr>
            <tr><td>Purity Specification</td><td>${tds.purity_specification}</td></tr>
            <tr><td>Appearance</td><td>${tds.appearance}</td></tr>
            ${tds.cas_number ? `<tr><td>CAS Number</td><td>${tds.cas_number}</td></tr>` : ''}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Solubility</div>
          <table class="table">
            <tr><th>Solvent</th><th>Solubility</th></tr>
            ${Object.entries(tds.solubility).map(([solvent, solubility]) => 
              `<tr><td>${solvent.charAt(0).toUpperCase() + solvent.slice(1)}</td><td>${solubility}</td></tr>`
            ).join('')}
          </table>
        </div>

        <div class="section">
          <div class="section-title">Storage and Handling</div>
          <div class="info-item"><span class="label">Storage Temperature:</span><span class="value">${tds.storage_temperature}</span></div>
          <div class="info-item"><span class="label">Storage Conditions:</span><span class="value">${tds.storage_conditions}</span></div>
          <div class="info-item"><span class="label">Shelf Life:</span><span class="value">${tds.shelf_life}</span></div>
          ${tds.reconstitution_guidelines ? `<div class="info-item"><span class="label">Reconstitution:</span><span class="value">${tds.reconstitution_guidelines}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Research Applications</div>
          <ul>
            ${tds.research_applications.map(app => `<li>${app}</li>`).join('')}
          </ul>
          ${tds.biological_activity ? `<div class="info-item"><span class="label">Biological Activity:</span><span class="value">${tds.biological_activity}</span></div>` : ''}
          ${tds.mechanism_of_action ? `<div class="info-item"><span class="label">Mechanism of Action:</span><span class="value">${tds.mechanism_of_action}</span></div>` : ''}
          ${tds.working_concentrations ? `<div class="info-item"><span class="label">Working Concentrations:</span><span class="value">${tds.working_concentrations}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">Analytical Methods</div>
          <table class="table">
            <tr><th>Method</th><th>Description</th></tr>
            ${Object.entries(tds.analytical_methods).map(([method, description]) => 
              `<tr><td>${method.toUpperCase()}</td><td>${description}</td></tr>`
            ).join('')}
          </table>
        </div>

        <div class="warning-box">
          <strong>⚠️ For Research Use Only</strong><br>
          This product is intended for research use only and not for human consumption. 
          Handle with appropriate safety equipment and follow institutional safety protocols.
        </div>

        <div class="footer">
          <p><strong>PeptideTech Research</strong></p>
          <p>Technical Support: tech-support@peptidetechresearch.com | Quality Control Laboratory</p>
          <p>This document was generated on ${new Date().toLocaleDateString()} and is valid for the specified product batch only.</p>
        </div>
      </body>
      </html>
    `;

    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };

  const generateSDSDocument = (sds: SafetyDataSheet, format: string): string => {
    if (format === 'JSON') {
      return JSON.stringify(sds, null, 2);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Safety Data Sheet - ${sds.sds_number}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px solid #EF4444; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #EF4444; }
          .document-title { font-size: 20px; margin-top: 10px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 16px; font-weight: bold; color: #1F2937; background-color: #FEF2F2; padding: 8px; border-left: 4px solid #EF4444; margin-bottom: 15px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-item { margin-bottom: 8px; }
          .label { font-weight: bold; color: #374151; }
          .value { margin-left: 10px; color: #6B7280; }
          .hazard-box { background-color: #FEE2E2; border: 2px solid #EF4444; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .emergency-box { background-color: #DBEAFE; border: 2px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PeptideTech Research</div>
          <div>Safety Data Sheet</div>
          <div class="document-title">${sds.product_name}</div>
          <div style="margin-top: 10px; font-size: 14px;">SDS Number: ${sds.sds_number} | Version: ${sds.document_version}</div>
        </div>

        <div class="section">
          <div class="section-title">1. Product and Company Identification</div>
          <div class="info-item"><span class="label">Product Name:</span><span class="value">${sds.product_name}</span></div>
          <div class="info-item"><span class="label">SKU:</span><span class="value">${sds.sku}</span></div>
          <div class="info-item"><span class="label">Recommended Use:</span><span class="value">Research chemical</span></div>
          <div class="info-item"><span class="label">Restrictions:</span><span class="value">Not for human or veterinary use</span></div>
        </div>

        <div class="section">
          <div class="section-title">2. Hazard Identification</div>
          ${sds.signal_word ? `<div class="hazard-box"><strong>Signal Word: ${sds.signal_word}</strong></div>` : ''}
          <div class="info-item"><span class="label">Hazard Statements:</span></div>
          <ul>${sds.hazard_statements.map(statement => `<li>${statement}</li>`).join('')}</ul>
          <div class="info-item"><span class="label">Precautionary Statements:</span></div>
          <ul>${sds.precautionary_statements.map(statement => `<li>${statement}</li>`).join('')}</ul>
        </div>

        <div class="section">
          <div class="section-title">3. Composition/Information on Ingredients</div>
          <div class="info-item"><span class="label">Chemical Name:</span><span class="value">${sds.chemical_identity.name}</span></div>
          <div class="info-item"><span class="label">Molecular Formula:</span><span class="value">${sds.chemical_identity.formula}</span></div>
          <div class="info-item"><span class="label">Molecular Weight:</span><span class="value">${sds.chemical_identity.mw} Da</span></div>
          ${sds.chemical_identity.cas ? `<div class="info-item"><span class="label">CAS Number:</span><span class="value">${sds.chemical_identity.cas}</span></div>` : ''}
        </div>

        <div class="section">
          <div class="section-title">4. First Aid Measures</div>
          <div class="emergency-box">
            <strong>Emergency Contact: 1-800-424-9300 (CHEMTREC)</strong>
          </div>
          <div class="info-item"><span class="label">Inhalation:</span><span class="value">${sds.first_aid_inhalation}</span></div>
          <div class="info-item"><span class="label">Skin Contact:</span><span class="value">${sds.first_aid_skin_contact}</span></div>
          <div class="info-item"><span class="label">Eye Contact:</span><span class="value">${sds.first_aid_eye_contact}</span></div>
          <div class="info-item"><span class="label">Ingestion:</span><span class="value">${sds.first_aid_ingestion}</span></div>
        </div>

        <div class="section">
          <div class="section-title">7. Handling and Storage</div>
          <div class="info-item"><span class="label">Handling Precautions:</span><span class="value">${sds.handling_precautions}</span></div>
          <div class="info-item"><span class="label">Storage Requirements:</span><span class="value">${sds.storage_requirements}</span></div>
        </div>

        <div class="section">
          <div class="section-title">8. Exposure Controls/Personal Protection</div>
          <div class="info-item"><span class="label">Respiratory Protection:</span><span class="value">${sds.personal_protective_equipment.respiratory}</span></div>
          <div class="info-item"><span class="label">Hand Protection:</span><span class="value">${sds.personal_protective_equipment.hands}</span></div>
          <div class="info-item"><span class="label">Eye Protection:</span><span class="value">${sds.personal_protective_equipment.eyes}</span></div>
          <div class="info-item"><span class="label">Skin Protection:</span><span class="value">${sds.personal_protective_equipment.skin}</span></div>
        </div>

        <div class="section">
          <div class="section-title">13. Disposal Considerations</div>
          <div class="info-item">${sds.disposal_methods || 'Dispose according to local, state, and federal regulations. Contact licensed waste disposal service.'}</div>
        </div>

        <div class="hazard-box">
          <strong>⚠️ IMPORTANT SAFETY NOTICE</strong><br>
          This product is for research use only. Not for human consumption. 
          Always wear appropriate personal protective equipment and follow institutional safety protocols.
        </div>

        <div class="footer">
          <p><strong>PeptideTech Research Safety Department</strong></p>
          <p>Emergency: 1-800-424-9300 | Safety Questions: safety@peptidetechresearch.com</p>
          <p>Document prepared: ${new Date().toLocaleDateString()} | This SDS complies with OSHA HCS 2012 requirements.</p>
        </div>
      </body>
      </html>
    `;

    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };

  const generateProtocolDocument = (protocol: ResearchProtocol, format: string): string => {
    if (format === 'JSON') {
      return JSON.stringify(protocol, null, 2);
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Research Protocol - ${protocol.title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #10B981; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #10B981; }
          .document-title { font-size: 20px; margin-top: 10px; }
          .section { margin-bottom: 25px; page-break-inside: avoid; }
          .section-title { font-size: 16px; font-weight: bold; color: #1F2937; background-color: #F0FDF4; padding: 8px; border-left: 4px solid #10B981; margin-bottom: 15px; }
          .step-list { counter-reset: step-counter; }
          .step-item { counter-increment: step-counter; margin-bottom: 15px; padding-left: 30px; position: relative; }
          .step-item::before { content: counter(step-counter); position: absolute; left: 0; top: 0; background: #10B981; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; }
          .materials-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          .info-box { background-color: #EFF6FF; border: 1px solid #3B82F6; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .warning-box { background-color: #FEF3C7; border: 1px solid #F59E0B; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #E5E7EB; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PeptideTech Research</div>
          <div>Research Protocol Library</div>
          <div class="document-title">${protocol.title}</div>
          <div style="margin-top: 10px; font-size: 14px;">
            Version: ${protocol.version} | Difficulty: ${protocol.difficulty_level} | Time: ${protocol.estimated_time}
          </div>
        </div>

        <div class="section">
          <div class="section-title">Protocol Overview</div>
          <div><strong>Objective:</strong> ${protocol.objective}</div>
          ${protocol.background ? `<div style="margin-top: 10px;"><strong>Background:</strong> ${protocol.background}</div>` : ''}
          <div style="margin-top: 10px;"><strong>Research Area:</strong> ${protocol.research_area}</div>
          <div><strong>Author:</strong> ${protocol.author}${protocol.institution ? ` (${protocol.institution})` : ''}</div>
        </div>

        <div class="section">
          <div class="section-title">Required Materials</div>
          <div class="materials-grid">
            <div>
              <h4>Equipment</h4>
              <ul>
                ${Object.entries(protocol.required_equipment).map(([item, description]) => 
                  `<li><strong>${item}:</strong> ${description}</li>`
                ).join('')}
              </ul>
            </div>
            <div>
              <h4>Reagents</h4>
              <ul>
                ${Object.entries(protocol.required_reagents).map(([reagent, description]) => 
                  `<li><strong>${reagent}:</strong> ${description}</li>`
                ).join('')}
              </ul>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Experimental Procedure</div>
          <div class="step-list">
            ${Object.entries(protocol.procedure_steps).map(([step, description]) => 
              `<div class="step-item"><strong>${step}:</strong> ${description}</div>`
            ).join('')}
          </div>
        </div>

        ${protocol.expected_outcomes ? `
        <div class="section">
          <div class="section-title">Expected Results</div>
          <div class="info-box">
            ${protocol.expected_outcomes}
          </div>
        </div>
        ` : ''}

        ${protocol.troubleshooting_guide ? `
        <div class="section">
          <div class="section-title">Troubleshooting</div>
          ${Object.entries(protocol.troubleshooting_guide).map(([problem, solution]) => 
            `<div style="margin-bottom: 10px;"><strong>Problem:</strong> ${problem}<br><strong>Solution:</strong> ${solution}</div>`
          ).join('')}
        </div>
        ` : ''}

        <div class="warning-box">
          <strong>⚠️ Research Use Only</strong><br>
          This protocol is for research purposes only. Ensure proper safety protocols are followed. 
          Not for human or veterinary use.
        </div>

        <div class="footer">
          <p><strong>PeptideTech Research Protocol Library</strong></p>
          <p>Protocol Support: protocols@peptidetechresearch.com | Research Division</p>
          <p>Document generated: ${new Date().toLocaleDateString()} | Rating: ${protocol.rating_average ? `${protocol.rating_average}/5 (${protocol.rating_count} reviews)` : 'Not rated'}</p>
        </div>
      </body>
      </html>
    `;

    return `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
  };

  const rateProtocol = async (protocolId: string, rating: number, reviewText?: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('protocol_ratings')
        .upsert({
          protocol_id: protocolId,
          user_id: user.id,
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await fetchDocuments(); // Refresh to get updated ratings
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate protocol');
      throw err;
    }
  };

  const searchDocuments = (query: string, documentType?: string) => {
    const searchTerm = query.toLowerCase();
    
    const results = {
      tds: technicalDataSheets.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.sku.toLowerCase().includes(searchTerm) ||
        doc.research_applications.some(app => app.toLowerCase().includes(searchTerm))
      ),
      sds: safetyDataSheets.filter(doc =>
        doc.product_name.toLowerCase().includes(searchTerm) ||
        doc.sku.toLowerCase().includes(searchTerm)
      ),
      protocols: researchProtocols.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.research_area.toLowerCase().includes(searchTerm) ||
        doc.objective.toLowerCase().includes(searchTerm)
      )
    };

    if (documentType) {
      return results[documentType as keyof typeof results] || [];
    }

    return results;
  };

  return {
    technicalDataSheets,
    safetyDataSheets,
    researchProtocols,
    downloads,
    loading,
    error,
    getTDSByProduct,
    getSDSByProduct,
    getProtocolsByProduct,
    getProtocolsByArea,
    downloadDocument,
    rateProtocol,
    searchDocuments,
    refetch: fetchDocuments
  };
};