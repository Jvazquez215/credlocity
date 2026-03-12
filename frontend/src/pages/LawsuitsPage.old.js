import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Search, Filter, Scale } from 'lucide-react';

const LawsuitsPage = () => {
  const navigate = useNavigate();
  const [lawsuits, setLawsuits] = useState([]);
  const [filteredLawsuits, setFilteredLawsuits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchLawsuits();
  }, []);

  useEffect(() => {
    filterLawsuits();
  }, [lawsuits, searchTerm, categoryFilter, typeFilter]);

  const fetchLawsuits = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/lawsuits`);
      if (response.ok) {
        const data = await response.json();
        setLawsuits(data);
      }
    } catch (error) {
      console.error('Error fetching lawsuits:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLawsuits = () => {
    let filtered = [...lawsuits];

    if (searchTerm) {
      filtered = filtered.filter(lawsuit =>
        lawsuit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lawsuit.brief_description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(lawsuit => lawsuit.lawsuit_type === typeFilter);
    }

    setFilteredLawsuits(filtered);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Lawsuits Filed - Credlocity</title>
        <meta name="description" content="View lawsuits filed by Credlocity on behalf of consumers, the credit repair industry, and consumer rights nationwide." />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Scale className="w-16 h-16 text-blue-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Lawsuits Filed
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Credlocity takes legal action to protect consumer rights and hold credit bureaus accountable. 
              View our ongoing and past legal cases.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search lawsuits..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  <option value="Client">On Behalf of Client</option>
                  <option value="Industry">Credit Repair Industry</option>
                  <option value="Nationwide">Consumer Nationwide</option>
                </select>
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">All Types</option>
                  <option value="FCRA">FCRA</option>
                  <option value="FCBA">FCBA</option>
                  <option value="FDCPA">FDCPA</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading lawsuits...</p>
            </div>
          )}

          {/* Lawsuits List */}
          {!loading && (
            <div className="space-y-6">
              {filteredLawsuits.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <Scale className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No lawsuits found</h3>
                  <p className="text-gray-500">
                    {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Check back soon for updates on our legal actions'}
                  </p>
                </div>
              ) : (
                filteredLawsuits.map((lawsuit) => (
                  <div
                    key={lawsuit.id}
                    onClick={() => navigate(`/lawsuits/${lawsuit.slug}`)}
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-2xl font-bold text-gray-900 flex-1">
                        {lawsuit.title}
                      </h2>
                      <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold whitespace-nowrap">
                        {lawsuit.lawsuit_type}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-gray-500">Case Number</span>
                        <p className="font-medium text-gray-900">{lawsuit.case_number}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Category</span>
                        <p className="font-medium text-gray-900">{lawsuit.lawsuit_category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Topic</span>
                        <p className="font-medium text-gray-900">{lawsuit.topic}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Date Filed</span>
                        <p className="font-medium text-gray-900">{formatDate(lawsuit.date_filed)}</p>
                      </div>
                    </div>

                    <p className="text-gray-600 mb-4">{lawsuit.brief_description}</p>

                    {lawsuit.related_company && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Related to:</span>
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          {lawsuit.related_company}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <span className="text-blue-600 font-medium hover:text-blue-700">
                        View Full Details →
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LawsuitsPage;