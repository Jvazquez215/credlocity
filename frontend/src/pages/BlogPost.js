import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [topicRelatedPosts, setTopicRelatedPosts] = useState([]);
  const [relatedPressReleases, setRelatedPressReleases] = useState([]);
  const [relatedLawsuits, setRelatedLawsuits] = useState([]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate comprehensive Schema.org structured data
  const generateSchemas = (post) => {
    const schemas = post.schemas || {};
    const baseUrl = "https://credlocity.com";
    const settings = siteSettings || {};
    
    // Don't generate if disabled
    if (schemas.auto_generate === false) {
      // Return custom schema if provided
      if (schemas.custom_schema) {
        try {
          return JSON.parse(schemas.custom_schema);
        } catch (e) {
          return null;
        }
      }
      return null;
    }
    
    const allSchemas = [];
    
    // Article Schema (always included if auto-generate is on)
    const articleType = schemas.article_type || (post.is_news ? "NewsArticle" : "BlogPosting");
    const articleSchema = {
      "@context": "https://schema.org",
      "@type": articleType,
      "headline": post.title,
      "description": post.excerpt || post.seo?.meta_description || "",
      "url": `${baseUrl}/blog/${post.slug}`,
      "datePublished": post.publish_date || post.created_at,
      "dateModified": post.updated_at,
      "image": post.featured_image_url || `${baseUrl}/logo.png`,
      "publisher": {
        "@type": "Organization",
        "name": settings.organization_name || "Credlocity",
        "url": baseUrl,
        "logo": {
          "@type": "ImageObject",
          "url": settings.organization_logo || settings.logo_url || `${baseUrl}/logo.png`
        },
        ...(settings.organization_phone && { "telephone": settings.organization_phone }),
        ...(settings.organization_email && { "email": settings.organization_email }),
        ...(settings.organization_address && {
          "address": {
            "@type": "PostalAddress",
            "streetAddress": settings.organization_address.street || "",
            "addressLocality": settings.organization_address.city || "",
            "addressRegion": settings.organization_address.state || "",
            "postalCode": settings.organization_address.zip || "",
            "addressCountry": "US"
          }
        }),
        ...(settings.social_profiles && Object.values(settings.social_profiles).filter(Boolean).length > 0 && {
          "sameAs": Object.values(settings.social_profiles).filter(Boolean)
        })
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${baseUrl}/blog/${post.slug}`
      }
    };
    
    // Add author if enabled
    if (schemas.include_author !== false && post.author_name) {
      articleSchema.author = {
        "@type": "Person",
        "name": post.author_name,
        "url": `${baseUrl}/team/${post.author_slug}`,
        ...(post.author_title && { "jobTitle": post.author_title }),
        ...(post.author_photo_url && { 
          "image": {
            "@type": "ImageObject",
            "url": post.author_photo_url
          }
        }),
        ...(post.author_bio && { "description": post.author_bio }),
        ...(post.author_experience && { "yearsExperience": post.author_experience }),
        "worksFor": {
          "@type": "Organization",
          "name": settings.organization_name || "Credlocity",
          "url": baseUrl
        }
      };
      
      if (post.author_credentials && post.author_credentials.length > 0) {
        articleSchema.author.award = post.author_credentials;
      }
    }
    
    // Add keywords
    if (post.seo?.keywords) {
      articleSchema.keywords = post.seo.keywords;
    }
    
    // Add corrections if present
    if (post.updates && post.updates.length > 0) {
      const criticalUpdates = post.updates.filter(u => u.type === 'critical_update');
      if (criticalUpdates.length > 0) {
        articleSchema.correction = criticalUpdates.map(u => ({
          "@type": "CorrectionComment",
          "text": u.explanation,
          "datePublished": u.date
        }));
      }
    }
    
    allSchemas.push(articleSchema);
    
    // Breadcrumb Schema
    if (schemas.include_breadcrumb !== false) {
      allSchemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": baseUrl
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Blog",
            "item": `${baseUrl}/blog`
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": post.title,
            "item": `${baseUrl}/blog/${post.slug}`
          }
        ]
      });
    }
    
    // Custom schema if provided
    if (schemas.custom_schema) {
      try {
        const customSchema = JSON.parse(schemas.custom_schema);
        allSchemas.push(customSchema);
      } catch (e) {
        console.error('Invalid custom schema JSON');
      }
    }
    
    return allSchemas;
  };

  useEffect(() => {
    fetchPost();
    fetchSiteSettings();
  }, [slug]);

  const fetchSiteSettings = async () => {
    try {
      const response = await api.get('/site-settings');
      setSiteSettings(response.data);
    } catch (err) {
      console.error('Error fetching site settings:', err);
    }
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/blog/posts/slug/${slug}`);
      setPost(response.data);
      
      // Fetch manually selected related posts details
      if (response.data.related_posts && response.data.related_posts.length > 0) {
        fetchRelatedPostsDetails(response.data.related_posts);
      } else if (response.data.categories && response.data.categories.length > 0) {
        // Fallback to category-based if no manual selection
        fetchRelatedPosts(response.data.categories[0]);
      }
      
      // Fetch topic-related posts (auto cross-linking)
      fetchTopicRelatedPosts(response.data);

      if (response.data.related_press_releases && response.data.related_press_releases.length > 0) {
        fetchRelatedPressReleases(response.data.related_press_releases);
      }

      if (response.data.related_lawsuits && response.data.related_lawsuits.length > 0) {
        fetchRelatedLawsuits(response.data.related_lawsuits);
      }
    } catch (err) {
      console.error('Error fetching post:', err);
      setError('Blog post not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPostsDetails = async (postIds) => {
    try {
      // Fetch all published posts
      const response = await api.get('/blog/posts?status=published');
      // Filter to only the ones in our related_posts array
      const related = response.data.filter(p => postIds.includes(p.id));
      setRelatedPosts(related);
    } catch (err) {
      console.error('Error fetching related posts details:', err);
    }
  };

  const fetchRelatedPosts = async (categoryId) => {
    try {
      const response = await api.get(`/blog/posts?category=${categoryId}&limit=3`);
      setRelatedPosts((response.data || []).filter(p => p.slug !== slug).slice(0, 3));
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const fetchTopicRelatedPosts = async (currentPost) => {
    try {
      // Fetch posts that have related_topics matching this post's categories
      // OR posts that are in the same topics as this post's related_topics
      const allPosts = await api.get('/blog/posts?status=published');
      const posts = allPosts.data;
      
      const topicRelated = posts.filter(p => {
        if (p.slug === slug) return false; // Exclude current post
        
        // Check if other posts have this post's categories in their related_topics
        const postCategories = currentPost.categories || [];
        const otherPostRelatedTopics = p.related_topics || [];
        const hasMatchingTopic = postCategories.some(cat => otherPostRelatedTopics.includes(cat));
        
        if (hasMatchingTopic) return true;
        
        // Check if this post has related_topics that match other post's categories
        const currentRelatedTopics = currentPost.related_topics || [];
        const otherPostCategories = p.categories || [];
        const hasReverseMatch = currentRelatedTopics.some(topic => otherPostCategories.includes(topic));
        
        return hasReverseMatch;
      });
      
      setTopicRelatedPosts(topicRelated.slice(0, 6)); // Limit to 6
    } catch (err) {
      console.error('Error fetching topic related posts:', err);
    }
  };

  const fetchRelatedPressReleases = async (pressReleaseIds) => {
    try {
      // Fetch all press releases
      const response = await api.get('/press-releases');
      // Filter to only the ones in our related_press_releases array
      const related = response.data.filter(pr => pressReleaseIds.includes(pr.id));
      setRelatedPressReleases(related);
    } catch (err) {
      console.error('Error fetching related press releases:', err);
    }
  };

  const fetchRelatedLawsuits = async (lawsuitIds) => {
    try {
      // Fetch all lawsuits
      const response = await api.get('/lawsuits');
      // Filter to only the ones in our related_lawsuits array
      const related = response.data.filter(lawsuit => lawsuitIds.includes(lawsuit.id));
      setRelatedLawsuits(related);
    } catch (err) {
      console.error('Error fetching related lawsuits:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
            <p className="text-gray-600 mt-4">Loading article...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/blog" className="inline-block bg-primary-blue text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const seoTitle = post.seo?.meta_title || post.title;
  const seoDescription = post.seo?.meta_description || post.excerpt || stripHtml(post.content).substring(0, 160);
  const ogImage = post.seo?.og_image || post.featured_image_url || 'https://credlocity.com/default-og-image.jpg';

  return (
    <>
      <Helmet>
        {/* Basic SEO */}
        <title>{seoTitle} | Credlocity</title>
        <meta name="description" content={seoDescription} />
        {post.seo?.keywords && <meta name="keywords" content={post.seo.keywords} />}
        <link rel="canonical" href={post.seo?.canonical_url || `https://credlocity.com/blog/${post.slug}`} />
        {post.seo?.robots && <meta name="robots" content={post.seo.robots} />}
        
        {/* Open Graph */}
        <meta property="og:title" content={post.seo?.og_title || seoTitle} />
        <meta property="og:description" content={post.seo?.og_description || seoDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://credlocity.com/blog/${post.slug}`} />
        <meta property="og:image" content={ogImage} />
        <meta property="article:published_time" content={post.publish_date} />
        <meta property="article:author" content={post.author_name} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo?.og_title || seoTitle} />
        <meta name="twitter:description" content={post.seo?.og_description || seoDescription} />
        <meta name="twitter:image" content={ogImage} />
        
        {/* Schema.org Structured Data */}
        {(() => {
          const schemas = generateSchemas(post);
          if (!schemas) return null;
          
          return (
            <script type="application/ld+json">
              {JSON.stringify(schemas, null, 2)}
            </script>
          );
        })()}
      </Helmet>

      <Header />

      <article className="bg-gray-50">
        {/* Breadcrumbs */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-600">
              <Link to="/" className="hover:text-primary-blue">Home</Link>
              <span>/</span>
              <Link to="/blog" className="hover:text-primary-blue">Blog</Link>
              <span>/</span>
              <span className="text-gray-900">{post.title}</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Article Header */}
            <header className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h1 className="font-cinzel text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {post.title}
              </h1>
              
              <div className="flex items-center justify-between text-gray-600 mb-6">
                <div className="flex items-center space-x-4">
                  <Link to={`/team/${post.author_slug}`} className="font-medium hover:text-blue-600 transition">
                    {post.author_name}
                  </Link>
                  <span>•</span>
                  <time>{formatDate(post.publish_date || post.created_at)}</time>
                  {post.view_count > 0 && (
                    <>
                      <span>•</span>
                      <span>{post.view_count} views</span>
                    </>
                  )}
                </div>
              </div>

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.featured_image_alt || post.title}
                    className="w-full h-auto"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </header>

            {/* Updates & Corrections */}
            {post.updates && post.updates.length > 0 && (
              <div className="mb-8 space-y-4">
                {post.updates.map((update) => {
                  const isCritical = update.type === 'critical_update';
                  const highlightStyle = update.highlight_enabled ? {
                    ...(update.highlight_style === 'background' 
                      ? { backgroundColor: update.highlight_color } 
                      : { 
                          border: `3px solid ${update.highlight_color}`,
                          borderLeft: `6px solid ${update.highlight_color}`
                        })
                  } : {};

                  return (
                    <div
                      key={update.id}
                      className={`rounded-xl shadow-lg p-6 ${
                        isCritical ? 'bg-red-50' : 'bg-blue-50'
                      }`}
                      style={highlightStyle}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCritical ? 'bg-red-600' : 'bg-blue-600'
                          }`}>
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {isCritical ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              )}
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              isCritical 
                                ? 'bg-red-600 text-white' 
                                : 'bg-blue-600 text-white'
                            }`}>
                              {isCritical ? '🚨 Critical Update' : '📝 Update'}
                            </span>
                            <span className="text-sm text-gray-600 font-medium">
                              {new Date(update.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          <p className="text-lg font-semibold text-gray-900 mb-2">
                            {update.explanation}
                          </p>
                          {update.content && (
                            <p className="text-gray-700 leading-relaxed">
                              {update.content}
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-3">
                            Updated by {update.author}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Article Content */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:font-cinzel prose-headings:text-primary-blue
                  prose-p:text-gray-700 prose-p:leading-relaxed
                  prose-a:text-primary-blue prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-gray-900
                  prose-ul:list-disc prose-ol:list-decimal
                  prose-img:rounded-lg prose-img:shadow-md"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>

            {/* Author Bio Card - E-E-A-T Optimization */}
            <div className="bg-gray-50 rounded-xl shadow-lg p-6 mb-8 border-l-4 border-blue-600">
              <h3 className="font-cinzel text-xl font-bold text-gray-900 mb-4">About the Author</h3>
              <div className="flex items-start gap-4">
                {post.author_photo_url ? (
                  <Link to={`/team/${post.author_slug}`}>
                    <img 
                      src={post.author_photo_url} 
                      alt={post.author_name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md flex-shrink-0"
                    />
                  </Link>
                ) : (
                  <Link to={`/team/${post.author_slug}`}>
                    <div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-3xl text-gray-600 font-bold border-4 border-white shadow-md">
                      {post.author_name?.charAt(0)}
                    </div>
                  </Link>
                )}
                
                <div className="flex-1">
                  <Link to={`/team/${post.author_slug}`} className="hover:text-blue-600 transition">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{post.author_name}</h4>
                  </Link>
                  {post.author_title && (
                    <p className="text-gray-600 font-semibold mb-2">{post.author_title}</p>
                  )}
                  
                  {/* CREDENTIALS - Critical for E-E-A-T SEO */}
                  {post.author_credentials && post.author_credentials.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-semibold text-blue-600 mb-1">Credentials:</p>
                      <p className="text-sm text-gray-700">
                        {post.author_credentials.join(', ')}
                      </p>
                    </div>
                  )}
                  
                  {/* EXPERIENCE - Critical for E-E-A-T SEO */}
                  {post.author_experience && post.author_experience > 0 && (
                    <p className="text-sm text-gray-700 mb-3">
                      <span className="font-semibold text-gray-900">Experience:</span> {post.author_experience}+ Years in Credit Repair
                    </p>
                  )}
                  
                  {/* EDUCATION - Critical for E-E-A-T SEO */}
                  {post.author_education && post.author_education.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-1">Education:</p>
                      <div className="space-y-1">
                        {post.author_education.map((edu, index) => (
                          <p key={index} className="text-sm text-gray-700">
                            🎓 {edu.degree} - {edu.institution} {edu.year && `(${edu.year})`}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* PUBLICATIONS/MEDIA FEATURES - Critical for E-E-A-T SEO */}
                  {post.author_publications && post.author_publications.length > 0 && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-900 mb-2">As Featured In:</p>
                      <div className="flex flex-wrap gap-2">
                        {post.author_publications.map((pub, index) => (
                          <a 
                            key={index}
                            href={pub.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 px-3 py-1 rounded-full transition"
                            title={pub.title}
                          >
                            <span className="text-blue-600">📰</span>
                            <span className="font-medium">{pub.publication}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Link 
                    to={`/team/${post.author_slug}`}
                    className="inline-block text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition font-semibold mt-2"
                  >
                    View Full Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="font-cinzel text-lg font-bold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm hover:bg-gray-200 transition"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Disclosures Section */}
            {post.disclosures && Object.values(post.disclosures).some(v => v === true || (typeof v === 'string' && v.length > 0)) && (
              <div className="bg-gray-50 rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden mb-8">
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-4">
                  <h3 className="font-cinzel text-xl font-bold text-white">Important Disclosures & Legal Notices</h3>
                </div>
                <div className="p-6 space-y-6">
                  {/* YMYL Disclosure */}
                  {post.disclosures.ymyl_enabled && post.disclosures.ymyl_content && (
                    <div className="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
                      <h4 className="font-bold text-lg text-yellow-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Your Money or Your Life (YMYL) Content Notice
                      </h4>
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {post.disclosures.ymyl_content}
                      </div>
                    </div>
                  )}

                  {/* General Disclosure */}
                  {post.disclosures.general_disclosure_enabled && post.disclosures.general_disclosure_content && (
                    <div className="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
                      <h4 className="font-bold text-lg text-blue-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">ℹ️</span>
                        {post.disclosures.general_disclosure_type === 'affiliate' && 'Affiliate Disclosure'}
                        {post.disclosures.general_disclosure_type === 'sponsored' && 'Sponsored Content Disclosure'}
                        {post.disclosures.general_disclosure_type === 'partnership' && 'Partnership Disclosure'}
                        {post.disclosures.general_disclosure_type === 'other' && 'Disclosure'}
                      </h4>
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {post.disclosures.general_disclosure_content}
                      </div>
                    </div>
                  )}

                  {/* Competitor Disclosure */}
                  {post.disclosures.competitor_disclosure_enabled && post.disclosures.competitor_disclosure_content && (
                    <div className="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg">
                      <h4 className="font-bold text-lg text-purple-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🏢</span>
                        Competitive Relationship Disclosure
                      </h4>
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {post.disclosures.competitor_disclosure_content}
                      </div>
                    </div>
                  )}

                  {/* Corrections & Accountability */}
                  {post.disclosures.corrections_enabled && post.disclosures.corrections_content && (
                    <div className="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
                      <h4 className="font-bold text-lg text-green-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">✅</span>
                        Corrections & Accountability Policy
                      </h4>
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {post.disclosures.corrections_content}
                      </div>
                    </div>
                  )}

                  {/* Pseudonym / Confidential Sources */}
                  {post.disclosures.pseudonym_enabled && (
                    <div className="border-l-4 border-orange-500 bg-orange-50 p-6 rounded-r-lg">
                      <h4 className="font-bold text-lg text-orange-900 mb-3 flex items-center gap-2">
                        <span className="text-2xl">🔒</span>
                        Source Protection Notice
                      </h4>
                      <div className="text-gray-800 whitespace-pre-line leading-relaxed">
                        {post.disclosures.pseudonym_content || (
                          <>
                            <p className="font-semibold mb-2">Some names in this article have been changed to protect the privacy of individuals involved.</p>
                            {post.disclosures.pseudonym_reason === 'nature_of_info' && (
                              <p>Names have been protected due to the sensitive nature of the information being provided.</p>
                            )}
                            {post.disclosures.pseudonym_reason === 'speak_freely' && (
                              <p>Names have been redacted to allow sources to speak freely without fear of retaliation.</p>
                            )}
                            {post.disclosures.pseudonym_reason === 'privacy' && (
                              <p>Names have been changed to protect the privacy of individuals involved in this matter.</p>
                            )}
                            {post.disclosures.pseudonym_reason === 'retaliation' && (
                              <p>Sources are protected to prevent workplace or personal retaliation.</p>
                            )}
                            {post.disclosures.pseudonym_reason === 'other' && (
                              <p>Names have been changed to protect sources while maintaining factual accuracy.</p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Legal Footer */}
                  <div className="text-xs text-gray-600 border-t border-gray-300 pt-4 mt-4">
                    <p className="font-semibold mb-2">Legal Notice</p>
                    <p>Last Updated: {new Date(post.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="mt-2">© {new Date().getFullYear()} Credlocity Business Group, LLC. All Rights Reserved.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Related Content Section */}
            {((post.related_posts && post.related_posts.length > 0) || 
              (topicRelatedPosts && topicRelatedPosts.length > 0) || 
              (post.related_pages && post.related_pages.length > 0) ||
              (relatedPressReleases && relatedPressReleases.length > 0) ||
              (relatedLawsuits && relatedLawsuits.length > 0)) && (
              <div className="mb-8">
                <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-6 text-center">
                  Related Content
                </h3>

                {/* Manual Related Posts */}
                {post.related_posts && post.related_posts.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <span>📚</span> Recommended Reading
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {post.related_posts.map((postId, index) => {
                        const relatedPost = relatedPosts.find(p => p.id === postId);
                        if (!relatedPost) return null;
                        return (
                          <Link
                            key={postId}
                            to={`/blog/${relatedPost.slug}`}
                            className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                          >
                            {relatedPost.featured_image_url && (
                              <div className="h-48 overflow-hidden">
                                <img
                                  src={relatedPost.featured_image_url}
                                  alt={relatedPost.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                            )}
                            <div className="p-4">
                              <h5 className="font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-2 mb-2">
                                {relatedPost.title}
                              </h5>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {relatedPost.excerpt}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Topic Related Posts (Auto Cross-Linking) */}
                {topicRelatedPosts && topicRelatedPosts.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <span>🔗</span> Related Topics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {topicRelatedPosts.map((topicPost) => (
                        <Link
                          key={topicPost.id}
                          to={`/blog/${topicPost.slug}`}
                          className="flex gap-3 bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 hover:border-purple-300 transition"
                        >
                          {topicPost.featured_image_url && (
                            <img
                              src={topicPost.featured_image_url}
                              alt={topicPost.title}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                              {topicPost.title}
                            </h5>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {topicPost.excerpt}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Pages */}
                {post.related_pages && post.related_pages.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <span>🔖</span> Additional Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {post.related_pages.map((page, index) => (
                        <a
                          key={index}
                          href={page.url}
                          className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 hover:border-green-300 transition group"
                        >
                          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-700 transition">
                            <span className="text-white text-xl">→</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {page.title}
                            </h5>
                            {page.description && (
                              <p className="text-sm text-gray-600">
                                {page.description}
                              </p>
                            )}
                            <p className="text-xs text-green-600 mt-1">{page.url}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Press Releases */}
                {relatedPressReleases && relatedPressReleases.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <span>📰</span> Related Press Releases
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedPressReleases.map((pressRelease) => (
                        <Link
                          key={pressRelease.id}
                          to={`/press-releases/${pressRelease.slug}`}
                          className="group bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 hover:shadow-xl hover:border-blue-400 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-blue-700 transition">
                              <span className="text-white text-3xl">📰</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Press Release</p>
                              <h5 className="font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
                                {pressRelease.title}
                              </h5>
                              {pressRelease.excerpt && (
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                  {pressRelease.excerpt}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {new Date(pressRelease.publish_date).toLocaleDateString()}
                                </span>
                                <span className="text-sm text-blue-600 font-semibold group-hover:underline">
                                  Read More →
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Lawsuits */}
                {relatedLawsuits && relatedLawsuits.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
                      <span>⚖️</span> Related Lawsuits Filed
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {relatedLawsuits.map((lawsuit) => (
                        <Link
                          key={lawsuit.id}
                          to={`/lawsuits/${lawsuit.slug}`}
                          className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-6 hover:shadow-xl hover:border-amber-500 transition-all duration-300"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 bg-amber-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-amber-700 transition">
                              <span className="text-white text-3xl">⚖️</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-xs text-amber-700 font-semibold mb-1 uppercase tracking-wide">Lawsuit</p>
                              <h5 className="font-bold text-gray-900 group-hover:text-amber-700 transition mb-2 line-clamp-2">
                                {lawsuit.title}
                              </h5>
                              {lawsuit.brief_description && (
                                <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                                  {lawsuit.brief_description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  Case #{lawsuit.case_number}
                                </span>
                                <span className="text-sm text-amber-700 font-semibold group-hover:underline">
                                  Read the Lawsuit →
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Social Share */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h3 className="font-cinzel text-lg font-bold text-gray-900 mb-4">Share This Article</h3>
              <div className="flex space-x-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://credlocity.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-400 text-white px-6 py-2 rounded-lg hover:bg-blue-500 transition"
                >
                  Twitter
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://credlocity.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Facebook
                </a>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://credlocity.com/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-800 text-white px-6 py-2 rounded-lg hover:bg-blue-900 transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-primary-blue to-blue-700 rounded-xl shadow-lg p-8 text-white text-center mb-8">
              <h3 className="font-cinzel text-2xl font-bold mb-4">Ready to Improve Your Credit?</h3>
              <p className="text-blue-100 mb-6">
                Get professional credit repair assistance from our team of experts
              </p>
              <Link
                to="/pricing"
                className="inline-block bg-white text-primary-blue px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                View Our Plans
              </Link>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div>
                <h3 className="font-cinzel text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <article key={relatedPost.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
                      {relatedPost.featured_image_url && (
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="w-full h-40 object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="p-4">
                        <h4 className="font-cinzel font-bold text-lg text-gray-900 mb-2 line-clamp-2">
                          <Link to={`/blog/${relatedPost.slug}`} className="hover:text-primary-blue transition">
                            {relatedPost.title}
                          </Link>
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                          {relatedPost.excerpt || stripHtml(relatedPost.content).substring(0, 100) + '...'}
                        </p>
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="text-primary-blue text-sm font-medium hover:underline"
                        >
                          Read More →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>

      <Footer />
    </>
  );
};

export default BlogPost;
