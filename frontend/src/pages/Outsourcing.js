import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { 
  CheckCircle2, Users, Clock, Shield, TrendingUp, 
  Award, Target, Zap, BarChart3, Headphones, DollarSign,
  Star, Play, ArrowRight, Quote, Building2, UserCheck, ExternalLink
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

// Component for individual review card
const OutsourcingReviewCard = ({ review }) => {
  const [showVideo, setShowVideo] = useState(false);
  
  const getEmbedUrl = (url) => {
    if (!url) return '';
    // Convert YouTube watch URLs to embed URLs
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    return url;
  };

  // Generate slug for linking if not present
  const reviewSlug = review.slug || review.company_name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow group">
      {/* Video Section */}
      {(review.video_type === 'youtube' && review.youtube_embed_url) || (review.video_type === 'file' && review.video_file_url) ? (
        <div className="relative">
          {showVideo ? (
            <div className="aspect-video">
              {review.video_type === 'youtube' ? (
                <iframe
                  src={getEmbedUrl(review.youtube_embed_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={`Video review from ${review.company_name}`}
                />
              ) : (
                <video
                  src={review.video_file_url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ) : (
            <div 
              className="aspect-video bg-gradient-to-br from-primary-blue to-blue-800 flex items-center justify-center cursor-pointer group"
              onClick={() => setShowVideo(true)}
            >
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-white/30 transition-colors">
                  <Play className="w-10 h-10 text-white ml-1" />
                </div>
                <p className="font-semibold">Watch Video Review</p>
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="p-6">
        {/* Company Header */}
        <div className="flex items-center gap-4 mb-4">
          {review.company_logo_url ? (
            <img 
              src={review.company_logo_url} 
              alt={`${review.company_name} logo`}
              className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
            />
          ) : (
            <div className="w-16 h-16 bg-primary-blue/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-8 h-8 text-primary-blue" />
            </div>
          )}
          <div>
            <h3 className="font-cinzel font-bold text-lg text-gray-900">{review.company_name}</h3>
            {review.featured && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                <Star className="w-3 h-3 fill-amber-500" /> Featured Partner
              </span>
            )}
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative mb-6">
          <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary-blue/10" />
          <p className="text-gray-700 italic pl-4">"{review.testimonial_text}"</p>
        </div>

        {/* CEO Info */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {review.ceo_photo_url ? (
            <img 
              src={review.ceo_photo_url} 
              alt={review.ceo_name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-gray-500" />
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-900">{review.ceo_name}</p>
            <p className="text-sm text-gray-500">{review.ceo_title || 'CEO'}</p>
          </div>
        </div>

        {/* Switched From Badge */}
        {review.switched_from_another && review.previous_company_name && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-semibold text-green-800">
              🔄 Switched from {review.previous_company_name}
            </p>
            {review.why_they_switched && (
              <p className="text-sm text-green-700 mt-1">"{review.why_they_switched}"</p>
            )}
          </div>
        )}

        {/* Read Full Story Link */}
        <Link 
          to={`/outsourcing/reviews/${reviewSlug}`}
          className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gray-50 text-primary-blue font-semibold rounded-lg hover:bg-primary-blue hover:text-white transition-colors group-hover:bg-primary-blue group-hover:text-white"
        >
          Read Full Story <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

// Benefit Card Component
const BenefitCard = ({ icon: Icon, title, description }) => (
  <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border border-gray-100">
    <div className="w-14 h-14 bg-primary-blue/10 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-7 h-7 text-primary-blue" />
    </div>
    <h3 className="font-cinzel font-bold text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

// Process Step Component
const ProcessStep = ({ number, title, description }) => (
  <div className="flex gap-4">
    <div className="flex-shrink-0">
      <div className="w-10 h-10 bg-primary-blue text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
    </div>
    <div className="pb-8 border-l-2 border-primary-blue/20 pl-6 -ml-5">
      <h4 className="font-cinzel font-bold text-lg text-gray-900">{title}</h4>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>
  </div>
);

// Differentiator Component
const DifferentiatorCard = ({ icon: Icon, title, description, highlight }) => (
  <div className={`p-6 rounded-xl border-2 ${highlight ? 'bg-primary-blue text-white border-primary-blue' : 'bg-white border-gray-200'}`}>
    <Icon className={`w-10 h-10 mb-4 ${highlight ? 'text-white' : 'text-primary-blue'}`} />
    <h3 className={`font-cinzel font-bold text-xl mb-2 ${highlight ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
    <p className={highlight ? 'text-blue-100' : 'text-gray-600'}>{description}</p>
  </div>
);

const Outsourcing = () => {
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [formData, setFormData] = useState({
    company_name: '',
    contact_first_name: '',
    contact_last_name: '',
    contact_email: '',
    contact_phone: '',
    position: '',
    current_platform: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fetch outsourcing client reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await api.get('/outsource/client-reviews');
        setReviews(response.data);
      } catch (error) {
        console.error('Error fetching outsource reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };
    fetchReviews();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post('/api/outsource/inquiries', formData);
      setSubmitted(true);
      toast.success('Thank you! We\'ll contact you within 24 hours.');
      setFormData({
        company_name: '',
        contact_first_name: '',
        contact_last_name: '',
        contact_email: '',
        contact_phone: '',
        position: '',
        current_platform: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Credit Repair Outsourcing Services | White Label Disputes | Credlocity</title>
        <meta name="description" content="Professional credit repair outsourcing for CROs. We handle disputes on behalf of your clients. 16+ years experience, A+ BBB rated. Save time, scale faster. See real reviews from outsourcing partners." />
        <meta name="keywords" content="credit repair outsourcing, white label credit repair, dispute processing services, credit repair fulfillment, CRO outsourcing" />
        <link rel="canonical" href="https://www.credlocity.com/outsourcing" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Credit Repair Outsourcing Services | Credlocity" />
        <meta property="og:description" content="Professional dispute processing for credit repair organizations. 16+ years experience. Scale your business without hiring." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.credlocity.com/outsourcing" />
        
        {/* Schema Markup */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": "Credit Repair Outsourcing",
            "provider": {
              "@type": "Organization",
              "name": "Credlocity",
              "url": "https://www.credlocity.com",
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5",
                "reviewCount": reviews.length.toString()
              }
            },
            "areaServed": {
              "@type": "Country",
              "name": "United States"
            },
            "description": "Professional credit repair outsourcing services for credit repair organizations"
          })}
        </script>
      </Helmet>

      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-primary text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <span className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-semibold mb-6">
                🏆 A+ BBB Rated | 16+ Years Experience | 0 Complaints
              </span>
              <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-6">
                Credit Repair Outsourcing Services for Growing CROs
              </h1>
              <p className="text-xl md:text-2xl mb-4 text-gray-100">
                Professional Dispute Processing | White Label Services | Scale Your Business
              </p>
              <p className="text-lg mb-8 text-gray-200 max-w-3xl mx-auto">
                Let Credlocity handle the dispute processing while you focus on sales and client acquisition. 
                We've been doing credit repair since 2008 with a proven track record of results.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-12 py-6"
                  onClick={() => document.getElementById('inquiry-form').scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started Today
                </Button>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-primary-blue text-lg px-12 py-6"
                  onClick={() => document.getElementById('reviews-section').scrollIntoView({ behavior: 'smooth' })}
                >
                  See Partner Reviews
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Bar */}
        <section className="bg-white py-8 shadow-md">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary-blue">16+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-blue">79K+</div>
                <div className="text-gray-600">Clients Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-blue">A+</div>
                <div className="text-gray-600">BBB Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-blue">0</div>
                <div className="text-gray-600">BBB Complaints</div>
              </div>
            </div>
          </div>
        </section>

        {/* Why We're Different Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                Why We're Different From Other Outsourcers
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Not all outsourcing companies are created equal. Here's what sets Credlocity apart from the competition.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <DifferentiatorCard 
                icon={Award}
                title="16+ Years Experience"
                description="We've been in the credit repair industry since 2008. Most outsourcers started yesterday. Our experience means better results for your clients."
              />
              <DifferentiatorCard 
                icon={Shield}
                title="A+ BBB Rating"
                description="Zero complaints with the Better Business Bureau. Other outsourcers often have multiple complaints. We prioritize quality and compliance."
                highlight
              />
              <DifferentiatorCard 
                icon={Target}
                title="Metro2 Compliance Experts"
                description="Our team specializes in Metro2 data format compliance. We identify errors others miss, leading to higher deletion rates."
              />
              <DifferentiatorCard 
                icon={Users}
                title="Dedicated Account Managers"
                description="You get a dedicated point of contact, not a random support queue. We know your business and your clients."
              />
              <DifferentiatorCard 
                icon={BarChart3}
                title="Transparent Reporting"
                description="Real-time dashboards and detailed reports. No black boxes. You always know exactly what we're doing for your clients."
              />
              <DifferentiatorCard 
                icon={Zap}
                title="Fast Turnaround"
                description="48-hour dispute processing on average. Other outsourcers take weeks. Speed matters in credit repair."
                highlight
              />
            </div>
          </div>
        </section>

        {/* Why Outsource Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-center text-primary-blue mb-4">
              Why Outsource Your Credit Repair Disputes?
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
              Growing credit repair organizations face a common challenge: hiring, training, and managing dispute specialists 
              is expensive and time-consuming. Let us handle it.
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <BenefitCard 
                icon={DollarSign}
                title="Reduce Operating Costs"
                description="No hiring, training, or employee overhead. Pay only for work performed. Reduce costs by up to 60% compared to in-house staff."
              />
              <BenefitCard 
                icon={Clock}
                title="Save Time"
                description="Eliminate the time spent recruiting, training, and managing dispute specialists. Focus on growing your client base instead."
              />
              <BenefitCard 
                icon={TrendingUp}
                title="Scale Instantly"
                description="Handle 10 clients or 1000 clients with the same ease. We scale with your business without the growing pains."
              />
              <BenefitCard 
                icon={Shield}
                title="Expert Compliance"
                description="16+ years of FCRA, FDCPA, and FCBA expertise. We ensure every dispute is compliant and effective."
              />
              <BenefitCard 
                icon={Target}
                title="Better Results"
                description="Our specialized team uses advanced Metro2 compliance strategies that get results. Higher deletion rates for your clients."
              />
              <BenefitCard 
                icon={Headphones}
                title="Dedicated Support"
                description="Direct access to your account manager. Real-time updates and transparent communication throughout."
              />
            </div>
          </div>
        </section>

        {/* Partner Reviews Section */}
        <section id="reviews-section" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4">
                What Our Outsourcing Partners Say
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Don't just take our word for it. Hear from credit repair organizations who've partnered with Credlocity.
              </p>
            </div>

            {loadingReviews ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {reviews.map((review) => (
                  <OutsourcingReviewCard key={review.id} review={review} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl max-w-2xl mx-auto">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  Partner reviews coming soon! Be among the first to share your experience.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-center text-primary-blue mb-12">
              How Credlocity Outsourcing Works
            </h2>

            <div className="max-w-4xl mx-auto space-y-2">
              <ProcessStep 
                number={1}
                title="Submit Your Inquiry"
                description="Fill out our simple form below. Tell us about your CRO and current CRM platform."
              />
              <ProcessStep 
                number={2}
                title="Approval & Setup"
                description="We review your application within 24 hours. Once approved, we'll set up secure access to your CRM."
              />
              <ProcessStep 
                number={3}
                title="Integration"
                description="We integrate with your existing CRM (DisputeFox, Credit Repair Cloud, Credit Butterfly, and more)."
              />
              <ProcessStep 
                number={4}
                title="Start Processing"
                description="We begin processing disputes on behalf of your clients. You get regular updates and reports."
              />
              <ProcessStep 
                number={5}
                title="Track & Invoice"
                description="Access your partner portal to track work, view reports, and manage invoices. Simple, transparent pricing."
              />
            </div>
          </div>
        </section>

        {/* CRM Platforms We Support */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="font-cinzel text-3xl font-bold text-center text-primary-blue mb-8">
              CRM Platforms We Support
            </h2>
            <p className="text-center text-gray-600 mb-8">
              We work with all major credit repair CRM platforms
            </p>
            <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
              {['DisputeFox', 'Credit Repair Cloud', 'Credit Butterfly', 'Client Dispute Manager', 'Dispute Suite', 'And More...'].map((platform) => (
                <div key={platform} className="px-6 py-3 bg-white border-2 border-primary-blue rounded-lg font-semibold text-primary-blue shadow-sm">
                  {platform}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        <section id="inquiry-form" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-blue-50 border-2 border-primary-blue rounded-xl p-8 md:p-12">
                <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">
                  Partner With Credlocity Today
                </h2>
                <p className="text-center text-gray-700 mb-8">
                  Fill out the form below and we'll contact you within 24 hours to discuss how we can help grow your credit repair business.
                </p>

                {submitted ? (
                  <div className="bg-green-50 border-2 border-green-500 rounded-lg p-8 text-center">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
                    <p className="text-gray-700">
                      We've received your inquiry and will contact you within 24 hours to discuss next steps.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="company_name">Company Name *</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        required
                        placeholder="Your Credit Repair Company Name"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_first_name">First Name *</Label>
                        <Input
                          id="contact_first_name"
                          name="contact_first_name"
                          value={formData.contact_first_name}
                          onChange={handleChange}
                          required
                          placeholder="John"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_last_name">Last Name *</Label>
                        <Input
                          id="contact_last_name"
                          name="contact_last_name"
                          value={formData.contact_last_name}
                          onChange={handleChange}
                          required
                          placeholder="Doe"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_email">Email Address *</Label>
                        <Input
                          id="contact_email"
                          name="contact_email"
                          type="email"
                          value={formData.contact_email}
                          onChange={handleChange}
                          required
                          placeholder="john@yourcompany.com"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">Phone Number *</Label>
                        <Input
                          id="contact_phone"
                          name="contact_phone"
                          type="tel"
                          value={formData.contact_phone}
                          onChange={handleChange}
                          required
                          placeholder="(555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="position">Your Position *</Label>
                      <Input
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Owner, CEO, Operations Manager"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="current_platform">Current CRM Platform *</Label>
                      <select
                        id="current_platform"
                        name="current_platform"
                        value={formData.current_platform}
                        onChange={handleChange}
                        required
                        className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                      >
                        <option value="">Select your CRM...</option>
                        <option value="disputefox">DisputeFox</option>
                        <option value="credit-repair-cloud">Credit Repair Cloud</option>
                        <option value="credit-butterfly">Credit Butterfly</option>
                        <option value="client-dispute-manager">Client Dispute Manager</option>
                        <option value="dispute-suite">Dispute Suite</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="notes">Additional Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about your business, current client volume, or any questions you have..."
                        className="mt-1"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-blue hover:bg-primary-dark text-white py-6 text-lg"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          Submit Inquiry <ArrowRight className="w-5 h-5" />
                        </span>
                      )}
                    </Button>

                    <p className="text-sm text-gray-500 text-center">
                      By submitting this form, you agree to be contacted by Credlocity regarding outsourcing services.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-cinzel text-3xl font-bold mb-4">
              Ready to Scale Your Credit Repair Business?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Join credit repair organizations across the country who trust Credlocity for their dispute processing needs.
            </p>
            <Button 
              size="lg"
              className="bg-secondary-green hover:bg-secondary-light text-white text-lg px-12 py-6"
              onClick={() => document.getElementById('inquiry-form').scrollIntoView({ behavior: 'smooth' })}
            >
              Start Outsourcing Today
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Outsourcing;