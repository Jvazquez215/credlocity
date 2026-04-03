import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { FileText, Upload, Trash2, Download, Edit2, X, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Dispute Letters', 'Debt Validation', 'Goodwill Letters', 'Cease & Desist', 'Identity Theft', 'Credit Bureau', 'Legal Templates', 'Other'];

const FreeLettersManager = () => {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', category: 'Dispute Letters', description: '' });
  const [file, setFile] = useState(null);

  const fetchLetters = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/letters/admin/list`);
      if (res.ok) setLetters(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLetters(); }, [fetchLetters]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');
    if (!form.title.trim()) return toast.error('Title is required');

    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('category', form.category);
    fd.append('description', form.description);
    fd.append('file', file);

    try {
      const res = await fetch(`${API}/api/letters/upload`, { method: 'POST', body: fd });
      if (res.ok) {
        toast.success('Letter uploaded successfully');
        setShowUpload(false);
        setForm({ title: '', category: 'Dispute Letters', description: '' });
        setFile(null);
        fetchLetters();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Upload failed');
      }
    } catch (e) { toast.error('Upload failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this letter?')) return;
    try {
      const res = await fetch(`${API}/api/letters/${id}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Letter deleted'); fetchLetters(); }
    } catch (e) { toast.error('Delete failed'); }
  };

  const handleTogglePublish = async (letter) => {
    const fd = new FormData();
    fd.append('is_published', (!letter.is_published).toString());
    try {
      const res = await fetch(`${API}/api/letters/${letter.id}`, { method: 'PUT', body: fd });
      if (res.ok) { toast.success(letter.is_published ? 'Unpublished' : 'Published'); fetchLetters(); }
    } catch (e) { toast.error('Update failed'); }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6" data-testid="free-letters-manager">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Free Downloadable Letters</h1>
          <p className="text-sm text-gray-500">Upload and manage letter templates for consumers to download free on the website.</p>
        </div>
        <Button onClick={() => setShowUpload(!showUpload)} className="bg-primary-blue text-white" data-testid="upload-letter-btn">
          <Upload className="w-4 h-4 mr-2" /> Upload Letter
        </Button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="bg-white rounded-xl border p-6 space-y-4" data-testid="upload-form">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue/20 outline-none text-sm" placeholder="e.g., FCRA Section 611 Dispute Letter" data-testid="letter-title-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue/20 outline-none text-sm" data-testid="letter-category-select">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-blue/20 outline-none text-sm" placeholder="Brief description of when to use this letter..." data-testid="letter-desc-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File * (PDF, DOC, DOCX, TXT, RTF)</label>
            <input type="file" accept=".pdf,.doc,.docx,.txt,.rtf" onChange={e => setFile(e.target.files[0])} className="w-full text-sm" data-testid="letter-file-input" />
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="bg-primary-blue text-white" data-testid="submit-upload-btn">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* Letters Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center"><div className="w-8 h-8 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : letters.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No letters uploaded yet. Click "Upload Letter" to add one.</p>
          </div>
        ) : (
          <table className="w-full text-sm" data-testid="letters-table">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Size</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Downloads</th>
                <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {letters.map(l => (
                <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary-blue flex-shrink-0" />
                      <div>
                        <div className="font-medium text-gray-900">{l.title}</div>
                        {l.description && <div className="text-xs text-gray-400 truncate max-w-xs">{l.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{l.category}</span></td>
                  <td className="px-4 py-3 text-gray-500 uppercase">{l.file_type}</td>
                  <td className="px-4 py-3 text-gray-500">{formatSize(l.file_size)}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{l.download_count || 0}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${l.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {l.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleTogglePublish(l)} className="p-1.5 rounded hover:bg-gray-100" title={l.is_published ? 'Unpublish' : 'Publish'}>
                        {l.is_published ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-green-500" />}
                      </button>
                      <a href={`${API}/api/letters/download/${l.id}`} className="p-1.5 rounded hover:bg-gray-100" title="Download">
                        <Download className="w-4 h-4 text-primary-blue" />
                      </a>
                      <button onClick={() => handleDelete(l.id)} className="p-1.5 rounded hover:bg-red-50" title="Delete" data-testid={`delete-${l.id}`}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default FreeLettersManager;
