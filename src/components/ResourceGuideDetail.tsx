import { useState } from 'react';
import { ArrowLeft, Download, Star, Eye, Clock, User, BookOpen, Share2, ThumbsUp } from 'lucide-react';
import { ResourceGuide } from '../data/blogPosts';
import { useBlog } from '../hooks/useBlog';
import { useAuth } from '../contexts/AuthContext';

interface ResourceGuideDetailProps {
  resource: ResourceGuide;
  onBack: () => void;
}

export default function ResourceGuideDetail({ resource, onBack }: ResourceGuideDetailProps) {
  const { rateResource, incrementDownloadCount } = useBlog();
  const { user } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleRating = async (rating: number) => {
    if (!user) {
      alert('Please sign in to rate this resource.');
      return;
    }

    try {
      setSubmittingRating(true);
      await rateResource(resource.id, rating, reviewText);
      setUserRating(rating);
      alert('Thank you for rating this resource!');
    } catch (error) {
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownload = async () => {
    if (!resource.download_url) return;

    try {
      setDownloading(true);
      await incrementDownloadCount(resource.id);
      
      // Create download link
      const link = document.createElement('a');
      link.href = resource.download_url;
      link.download = `${resource.slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'guide':
        return 'bg-blue-100 text-blue-800';
      case 'tutorial':
        return 'bg-purple-100 text-purple-800';
      case 'whitepaper':
        return 'bg-indigo-100 text-indigo-800';
      case 'case_study':
        return 'bg-green-100 text-green-800';
      case 'protocol':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resources
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resource Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(resource.guide_type)}`}>
                {resource.guide_type.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(resource.difficulty_level)}`}>
                {resource.difficulty_level}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {resource.estimated_read_time} min read
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                {resource.view_count} views
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{resource.title}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">{resource.description}</p>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-b">
            <div className="flex items-center space-x-6">
              {resource.rating_average > 0 && (
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= resource.rating_average ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {resource.rating_average.toFixed(1)} ({resource.rating_count} reviews)
                  </span>
                </div>
              )}
              <div className="text-sm text-gray-600">
                Downloaded {resource.download_count} times
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {resource.download_url && (
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {downloading ? 'Downloading...' : 'Download PDF'}
                </button>
              )}
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {resource.featured_image && (
          <div className="mb-8">
            <img 
              src={resource.featured_image} 
              alt={resource.title}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>
        )}

        {/* Resource Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: resource.content }}
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Topics</h3>
          <div className="flex flex-wrap gap-2">
            {resource.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rate This Resource</h3>
          
          {user ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setUserRating(rating)}
                      className={`${
                        rating <= userRating ? 'text-yellow-500' : 'text-gray-300'
                      } hover:text-yellow-500 transition-colors`}
                    >
                      <Star className="h-6 w-6" />
                    </button>
                  ))}
                  <span className="text-sm text-gray-600 ml-4">
                    {userRating > 0 ? `${userRating}/5 stars` : 'Click to rate'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your experience with this resource..."
                />
              </div>

              <button
                onClick={() => handleRating(userRating)}
                disabled={userRating === 0 || submittingRating}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">Please sign in to rate this resource.</p>
            </div>
          )}

          {/* Current Ratings Display */}
          {resource.rating_count > 0 && (
            <div className="mt-8 pt-6 border-t">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">Community Ratings</h4>
                <div className="flex items-center">
                  <div className="flex items-center mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= resource.rating_average ? 'text-yellow-500 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {resource.rating_average.toFixed(1)} out of 5 ({resource.rating_count} reviews)
                  </span>
                </div>
              </div>
              
              {/* Rating Distribution */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = Math.floor(resource.rating_count * (rating === 5 ? 0.6 : rating === 4 ? 0.3 : 0.1));
                  const percentage = resource.rating_count > 0 ? (count / resource.rating_count) * 100 : 0;
                  
                  return (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-8 text-gray-600">{rating}★</span>
                      <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-500 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-gray-600 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}