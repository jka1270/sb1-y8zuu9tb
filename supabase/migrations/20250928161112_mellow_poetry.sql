/*
  # Customer Accounts System

  1. New Tables
    - `research_profiles`
      - Extended user profiles with research-specific information
      - Institution details, research areas, credentials
    - `saved_products`
      - User's saved/favorited products
      - Research notes and tags
    - `product_lists`
      - Custom product collections
      - Research project organization
    - `user_preferences`
      - Account settings and preferences
      - Notification settings

  2. Security
    - Enable RLS on all tables
    - Users can only access their own data
    - Research profile verification system
*/

-- Create research profiles table (extends user_profiles)
CREATE TABLE IF NOT EXISTS research_profiles (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  institution_type text CHECK (institution_type IN ('university', 'research_institute', 'pharmaceutical', 'biotech', 'government', 'hospital', 'other')),
  research_areas text[] DEFAULT '{}',
  position_title text,
  department text,
  supervisor_name text,
  supervisor_email text,
  years_experience integer,
  education_level text CHECK (education_level IN ('bachelor', 'master', 'phd', 'postdoc', 'faculty', 'industry')),
  specializations text[] DEFAULT '{}',
  publications_count integer DEFAULT 0,
  orcid_id text,
  research_interests text,
  current_projects text,
  funding_sources text[] DEFAULT '{}',
  ethics_training_completed boolean DEFAULT false,
  ethics_training_date date,
  safety_training_completed boolean DEFAULT false,
  safety_training_date date,
  institutional_approval boolean DEFAULT false,
  approval_document_url text,
  verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create saved products table
CREATE TABLE IF NOT EXISTS saved_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  variant_id text,
  research_notes text,
  tags text[] DEFAULT '{}',
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  planned_use text,
  quantity_needed integer,
  budget_allocated numeric(10,2),
  project_association text,
  saved_at timestamptz DEFAULT now(),
  last_viewed timestamptz DEFAULT now(),
  
  UNIQUE(user_id, product_id, variant_id)
);

-- Create product lists table
CREATE TABLE IF NOT EXISTS product_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  list_type text DEFAULT 'custom' CHECK (list_type IN ('custom', 'project', 'wishlist', 'comparison')),
  project_name text,
  project_code text,
  budget_limit numeric(10,2),
  is_shared boolean DEFAULT false,
  share_token text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create product list items table
CREATE TABLE IF NOT EXISTS product_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid REFERENCES product_lists(id) ON DELETE CASCADE,
  product_id text NOT NULL,
  product_name text NOT NULL,
  variant_id text,
  quantity integer DEFAULT 1,
  notes text,
  priority integer DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  
  UNIQUE(list_id, product_id, variant_id)
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_notifications boolean DEFAULT true,
  order_updates boolean DEFAULT true,
  stock_alerts boolean DEFAULT false,
  newsletter boolean DEFAULT false,
  research_updates boolean DEFAULT true,
  price_alerts boolean DEFAULT false,
  preferred_currency text DEFAULT 'USD',
  preferred_units text DEFAULT 'metric',
  default_shipping_method text DEFAULT 'standard',
  auto_save_cart boolean DEFAULT true,
  privacy_level text DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'enhanced')),
  data_retention_period integer DEFAULT 365,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create research activity log table
CREATE TABLE IF NOT EXISTS research_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('product_view', 'product_save', 'list_create', 'order_place', 'search', 'filter_use')),
  product_id text,
  search_query text,
  filters_used jsonb,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_profiles_institution_type ON research_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_research_profiles_verification_status ON research_profiles(verification_status);
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON saved_products(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_tags ON saved_products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_product_lists_user_id ON product_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_product_list_items_list_id ON product_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_research_activity_log_user_id ON research_activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_research_activity_log_activity_type ON research_activity_log(activity_type);

-- Enable Row Level Security
ALTER TABLE research_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE research_activity_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for research_profiles
CREATE POLICY "Users can read own research profile"
  ON research_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own research profile"
  ON research_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own research profile"
  ON research_profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Create RLS policies for saved_products
CREATE POLICY "Users can manage own saved products"
  ON saved_products FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create RLS policies for product_lists
CREATE POLICY "Users can manage own product lists"
  ON product_lists FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view shared lists"
  ON product_lists FOR SELECT
  TO authenticated
  USING (is_shared = true OR user_id = auth.uid());

-- Create RLS policies for product_list_items
CREATE POLICY "Users can manage own list items"
  ON product_list_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_lists 
      WHERE id = product_list_items.list_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view shared list items"
  ON product_list_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM product_lists 
      WHERE id = product_list_items.list_id 
      AND (is_shared = true OR user_id = auth.uid())
    )
  );

-- Create RLS policies for user_preferences
CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (id = auth.uid());

-- Create RLS policies for research_activity_log
CREATE POLICY "Users can read own activity log"
  ON research_activity_log FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert activity log"
  ON research_activity_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to create default user preferences
CREATE OR REPLACE FUNCTION create_default_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default preferences for new users
CREATE OR REPLACE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_preferences();

-- Function to log research activity
CREATE OR REPLACE FUNCTION log_research_activity(
  p_user_id uuid,
  p_activity_type text,
  p_product_id text DEFAULT NULL,
  p_search_query text DEFAULT NULL,
  p_filters_used jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO research_activity_log (
    user_id,
    activity_type,
    product_id,
    search_query,
    filters_used,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_product_id,
    p_search_query,
    p_filters_used,
    p_metadata
  );
END;
$$ LANGUAGE plpgsql;