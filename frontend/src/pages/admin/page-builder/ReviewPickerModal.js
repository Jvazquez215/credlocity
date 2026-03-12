import React, { useState, useEffect } from 'react';
import { X, Search, Star, CheckCircle } from 'lucide-react';
import api from '../../../utils/api';

const ReviewPickerModal = ({ isOpen, onClose, onSelect, selectedReviewIds = [] }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState(selectedReviewIds);

  useEffect(() => {
    if (isOpen) {
      loadReviews();
      setSelected(selectedReviewIds);
    }
  }, [isOpen, selectedReviewIds]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/reviews');
      setReviews(response.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleReview = (reviewId) => {
    setSelected(prev => 
      prev.includes(reviewId)
        ? prev.filter(id => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const handleConfirm = () => {
    const selectedReviews = reviews.filter(r => selected.includes(r.id));
    onSelect(selectedReviews);
    onClose();
  };

  const filteredReviews = reviews.filter(review => 
    review.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.testimonial_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.service_used?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">⭐ Select Reviews to Display</h3>
            <p className="text-sm text-gray-500">Choose which customer reviews to show on your page</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by client name, testimonial, or service..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selected.length} review(s) selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(reviews.map(r => r.id))}
                className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded"
              >
                Select All
              </button>
              <button
                onClick={() => setSelected([])}
                className="text-sm px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading reviews...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found</p>
              <p className="text-sm text-gray-400 mt-2">
                Add customer reviews in the Reviews section first
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReviews.map((review) => (
                <div
                  key={review.id}
                  onClick={() => toggleReview(review.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    selected.includes(review.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <div className="mt-1">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selected.includes(review.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selected.includes(review.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-semibold">{review.client_name}</p>
                          {review.service_used && (
                            <p className="text-xs text-gray-500">{review.service_used}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {review.points_improved && (
                            <span className="text-sm font-bold text-green-600">
                              +{review.points_improved} pts
                            </span>
                          )}
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-yellow-500 fill-current" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        "{review.testimonial_text}"
                      </p>
                      {review.featured_on_homepage && (
                        <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          ⭐ Featured
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selected.length} of {filteredReviews.length} review(s) selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selected.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Add {selected.length} Review{selected.length !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewPickerModal;
