import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import { 
  Globe, Eye, EyeOff, Save, Plus, Trash2, GripVertical, Star,
  Pencil, X, Check, Tag, Sparkles, Crown, Zap, Gift
} from 'lucide-react';

const WebsitePricingManager = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [pageConfig, setPageConfig] = useState(null);
  const [showConfigEditor, setShowConfigEditor] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchPageConfig();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/billing/subscription-plans');
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchPageConfig = async () => {
    try {
      const response = await api.get('/billing/pricing-page-config');
      setPageConfig(response.data);
    } catch (error) {
      console.error('Error fetching page config:', error);
    }
  };

  const toggleWebsiteVisibility = async (plan) => {
    try {
      await api.put(`/billing/subscription-plans/${plan.id}`, {
        show_on_website: !plan.show_on_website
      });
      toast.success(`Plan ${plan.show_on_website ? 'hidden from' : 'shown on'} website`);
      fetchPlans();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast.error('Failed to update plan');
    }
  };

  const savePlanSettings = async () => {
    if (!editingPlan) return;
    
    try {
      await api.put(`/billing/subscription-plans/${editingPlan.id}`, {
        website_settings: editingPlan.website_settings,
        show_on_website: editingPlan.show_on_website,
        is_featured: editingPlan.is_featured
      });
      toast.success('Plan settings saved');
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan settings');
    }
  };

  const savePageConfig = async () => {
    setSavingConfig(true);
    try {
      await api.put('/billing/pricing-page-config', pageConfig);
      toast.success('Pricing page configuration saved');
      setShowConfigEditor(false);
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setSavingConfig(false);
    }
  };

  const updateWebsiteSetting = (field, value) => {
    setEditingPlan(prev => ({
      ...prev,
      website_settings: {
        ...prev.website_settings,
        [field]: value
      }
    }));
  };

  const addFeature = (type) => {
    const field = type === 'included' ? 'features_included' : 'features_not_included';
    setEditingPlan(prev => ({
      ...prev,
      website_settings: {
        ...prev.website_settings,
        [field]: [...(prev.website_settings?.[field] || []), '']
      }
    }));
  };

  const updateFeature = (type, index, value) => {
    const field = type === 'included' ? 'features_included' : 'features_not_included';
    setEditingPlan(prev => {
      const features = [...(prev.website_settings?.[field] || [])];
      features[index] = value;
      return {
        ...prev,
        website_settings: {
          ...prev.website_settings,
          [field]: features
        }
      };
    });
  };

  const removeFeature = (type, index) => {
    const field = type === 'included' ? 'features_included' : 'features_not_included';
    setEditingPlan(prev => ({
      ...prev,
      website_settings: {
        ...prev.website_settings,
        [field]: (prev.website_settings?.[field] || []).filter((_, i) => i !== index)
      }
    }));
  };

  const bannerPresets = [
    { text: 'Most Popular', color: 'green', icon: Star },
    { text: 'Best Value', color: 'gold', icon: Crown },
    { text: '30 Days Free', color: 'blue', icon: Gift },
    { text: '60 Days Free', color: 'purple', icon: Gift },
    { text: 'Half Off', color: 'red', icon: Tag },
    { text: 'Limited Time', color: 'orange', icon: Zap },
    { text: 'Special Offer', color: 'pink', icon: Sparkles },
    { text: 'New', color: 'teal', icon: Sparkles },
  ];

  const colorClasses = {
    green: 'bg-green-500 text-white',
    gold: 'bg-yellow-500 text-white',
    blue: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    red: 'bg-red-500 text-white',
    orange: 'bg-orange-500 text-white',
    pink: 'bg-pink-500 text-white',
    teal: 'bg-teal-500 text-white',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div data-testid="website-pricing-manager" className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Website Pricing Page</h2>
          <p className="text-gray-500">Control what appears on the public-facing pricing page</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.open('/pricing', '_blank')}>
            <Eye className="w-4 h-4 mr-2" /> Preview Page
          </Button>
          <Button variant="outline" onClick={() => setShowConfigEditor(!showConfigEditor)}>
            <Pencil className="w-4 h-4 mr-2" /> Edit Page Content
          </Button>
        </div>
      </div>

      {/* Page Content Editor */}
      {showConfigEditor && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold mb-4">Page Content Configuration</h3>
          
          {/* Hero Section */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700">Hero Section</h4>
            <div>
              <Label>Title</Label>
              <Input
                value={pageConfig?.hero?.title || ''}
                onChange={(e) => setPageConfig(prev => ({
                  ...prev,
                  hero: { ...prev?.hero, title: e.target.value }
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Textarea
                value={pageConfig?.hero?.subtitle || ''}
                onChange={(e) => setPageConfig(prev => ({
                  ...prev,
                  hero: { ...prev?.hero, subtitle: e.target.value }
                }))}
                rows={2}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Highlights (comma-separated)</Label>
              <Input
                value={pageConfig?.hero?.highlights?.join(', ') || ''}
                onChange={(e) => setPageConfig(prev => ({
                  ...prev,
                  hero: { ...prev?.hero, highlights: e.target.value.split(',').map(h => h.trim()) }
                }))}
                placeholder="$0 First Work Fee, 30-Day Free Trial, Cancel Anytime"
                className="mt-1"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="space-y-4 mb-6">
            <h4 className="font-medium text-gray-700">Call-to-Action Section</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>CTA Title</Label>
                <Input
                  value={pageConfig?.cta_section?.title || ''}
                  onChange={(e) => setPageConfig(prev => ({
                    ...prev,
                    cta_section: { ...prev?.cta_section, title: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>CTA Subtitle</Label>
                <Input
                  value={pageConfig?.cta_section?.subtitle || ''}
                  onChange={(e) => setPageConfig(prev => ({
                    ...prev,
                    cta_section: { ...prev?.cta_section, subtitle: e.target.value }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Primary Button Text</Label>
                <Input
                  value={pageConfig?.cta_section?.primary_button?.text || ''}
                  onChange={(e) => setPageConfig(prev => ({
                    ...prev,
                    cta_section: { 
                      ...prev?.cta_section, 
                      primary_button: { ...prev?.cta_section?.primary_button, text: e.target.value }
                    }
                  }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Primary Button URL</Label>
                <Input
                  value={pageConfig?.cta_section?.primary_button?.url || ''}
                  onChange={(e) => setPageConfig(prev => ({
                    ...prev,
                    cta_section: { 
                      ...prev?.cta_section, 
                      primary_button: { ...prev?.cta_section?.primary_button, url: e.target.value }
                    }
                  }))}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConfigEditor(false)}>Cancel</Button>
            <Button onClick={savePageConfig} disabled={savingConfig}>
              {savingConfig ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-semibold">Pricing Plans</h3>
          <p className="text-sm text-gray-500">Toggle visibility and customize how each plan appears on the website</p>
        </div>
        
        <div className="divide-y">
          {plans.map((plan) => (
            <div key={plan.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleWebsiteVisibility(plan)}
                    className={`p-2 rounded-lg transition ${
                      plan.show_on_website 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-gray-100 text-gray-400'
                    }`}
                    title={plan.show_on_website ? 'Visible on website' : 'Hidden from website'}
                  >
                    {plan.show_on_website ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      {plan.is_featured && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">Featured</span>
                      )}
                      {plan.website_settings?.banner && (
                        <span className={`px-2 py-0.5 text-xs rounded-full ${colorClasses[plan.website_settings.banner.color] || 'bg-gray-500 text-white'}`}>
                          {plan.website_settings.banner.text}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {plan.website_settings?.price_display || `$${plan.monthly_fee}`}{plan.website_settings?.price_period || '/month'}
                      {plan.website_settings?.trial_text && ` • ${plan.website_settings.trial_text}`}
                    </p>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingPlan({ ...plan, website_settings: plan.website_settings || {} })}
                >
                  <Pencil className="w-4 h-4 mr-1" /> Configure
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Plan Modal */}
      {editingPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Configure "{editingPlan.name}" for Website</h2>
                <Button variant="outline" size="sm" onClick={() => setEditingPlan(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Display Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Display Settings</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input
                      value={editingPlan.website_settings?.display_name || editingPlan.name}
                      onChange={(e) => updateWebsiteSetting('display_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={editingPlan.website_settings?.tagline || ''}
                      onChange={(e) => updateWebsiteSetting('tagline', e.target.value)}
                      placeholder="e.g., Most popular choice"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Price Display</Label>
                    <Input
                      value={editingPlan.website_settings?.price_display || `$${editingPlan.monthly_fee}`}
                      onChange={(e) => updateWebsiteSetting('price_display', e.target.value)}
                      placeholder="e.g., $99.95 or Custom"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Price Period</Label>
                    <Input
                      value={editingPlan.website_settings?.price_period || '/month'}
                      onChange={(e) => updateWebsiteSetting('price_period', e.target.value)}
                      placeholder="e.g., /month or /year"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Trial Text</Label>
                    <Input
                      value={editingPlan.website_settings?.trial_text || ''}
                      onChange={(e) => updateWebsiteSetting('trial_text', e.target.value)}
                      placeholder="e.g., 30-Day Free Trial"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>CTA Button Text</Label>
                    <Input
                      value={editingPlan.website_settings?.cta_text || 'Get Started'}
                      onChange={(e) => updateWebsiteSetting('cta_text', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>CTA Button URL</Label>
                    <Input
                      value={editingPlan.website_settings?.cta_url || ''}
                      onChange={(e) => updateWebsiteSetting('cta_url', e.target.value)}
                      placeholder="e.g., /signup?plan=standard or https://..."
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Banner/Badge */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-700">Promotional Banner</h3>
                <p className="text-sm text-gray-500">Add a badge/banner to highlight this plan</p>
                
                <div className="flex flex-wrap gap-2">
                  {bannerPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateWebsiteSetting('banner', { text: preset.text, color: preset.color })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition ${
                        editingPlan.website_settings?.banner?.text === preset.text
                          ? colorClasses[preset.color]
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <preset.icon className="w-4 h-4" />
                      {preset.text}
                    </button>
                  ))}
                  <button
                    onClick={() => updateWebsiteSetting('banner', null)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      !editingPlan.website_settings?.banner
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    No Banner
                  </button>
                </div>

                {editingPlan.website_settings?.banner && (
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label>Custom Banner Text</Label>
                      <Input
                        value={editingPlan.website_settings?.banner?.text || ''}
                        onChange={(e) => updateWebsiteSetting('banner', {
                          ...editingPlan.website_settings?.banner,
                          text: e.target.value
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Banner Color</Label>
                      <select
                        value={editingPlan.website_settings?.banner?.color || 'green'}
                        onChange={(e) => updateWebsiteSetting('banner', {
                          ...editingPlan.website_settings?.banner,
                          color: e.target.value
                        })}
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="green">Green</option>
                        <option value="gold">Gold</option>
                        <option value="blue">Blue</option>
                        <option value="purple">Purple</option>
                        <option value="red">Red</option>
                        <option value="orange">Orange</option>
                        <option value="pink">Pink</option>
                        <option value="teal">Teal</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Features Included */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-700">Features Included</h3>
                    <p className="text-sm text-gray-500">What&apos;s included in this plan (shown with checkmarks)</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addFeature('included')}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editingPlan.website_settings?.features_included || []).map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-6 h-9 flex items-center justify-center text-green-600">
                        <Check className="w-4 h-4" />
                      </div>
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('included', idx, e.target.value)}
                        placeholder="Enter feature..."
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeFeature('included', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(editingPlan.website_settings?.features_included || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No custom features. Will use default plan features.
                    </p>
                  )}
                </div>
              </div>

              {/* Features Not Included */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-700">Features Not Included</h3>
                    <p className="text-sm text-gray-500">What&apos;s NOT included (shown with X marks)</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => addFeature('not_included')}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(editingPlan.website_settings?.features_not_included || []).map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="w-6 h-9 flex items-center justify-center text-gray-400">
                        <X className="w-4 h-4" />
                      </div>
                      <Input
                        value={feature}
                        onChange={(e) => updateFeature('not_included', idx, e.target.value)}
                        placeholder="Enter feature not included..."
                        className="flex-1"
                      />
                      <Button variant="outline" size="sm" onClick={() => removeFeature('not_included', idx)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(editingPlan.website_settings?.features_not_included || []).length === 0 && (
                    <p className="text-sm text-gray-400 italic">No features marked as not included.</p>
                  )}
                </div>
              </div>

              {/* Visibility Options */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="font-semibold text-gray-700">Visibility Options</h3>
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.show_on_website}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, show_on_website: e.target.checked }))}
                      className="w-5 h-5"
                    />
                    <span>Show on public pricing page</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPlan.is_featured}
                      onChange={(e) => setEditingPlan(prev => ({ ...prev, is_featured: e.target.checked }))}
                      className="w-5 h-5"
                    />
                    <span>Mark as featured (highlighted with border)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setEditingPlan(null)}>Cancel</Button>
              <Button onClick={savePlanSettings}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Card */}
      {editingPlan && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg p-4 border w-80 z-40">
          <h4 className="font-semibold mb-3">Preview</h4>
          <div className={`rounded-lg border-2 ${editingPlan.is_featured ? 'border-green-500' : 'border-gray-200'} overflow-hidden`}>
            {editingPlan.website_settings?.banner && (
              <div className={`${colorClasses[editingPlan.website_settings.banner.color]} text-center py-1.5 text-sm font-semibold`}>
                {editingPlan.website_settings.banner.text}
              </div>
            )}
            <div className="p-4">
              <h5 className="font-bold">{editingPlan.website_settings?.display_name || editingPlan.name}</h5>
              <p className="text-xs text-gray-500 mb-2">{editingPlan.website_settings?.tagline}</p>
              <div className="text-2xl font-bold text-primary-blue">
                {editingPlan.website_settings?.price_display || `$${editingPlan.monthly_fee}`}
                <span className="text-sm font-normal text-gray-500">{editingPlan.website_settings?.price_period}</span>
              </div>
              <p className="text-xs text-green-600 mb-2">{editingPlan.website_settings?.trial_text}</p>
              <Button size="sm" className="w-full bg-green-500 text-xs">
                {editingPlan.website_settings?.cta_text || 'Get Started'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsitePricingManager;
