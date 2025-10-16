/*
  # Create Blog and Resources Tables

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `excerpt` (text)
      - `content` (text)
      - `featured_image` (text)
      - `category` (text)
      - `tags` (text array)
      - `author_name` (text)
      - `author_bio` (text)
      - `author_image` (text)
      - `reading_time` (integer)
      - `view_count` (integer)
      - `like_count` (integer)
      - `status` (text)
      - `featured` (boolean)
      - `published_at` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `resource_guides`
      - `id` (uuid, primary key)
      - `title` (text)
      - `slug` (text, unique)
      - `description` (text)
      - `content` (text)
      - `guide_type` (text)
      - `difficulty_level` (text)
      - `estimated_read_time` (integer)
      - `featured_image` (text)
      - `download_url` (text)
      - `tags` (text array)
      - `view_count` (integer)
      - `download_count` (integer)
      - `rating_average` (numeric)
      - `rating_count` (integer)
      - `status` (text)
      - `featured` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `blog_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `content` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `resource_ratings`
      - `id` (uuid, primary key)
      - `resource_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `rating` (integer)
      - `review_text` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to published content
    - Add policies for authenticated users to comment and rate
    - Add policies for content management
*/

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  featured_image text,
  category text NOT NULL DEFAULT 'research',
  tags text[] DEFAULT '{}',
  author_name text NOT NULL,
  author_bio text,
  author_image text,
  reading_time integer DEFAULT 5,
  view_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resource Guides Table
CREATE TABLE IF NOT EXISTS resource_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  guide_type text NOT NULL DEFAULT 'guide' CHECK (guide_type IN ('guide', 'tutorial', 'whitepaper', 'case_study', 'protocol')),
  difficulty_level text DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_read_time integer DEFAULT 10,
  featured_image text,
  download_url text,
  tags text[] DEFAULT '{}',
  view_count integer DEFAULT 0,
  download_count integer DEFAULT 0,
  rating_average numeric(3,2) DEFAULT 0,
  rating_count integer DEFAULT 0,
  status text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Comments Table
CREATE TABLE IF NOT EXISTS blog_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resource Ratings Table
CREATE TABLE IF NOT EXISTS resource_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id uuid REFERENCES resource_guides(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(resource_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_ratings ENABLE ROW LEVEL SECURITY;

-- Blog Posts Policies
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

-- Resource Guides Policies
CREATE POLICY "Anyone can read published guides"
  ON resource_guides
  FOR SELECT
  TO public
  USING (status = 'published');

-- Blog Comments Policies
CREATE POLICY "Anyone can read approved comments"
  ON blog_comments
  FOR SELECT
  TO public
  USING (status = 'approved');

CREATE POLICY "Authenticated users can create comments"
  ON blog_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON blog_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Resource Ratings Policies
CREATE POLICY "Anyone can read ratings"
  ON resource_ratings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create ratings"
  ON resource_ratings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON resource_ratings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_resource_guides_guide_type ON resource_guides(guide_type);
CREATE INDEX IF NOT EXISTS idx_resource_guides_difficulty ON resource_guides(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_resource_guides_status ON resource_guides(status);
CREATE INDEX IF NOT EXISTS idx_resource_guides_featured ON resource_guides(featured);
CREATE INDEX IF NOT EXISTS idx_resource_guides_tags ON resource_guides USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_status ON blog_comments(status);

CREATE INDEX IF NOT EXISTS idx_resource_ratings_resource_id ON resource_ratings(resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_ratings_rating ON resource_ratings(rating);