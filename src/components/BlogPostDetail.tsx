import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Eye, Heart, Share2, MessageCircle, Clock, Tag } from 'lucide-react';
import { BlogPost } from '../data/blogPosts';
import { useBlog } from '../hooks/useBlog';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import OptimizedImage from './OptimizedImage';
import LoadingSpinner from './LoadingSpinner';

interface BlogPostDetailProps {
  post: BlogPost;
  onBack: () => void;
}

export default function BlogPostDetail({ post, onBack }: BlogPostDetailProps) {
  const { fetchComments, addComment } = useBlog();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [liked, setLiked] = useState(false);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    loadComments();
  }, [post.id]);

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const commentsData = await fetchComments(post.id);
      setComments(commentsData);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      setSubmittingComment(true);
      await addComment(post.id, newComment);
      setNewComment('');
      showNotification({
        type: 'success',
        message: 'Comment submitted for review. It will appear after moderation.',
        duration: 5000
      });
      await loadComments();
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to submit comment. Please try again.',
        duration: 5000
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      showNotification({
        type: 'success',
        message: 'Link copied to clipboard!',
        duration: 3000
      });
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
            Back to Articles
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Article Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4 mb-4">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {post.category}
              </span>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-4 w-4 mr-1" />
                {post.reading_time} min read
              </div>
              <div className="flex items-center text-gray-500 text-sm">
                <Eye className="h-4 w-4 mr-1" />
                {post.view_count} views
              </div>
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-xl text-gray-600 leading-relaxed">{post.excerpt}</p>
          </div>

          <div className="flex items-center justify-between py-6 border-t border-b">
            <div className="flex items-center">
              <OptimizedImage
                src={post.author_image} 
                alt={post.author_name}
                className="w-12 h-12 rounded-full mr-4"
                loading="lazy"
              />
              <div>
                <div className="font-semibold text-gray-900">{post.author_name}</div>
                <div className="text-sm text-gray-600">{post.author_bio}</div>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(post.published_at)}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setLiked(!liked)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  liked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                {post.like_count + (liked ? 1 : 0)}
              </button>
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
        <div className="mb-8">
          <OptimizedImage
            src={post.featured_image} 
            alt={post.title}
            className="w-full h-96 object-cover rounded-lg shadow-md"
            priority={true}
            sizes="(max-width: 1024px) 100vw, 80vw"
          />
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        {/* Tags */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm hover:bg-blue-100 cursor-pointer"
              >
                <Tag className="h-3 w-3 inline mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments ({comments.length})
            </h3>
          </div>

          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-8">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Share your thoughts on this article..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment || !newComment.trim()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingComment ? 'Submitting...' : 'Post Comment'}
              </button>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-gray-600">Please sign in to leave a comment.</p>
            </div>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {loadingComments ? (
              <div className="text-center py-8">
                <LoadingSpinner text="Loading comments..." />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-medium text-gray-900">
                          {comment.user_profile?.first_name} {comment.user_profile?.last_name}
                        </span>
                        {comment.user_profile?.company && (
                          <span className="text-gray-500 text-sm">• {comment.user_profile.company}</span>
                        )}
                        <span className="text-gray-500 text-sm">
                          • {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}