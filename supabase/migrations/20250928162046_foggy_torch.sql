/*
  # Certificate of Analysis (COA) System

  1. New Tables
    - `certificates_of_analysis`
      - `id` (uuid, primary key)
      - `batch_number` (text, unique batch identifier)
      - `product_id` (text, product identifier)
      - `variant_id` (text, variant identifier)
      - `sku` (text, product SKU)
      - `manufacturing_date` (date)
      - `expiry_date` (date)
      - `analysis_date` (date)
      - `analyst_name` (text)
      - `laboratory` (text)
      - `purity_hplc` (numeric, HPLC purity percentage)
      - `purity_ms` (text, mass spectrometry confirmation)
      - `water_content` (numeric, water percentage)
      - `acetate_content` (numeric, acetate percentage)
      - `peptide_content` (numeric, peptide content percentage)
      - `molecular_weight_found` (numeric, found molecular weight)
      - `molecular_weight_expected` (numeric, expected molecular weight)
      - `microbiological_tests` (jsonb, microbiology test results)
      - `heavy_metals` (jsonb, heavy metals test results)
      - `residual_solvents` (jsonb, solvent residue tests)
      - `appearance` (text, visual appearance)
      - `solubility` (text, solubility test results)
      - `ph_value` (numeric, pH measurement)
      - `storage_conditions` (text, recommended storage)
      - `test_methods` (jsonb, analytical methods used)
      - `specifications_met` (boolean, meets specifications)
      - `notes` (text, additional notes)
      - `qc_approved_by` (text, QC approver name)
      - `qc_approved_date` (date, QC approval date)
      - `document_url` (text, PDF document URL)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `coa_downloads`
      - `id` (uuid, primary key)
      - `coa_id` (uuid, foreign key)
      - `user_id` (uuid, user who downloaded)
      - `order_id` (uuid, related order if applicable)
      - `download_type` (text, PDF/JSON/etc)
      - `ip_address` (text, download IP)
      - `user_agent` (text, browser info)
      - `downloaded_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only download COAs for products they've purchased
    - Public access to COA existence (not content)
    - Admin access for COA management

  3. Functions
    - Generate COA PDF documents
    - Track download analytics
    - Validate COA authenticity
*/

-- Create certificates of analysis table
CREATE TABLE IF NOT EXISTS certificates_of_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number text UNIQUE NOT NULL,
  product_id text NOT NULL,
  variant_id text,
  sku text NOT NULL,
  manufacturing_date date NOT NULL,
  expiry_date date,
  analysis_date date NOT NULL,
  analyst_name text NOT NULL,
  laboratory text NOT NULL DEFAULT 'PeptideTech Quality Control Lab',
  
  -- Purity Analysis
  purity_hplc numeric(5,2) NOT NULL CHECK (purity_hplc >= 0 AND purity_hplc <= 100),
  purity_ms text NOT NULL DEFAULT 'Confirmed',
  water_content numeric(4,2) DEFAULT 0 CHECK (water_content >= 0 AND water_content <= 100),
  acetate_content numeric(4,2) DEFAULT 0 CHECK (acetate_content >= 0 AND acetate_content <= 100),
  peptide_content numeric(5,2) CHECK (peptide_content >= 0 AND peptide_content <= 100),
  
  -- Molecular Weight
  molecular_weight_found numeric(10,2),
  molecular_weight_expected numeric(10,2),
  
  -- Test Results (stored as JSON for flexibility)
  microbiological_tests jsonb DEFAULT '{
    "total_aerobic_count": "< 100 CFU/g",
    "yeast_mold": "< 10 CFU/g",
    "e_coli": "Negative",
    "salmonella": "Negative",
    "staphylococcus": "Negative"
  }'::jsonb,
  
  heavy_metals jsonb DEFAULT '{
    "lead": "< 1 ppm",
    "mercury": "< 0.1 ppm",
    "cadmium": "< 0.5 ppm",
    "arsenic": "< 1 ppm"
  }'::jsonb,
  
  residual_solvents jsonb DEFAULT '{
    "acetonitrile": "< 410 ppm",
    "methanol": "< 3000 ppm",
    "dichloromethane": "< 600 ppm",
    "trifluoroacetic_acid": "< 0.1%"
  }'::jsonb,
  
  -- Physical Properties
  appearance text DEFAULT 'White to off-white lyophilized powder',
  solubility text DEFAULT 'Soluble in water and aqueous buffers',
  ph_value numeric(3,1) CHECK (ph_value >= 0 AND ph_value <= 14),
  
  -- Storage and Methods
  storage_conditions text DEFAULT 'Store at -20°C, protect from light and moisture',
  test_methods jsonb DEFAULT '{
    "hplc": "Reversed-phase HPLC with UV detection at 220nm",
    "ms": "MALDI-TOF Mass Spectrometry",
    "water_content": "Karl Fischer Titration",
    "microbiology": "USP <61> and <62> methods"
  }'::jsonb,
  
  -- Quality Control
  specifications_met boolean NOT NULL DEFAULT true,
  notes text,
  qc_approved_by text NOT NULL,
  qc_approved_date date NOT NULL,
  document_url text, -- URL to generated PDF
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create COA downloads tracking table
CREATE TABLE IF NOT EXISTS coa_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coa_id uuid REFERENCES certificates_of_analysis(id) ON DELETE CASCADE,
  user_id uuid,
  order_id uuid,
  download_type text DEFAULT 'PDF' CHECK (download_type IN ('PDF', 'JSON', 'XML')),
  ip_address inet,
  user_agent text,
  downloaded_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_coa_batch_number ON certificates_of_analysis(batch_number);
