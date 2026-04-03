import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { MapPin, ArrowRight, ChevronRight, Users, TrendingUp, Shield, Star, Building2, Search } from 'lucide-react';
import useSEO from '../hooks/useSEO';
import { TrialButton } from '../components/LeadButtons';

const API = process.env.REACT_APP_BACKEND_URL;

const CITY_DATA = [
  {
    city: 'Philadelphia', state: 'PA', slug: '/credit-repair-philadelphia', region: 'East Coast',
    image: 'https://images.pexels.com/photos/6379121/pexels-photo-6379121.jpeg?auto=compress&cs=tinysrgb&w=600',
    tagline: 'Headquarters — Serving the Tri-State Area',
    pop: '1.6M', metro: '6.2M', avgScore: '675', subprime: '35%',
    desc: 'Home to Credlocity\'s national headquarters at 1500 Chestnut Street, Suite 2. Philadelphia has one of the highest rates of credit report errors in the nation, with 35% of residents carrying subprime scores. Our in-person and remote services have helped thousands of Philly residents improve their credit.',
    office: '1500 Chestnut St, Suite 2, Philadelphia, PA 19102',
  },
  {
    city: 'Atlanta', state: 'GA', slug: '/credit-repair-atlanta', region: 'Southeast',
    image: 'https://images.pexels.com/photos/2815184/pexels-photo-2815184.jpeg?auto=compress&cs=tinysrgb&w=600',
    tagline: 'The South\'s Credit Repair Leader',
    pop: '499K', metro: '6.1M', avgScore: '668', subprime: '38%',
    desc: 'Atlanta\'s booming economy creates huge demand for credit-qualified workers and homebuyers, yet nearly 38% of metro Atlanta residents have subprime credit scores. Credlocity helps Atlantans dispute errors, remove collections, and qualify for better rates on the city\'s competitive housing market.',
  },
  {
    city: 'New York', state: 'NY', slug: '/credit-repair-new-york', region: 'East Coast',
    image: 'https://images.unsplash.com/photo-1655845836463-facb2826510b?w=600',
    tagline: 'All Five Boroughs & Beyond',
    pop: '8.3M', metro: '20.1M', avgScore: '695', subprime: '28%',
    desc: 'New York\'s high cost of living makes excellent credit essential. Even a small score improvement can save tens of thousands on a Manhattan mortgage or qualify you for better apartment rentals across all five boroughs. We serve NYC, Long Island, Westchester, and the entire state remotely.',
  },
  {
    city: 'Trenton', state: 'NJ', slug: '/credit-repair-trenton', region: 'East Coast',
    image: 'https://images.unsplash.com/photo-1642507870903-710079828691?w=600',
    tagline: 'New Jersey\'s Capital City',
    pop: '91K', metro: '375K', avgScore: '660', subprime: '40%',
    desc: 'As New Jersey\'s capital, Trenton faces unique economic challenges with 40% of residents carrying subprime credit scores. Credlocity provides professional credit repair services to help Trenton families qualify for homeownership in one of the nation\'s most expensive states.',
  },
  {
    city: 'Boise', state: 'ID', slug: '/credit-repair-boise', region: 'Idaho',
    image: 'https://images.pexels.com/photos/30256874/pexels-photo-30256874.jpeg?auto=compress&cs=tinysrgb&w=600',
    tagline: 'Idaho\'s Fastest-Growing Metro',
    pop: '236K', metro: '800K', avgScore: '710', subprime: '22%',
    desc: 'Boise\'s explosive growth has pushed median home prices above $450,000, making good credit more important than ever. Our local Idaho office serves Boise residents with both in-person and remote consultations. Even a 50-point score improvement can save $40,000+ on a Boise mortgage.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
  {
    city: 'Nampa', state: 'ID', slug: '/credit-repair-nampa', region: 'Idaho',
    image: 'https://images.unsplash.com/photo-1748273489562-803584ce4e3b?w=600',
    tagline: 'Treasure Valley\'s Growing Hub',
    pop: '108K', metro: '800K', avgScore: '695', subprime: '27%',
    desc: 'As Idaho\'s third-largest city and a key part of the Treasure Valley, Nampa residents face rising costs that make credit health critical. We serve Nampa from our nearby Idaho office with affordable, FCRA-compliant credit repair services.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
  {
    city: 'Caldwell', state: 'ID', slug: '/credit-repair-caldwell', region: 'Idaho',
    image: 'https://images.unsplash.com/photo-1700669026231-c15352acbc26?w=600',
    tagline: 'Canyon County\'s County Seat',
    pop: '62K', metro: '800K', avgScore: '685', subprime: '30%',
    desc: 'Caldwell, the county seat of Canyon County, has seen rapid growth alongside the Treasure Valley boom. With 30% subprime rates and rising property values, professional credit repair can make the difference between renting and owning a home.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
  {
    city: 'Idaho Falls', state: 'ID', slug: '/credit-repair-idaho-falls', region: 'Idaho',
    image: 'https://images.pexels.com/photos/1767666/pexels-photo-1767666.jpeg?auto=compress&cs=tinysrgb&w=600',
    tagline: 'Eastern Idaho\'s Economic Center',
    pop: '67K', metro: '190K', avgScore: '705', subprime: '24%',
    desc: 'Idaho Falls is the commercial hub of eastern Idaho, with a growing economy driven by the Idaho National Laboratory. Our credit repair services help Idaho Falls residents qualify for better mortgage rates in this rapidly appreciating market.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
  {
    city: 'Twin Falls', state: 'ID', slug: '/credit-repair-twin-falls', region: 'Idaho',
    image: 'https://images.unsplash.com/photo-1657518860172-5d4e4de1eb03?w=600',
    tagline: 'Magic Valley\'s Gateway City',
    pop: '53K', metro: '115K', avgScore: '700', subprime: '26%',
    desc: 'Twin Falls, home to the spectacular Shoshone Falls, serves as the economic hub of the Magic Valley. With a growing job market and rising home prices, credit repair helps residents access better financing options and lower interest rates.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
  {
    city: 'Pocatello', state: 'ID', slug: '/credit-repair-pocatello', region: 'Idaho',
    image: 'https://images.pexels.com/photos/6940677/pexels-photo-6940677.jpeg?auto=compress&cs=tinysrgb&w=600',
    tagline: 'The Gateway to the Northwest',
    pop: '57K', metro: '100K', avgScore: '695', subprime: '28%',
    desc: 'Pocatello, home to Idaho State University, combines small-town charm with economic opportunity. Our credit repair services help students, faculty, and residents qualify for better rates on everything from auto loans to mortgages in southeast Idaho.',
    office: '964 W Idaho Ave, Ontario, OR 97914',
  },
];

const LocationsPage = () => {
  useSEO({ title: 'Credit Repair Locations', description: 'Credlocity credit repair services across America.' });
  const [activeRegion, setActiveRegion] = useState('All Locations');
  const [search, setSearch] = useState('');
  const [apiLocations, setApiLocations] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/locations/public`)
      .then(r => r.ok ? r.json() : [])
      .then(data => { if (data.length > 0) setApiLocations(data); })
      .catch(() => {});
  }, []);

  // Use API data if available, otherwise fall back to hardcoded
  const cities = apiLocations
    ? apiLocations.map(l => ({
        city: l.city, state: l.state, slug: `/${l.slug}`, region: l.region || 'Other',
        image: l.image_url || '', tagline: l.tagline || '', pop: l.population || '',
        metro: l.metro_area || '', avgScore: l.avg_credit_score || '', subprime: l.subprime_pct || '',
        desc: l.description || '', office: l.office_address || '',
      }))
    : CITY_DATA;

  const allRegions = ['All Locations', ...new Set(cities.map(c => c.region))];

  const filtered = cities.filter(c => {
    const matchRegion = activeRegion === 'All Locations' || c.region === activeRegion;
    const matchSearch = !search || c.city.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase());
    return matchRegion && matchSearch;
  });

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Credlocity Business Group LLC",
    "url": "https://www.credlocity.com",
    "areaServed": cities.map(c => ({
      "@type": "City",
      "name": `${c.city}, ${c.state}`
    }))
  };

  return (
    <div className="min-h-screen" data-testid="locations-page">
      <Helmet>
        <title>Credit Repair Locations | Professional Credit Repair Services Near You | Credlocity</title>
        <meta name="description" content="Find Credlocity credit repair services near you. We serve Philadelphia PA, Atlanta GA, New York NY, Trenton NJ, Boise ID, Nampa ID, Caldwell ID, Idaho Falls ID, Twin Falls ID, and Pocatello ID. 79,000+ clients served since 2008." />
        <meta name="keywords" content="credit repair near me, credit repair locations, credit repair Philadelphia, credit repair Atlanta, credit repair New York, credit repair Boise, credit repair Idaho, best credit repair company, local credit repair services" />
        <link rel="canonical" href="https://www.credlocity.com/locations" />
        <script type="application/ld+json">{JSON.stringify(schemaData)}</script>
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-primary text-white py-20 md:py-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <nav className="flex items-center gap-2 text-sm text-gray-300 mb-8">
            <Link to="/" className="hover:text-white transition">Home</Link><span>/</span><span className="text-white">Locations</span>
          </nav>
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm mb-6">
              <MapPin className="w-4 h-4" /> Serving {cities.length} Cities Across America
            </div>
            <h1 className="font-cinzel text-4xl sm:text-5xl lg:text-6xl font-bold mb-6" data-testid="locations-title">
              Credit Repair Services Near You
            </h1>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed max-w-3xl mb-8">
              From our Philadelphia headquarters to our Idaho office, Credlocity provides Board Certified, FCRA-compliant credit repair services across the nation. Find your city below and discover how our 79,000+ clients have achieved an average <strong>236-point score increase</strong> in just 3-7 months.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white" asChild>
                <TrialButton variant="link" className="inline-flex items-center">
                  Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
                </TrialButton>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/how-it-works">How It Works <ChevronRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-8 bg-white border-b" data-testid="locations-stats">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 max-w-5xl mx-auto text-center">
            {[
              { val: `${cities.length}`, label: 'Cities Served' },
              { val: '79,000+', label: 'Clients Since 2008' },
              { val: '236 pts', label: 'Avg Score Increase' },
              { val: '3-7 mo', label: 'Avg Client Duration' },
              { val: '5.0', label: 'Star Rating' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-bold text-primary-blue">{s.val}</div>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Region Filters + Search */}
      <section className="py-6 bg-gray-50 border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by city or state..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none text-sm"
                data-testid="locations-search"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {allRegions.map(r => (
                <button
                  key={r}
                  onClick={() => setActiveRegion(r)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${activeRegion === r ? 'bg-primary-blue text-white' : 'bg-white text-gray-600 border hover:bg-gray-100'}`}
                  data-testid={`region-${r.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {r} {r === 'All Locations' ? `(${cities.length})` : `(${cities.filter(c => c.region === r).length})`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* City Cards */}
      <section className="py-12 bg-gray-50" data-testid="city-cards-section">
        <div className="container mx-auto px-4 max-w-6xl">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No locations match your search</h3>
              <p className="text-gray-500 text-sm">Try a different city name or region filter.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((city, i) => (
                <Link
                  key={city.slug}
                  to={city.slug}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-primary-blue/30 hover:shadow-xl transition-all"
                  data-testid={`city-card-${city.city.toLowerCase().replace(/\s/g, '-')}`}
                >
                  {/* City Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={city.image}
                      alt={`Credit repair services in ${city.city}, ${city.state}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="font-cinzel text-2xl font-bold text-white">{city.city}, {city.state}</h2>
                          <p className="text-sm text-gray-200">{city.tagline}</p>
                        </div>
                        <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full">{city.region}</span>
                      </div>
                    </div>
                    {city.office && (
                      <div className="absolute top-3 right-3 bg-secondary-green text-white text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> Local Office
                      </div>
                    )}
                  </div>

                  {/* City Content */}
                  <div className="p-6">
                    <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-3">{city.desc}</p>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-blue">{city.pop}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Population</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-blue">{city.metro}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Metro Area</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-primary-blue">{city.avgScore}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Avg Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-500">{city.subprime}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">Subprime</div>
                      </div>
                    </div>

                    {city.office && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-secondary-green flex-shrink-0" />
                        <span>{city.office}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-primary-blue font-medium text-sm group-hover:underline flex items-center gap-1">
                        View {city.city} Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Location Matters for Credit Repair */}
      <section className="py-16 bg-white" data-testid="why-location-matters">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-primary-blue mb-4 text-center">
            Why Local Credit Repair Matters
          </h2>
          <p className="text-gray-500 text-center max-w-3xl mx-auto mb-12">
            While credit repair laws are federal, local economic conditions and regional lending practices create unique challenges in every city.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MapPin, title: 'City-Specific Data', desc: 'Each city has different credit score averages, subprime rates, and collection account percentages. We tailor our strategy to your local credit landscape.' },
              { icon: Building2, title: 'Local Lender Knowledge', desc: 'We understand which lenders serve your area, what scores they require, and which FICO versions they pull. This knowledge drives our dispute prioritization.' },
              { icon: Shield, title: 'State Consumer Protections', desc: 'Beyond federal laws (FCRA, FDCPA, CROA), many states have additional consumer protection statutes we leverage when disputing inaccurate items on your behalf.' },
              { icon: Users, title: 'Community Impact', desc: 'Credit repair in underserved communities creates generational wealth through homeownership. We serve diverse communities across all our locations with culturally competent services.' },
              { icon: TrendingUp, title: 'Market-Specific Goals', desc: 'A 720 score qualifies you differently in Atlanta vs. New York City. We set score goals based on your local housing market and lending landscape.' },
              { icon: Star, title: 'Proven Local Results', desc: 'Our 79,000+ clients across all locations see an average 236-point score increase in 3-7 months. Local testimonials from your city prove our effectiveness.' },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-primary-blue/20 hover:shadow-md transition">
                <item.icon className="w-8 h-8 text-primary-blue mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Available */}
      <section className="py-16 bg-gray-50" data-testid="services-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-4 text-center">Services Available at All Locations</h2>
          <p className="text-gray-500 text-center max-w-2xl mx-auto mb-10">Every Credlocity location offers the same comprehensive suite of FCRA-compliant credit repair services.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              'Credit Report Error Disputes',
              'Collection Account Removal',
              'Late Payment Removal',
              'Charge-Off Disputes',
              'Hard Inquiry Removal',
              'Identity Theft Recovery (FCRA 605B)',
              'Bankruptcy Credit Repair',
              'Credit Score Optimization',
              'Medical Debt Dispute',
              'Student Loan Error Correction',
              'Repossession Record Removal',
              'Foreclosure Dispute',
            ].map((svc, i) => (
              <div key={i} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
                <div className="w-2 h-2 bg-secondary-green rounded-full flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{svc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interlinks */}
      <section className="py-16 bg-white" data-testid="related-section">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-cinzel text-2xl font-bold text-primary-blue mb-8 text-center">Learn More About Credit Repair</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { title: 'Credit Scores Explained', link: '/credit-scores', desc: 'FICO vs VantageScore, all versions, 800 Club' },
              { title: 'Credit Repair Laws', link: '/credit-repair-laws', desc: 'FCRA, CROA, TSR, FDCPA guides' },
              { title: 'Free Letters', link: '/free-letters', desc: 'Free dispute letter templates' },
              { title: '30-Day Free Trial', link: '/30-day-free-trial', desc: 'Start with $0 service fees' },
            ].map((item, i) => (
              <Link key={i} to={item.link} className="bg-gray-50 rounded-xl p-5 border hover:border-primary-blue/20 hover:shadow-md transition group">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-primary-blue">{item.title}</h3>
                <p className="text-xs text-gray-500">{item.desc}</p>
                <span className="text-primary-blue text-xs font-medium mt-2 inline-flex items-center gap-1">Read More <ChevronRight className="w-3 h-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-primary text-white" data-testid="locations-cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-4">Don't See Your City?</h2>
          <p className="text-lg text-gray-100 mb-6 max-w-2xl mx-auto">
            Credlocity serves clients in <strong>all 50 states</strong> remotely. No matter where you live, our Board Certified Credit Consultants can help. Start with a 30-day free trial today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-secondary-green hover:bg-secondary-light text-white px-8" asChild>
              <TrialButton variant="link" className="inline-flex items-center">
                Start Free Trial <ArrowRight className="w-4 h-4 ml-2" />
              </TrialButton>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link to="/about-credlocity">About Credlocity <ChevronRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LocationsPage;
