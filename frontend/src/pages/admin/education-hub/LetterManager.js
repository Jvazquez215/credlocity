import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/api';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

const LetterManager = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLetters();
  }, [filter]);

  const fetchLetters = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { letter_type: filter } : {};
      const response = await axios.get('/sample-letters', { params });
      setLetters(response.data);
    } catch (error) {
      console.error('Error fetching letters:', error);
      toast.error('Failed to load letters');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (letterId) => {
    if (!window.confirm('Are you sure you want to delete this letter template?')) {
      return;
    }

    try {
      await axios.delete(`/sample-letters/${letterId}`);
      toast.success('Letter deleted successfully');
      fetchLetters();
    } catch (error) {
      console.error('Error deleting letter:', error);
      toast.error('Failed to delete letter');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading letters...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Sample Letter Templates</h1>
          <p className="text-gray-600 mt-1">Manage fillable letter templates for consumers</p>
        </div>
        <Button onClick={() => navigate('/admin/education-hub/letters/create')}>
          <Plus className="w-4 h-4 mr-2" />
          Add Letter Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          size="sm"
        >
          All ({letters.length})
        </Button>
        <Button
          variant={filter === 'credit_bureau' ? 'default' : 'outline'}
          onClick={() => setFilter('credit_bureau')}
          size="sm"
        >
          Credit Bureau
        </Button>
        <Button
          variant={filter === 'creditor' ? 'default' : 'outline'}
          onClick={() => setFilter('creditor')}
          size="sm"
        >
          Creditor
        </Button>
      </div>

      {/* Letters Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Downloads
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {letters.map((letter) => (
              <tr key={letter.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{letter.title}</div>
                  <div className="text-sm text-gray-500">{letter.fields?.length || 0} fillable fields</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    letter.letter_type === 'credit_bureau' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {letter.letter_type === 'credit_bureau' ? 'Bureau' : 'Creditor'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {letter.target_recipient}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {letter.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {letter.downloads || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    letter.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {letter.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/admin/education-hub/letters/edit/${letter.id}`)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(letter.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {letters.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No letter templates found. Create your first one!
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-6 grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{letters.length}</div>
          <div className="text-sm text-gray-600">Total Templates</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {letters.filter(l => l.letter_type === 'credit_bureau').length}
          </div>
          <div className="text-sm text-gray-600">Bureau Letters</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {letters.filter(l => l.letter_type === 'creditor').length}
          </div>
          <div className="text-sm text-gray-600">Creditor Letters</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-orange-600">
            {letters.reduce((sum, l) => sum + (l.downloads || 0), 0)}
          </div>
          <div className="text-sm text-gray-600">Total Downloads</div>
        </div>
      </div>
    </div>
  );
};

export default LetterManager;
