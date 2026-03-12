import React, { useState, useEffect } from 'react';
import axios from '../../../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';

export default function SiteSettings() {
  const [loading, setLoading] = useState(false);
  
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2563eb');
  const [secondaryColor, setSecondaryColor] = useState('#1e40af');
  const [defaultMetaTitle, setDefaultMetaTitle] = useState('');
  const [defaultMetaDescription, setDefaultMetaDescription] = useState('');
  const [orgName, setOrgName] = useState('Credlocity');
  const [orgPhone, setOrgPhone] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgAddress, setOrgAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });
  const [socialProfiles, setSocialProfiles] = useState({
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    youtube: ''
  });
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [sitemapEnabled, setSitemapEnabled] = useState(true);
  const [robotsTxtCustom, setRobotsTxtCustom] = useState('');
  const [chatbotEnabled, setChatbotEnabled] = useState(false);

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/api/site-settings');
      const settings = response.data;
      setLogoUrl(settings.logo_url || '');
      setPrimaryColor(settings.brand_color_primary || '#2563eb');
      setSecondaryColor(settings.brand_color_secondary || '#1e40af');
      setDefaultMetaTitle(settings.default_meta_title || '');
      setDefaultMetaDescription(settings.default_meta_description || '');
      setOrgName(settings.organization_name || 'Credlocity');
      setOrgPhone(settings.organization_phone || '');
      setOrgEmail(settings.organization_email || '');
      setOrgAddress(settings.organization_address || {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US'
      });
      setSocialProfiles(settings.social_profiles || {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
        youtube: ''
      });
      setGoogleAnalyticsId(settings.google_analytics_id || '');
      setSitemapEnabled(settings.sitemap_enabled !== false);
      setRobotsTxtCustom(settings.robots_txt_custom || '');
      setChatbotEnabled(settings.chatbot_enabled || false);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await axios.put('/api/site-settings', {
        logo_url: logoUrl,
        brand_color_primary: primaryColor,
        brand_color_secondary: secondaryColor,
        default_meta_title: defaultMetaTitle,
        default_meta_description: defaultMetaDescription,
        organization_name: orgName,
        organization_phone: orgPhone,
        organization_email: orgEmail,
        organization_address: orgAddress,
        social_profiles: socialProfiles,
        google_analytics_id: googleAnalyticsId,
        sitemap_enabled: sitemapEnabled,
        robots_txt_custom: robotsTxtCustom,
        chatbot_enabled: chatbotEnabled
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground mt-2">Configure global site settings</p>
        </div>
        <Button onClick={handleSaveSettings} disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Logo and brand colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Logo URL</Label>
            <Input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="/uploads/logo.png" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-20" />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Secondary Color</Label>
              <div className="flex gap-2">
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-10 w-20" />
                <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Global SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Default Meta Title</Label>
            <Input value={defaultMetaTitle} onChange={(e) => setDefaultMetaTitle(e.target.value)} maxLength={60} />
          </div>
          <div>
            <Label>Default Meta Description</Label>
            <Textarea value={defaultMetaDescription} onChange={(e) => setDefaultMetaDescription(e.target.value)} maxLength={160} rows={3} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Organization Name</Label>
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} placeholder="+1-XXX-XXX-XXXX" />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} placeholder="contact@credlocity.com" />
            </div>
          </div>
          
          {/* Address Fields */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Business Address (for Schema.org)</h3>
            <div className="space-y-4">
              <div>
                <Label>Street Address</Label>
                <Input 
                  value={orgAddress.street} 
                  onChange={(e) => setOrgAddress({...orgAddress, street: e.target.value})} 
                  placeholder="123 Main Street, Suite 100"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>City</Label>
                  <Input 
                    value={orgAddress.city} 
                    onChange={(e) => setOrgAddress({...orgAddress, city: e.target.value})} 
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label>State</Label>
                  <Input 
                    value={orgAddress.state} 
                    onChange={(e) => setOrgAddress({...orgAddress, state: e.target.value})} 
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label>ZIP Code</Label>
                  <Input 
                    value={orgAddress.zip} 
                    onChange={(e) => setOrgAddress({...orgAddress, zip: e.target.value})} 
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Social Profiles */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Social Media Profiles (for Schema.org)</h3>
            <div className="space-y-3">
              <div>
                <Label>Facebook URL</Label>
                <Input 
                  value={socialProfiles.facebook} 
                  onChange={(e) => setSocialProfiles({...socialProfiles, facebook: e.target.value})} 
                  placeholder="https://facebook.com/credlocity"
                />
              </div>
              <div>
                <Label>Twitter/X URL</Label>
                <Input 
                  value={socialProfiles.twitter} 
                  onChange={(e) => setSocialProfiles({...socialProfiles, twitter: e.target.value})} 
                  placeholder="https://twitter.com/credlocity"
                />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input 
                  value={socialProfiles.linkedin} 
                  onChange={(e) => setSocialProfiles({...socialProfiles, linkedin: e.target.value})} 
                  placeholder="https://linkedin.com/company/credlocity"
                />
              </div>
              <div>
                <Label>Instagram URL</Label>
                <Input 
                  value={socialProfiles.instagram} 
                  onChange={(e) => setSocialProfiles({...socialProfiles, instagram: e.target.value})} 
                  placeholder="https://instagram.com/credlocity"
                />
              </div>
              <div>
                <Label>YouTube URL</Label>
                <Input 
                  value={socialProfiles.youtube} 
                  onChange={(e) => setSocialProfiles({...socialProfiles, youtube: e.target.value})} 
                  placeholder="https://youtube.com/@credlocity"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label>Google Analytics ID</Label>
            <Input value={googleAnalyticsId} onChange={(e) => setGoogleAnalyticsId(e.target.value)} placeholder="G-XXXXXXXXXX" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={sitemapEnabled} onChange={(e) => setSitemapEnabled(e.target.checked)} />
              <span>Enable sitemap</span>
            </label>
            {sitemapEnabled && (
              <p className="text-sm text-green-600 mt-2">Sitemap: https://credlocity.com/sitemap.xml</p>
            )}
          </div>
          <div>
            <Label>Custom robots.txt</Label>
            <Textarea value={robotsTxtCustom} onChange={(e) => setRobotsTxtCustom(e.target.value)} rows={6} className="font-mono" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Features</CardTitle>
          <CardDescription>Control AI-powered features on your website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={chatbotEnabled} 
                onChange={(e) => setChatbotEnabled(e.target.checked)} 
                className="w-4 h-4"
              />
              <span className="font-medium">🧙 Enable CreditSage AI Chatbot</span>
            </label>
            <p className="text-sm text-gray-500 mt-2 ml-6">
              {chatbotEnabled ? 'CreditSage chatbot is currently enabled and visible on your website' : 'CreditSage chatbot is currently disabled'}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={loading} size="lg">
          {loading ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>
    </div>
  );
}
