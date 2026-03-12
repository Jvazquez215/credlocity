import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Scale, FileText, ExternalLink, Calendar, Tag } from 'lucide-react';

const LawsuitDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [lawsuit, setLawsuit] = useState(null);
  const [relatedPressReleases, setRelatedPressReleases] = useState([]);
  const [relatedBlogPosts, setRelatedBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Structured data options
  const [partyRoles, setPartyRoles] = useState([]);
  const [lawsuitCategories, setLawsuitCategories] = useState([]);
  const [lawsuitTypes, setLawsuitTypes] = useState([]);
  const [violations, setViolations] = useState([]);
  const [outcomeStages, setOutcomeStages] = useState([]);

  useEffect(() => {
    fetchLawsuit();
    fetchStructuredDataOptions();
  }, [slug]);

  const fetchStructuredDataOptions = async () => {
    try {
      const [partyRolesRes, categoriesRes, typesRes, violationsRes, stagesRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuit-metadata/party-roles`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuit-metadata/categories`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuit-metadata/types`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuit-metadata/violations`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuit-metadata/outcome-stages`)
      ]);

      if (partyRolesRes.ok) setPartyRoles(await partyRolesRes.json());
      if (categoriesRes.ok) setLawsuitCategories(await categoriesRes.json());
      if (typesRes.ok) setLawsuitTypes(await typesRes.json());
      if (violationsRes.ok) setViolations(await violationsRes.json());
      if (stagesRes.ok) setOutcomeStages(await stagesRes.json());
    } catch (error) {
      console.error('Error fetching structured data options:', error);
    }
  };

  const fetchLawsuit = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuits/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setLawsuit(data);
        
        // Fetch related press releases and blog posts
        await fetchRelatedPressReleases(data);
        await fetchRelatedBlogPosts(data);
      } else {
        navigate('/lawsuits');
      }
    } catch (error) {
      console.error('Error fetching lawsuit:', error);
      navigate('/lawsuits');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedBlogPosts = async (lawsuit) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/blog/posts`);
      if (response.ok) {
        const allPosts = await response.json();
        const related = [];
        
        // Method 1: Blog posts that link to this lawsuit (in their related_lawsuits array)
        const linkedByPost = allPosts.filter(post => 
          post.related_lawsuits && post.related_lawsuits.includes(lawsuit.id)
        );
        related.push(...linkedByPost);
        
        // Method 2: Blog posts directly linked from this lawsuit (via related_blog_posts array)
        if (lawsuit.related_blog_posts && lawsuit.related_blog_posts.length > 0) {
          const directLinked = allPosts.filter(post => 
            lawsuit.related_blog_posts.includes(post.id)
          );
          // Add only if not already in the list
          directLinked.forEach(post => {
            if (!related.find(r => r.id === post.id)) {
              related.push(post);
            }
          });
        }
        
        setRelatedBlogPosts(related);
      }
    } catch (error) {
      console.error('Error fetching related blog posts:', error);
    }
  };

  const fetchRelatedPressReleases = async (lawsuit) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/press-releases`);
      if (response.ok) {
        const allReleases = await response.json();
        const related = [];
        
        // Method 1: Press releases that link to this lawsuit (in their related_lawsuits array)
        const linkedByPR = allReleases.filter(release => 
          release.related_lawsuits && release.related_lawsuits.includes(lawsuit.id)
        );
        related.push(...linkedByPR);
        
        // Method 2: Press release directly linked from this lawsuit (via related_press_release_id)
        if (lawsuit.related_press_release_id) {
          const directLinked = allReleases.find(release => release.id === lawsuit.related_press_release_id);
          if (directLinked && !related.find(r => r.id === directLinked.id)) {
            related.push(directLinked);
          }
        }
        
        setRelatedPressReleases(related);
      }
    } catch (error) {
      console.error('Error fetching related press releases:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPartyRoleName = (id) => {
    const role = partyRoles.find(r => r.id === id);
    return role ? role.name : '';
  };

  const getCategoryName = (id) => {
    const category = lawsuitCategories.find(c => c.id === id);
    return category ? category.name : '';
  };

  const getTypeName = (id) => {
    const type = lawsuitTypes.find(t => t.id === id);
    return type ? type.name : '';
  };

  const getViolationName = (id) => {
    const violation = violations.find(v => v.id === id);
    return violation ? violation.name : '';
  };

  const getOutcomeStageName = (id) => {
    const stage = outcomeStages.find(s => s.id === id);
    return stage ? stage.name : '';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading lawsuit details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!lawsuit) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{lawsuit.meta_title || `${lawsuit.title} - Credlocity`}</title>
        <meta name="description" content={lawsuit.meta_description || lawsuit.brief_description} />
        {lawsuit.meta_keywords && lawsuit.meta_keywords.length > 0 && (
          <meta name="keywords" content={lawsuit.meta_keywords.join(', ')} />
        )}
        {lawsuit.schema_data && Object.keys(lawsuit.schema_data).length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify(lawsuit.schema_data)}
          </script>
        )}
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <button
            onClick={() => navigate('/lawsuits')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <ArrowLeft size={20} />
            Back to All Lawsuits
          </button>

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Scale className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {lawsuit.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {lawsuit.lawsuit_category_id && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {getCategoryName(lawsuit.lawsuit_category_id)}
                    </span>
                  )}
                  {lawsuit.party_role_id && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                      {getPartyRoleName(lawsuit.party_role_id)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-500">Case Number</span>
                  <p className="font-semibold text-gray-900">{lawsuit.case_number}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-500">Date Filed</span>
                  <p className="font-semibold text-gray-900">{formatDate(lawsuit.date_filed)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <span className="text-sm text-gray-500">Topic</span>
                  <p className="font-semibold text-gray-900">{lawsuit.topic}</p>
                </div>
              </div>
              {lawsuit.related_company && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-500 mt-1" />
                  <div>
                    <span className="text-sm text-gray-500">Related Company</span>
                    <p className="font-semibold text-gray-900">{lawsuit.related_company}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Case Description</h2>
              <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
                {lawsuit.description}
              </div>
            </div>

            {/* Lawsuit Types */}
            {lawsuit.lawsuit_type_ids && lawsuit.lawsuit_type_ids.length > 0 && (
              <div className="mb-8 p-6 bg-blue-50 border-l-4 border-blue-600 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-blue-600" />
                  Legal Claims
                </h2>
                <div className="flex flex-wrap gap-2">
                  {lawsuit.lawsuit_type_ids.map(typeId => (
                    <span key={typeId} className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                      {getTypeName(typeId)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Violations */}
            {lawsuit.violation_ids && lawsuit.violation_ids.length > 0 && (
              <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-600 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-red-600" />
                  Legal Violations Alleged
                </h2>
                <ul className="space-y-2">
                  {lawsuit.violation_ids.map(violationId => (
                    <li key={violationId} className="flex items-start gap-3">
                      <span className="w-2 h-2 bg-red-600 rounded-full mt-2"></span>
                      <span className="text-gray-700 font-medium">{getViolationName(violationId)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Case Outcome/Status */}
            {(lawsuit.outcome_stage_id || lawsuit.outcome_notes) && (
              <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-600 rounded-lg">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Scale className="w-6 h-6 text-green-600" />
                  Case Outcome / Current Status
                </h2>
                {lawsuit.outcome_stage_id && (
                  <div className="mb-3">
                    <span className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">
                      {getOutcomeStageName(lawsuit.outcome_stage_id)}
                    </span>
                  </div>
                )}
                {lawsuit.outcome_notes && (
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line mt-3">
                    {lawsuit.outcome_notes}
                  </p>
                )}
              </div>
            )}

            {/* Press Coverage */}
            {lawsuit.press_coverage && lawsuit.press_coverage.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                  Press Coverage
                </h2>
                <div className="space-y-3">
                  {lawsuit.press_coverage.map((link, index) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 hover:border-purple-300 transition group"
                    >
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-700 transition">
                        <ExternalLink className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-gray-900 block truncate">{link}</span>
                        <span className="text-xs text-gray-500">External News Coverage</span>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Filed Documents */}
            {lawsuit.filed_documents && lawsuit.filed_documents.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Filed Documents</h2>
                <div className="space-y-3">
                  {lawsuit.filed_documents.map((doc, index) => (
                    <a
                      key={index}
                      href={doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FileText className="w-5 h-5 text-blue-600" />
                      <span className="flex-1 font-medium text-gray-900">Document {index + 1}</span>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Public Docket Link */}
            {lawsuit.public_docket_link && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Public Docket</h2>
                <a
                  href={lawsuit.public_docket_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  View Public Docket
                  <ExternalLink size={18} />
                </a>
              </div>
            )}

            {/* Related Press Releases */}
            {relatedPressReleases.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Related Press Releases
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedPressReleases.map((release) => (
                    <div
                      key={release.id}
                      onClick={() => navigate(`/press-releases/${release.slug}`)}
                      className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition">
                          <span className="text-white text-3xl">📰</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Press Release</p>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                            {release.title}
                          </h3>
                          {release.excerpt && (
                            <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                              {release.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              {formatDate(release.publish_date)}
                            </span>
                            <span className="text-sm text-blue-600 font-semibold group-hover:underline">
                              Read More →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Blog Posts */}
            {relatedBlogPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <FileText className="w-6 h-6 text-green-600" />
                  Related Articles
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {relatedBlogPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                      className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 hover:shadow-xl hover:border-green-400 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {post.featured_image_url ? (
                          <img 
                            src={post.featured_image_url} 
                            alt={post.title}
                            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-700 transition">
                            <span className="text-white text-3xl">📝</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wide">Blog Article</p>
                          <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition mb-2 line-clamp-2">
                            {post.title}
                          </h3>
                          {post.excerpt && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                              {post.excerpt}
                            </p>
                          )}
                          <span className="text-sm text-green-600 font-semibold group-hover:underline">
                            Read Article →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Affected by Similar Issues?
                </h3>
                <p className="text-gray-700 mb-4">
                  If you've experienced similar credit reporting issues, Credlocity can help. Contact us for a free consultation.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Start Your Free Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LawsuitDetail;