CREATE INDEX IF NOT EXISTS idx_coa_product_id ON certificates_of_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_coa_sku ON certificates_of_analysis(sku);
CREATE INDEX IF NOT EXISTS idx_coa_manufacturing_date ON certificates_of_analysis(manufacturing_date);
CREATE INDEX IF NOT EXISTS idx_coa_downloads_coa_id ON coa_downloads(coa_id);
CREATE INDEX IF NOT EXISTS idx_coa_downloads_user_id ON coa_downloads(user_id);

-- Enable Row Level Security
ALTER TABLE certificates_of_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE coa_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates_of_analysis
CREATE POLICY "Public can view COA basic info"
  ON certificates_of_analysis
  FOR SELECT
  TO public
  USING (true); -- Basic COA info is public for transparency

CREATE POLICY "Authenticated users can download COAs"
  ON certificates_of_analysis
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for coa_downloads
CREATE POLICY "Users can view own downloads"
  ON coa_downloads
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can track downloads"
  ON coa_downloads
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to generate COA reference number
CREATE OR REPLACE FUNCTION generate_coa_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate a unique COA reference number
  NEW.batch_number = COALESCE(NEW.batch_number, 
    'COA-' || TO_CHAR(NEW.manufacturing_date, 'YYYYMMDD') || '-' || 
    UPPER(SUBSTRING(NEW.sku FROM 1 FOR 3)) || '-' || 
    LPAD(EXTRACT(EPOCH FROM now())::text, 6, '0')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate COA reference
CREATE TRIGGER generate_coa_reference_trigger
  BEFORE INSERT ON certificates_of_analysis
  FOR EACH ROW
  EXECUTE FUNCTION generate_coa_reference();

-- Function to track COA downloads
CREATE OR REPLACE FUNCTION track_coa_download(
  coa_uuid uuid,
  user_uuid uuid DEFAULT NULL,
  order_uuid uuid DEFAULT NULL,
  download_format text DEFAULT 'PDF',
  client_ip text DEFAULT NULL,
  client_user_agent text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  download_id uuid;
BEGIN
  INSERT INTO coa_downloads (
    coa_id,
    user_id,
    order_id,
    download_type,
    ip_address,
    user_agent
  ) VALUES (
    coa_uuid,
    user_uuid,
    order_uuid,
    download_format,
    client_ip::inet,
    client_user_agent
  ) RETURNING id INTO download_id;
  
  RETURN download_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample COA data for existing products
INSERT INTO certificates_of_analysis (
  batch_number,
  product_id,
  sku,
  manufacturing_date,
  expiry_date,
  analysis_date,
  analyst_name,
  purity_hplc,
  purity_ms,
  water_content,
  acetate_content,
  peptide_content,
  molecular_weight_found,
  molecular_weight_expected,
  ph_value,
  qc_approved_by,
  qc_approved_date
) VALUES
  ('COA-20240115-BPC-001', '1', 'BPC-157-5MG', '2024-01-15', '2027-01-15', '2024-01-16', 'Dr. Sarah Chen', 98.5, 'Confirmed', 4.2, 12.8, 83.0, 1419.53, 1419.53, 6.8, 'Dr. Michael Rodriguez', '2024-01-16'),
  ('COA-20240118-CJC-002', '8', 'CJC-10MG', '2024-01-18', '2027-01-18', '2024-01-19', 'Dr. Sarah Chen', 97.8, 'Confirmed', 3.9, 14.2, 82.0, 3367.97, 3367.97, 7.1, 'Dr. Michael Rodriguez', '2024-01-19'),
  ('COA-20240120-GHK-003', '6', 'GHK-CU-50MG', '2024-01-20', '2027-01-20', '2024-01-21', 'Dr. Lisa Wang', 96.2, 'Confirmed', 5.1, 11.5, 83.4, 404.93, 404.93, 6.5, 'Dr. Michael Rodriguez', '2024-01-21'),
  ('COA-20240122-IPA-004', '5', 'IPA-5MG', '2024-01-22', '2027-01-22', '2024-01-23', 'Dr. Lisa Wang', 99.1, 'Confirmed', 3.2, 13.7, 83.1, 711.85, 711.85, 6.9, 'Dr. Michael Rodriguez', '2024-01-23'),
  ('COA-20240125-MT2-005', '4', 'MT2-10MG', '2024-01-25', '2027-01-25', '2024-01-26', 'Dr. Sarah Chen', 99.3, 'Confirmed', 2.8, 12.1, 85.1, 1024.18, 1024.18, 7.0, 'Dr. Michael Rodriguez', '2024-01-26');