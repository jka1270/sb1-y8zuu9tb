/*
  # Create Research Documentation Tables

  1. New Tables
    - `technical_data_sheets`
      - Product technical specifications and data
      - Chemical properties, storage, analytical methods
      - Research applications and guidelines
    
    - `safety_data_sheets`
      - Safety information and hazard data
      - First aid measures and protective equipment
      - Handling, storage, and disposal requirements
    
    - `research_protocols`
      - Experimental procedures and protocols
      - Required materials and step-by-step instructions
      - Expected outcomes and troubleshooting guides
    
    - `document_downloads`
      - Track document download history
      - Analytics for document usage
    
    - `protocol_ratings`
      - User ratings and reviews for protocols
  
  2. Security
    - Enable RLS on all tables
    - Public read access for approved documents
    - Authenticated users can download and rate
    - Only admins can create/update documents
*/

-- Technical Data Sheets table
CREATE TABLE IF NOT EXISTS technical_data_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  variant_id text,
  sku text NOT NULL,
  document_version text NOT NULL DEFAULT '1.0',
  title text NOT NULL,
  description text,
  molecular_formula text NOT NULL,
  molecular_weight numeric NOT NULL,
  cas_number text,
  purity_specification text NOT NULL,
  appearance text NOT NULL,
  solubility jsonb NOT NULL DEFAULT '{}',
  stability_data jsonb,
  storage_temperature text NOT NULL,
  storage_conditions text NOT NULL,
  shelf_life text NOT NULL,
  research_applications text[] NOT NULL DEFAULT '{}',
  biological_activity text,
  mechanism_of_action text,
  target_receptors text[],
  research_areas text[] NOT NULL DEFAULT '{}',
  analytical_methods jsonb NOT NULL DEFAULT '{}',
  reconstitution_guidelines text,
  working_concentrations text,
  regulatory_status text NOT NULL DEFAULT 'Research Use Only',
  reference_list text[],
  document_url text,
  last_reviewed timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technical_data_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view technical data sheets"
  ON technical_data_sheets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert technical data sheets"
  ON technical_data_sheets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update technical data sheets"
  ON technical_data_sheets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Safety Data Sheets table
CREATE TABLE IF NOT EXISTS safety_data_sheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  variant_id text,
  sku text NOT NULL,
  document_version text NOT NULL DEFAULT '1.0',
  sds_number text NOT NULL UNIQUE,
  product_name text NOT NULL,
  ghs_classification jsonb NOT NULL DEFAULT '{}',
  signal_word text,
  hazard_statements text[] NOT NULL DEFAULT '{}',
  precautionary_statements text[] NOT NULL DEFAULT '{}',
  chemical_identity jsonb NOT NULL,
  first_aid_inhalation text NOT NULL,
  first_aid_skin_contact text NOT NULL,
  first_aid_eye_contact text NOT NULL,
  first_aid_ingestion text NOT NULL,
  handling_precautions text NOT NULL,
  storage_requirements text NOT NULL,
  personal_protective_equipment jsonb NOT NULL,
  disposal_methods text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE safety_data_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view safety data sheets"
  ON safety_data_sheets FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert safety data sheets"
  ON safety_data_sheets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update safety data sheets"
  ON safety_data_sheets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Research Protocols table
CREATE TABLE IF NOT EXISTS research_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL,
  variant_id text,
  protocol_type text NOT NULL,
  title text NOT NULL,
  description text,
  research_area text NOT NULL,
  difficulty_level text NOT NULL DEFAULT 'intermediate',
  estimated_time text,
  objective text NOT NULL,
  background text,
  required_equipment jsonb NOT NULL DEFAULT '{}',
  required_reagents jsonb NOT NULL DEFAULT '{}',
  procedure_steps jsonb NOT NULL,
  expected_outcomes text,
  troubleshooting_guide jsonb,
  author text NOT NULL,
  institution text,
  version text NOT NULL DEFAULT '1.0',
  approval_status text NOT NULL DEFAULT 'pending',
  download_count integer DEFAULT 0,
  rating_average numeric(3,2),
  rating_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE research_protocols ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved protocols"
  ON research_protocols FOR SELECT
  TO public
  USING (approval_status = 'approved');

CREATE POLICY "Admins can view all protocols"
  ON research_protocols FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can insert protocols"
  ON research_protocols FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can update protocols"
  ON research_protocols FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Document Downloads tracking table
CREATE TABLE IF NOT EXISTS document_downloads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  document_type text NOT NULL,
  document_id uuid NOT NULL,
  product_id text,
  download_format text NOT NULL DEFAULT 'PDF',
  access_method text NOT NULL DEFAULT 'direct',
  user_agent text,
  downloaded_at timestamptz DEFAULT now()
);

ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own downloads"
  ON document_downloads FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can track downloads"
  ON document_downloads FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all downloads"
  ON document_downloads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'super_admin')
    )
  );

-- Protocol Ratings table
CREATE TABLE IF NOT EXISTS protocol_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(protocol_id, user_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'protocol_ratings_protocol_id_fkey'
  ) THEN
    ALTER TABLE protocol_ratings 
    ADD CONSTRAINT protocol_ratings_protocol_id_fkey 
    FOREIGN KEY (protocol_id) REFERENCES research_protocols(id) ON DELETE CASCADE;
  END IF;
END $$;

ALTER TABLE protocol_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view protocol ratings"
  ON protocol_ratings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can rate protocols"
  ON protocol_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON protocol_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tds_product_id ON technical_data_sheets(product_id);
CREATE INDEX IF NOT EXISTS idx_tds_sku ON technical_data_sheets(sku);
CREATE INDEX IF NOT EXISTS idx_sds_product_id ON safety_data_sheets(product_id);
CREATE INDEX IF NOT EXISTS idx_sds_sku ON safety_data_sheets(sku);
CREATE INDEX IF NOT EXISTS idx_protocols_product_id ON research_protocols(product_id);
CREATE INDEX IF NOT EXISTS idx_protocols_approval_status ON research_protocols(approval_status);
CREATE INDEX IF NOT EXISTS idx_protocols_research_area ON research_protocols(research_area);
CREATE INDEX IF NOT EXISTS idx_downloads_user_id ON document_downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_downloads_document_id ON document_downloads(document_id);
CREATE INDEX IF NOT EXISTS idx_ratings_protocol_id ON protocol_ratings(protocol_id);
CREATE INDEX IF NOT EXISTS idx_ratings_user_id ON protocol_ratings(user_id);