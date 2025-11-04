import { useState } from 'react';
<<<<<<< HEAD
import { ArrowLeft, Search, Calendar, User, Eye, Heart, Clock, Tag, Filter, BookOpen, FileText, TrendingUp } from 'lucide-react';
=======
import { Search, Calendar, User, Eye, Heart, Clock, Tag, Filter, BookOpen, FileText, TrendingUp } from 'lucide-react';
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
import { useBlog } from '../hooks/useBlog';
import { blogCategories } from '../data/blogPosts';
import BlogPostDetail from './BlogPostDetail';
import ResourceGuideDetail from './ResourceGuideDetail';
import LoadingSpinner from './LoadingSpinner';
import OptimizedImage from './OptimizedImage';

interface BlogPageProps {
  onBack: () => void;
}

export default function BlogPage({ onBack }: BlogPageProps) {
  const {
    blogPosts,
    resourceGuides,
    loading,
    error,
    searchContent,
    getFeaturedContent,
    getPopularContent,
    incrementViewCount
  } = useBlog();

  const [activeTab, setActiveTab] = useState('blog');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [sortBy, setSortBy] = useState('latest');

  const featuredContent = getFeaturedContent();
  const popularContent = getPopularContent();

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const filteredResources = resourceGuides.filter(guide => {
    const matchesSearch = !searchTerm ||
      guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guide.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.view_count - a.view_count;
      case 'liked':
        return b.like_count - a.like_count;
      case 'oldest':
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      default: // latest
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    }
  });

  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.view_count - a.view_count;
      case 'rated':
        return b.rating_average - a.rating_average;
      case 'downloaded':
        return b.download_count - a.download_count;
      default: // latest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePostClick = (post: any) => {
    setSelectedPost(post);
    incrementViewCount('blog', post.id);
  };

  const handleResourceClick = (resource: any) => {
    setSelectedResource(resource);
    incrementViewCount('resource', resource.id);
  };

  if (selectedPost) {
    return (
      <BlogPostDetail 
        post={selectedPost} 
        onBack={() => setSelectedPost(null)} 
      />
    );
  }

  if (selectedResource) {
    return (
      <ResourceGuideDetail 
        resource={selectedResource} 
        onBack={() => setSelectedResource(null)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
<<<<<<< HEAD
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

=======
>>>>>>> c7bfe8dc5fa8f702766366e53572fdd68007ce3d
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Research Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest research insights, industry news, and comprehensive guides 
            for peptide research and applications.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search articles and guides..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {blogCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="latest">Latest</option>
                <option value="popular">Most Popular</option>
                <option value="liked">Most Liked</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('blog')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'blog'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4 mr-2" />
                Research Articles ({blogPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'resources'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Guides & Resources ({resourceGuides.length})
              </button>
              <button
                onClick={() => setActiveTab('featured')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'featured'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Featured Content
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'blog' && (
          <div>
            {/* Featured Posts */}
            {featuredContent.posts.length > 0 && !searchTerm && !selectedCategory && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredContent.posts.slice(0, 2).map((post) => (
                    <div 
                      key={post.id} 
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => handlePostClick(post)}
                    >
                      <img 
                        src={post.featured_image} 
                        alt={post.title}
                        className="w-full h-64 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {blogCategories.find(c => c.id === post.category)?.name}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {post.reading_time} min read
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <OptimizedImage
                              src={post.author_image} 
                              alt={post.author_name}
                              className="w-8 h-8 rounded-full mr-3"
                              loading="lazy"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{post.author_name}</div>
                              <div className="text-xs text-gray-500">{formatDate(post.published_at)}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {post.view_count}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {post.like_count}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? 'Search Results' : 'Latest Articles'}
                </h2>
                <p className="text-gray-600">
                  Showing {sortedPosts.length} of {blogPosts.length} articles
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedPosts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePostClick(post)}
                  >
                    <OptimizedImage
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                          {blogCategories.find(c => c.id === post.category)?.name}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-4 w-4 mr-1" />
                          {post.reading_time} min
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <OptimizedImage
                            src={post.author_image} 
                            alt={post.author_name}
                            className="w-6 h-6 rounded-full mr-2"
                            loading="lazy"
                          />
                          <span className="text-sm text-gray-700">{post.author_name}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500 text-sm">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {post.view_count}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.like_count}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {post.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div>
            {/* Featured Resources */}
            {featuredContent.resources.length > 0 && !searchTerm && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Guides</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {featuredContent.resources.slice(0, 2).map((resource) => (
                    <div 
                      key={resource.id} 
                      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <img 
                        src={resource.featured_image} 
                        alt={resource.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            resource.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                            resource.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {resource.difficulty_level}
                          </span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                            {resource.guide_type}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600">
                          {resource.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{resource.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-gray-500 text-sm">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {resource.view_count}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {resource.estimated_read_time} min
                            </div>
                            {resource.rating_average > 0 && (
                              <div className="flex items-center">
                                <span className="text-yellow-500">★</span>
                                <span className="ml-1">{resource.rating_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Resources */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? 'Search Results' : 'All Guides & Resources'}
                </h2>
                <p className="text-gray-600">
                  Showing {sortedResources.length} of {resourceGuides.length} resources
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedResources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          resource.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                          resource.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resource.difficulty_level}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {resource.guide_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{resource.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {resource.view_count}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.estimated_read_time} min
                          </div>
                        </div>
                        {resource.rating_average > 0 && (
                          <div className="flex items-center">
                            <span className="text-yellow-500 text-sm">★</span>
                            <span className="ml-1">{resource.rating_average.toFixed(1)}</span>
                            <span className="text-gray-400 ml-1">({resource.rating_count})</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex flex-wrap gap-1">
                          {resource.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                          {resource.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{resource.tags.length - 3}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'featured' && (
          <div className="space-y-12">
            {/* Featured Articles */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredContent.posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handlePostClick(post)}
                  >
                    <OptimizedImage
                      src={post.featured_image} 
                      alt={post.title}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{post.author_name}</span>
                        <div className="flex items-center space-x-3 text-gray-500 text-sm">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {post.view_count}
                          </div>
                          <div className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {post.like_count}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Resources */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Guides</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {featuredContent.resources.map((resource) => (
                  <div 
                    key={resource.id} 
                    className="bg-white rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleResourceClick(resource)}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          resource.difficulty_level === 'beginner' ? 'bg-green-100 text-green-800' :
                          resource.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {resource.difficulty_level}
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                          {resource.guide_type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                        {resource.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-gray-500 text-sm">
                          <div className="flex items-center">
                            <Eye className="h-3 w-3 mr-1" />
                            {resource.view_count}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {resource.estimated_read_time} min
                          </div>
                        </div>
                        {resource.rating_average > 0 && (
                          <div className="flex items-center text-sm">
                            <span className="text-yellow-500">★</span>
                            <span className="ml-1 text-gray-700">{resource.rating_average.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Content */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Most Popular</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Articles</h3>
                  <div className="space-y-4">
                    {popularContent.posts.slice(0, 5).map((post, index) => (
                      <div 
                        key={post.id} 
                        className="flex items-center p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handlePostClick(post)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 hover:text-blue-600">{post.title}</h4>
                          <div className="flex items-center space-x-3 text-gray-500 text-sm mt-1">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {post.view_count}
                            </div>
                            <div className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {post.like_count}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Guides</h3>
                  <div className="space-y-4">
                    {popularContent.resources.slice(0, 5).map((resource, index) => (
                      <div 
                        key={resource.id} 
                        className="flex items-center p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleResourceClick(resource)}
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-4">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 hover:text-blue-600">{resource.title}</h4>
                          <div className="flex items-center space-x-3 text-gray-500 text-sm mt-1">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {resource.view_count}
                            </div>
                            {resource.rating_average > 0 && (
                              <div className="flex items-center">
                                <span className="text-yellow-500 text-xs">★</span>
                                <span className="ml-1">{resource.rating_average.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'blog' && sortedPosts.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search terms or category filter.</p>
          </div>
        )}

        {activeTab === 'resources' && sortedResources.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600">Try adjusting your search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
}