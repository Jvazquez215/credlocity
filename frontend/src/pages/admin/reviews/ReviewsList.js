import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Plus, Edit2, Trash2, Star } from 'lucide-react';

const ReviewsList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await api.get('/reviews');
      setReviews(response.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
      alert('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('Review deleted successfully');
      fetchReviews();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading reviews...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Reviews Management</h2>
        <Button
          onClick={() => navigate('/admin/reviews/create')}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Review
        </Button>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Reviews Yet</h3>
          <p className="text-gray-500 mb-6">
            Start by creating your first client testimonial
          </p>
          <Button
            onClick={() => navigate('/admin/reviews/create')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create First Review
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Client Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Before Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">After Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Points Improved</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Featured</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {review.client_photo_url && (
                        <img
                          src={review.client_photo_url}
                          alt={review.client_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <span className="font-medium text-gray-900">{review.client_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-red-600 font-semibold">{review.before_score}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">{review.after_score}</td>
                  <td className="px-6 py-4 text-green-600 font-bold">
                    +{review.points_improved}
                  </td>
                  <td className="px-6 py-4">
                    {review.featured_on_homepage ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                        <Star className="w-3 h-3 fill-current" />
                        Featured
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/reviews/edit/${review.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Featured reviews appear on the homepage (limit to 3-6 for best display)</li>
          <li>• Include before/after credit scores for maximum impact</li>
          <li>• Video testimonials (YouTube/Vimeo) significantly boost credibility</li>
          <li>• Add "Switched from" field to highlight competitor comparisons</li>
        </ul>
      </div>
    </div>
  );
};

export default ReviewsList;
