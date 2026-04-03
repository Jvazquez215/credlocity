import React, { useState, useEffect, useCallback } from 'react';
import { X, Send, Check, AlertCircle, Loader2, Link2, Image, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PLATFORM_CONFIG = {
  facebook: { name: 'Facebook', icon: 'fa-brands fa-facebook-f', color: '#1877F2', bg: 'bg-[#1877F2]', charLimit: 63206, hasLink: true },
  instagram: { name: 'Instagram', icon: 'fa-brands fa-instagram', color: '#E4405F', bg: 'bg-[#E4405F]', charLimit: 2200, hasLink: false },
  twitter: { name: 'Twitter / X', icon: 'fa-brands fa-x-twitter', color: '#000000', bg: 'bg-black', charLimit: 280, hasLink: true },
  threads: { name: 'Threads', icon: 'fa-brands fa-threads', color: '#000000', bg: 'bg-black', charLimit: 500, hasLink: true },
  linkedin: { name: 'LinkedIn', icon: 'fa-brands fa-linkedin-in', color: '#0A66C2', bg: 'bg-[#0A66C2]', charLimit: 3000, hasLink: true },
};

export default function SocialMediaPublishModal({ isOpen, onClose, sourceData }) {
  const [selectedPlatforms, setSelectedPlatforms] = useState({});
  const [platformContents, setPlatformContents] = useState({});
  const [publishing, setPublishing] = useState(false);
  const [results, setResults] = useState(null);
  const [platformStatuses, setPlatformStatuses] = useState([]);
  const token = localStorage.getItem('auth_token');

  // Initialize content from source data when modal opens
  useEffect(() => {
    if (isOpen && sourceData) {
      const ogTitle = sourceData.og_title || sourceData.title || '';
      const ogDesc = sourceData.og_description || sourceData.excerpt || sourceData.summary || '';
      const link = sourceData.url || '';

      const initial = {};
      Object.keys(PLATFORM_CONFIG).forEach(pid => {
        const cfg = PLATFORM_CONFIG[pid];
        let defaultContent = ogTitle;
        if (ogDesc) defaultContent += `\n\n${ogDesc}`;
        // Trim to char limit
        if (defaultContent.length > cfg.charLimit) {
          defaultContent = defaultContent.slice(0, cfg.charLimit - 3) + '...';
        }
        initial[pid] = defaultContent;
      });
      setPlatformContents(initial);
      setSelectedPlatforms({});
      setResults(null);
    }
  }, [isOpen, sourceData]);

  // Fetch platform connection status
  useEffect(() => {
    if (isOpen) {
      fetch(`${API_URL}/api/social-media/platforms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : { platforms: [] })
        .then(d => setPlatformStatuses(d.platforms || []))
        .catch(() => {});
    }
  }, [isOpen, token]);

  const togglePlatform = (pid) => {
    setSelectedPlatforms(prev => ({ ...prev, [pid]: !prev[pid] }));
  };

  const updateContent = (pid, text) => {
    setPlatformContents(prev => ({ ...prev, [pid]: text }));
  };

  const selectedCount = Object.values(selectedPlatforms).filter(Boolean).length;

  const handlePublish = async () => {
    if (selectedCount === 0) {
      toast.error('Select at least one platform');
      return;
    }

    const platforms = Object.entries(selectedPlatforms)
      .filter(([, v]) => v)
      .map(([pid]) => ({
        platform_id: pid,
        content: platformContents[pid] || '',
        include_link: PLATFORM_CONFIG[pid].hasLink,
      }));

    // Validate char limits
    for (const p of platforms) {
      const limit = PLATFORM_CONFIG[p.platform_id].charLimit;
      if (p.content.length > limit) {
        toast.error(`${PLATFORM_CONFIG[p.platform_id].name} post exceeds ${limit} character limit`);
        return;
      }
      if (!p.content.trim()) {
        toast.error(`${PLATFORM_CONFIG[p.platform_id].name} post content is empty`);
        return;
      }
    }

    setPublishing(true);
    try {
      const res = await fetch(`${API_URL}/api/social-media/posts`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms,
          source_type: sourceData.source_type || 'blog',
          source_id: sourceData.source_id || '',
          source_title: sourceData.title || '',
          source_url: sourceData.url || '',
          og_image: sourceData.og_image || sourceData.featured_image_url || '',
        })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.posts || []);
        const published = (data.posts || []).filter(p => p.status === 'published').length;
        const pending = (data.posts || []).filter(p => p.status === 'pending_setup').length;
        if (published > 0) toast.success(`${published} post(s) published successfully!`);
        if (pending > 0) toast.info(`${pending} post(s) saved — will publish once platform API keys are configured`);
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Failed to create posts');
      }
    } catch (e) {
      toast.error('Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (!isOpen) return null;

  const link = sourceData?.url || '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="social-media-modal">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-slate-900 to-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">Share to Social Media</h2>
            <p className="text-slate-400 text-xs mt-0.5">
              {sourceData?.title ? `"${sourceData.title.slice(0, 50)}${sourceData.title.length > 50 ? '...' : ''}"` : 'Publish your content'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1" data-testid="close-social-modal">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Results view */}
          {results ? (
            <div className="space-y-3" data-testid="publish-results">
              <h3 className="font-semibold text-gray-800">Publishing Results</h3>
              {results.map(r => {
                const cfg = PLATFORM_CONFIG[r.platform_id] || {};
                return (
                  <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${cfg.bg} rounded-lg flex items-center justify-center`}>
                        <i className={`${cfg.icon} text-white text-sm`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cfg.name}</p>
                        <p className="text-xs text-gray-500">{r.char_count} characters</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {r.status === 'published' && <Badge className="bg-green-100 text-green-700"><Check className="w-3 h-3 mr-1" /> Published</Badge>}
                      {r.status === 'pending_setup' && <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="w-3 h-3 mr-1" /> Saved (Setup needed)</Badge>}
                      {r.status === 'failed' && <Badge className="bg-red-100 text-red-700"><AlertCircle className="w-3 h-3 mr-1" /> Failed</Badge>}
                      {r.status === 'queued' && <Badge className="bg-blue-100 text-blue-700">Queued</Badge>}
                    </div>
                  </div>
                );
              })}
              <div className="pt-2">
                <Button onClick={onClose} className="w-full" data-testid="done-btn">Done</Button>
              </div>
            </div>
          ) : (
            <>
              {/* OG Preview */}
              {(sourceData?.og_image || sourceData?.featured_image_url) && (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                  <img
                    src={sourceData.og_image || sourceData.featured_image_url}
                    alt="OG"
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{sourceData.title}</p>
                    <p className="text-xs text-gray-500 truncate">{sourceData.og_description || sourceData.excerpt || ''}</p>
                    {link && (
                      <div className="flex items-center gap-1 mt-1">
                        <Link2 className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-500 truncate">{link}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Platform Selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Select Platforms</p>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(PLATFORM_CONFIG).map(([pid, cfg]) => {
                    const active = selectedPlatforms[pid];
                    const pStatus = platformStatuses.find(p => p.id === pid);
                    return (
                      <button
                        key={pid}
                        onClick={() => togglePlatform(pid)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                          active ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        data-testid={`platform-toggle-${pid}`}
                      >
                        <div className={`w-10 h-10 ${cfg.bg} rounded-xl flex items-center justify-center ${active ? 'ring-2 ring-blue-300' : ''}`}>
                          <i className={`${cfg.icon} text-white text-lg`} />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{cfg.name.split(' ')[0]}</span>
                        {pStatus?.connected && <span className="w-2 h-2 bg-green-500 rounded-full" title="Connected" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Per-platform editors */}
              {Object.entries(selectedPlatforms).filter(([, v]) => v).map(([pid]) => {
                const cfg = PLATFORM_CONFIG[pid];
                const content = platformContents[pid] || '';
                const remaining = cfg.charLimit - content.length;
                const overLimit = remaining < 0;

                return (
                  <div key={pid} className="border rounded-xl overflow-hidden" data-testid={`editor-${pid}`}>
                    <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 ${cfg.bg} rounded flex items-center justify-center`}>
                          <i className={`${cfg.icon} text-white text-xs`} />
                        </div>
                        <span className="font-medium text-sm">{cfg.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {cfg.hasLink && link && (
                          <span className="flex items-center gap-1 text-blue-500">
                            <Link2 className="w-3 h-3" /> Link included
                          </span>
                        )}
                        {!cfg.hasLink && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <Image className="w-3 h-3" /> Image only
                          </span>
                        )}
                        <span className={`font-mono px-1.5 py-0.5 rounded ${overLimit ? 'bg-red-100 text-red-600' : remaining < 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                          {content.length}/{cfg.charLimit}
                        </span>
                      </div>
                    </div>
                    <textarea
                      value={content}
                      onChange={(e) => updateContent(pid, e.target.value)}
                      className={`w-full p-4 text-sm resize-none focus:outline-none ${overLimit ? 'bg-red-50' : ''}`}
                      rows={pid === 'twitter' ? 3 : pid === 'threads' ? 4 : 5}
                      placeholder={`Write your ${cfg.name} post...`}
                      data-testid={`textarea-${pid}`}
                    />
                    {overLimit && (
                      <div className="px-4 py-1.5 bg-red-50 border-t border-red-100 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {Math.abs(remaining)} characters over limit
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer */}
        {!results && (
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {selectedCount > 0 ? `${selectedCount} platform${selectedCount > 1 ? 's' : ''} selected` : 'Select platforms above'}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} data-testid="cancel-social-btn">Skip</Button>
              <Button
                onClick={handlePublish}
                disabled={selectedCount === 0 || publishing}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                data-testid="publish-social-btn"
              >
                {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
                Publish to {selectedCount} Platform{selectedCount !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
