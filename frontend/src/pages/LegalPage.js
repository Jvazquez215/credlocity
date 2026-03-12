import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft } from 'lucide-react';

const LegalPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLegalPage();
  }, [slug]);

  const fetchLegalPage = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/legal-pages/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setPage(data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching legal page:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{page.meta_title || `${page.title} - Credlocity`}</title>
        <meta name="description" content={page.meta_description || page.title} />
      </Helmet>

      <Header />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{page.title}</h1>
            <p className="text-sm text-gray-500 mb-8">
              Last Updated: {formatDate(page.last_updated)}
            </p>
            
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default LegalPage;
