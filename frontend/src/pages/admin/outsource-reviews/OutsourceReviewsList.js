import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Plus, Pencil, Trash2, Star, Play, Building2, UserCheck, ArrowUpDown } from 'lucide-react';
import { toast } from 'sonner';

const OutsourceReviewsList = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/admin/outsource/client-reviews');
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching outsource reviews:', error);
      toast.error('Failed to load outsource reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/admin/outsource/client-reviews/${id}`);
      toast.success('Review deleted successfully');
      fetchReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Failed to delete review');
    }
  };

  const toggleActive = async (review) => {
    try {
      await api.put(`/admin/outsource/client-reviews/${review.id}`, {
        is_active: !review.is_active
      });
      toast.success(`Review ${review.is_active ? 'hidden' : 'shown'} on public page`);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling review status:', error);
      toast.error('Failed to update review status');
    }
  };

  const toggleFeatured = async (review) => {
    try {
      await api.put(`/admin/outsource/client-reviews/${review.id}`, {
        featured: !review.featured
      });
      toast.success(`Review ${review.featured ? 'unfeatured' : 'featured'}`);
      fetchReviews();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Outsourcing Partner Reviews</h2>
          <p className="text-gray-600 mt-1">Manage testimonials from your outsourcing clients</p>
        </div>
        <Button onClick={() => navigate('/admin/outsource-reviews/create')} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">Add your first outsourcing partner review to showcase on the public page.</p>
          <Button onClick={() => navigate('/admin/outsource-reviews/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Add First Review
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">CEO</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Video</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Switched From</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Featured</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Order</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {review.company_logo_url ? (
                        <img 
                          src={review.company_logo_url} 
                          alt={review.company_name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{review.company_name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{review.testimonial_text.substring(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {review.ceo_photo_url ? (
                        <img 
                          src={review.ceo_photo_url} 
                          alt={review.ceo_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{review.ceo_name}</p>
                        <p className="text-xs text-gray-500">{review.ceo_title || 'CEO'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {review.video_type ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        <Play className="w-3 h-3" />
                        {review.video_type === 'youtube' ? 'YouTube' : 'File'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {review.switched_from_another ? (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        🔄 {review.previous_company_name || 'Yes'}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleActive(review)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                        review.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {review.is_active ? 'Active' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleFeatured(review)}
                      className={`p-2 rounded-full transition-colors ${
                        review.featured 
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' 
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${review.featured ? 'fill-amber-500' : ''}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-gray-600 font-mono">{review.display_order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/outsource-reviews/edit/${review.id}`)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(review.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips for Great Outsourcing Reviews</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Include a video testimonial for maximum impact - YouTube embeds or direct uploads work great</li>
          <li>• Highlight partners who switched from competitors to show your superiority</li>
          <li>• Use high-quality logos and CEO photos for a professional appearance</li>
          <li>• Featured reviews appear first and get special highlighting on the page</li>
        </ul>
      </div>
    </div>
  );
};

export default OutsourceReviewsList;