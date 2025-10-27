import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { BlogPost, ResourceGuide, sampleBlogPosts, sampleResourceGuides } from '../data/blogPosts';

export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    first_name: string;
    last_name: string;
    company: string;
  };
}

export interface ResourceRating {
  id: string;
  resource_id: string;
  user_id: string;
  rating: number;
  review_text?: string;
  created_at: string;
  updated_at: string;
}

export const useBlog = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(sampleBlogPosts);
  const [resourceGuides, setResourceGuides] = useState<ResourceGuide[]>(sampleResourceGuides);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [ratings, setRatings] = useState<ResourceRating[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // For now, we'll use sample data
    // In a real implementation, you would fetch from Supabase
    fetchBlogPosts();
    fetchResourceGuides();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      // Using sample data for now
      // const { data, error } = await supabase
      //   .from('blog_posts')
      //   .select('*')
      //   .eq('status', 'published')
      //   .order('published_at', { ascending: false });

      // if (error) throw error;
      // setBlogPosts(data || []);
      
      setBlogPosts(sampleBlogPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchResourceGuides = async () => {
    try {
      // Using sample data for now
      // const { data, error } = await supabase
      //   .from('resource_guides')
      //   .select('*')
      //   .eq('status', 'published')
      //   .order('created_at', { ascending: false });

      // if (error) throw error;
      // setResourceGuides(data || []);
      
      setResourceGuides(sampleResourceGuides);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch resource guides');
    }
  };

  const fetchComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select(`
          *,
          user_profile:user_profiles(first_name, last_name, company)
        `)
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch comments');
      return [];
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content,
          status: 'pending' // Comments require moderation
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      throw err;
    }
  };

  const rateResource = async (resourceId: string, rating: number, reviewText?: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('resource_ratings')
        .upsert({
          resource_id: resourceId,
          user_id: user.id,
          rating,
          review_text: reviewText,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      // Update resource guide rating average
      await updateResourceRating(resourceId);
      
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rate resource');
      throw err;
    }
  };

  const updateResourceRating = async (resourceId: string) => {
    try {
      const { data: ratings, error: ratingsError } = await supabase
        .from('resource_ratings')
        .select('rating')
        .eq('resource_id', resourceId);

      if (ratingsError) throw ratingsError;

      if (ratings && ratings.length > 0) {
        const average = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
        
        const { error: updateError } = await supabase
          .from('resource_guides')
          .update({
            rating_average: Math.round(average * 100) / 100,
            rating_count: ratings.length,
            updated_at: new Date().toISOString()
          })
          .eq('id', resourceId);

        if (updateError) throw updateError;
      }
    } catch (err) {
      console.error('Failed to update resource rating:', err);
    }
  };

  const incrementViewCount = async (type: 'blog' | 'resource', id: string) => {
    try {
      const table = type === 'blog' ? 'blog_posts' : 'resource_guides';
      const { error } = await supabase
        .from(table)
        .update({ view_count: supabase.sql`view_count + 1` })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to increment view count:', err);
    }
  };

  const incrementDownloadCount = async (resourceId: string) => {
    try {
      const { error } = await supabase
        .from('resource_guides')
        .update({ download_count: supabase.sql`download_count + 1` })
        .eq('id', resourceId);

      if (error) throw error;
    } catch (err) {
      console.error('Failed to increment download count:', err);
    }
  };

  const searchContent = (query: string, type?: 'blog' | 'resource') => {
    const searchTerm = query.toLowerCase();
    
    const blogResults = blogPosts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.category.toLowerCase().includes(searchTerm)
    );

    const resourceResults = resourceGuides.filter(guide =>
      guide.title.toLowerCase().includes(searchTerm) ||
      guide.description.toLowerCase().includes(searchTerm) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      guide.guide_type.toLowerCase().includes(searchTerm)
    );

    if (type === 'blog') return blogResults;
    if (type === 'resource') return resourceResults;
    
    return { blog: blogResults, resources: resourceResults };
  };

  const getPostBySlug = (slug: string): BlogPost | undefined => {
    return blogPosts.find(post => post.slug === slug);
  };

  const getResourceBySlug = (slug: string): ResourceGuide | undefined => {
    return resourceGuides.find(guide => guide.slug === slug);
  };

  const getFeaturedContent = () => {
    return {
      posts: blogPosts.filter(post => post.featured),
      resources: resourceGuides.filter(guide => guide.featured)
    };
  };

  const getPopularContent = () => {
    return {
      posts: [...blogPosts].sort((a, b) => b.view_count - a.view_count).slice(0, 5),
      resources: [...resourceGuides].sort((a, b) => b.view_count - a.view_count).slice(0, 5)
    };
  };

  const getContentByCategory = (category: string) => {
    return blogPosts.filter(post => post.category === category);
  };

  const getContentByTag = (tag: string) => {
    const posts = blogPosts.filter(post => post.tags.includes(tag));
    const resources = resourceGuides.filter(guide => guide.tags.includes(tag));
    return { posts, resources };
  };

  return {
    blogPosts,
    resourceGuides,
    comments,
    ratings,
    loading,
    error,
    fetchComments,
    addComment,
    rateResource,
    incrementViewCount,
    incrementDownloadCount,
    searchContent,
    getPostBySlug,
    getResourceBySlug,
    getFeaturedContent,
    getPopularContent,
    getContentByCategory,
    getContentByTag,
    refetch: () => {
      fetchBlogPosts();
      fetchResourceGuides();
    }
  };
};