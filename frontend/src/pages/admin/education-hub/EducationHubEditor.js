import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/api';
import { toast } from 'sonner';
import RichTextEditor from '../../../components/RichTextEditor';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Card } from '../../../components/ui/card';
import { Plus, Trash2, GripVertical, Save, Eye } from 'lucide-react';

const EducationHubEditor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  
  // Hub data
  const [h1Title, setH1Title] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [sections, setSections] = useState([]);
  const [showToc, setShowToc] = useState(true);
  const [tocTitle, setTocTitle] = useState('Guide Navigation');
  
  // SEO
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schemaType, setSchemaType] = useState('HowTo');
  const [status, setStatus] = useState('published');
  const [slug, setSlug] = useState('credit-repair-guide');

  useEffect(() => {
    fetchEducationHub();
  }, []);

  const fetchEducationHub = async () => {
    try {
      setFetchLoading(true);
      const response = await axios.get('/education-hub');
      const hub = response.data;
      
      setH1Title(hub.h1_title || '');
      setHeroSubtitle(hub.hero_subtitle || '');
      setHeroImageUrl(hub.hero_image_url || '');
      setIntroduction(hub.introduction || '');
      setSections(hub.sections || []);
      setShowToc(hub.show_toc ?? true);
      setTocTitle(hub.toc_title || 'Guide Navigation');
      setSeoMetaTitle(hub.seo_meta_title || '');
      setSeoMetaDescription(hub.seo_meta_description || '');
      setSeoKeywords(hub.seo_keywords?.join(', ') || '');
      setCanonicalUrl(hub.canonical_url || '');
      setSchemaType(hub.schema_type || 'HowTo');
      setStatus(hub.status || 'published');
      setSlug(hub.slug || 'credit-repair-guide');
    } catch (error) {
      console.error('Error fetching education hub:', error);
      toast.error('Failed to load education hub');
    } finally {
      setFetchLoading(false);
    }
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      h2_title: '',
      content: '',
      order: sections.length,
      video_ids: [],
      show_letters: false
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (index, field, value) => {
    const updatedSections = [...sections];
    updatedSections[index][field] = value;
    setSections(updatedSections);
  };

  const deleteSection = (index) => {
    const updatedSections = sections.filter((_, i) => i !== index);
    setSections(updatedSections);
  };

  const moveSection = (index, direction) => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === sections.length - 1)) {
      return;
    }
    
    const updatedSections = [...sections];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedSections[index], updatedSections[swapIndex]] = [updatedSections[swapIndex], updatedSections[index]];
    updatedSections.forEach((section, i) => {
      section.order = i;
    });
    setSections(updatedSections);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const hubData = {
        h1_title: h1Title,
        hero_subtitle: heroSubtitle,
        hero_image_url: heroImageUrl,
        introduction,
        sections,
        show_toc: showToc,
        toc_title: tocTitle,
        seo_meta_title: seoMetaTitle,
        seo_meta_description: seoMetaDescription,
        seo_keywords: seoKeywords.split(',').map(k => k.trim()).filter(k => k),
        canonical_url: canonicalUrl,
        schema_type: schemaType,
        status,
        slug
      };

      await axios.put('/education-hub', hubData);
      toast.success('Education Hub saved successfully!');
    } catch (error) {
      console.error('Error saving education hub:', error);
      toast.error('Failed to save education hub');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="text-center py-8">Loading Education Hub...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Edit Education Hub</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open(`/${slug}`, '_blank')}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Hero Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <Label>H1 Title *</Label>
              <Input
                value={h1Title}
                onChange={(e) => setH1Title(e.target.value)}
                placeholder="The Ultimate 2025 Guide to Credit Repair..."
                required
              />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="Your complete resource for understanding credit..."
                rows={2}
              />
            </div>
            <div>
              <Label>Hero Image URL</Label>
              <Input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                placeholder="/uploads/hero-credit-repair.jpg"
              />
            </div>
          </div>
        </Card>

        {/* Introduction */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Introduction</h2>
          <RichTextEditor
            content={introduction}
            onChange={setIntroduction}
          />
          <p className="text-sm text-gray-500 mt-2">500-1000 word intro before main sections</p>
        </Card>

        {/* Table of Contents Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showToc}
                onChange={(e) => setShowToc(e.target.checked)}
                className="w-4 h-4"
              />
              <Label>Show Table of Contents</Label>
            </div>
            {showToc && (
              <div>
                <Label>TOC Title</Label>
                <Input
                  value={tocTitle}
                  onChange={(e) => setTocTitle(e.target.value)}
                  placeholder="Guide Navigation"
                />
              </div>
            )}
          </div>
        </Card>

        {/* Sections */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Content Sections</h2>
            <Button type="button" onClick={addSection} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Section
            </Button>
          </div>
          
          <div className="space-y-6">
            {sections.map((section, index) => (
              <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                    <h3 className="font-semibold">Section {index + 1}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSection(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>H2 Title *</Label>
                    <Input
                      value={section.h2_title}
                      onChange={(e) => updateSection(index, 'h2_title', e.target.value)}
                      placeholder="Understanding Your Credit Foundation"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Section Content (500-800 words recommended)</Label>
                    <RichTextEditor
                      content={section.content}
                      onChange={(value) => updateSection(index, 'content', value)}
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={section.show_letters || false}
                      onChange={(e) => updateSection(index, 'show_letters', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label>Show Sample Letters in this section</Label>
                  </div>
                </div>
              </div>
            ))}
            
            {sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No sections yet. Click "Add Section" to create your first section.
              </div>
            )}
          </div>
        </Card>

        {/* SEO Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <Label>Meta Title</Label>
              <Input
                value={seoMetaTitle}
                onChange={(e) => setSeoMetaTitle(e.target.value)}
                placeholder="Complete Credit Repair Guide 2025 | FCRA & CROA Handbook"
              />
              <p className="text-sm text-gray-500 mt-1">
                {seoMetaTitle.length}/60 characters
              </p>
            </div>
            
            <div>
              <Label>Meta Description</Label>
              <Textarea
                value={seoMetaDescription}
                onChange={(e) => setSeoMetaDescription(e.target.value)}
                placeholder="Comprehensive 5000+ word guide to credit repair..."
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                {seoMetaDescription.length}/160 characters
              </p>
            </div>
            
            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder="credit repair, FCRA, CROA, credit dispute"
              />
            </div>
            
            <div>
              <Label>Canonical URL</Label>
              <Input
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="/credit-repair-guide"
              />
            </div>
            
            <div>
              <Label>Schema Type</Label>
              <select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="HowTo">HowTo (Step-by-step guide)</option>
                <option value="FAQPage">FAQPage</option>
                <option value="Article">Article</option>
              </select>
            </div>
            
            <div>
              <Label>URL Slug</Label>
              <Input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="credit-repair-guide"
              />
            </div>
            
            <div>
              <Label>Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border rounded-md p-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Education Hub'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EducationHubEditor;
