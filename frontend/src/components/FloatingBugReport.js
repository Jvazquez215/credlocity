import React, { useState, useRef, useEffect } from 'react';
import { Bug, X, Upload, Trash2, Plus, Image as ImageIcon, Send } from 'lucide-react';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = [
  { value: 'ui_display', label: 'UI / Display Issue' },
  { value: 'calculation', label: 'Calculation Error' },
  { value: 'data_entry', label: 'Data Entry Problem' },
  { value: 'permissions', label: 'Permissions / Access' },
  { value: 'performance', label: 'Performance / Speed' },
  { value: 'broken_link', label: 'Broken Link / Navigation' },
  { value: 'other', label: 'Other' },
];

const SEVERITIES = [
  { value: 'critical', label: 'Critical — Blocks work' },
  { value: 'high', label: 'High — Major issue' },
  { value: 'medium', label: 'Medium — Annoying but workable' },
  { value: 'low', label: 'Low — Minor / Cosmetic' },
];

function getAuthToken() {
  return (
    localStorage.getItem('auth_token') ||
    sessionStorage.getItem('partner_token') ||
    localStorage.getItem('partner_token') ||
    localStorage.getItem('attorney_token') ||
    localStorage.getItem('company_token') ||
    null
  );
}

function getPortalName() {
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return 'Admin CMS';
  if (path.startsWith('/partner')) return 'Partner Portal';
  if (path.startsWith('/attorney')) return 'Attorney Portal';
  if (path.startsWith('/company')) return 'Company Portal';
  return 'Public Site';
}

const FloatingBugReport = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', steps: [''], error_message: '',
    category: 'other', severity: 'medium',
  });
  const [screenshots, setScreenshots] = useState([]); // {file, preview}
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [token, setToken] = useState(getAuthToken());
  const fileInputRef = useRef(null);
  const location = useLocation();

  // Re-check token on location changes and periodically
  useEffect(() => {
    setToken(getAuthToken());
  }, [location.pathname]);

  useEffect(() => {
    const iv = setInterval(() => setToken(getAuthToken()), 2000);
    return () => clearInterval(iv);
  }, []);

  // Only show on authenticated portal pages
  const isPortalPage = location.pathname.startsWith('/admin') || location.pathname.startsWith('/partner') || location.pathname.startsWith('/attorney') || location.pathname.startsWith('/company');
  if (!token || !isPortalPage) return null;

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const updateStep = (i, v) => { const s = [...form.steps]; s[i] = v; update('steps', s); };
  const addStep = () => update('steps', [...form.steps, '']);
  const removeStep = i => update('steps', form.steps.filter((_, idx) => idx !== i));

  const addFiles = (files) => {
    const valid = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (valid.length === 0) { toast.error('Only image files are allowed'); return; }
    const newShots = valid.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setScreenshots(prev => [...prev, ...newShots].slice(0, 5));
  };

  const removeScreenshot = (i) => {
    setScreenshots(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const reset = () => {
    screenshots.forEach(s => URL.revokeObjectURL(s.preview));
    setForm({ title: '', description: '', steps: [''], error_message: '', category: 'other', severity: 'medium' });
    setScreenshots([]);
  };

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Title and description are required');
      return;
    }
    setSubmitting(true);
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

    try {
      const body = {
        title: form.title,
        description: form.description,
        steps_to_reproduce: form.steps.filter(s => s.trim()),
        error_message: form.error_message || null,
        category: form.category,
        severity: form.severity,
        ticket_url: window.location.href,
        browser_info: navigator.userAgent,
        portal: getPortalName(),
      };

      const res = await fetch(`${API}/api/tickets`, { method: 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to submit');

      const ticketNumber = data.ticket_number;

      // Upload screenshots
      for (const shot of screenshots) {
        const fd = new FormData();
        fd.append('file', shot.file);
        await fetch(`${API}/api/tickets/${ticketNumber}/screenshots`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd,
        });
      }

      toast.success(`Bug report ${ticketNumber} submitted! Admin has been notified.`, { duration: 5000 });
      reset();
      setIsOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to submit bug report');
    }
    setSubmitting(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-5 z-[90] w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          data-testid="floating-bug-report-btn"
          title="Report a Bug"
        >
          <Bug className="w-5 h-5" />
          <span className="absolute right-full mr-2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Report a Bug
          </span>
        </button>
      )}

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex justify-end" onClick={() => setIsOpen(false)}>
          <div
            className="bg-white w-full max-w-lg h-full overflow-y-auto shadow-2xl"
            onClick={e => e.stopPropagation()}
            data-testid="bug-report-modal"
            style={{ animation: 'slideInRight 0.25s ease-out' }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-red-600 text-white z-10 flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                <h2 className="font-bold text-lg">Report a Bug</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{getPortalName()}</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded" data-testid="close-bug-modal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-semibold text-gray-700">What's the bug? *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  maxLength={100}
                  placeholder="Brief summary of the issue..."
                  value={form.title}
                  onChange={e => update('title', e.target.value)}
                  data-testid="bug-title-input"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Describe what happened *</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm mt-1 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  rows={3}
                  placeholder="What were you trying to do? What happened instead?"
                  value={form.description}
                  onChange={e => update('description', e.target.value)}
                  data-testid="bug-description-input"
                />
              </div>

              {/* Screenshots Drop Zone */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <ImageIcon className="w-4 h-4" /> Screenshots
                  <span className="text-gray-400 font-normal text-xs ml-1">(up to 5)</span>
                </label>
                <div
                  className={`mt-1 border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                  }`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  data-testid="screenshot-dropzone"
                >
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <p className="text-sm text-gray-500">Drag & drop images or <span className="text-red-600 font-medium">click to browse</span></p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => addFiles(e.target.files)}
                  />
                </div>
                {screenshots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {screenshots.map((s, i) => (
                      <div key={i} className="relative group w-20 h-20 rounded-lg overflow-hidden border">
                        <img src={s.preview} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeScreenshot(i); }}
                          className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`remove-screenshot-${i}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Steps to reproduce</label>
                <div className="space-y-2 mt-1">
                  {form.steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-5 text-right">{i + 1}.</span>
                      <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                        value={s}
                        onChange={e => updateStep(i, e.target.value)}
                        placeholder={`Step ${i + 1}...`}
                      />
                      {form.steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className="text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button onClick={addStep} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium">
                    <Plus className="w-3 h-3" /> Add Step
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <div>
                <label className="text-sm font-semibold text-gray-700">Error message (if any)</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm mt-1 font-mono bg-gray-50 focus:ring-2 focus:ring-red-500 outline-none"
                  rows={2}
                  placeholder="Paste any error text here..."
                  value={form.error_message}
                  onChange={e => update('error_message', e.target.value)}
                  data-testid="bug-error-input"
                />
              </div>

              {/* Category + Severity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-red-500 outline-none"
                    value={form.category}
                    onChange={e => update('category', e.target.value)}
                    data-testid="bug-category-select"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Severity</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm mt-1 focus:ring-2 focus:ring-red-500 outline-none"
                    value={form.severity}
                    onChange={e => update('severity', e.target.value)}
                    data-testid="bug-severity-select"
                  >
                    {SEVERITIES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Current Page (auto-filled) */}
              <div className="text-xs text-gray-400 bg-gray-50 rounded px-3 py-2 truncate">
                Page: {window.location.pathname}
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2 border-t">
                <button
                  onClick={() => { reset(); setIsOpen(false); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submit}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  data-testid="bug-submit-btn"
                >
                  {submitting ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="w-4 h-4" /> Submit Bug Report</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default FloatingBugReport;
