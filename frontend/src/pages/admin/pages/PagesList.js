import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageAPI } from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import { toast } from 'sonner';

const PagesList = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await pageAPI.getAll();
      setPages(response.data);
    } catch (error) {
      toast.error('Failed to load pages');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this page?')) return;
    
    try {
      await pageAPI.delete(id);
      toast.success('Page deleted successfully');
      fetchPages();
    } catch (error) {
      toast.error('Failed to delete page');
      console.error(error);
    }
  };

  const filteredPages = pages.filter(page => 
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue">Pages Management</h2>
        <Button
          asChild
          className="bg-secondary-green hover:bg-secondary-light text-white"
        >
          <Link to="/admin/pages/create">
            <Plus className="w-4 h-4 mr-2" />
            Create New Page
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <Input
          placeholder="Search pages by title or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Title</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Slug</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Status</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Placement</th>
              <th className="text-left py-4 px-6 font-semibold text-gray-700">Updated</th>
              <th className="text-right py-4 px-6 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPages.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-12 text-gray-500">
                  No pages found. Create your first page to get started!
                </td>
              </tr>
            ) : (
              filteredPages.map((page) => (
                <tr key={page.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <span className="font-medium">{page.title}</span>
                  </td>
                  <td className="py-4 px-6">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      page.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">{page.placement}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {new Date(page.updated_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="View Page"
                      >
                        <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Visual Editor"
                      >
                        <Link to={`/admin/page-builder/${page.id}`}>
                          <Edit className="w-4 h-4 text-blue-600" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        title="Edit Page Settings"
                      >
                        <Link to={`/admin/pages/edit/${page.id}`}>
                          <Edit className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Duplicate Page"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(page.id)}
                        title="Delete Page"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Create New Page" to add pages to your website</li>
          <li>• Published pages are visible on the website, drafts are not</li>
          <li>• Use the slug to create clean URLs (e.g., /about-us)</li>
          <li>• Placement controls where the page appears (main nav, footer, or hidden)</li>
        </ul>
      </div>
    </div>
  );
};

export default PagesList;
