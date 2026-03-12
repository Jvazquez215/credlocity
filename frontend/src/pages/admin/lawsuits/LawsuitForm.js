import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../utils/api';
import { Save, ArrowLeft, Upload, X, Image } from 'lucide-react';
import { toast } from 'sonner';
import ImageUpload from '../../../components/ui/ImageUpload';
import SchemaSelector from '../../../components/ui/SchemaSelector';

const LawsuitForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    title: '',
    case_number: '',
    lawsuit_category_id: '',
    lawsuit_type_ids: [],
    party_role_id: '',
    topic: '',
    description: '',
    brief_description: '',
    date_filed: new Date().toISOString().split('T')[0],
    violation_ids: [],
    outcome_stage_id: '',
    outcome_notes: '',
    filed_documents: [],
    public_docket_link: '',
    press_coverage: [],
    related_company: '',
    related_press_release_id: '',
    related_blog_posts: [],  // Add this field
    case_summary_html: '',
    is_active: true,
    featured_image_url: '',
    featured_image_alt: '',
    meta_title: '',
    meta_description: '',
    schema_types: [],
    schema_data: {}
  });

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(isEditing);
  const [pressReleases, setPressReleases] = useState([]);
  const [loadingPressReleases, setLoadingPressReleases] = useState(true);
  
  // Dropdown options
  const [partyRoles, setPartyRoles] = useState([]);
  const [lawsuitCategories, setLawsuitCategories] = useState([]);
  const [lawsuitTypes, setLawsuitTypes] = useState([]);
  const [violations, setViolations] = useState([]);
  const [outcomeStages, setOutcomeStages] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogPosts, setLoadingBlogPosts] = useState(true);
  
  // Press Release Creation
  const [showPressReleaseForm, setShowPressReleaseForm] = useState(false);
  const [creatingPressRelease, setCreatingPressRelease] = useState(false);
  const [newPressRelease, setNewPressRelease] = useState({
    title: '',
    summary: '',
    content: '',
    publish_date: new Date().toISOString().split('T')[0],
    contact_email: 'press@credlocity.com'
  });

  useEffect(() => {
    if (isEditing) {
      fetchLawsuit();
    }
    fetchPressReleases();
    fetchDropdownOptions();
    fetchBlogPosts();
  }, [id]);

  const fetchBlogPosts = async () => {
    try {
      const response = await api.get('/blog/posts');
      setBlogPosts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch blog posts:', error);
    } finally {
      setLoadingBlogPosts(false);
    }
  };

  const fetchDropdownOptions = async () => {
    try {
      const [
        partyRolesRes,
        categoriesRes,
        typesRes,
        violationsRes,
        stagesRes
      ] = await Promise.all([
        api.get('/admin/party-roles'),
        api.get('/admin/lawsuit-categories'),
        api.get('/admin/lawsuit-types'),
        api.get('/admin/lawsuit-violations'),
        api.get('/admin/lawsuit-outcome-stages')
      ]);

      setPartyRoles(partyRolesRes.data || []);
      setLawsuitCategories(categoriesRes.data || []);
      setLawsuitTypes(typesRes.data || []);
      setViolations(violationsRes.data || []);
      setOutcomeStages(stagesRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdown options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const fetchPressReleases = async () => {
    try {
      const response = await api.get('/admin/press-releases');
      setPressReleases(response.data || []);
    } catch (error) {
      console.error('Failed to fetch press releases:', error);
    } finally {
      setLoadingPressReleases(false);
    }
  };

  const fetchLawsuit = async () => {
    try {
      const response = await api.get(`/admin/lawsuits/${id}`);
      const lawsuit = response.data;
      setFormData({
        ...lawsuit,
        date_filed: new Date(lawsuit.date_filed).toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to fetch lawsuit');
      console.error(error);
    } finally {
      setFetchingData(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        date_filed: new Date(formData.date_filed).toISOString()
      };

      if (isEditing) {
        await api.put(`/admin/lawsuits/${id}`, dataToSend);
        toast.success('Lawsuit updated successfully');
      } else {
        await api.post('/admin/lawsuits', dataToSend);
        toast.success('Lawsuit created successfully');
      }
      navigate('/admin/lawsuits');
    } catch (error) {
      toast.error(isEditing ? 'Failed to update lawsuit' : 'Failed to create lawsuit');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleMultiSelectChange = (fieldName, itemId) => {
    setFormData(prev => {
      const currentItems = prev[fieldName] || [];
      const isSelected = currentItems.includes(itemId);
      
      return {
        ...prev,
        [fieldName]: isSelected
          ? currentItems.filter(id => id !== itemId)
          : [...currentItems, itemId]
      };
    });
  };

  const handleDocumentAdd = () => {
    const docUrl = prompt('Enter document URL:');
    if (docUrl) {
      setFormData({
        ...formData,
        filed_documents: [...formData.filed_documents, docUrl]
      });
    }
  };

  const handleDocumentRemove = (index) => {
    setFormData({
      ...formData,
      filed_documents: formData.filed_documents.filter((_, i) => i !== index)
    });
  };

  const handlePressCoverageAdd = () => {
    const url = prompt('Enter press coverage URL:');
    if (url) {
      setFormData({
        ...formData,
        press_coverage: [...(formData.press_coverage || []), url]
      });
    }
  };

  const handlePressCoverageRemove = (index) => {
    setFormData({
      ...formData,
      press_coverage: (formData.press_coverage || []).filter((_, i) => i !== index)
    });
  };

  const handleCreatePressRelease = async () => {
    // Validate required fields
    if (!newPressRelease.title || !newPressRelease.summary || !newPressRelease.content) {
      toast.error('Please fill in all required fields (Title, Summary, Content)');
      return;
    }

    setCreatingPressRelease(true);
    try {
      // Create the press release
      const prData = {
        title: newPressRelease.title,
        summary: newPressRelease.summary,
        content: newPressRelease.content,
        publish_date: newPressRelease.publish_date,
        contact_email: newPressRelease.contact_email,
        is_published: true,
        related_lawsuits: [] // Will be linked after lawsuit is saved
      };

      const response = await api.post('/admin/press-releases', prData);
      const createdPR = response.data;

      // Link the press release to the lawsuit
      setFormData(prev => ({
        ...prev,
        related_press_release_id: createdPR.id
      }));

      // Refresh press releases list
      await fetchPressReleases();

      // Close form and reset
      setShowPressReleaseForm(false);
      setNewPressRelease({
        title: '',
        summary: '',
        content: '',
        publish_date: new Date().toISOString().split('T')[0],
        contact_email: 'press@credlocity.com'
      });

      toast.success('Press release created and linked successfully!');
    } catch (error) {
      console.error('Error creating press release:', error);
      toast.error(error.response?.data?.detail || 'Failed to create press release');
    } finally {
      setCreatingPressRelease(false);
    }
  };


  if (fetchingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lawsuit...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/lawsuits')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Lawsuits
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          {isEditing ? 'Edit Lawsuit' : 'Create New Lawsuit'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lawsuit Caption (Title) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., John Doe vs. Credit Bureau XYZ"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Format: Plaintiff vs. Defendant(s)</p>
        </div>

        {/* Case Number & Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="case_number"
              value={formData.case_number}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lawsuit Category <span className="text-red-500">*</span>
            </label>
            {loadingOptions ? (
              <div className="text-sm text-gray-500 py-2">Loading categories...</div>
            ) : (
              <select
                name="lawsuit_category_id"
                value={formData.lawsuit_category_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                {lawsuitCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} {category.description && `- ${category.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Role <span className="text-red-500">*</span>
            </label>
            {loadingOptions ? (
              <div className="text-sm text-gray-500 py-2">Loading roles...</div>
            ) : (
              <select
                name="party_role_id"
                value={formData.party_role_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Role</option>
                {partyRoles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} {role.description && `- ${role.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Lawsuit Types (Multi-select) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lawsuit Types <span className="text-red-500">*</span> (Select all that apply)
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500 py-2">Loading types...</div>
          ) : lawsuitTypes.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">No lawsuit types available.</div>
          ) : (
            <div className="space-y-2 border border-gray-300 rounded-lg p-4">
              {lawsuitTypes.map(type => (
                <div key={type.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`type-${type.id}`}
                    checked={(formData.lawsuit_type_ids || []).includes(type.id)}
                    onChange={() => handleMultiSelectChange('lawsuit_type_ids', type.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor={`type-${type.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                    <div className="font-medium">{type.name}</div>
                    {type.description && <div className="text-gray-500 text-xs">{type.description}</div>}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legal Violations (Multi-select) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Violations/Claims (Select all that apply)
          </label>
          {loadingOptions ? (
            <div className="text-sm text-gray-500 py-2">Loading violations...</div>
          ) : violations.length === 0 ? (
            <div className="text-sm text-gray-500 py-2">No violations available.</div>
          ) : (
            <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {violations.map(violation => (
                <div key={violation.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`violation-${violation.id}`}
                    checked={(formData.violation_ids || []).includes(violation.id)}
                    onChange={() => handleMultiSelectChange('violation_ids', violation.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor={`violation-${violation.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                    <div className="font-medium">{violation.name}</div>
                    {violation.description && <div className="text-gray-500 text-xs">{violation.description}</div>}
                    {violation.law_section && (
                      <div className="text-blue-600 text-xs font-mono">{violation.law_section}</div>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outcome Stage & Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Outcome/Stage
            </label>
            {loadingOptions ? (
              <div className="text-sm text-gray-500 py-2">Loading stages...</div>
            ) : (
              <select
                name="outcome_stage_id"
                value={formData.outcome_stage_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Stage</option>
                {outcomeStages.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name} {stage.description && `- ${stage.description}`}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Filed <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_filed"
              value={formData.date_filed}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Topic */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="Brief subject of the lawsuit"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Brief Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Brief Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="brief_description"
            value={formData.brief_description}
            onChange={handleChange}
            rows="2"
            placeholder="Short description for list view"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Full Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="6"
            placeholder="Detailed description of the lawsuit"
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Outcome Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outcome/Status Notes
          </label>
          <textarea
            name="outcome_notes"
            value={formData.outcome_notes}
            onChange={handleChange}
            rows="3"
            placeholder="Additional details about the current stage or outcome..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-1">Provide additional context about the current stage or outcome</p>
        </div>

        {/* Filed Documents */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filed Documents
          </label>
          <div className="space-y-2">
            {formData.filed_documents.map((doc, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={doc}
                  readOnly
                  className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => handleDocumentRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDocumentAdd}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Upload size={18} />
            Add Document URL
          </button>
        </div>

        {/* Public Docket Link */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public Docket Link
          </label>
          <input
            type="url"
            name="public_docket_link"
            value={formData.public_docket_link}
            onChange={handleChange}
            placeholder="https://..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Related Company */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Company
          </label>
          <input
            type="text"
            name="related_company"
            value={formData.related_company}
            onChange={handleChange}
            placeholder="e.g., Transunion, Experian"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Press Coverage Links */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Press Coverage Links
          </label>
          <div className="space-y-2">
            {(formData.press_coverage || []).map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => handlePressCoverageRemove(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handlePressCoverageAdd}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Upload size={18} />
            Add Press Coverage URL
          </button>
          <p className="text-xs text-gray-500 mt-1">Add links to news articles or press coverage about this lawsuit</p>
        </div>

        {/* Related Press Release */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Press Release
          </label>
          {loadingPressReleases ? (
            <div className="text-sm text-gray-500 py-2">Loading press releases...</div>
          ) : (
            <>
              <select
                name="related_press_release_id"
                value={formData.related_press_release_id || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- No press release linked --</option>
                {pressReleases.map(pr => (
                  <option key={pr.id} value={pr.id}>
                    {pr.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Link an existing press release or create a new one below</p>
              
              {/* Create New Press Release Button */}
              <button
                type="button"
                onClick={() => setShowPressReleaseForm(!showPressReleaseForm)}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
              >
                {showPressReleaseForm ? '− Hide' : '+ Create New Press Release'}
              </button>
            </>
          )}
        </div>

        {/* Dynamic Press Release Creation Form */}
        {showPressReleaseForm && (
          <div className="mb-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Press Release</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Press Release Title *
                </label>
                <input
                  type="text"
                  value={newPressRelease.title}
                  onChange={(e) => setNewPressRelease({...newPressRelease, title: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Credlocity Wins Major Victory in Credit Bureau Lawsuit"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Summary *
                </label>
                <textarea
                  value={newPressRelease.summary}
                  onChange={(e) => setNewPressRelease({...newPressRelease, summary: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief summary of the press release (1-2 sentences)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Content *
                </label>
                <textarea
                  value={newPressRelease.content}
                  onChange={(e) => setNewPressRelease({...newPressRelease, content: e.target.value})}
                  rows={8}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Full press release content..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Publish Date
                  </label>
                  <input
                    type="date"
                    value={newPressRelease.publish_date}
                    onChange={(e) => setNewPressRelease({...newPressRelease, publish_date: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={newPressRelease.contact_email}
                    onChange={(e) => setNewPressRelease({...newPressRelease, contact_email: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="press@credlocity.com"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreatePressRelease}
                disabled={creatingPressRelease}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {creatingPressRelease ? 'Creating Press Release...' : 'Create & Link Press Release'}
              </button>
            </div>
          </div>
        )}

        {/* Related Blog Posts */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Related Blog Posts (Select all that apply)
          </label>
          {loadingBlogPosts ? (
            <div className="text-sm text-gray-500 py-2">Loading blog posts...</div>
          ) : blogPosts.length === 0 ? (
            <div className="text-sm text-gray-500 py-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              No blog posts available. <a href="/admin/blog/create" className="text-blue-600 hover:underline">Create one here</a>
            </div>
          ) : (
            <div className="space-y-2 border border-gray-300 rounded-lg p-4 max-h-64 overflow-y-auto">
              {blogPosts.map(post => (
                <div key={post.id} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id={`blog-${post.id}`}
                    checked={(formData.related_blog_posts || []).includes(post.id)}
                    onChange={() => handleMultiSelectChange('related_blog_posts', post.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                  />
                  <label htmlFor={`blog-${post.id}`} className="text-sm text-gray-700 cursor-pointer flex-1">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-gray-500 text-xs">Published: {new Date(post.created_at).toLocaleDateString()}</div>
                  </label>
                </div>
              ))}
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Selected blog posts will display in the related content section on the lawsuit detail page.
          </p>
        </div>

        {/* Case Summary HTML */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Case Summary (Rich Text/HTML)
          </label>
          <textarea
            name="case_summary_html"
            value={formData.case_summary_html || ''}
            onChange={handleChange}
            rows="6"
            placeholder="Enter detailed case summary. HTML formatting supported."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Detailed case summary with background and legal claims. HTML tags supported.</p>
        </div>

        {/* Outcome HTML */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Outcome (Rich Text/HTML)
          </label>
          <textarea
            name="outcome_html"
            value={formData.outcome_html || ''}
            onChange={handleChange}
            rows="4"
            placeholder="Enter case outcome or current status. HTML formatting supported."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Case outcome or current status. HTML tags supported.</p>
        </div>

        {/* Featured Image */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Image className="inline w-4 h-4 mr-2" />
            Featured Image
          </label>
          <ImageUpload
            value={formData.featured_image_url}
            onChange={(url) => setFormData({ ...formData, featured_image_url: url })}
            label="Upload or enter image URL"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image Alt Text</label>
          <input
            type="text"
            name="featured_image_alt"
            value={formData.featured_image_alt || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descriptive alt text for accessibility and SEO"
          />
        </div>

        {/* Schema Selector */}
        <div className="mb-4">
          <SchemaSelector
            value={formData.schema_types}
            onChange={(schemas) => setFormData({ ...formData, schema_types: schemas })}
            contentType="lawsuit"
          />
        </div>

        {/* Custom Schema Data JSON (Advanced) */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Schema.org JSON Data (Advanced)
          </label>
          <textarea
            name="schema_data"
            value={typeof formData.schema_data === 'string' ? formData.schema_data : JSON.stringify(formData.schema_data || {}, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData({ ...formData, schema_data: parsed });
              } catch {
                // Allow invalid JSON while typing
                setFormData({ ...formData, schema_data: e.target.value });
              }
            }}
            rows="6"
            placeholder='{"@type": "LegalService", "description": "..."}'
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Optional: Add custom structured data. Must be valid JSON.</p>
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">SEO Settings</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              placeholder="Leave empty to auto-generate"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Meta Description
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              rows="2"
              placeholder="Leave empty to auto-generate"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Active Status */}
        <div className="mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Active (show on website)
            </span>
          </label>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            <Save size={18} />
            {loading ? 'Saving...' : (isEditing ? 'Update Lawsuit' : 'Create Lawsuit')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/lawsuits')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default LawsuitForm;
