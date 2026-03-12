import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../../utils/api';
import RichTextEditor from '../../../components/RichTextEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { toast } from 'sonner';

export default function EditFAQ() {
  const { faqId } = useParams();
  const navigate = useNavigate();
  

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState('published');
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [selectedBlogPosts, setSelectedBlogPosts] = useState([]);
  const [selectedFaqs, setSelectedFaqs] = useState([]);
  const [views, setViews] = useState(0);

  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  useEffect(() => {
    fetchFAQ();
    fetchCategories();
    fetchAuthors();
    fetchBlogPosts();
    fetchFAQs();
  }, [faqId]);

  const fetchFAQ = async () => {
    try {
      const response = await axios.get(`/faqs/${faqId}`);
      const faq = response.data;
      
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setCategory(faq.category);
      setCategorySlug(faq.category_slug);
      setSlug(faq.slug);
      setOrder(faq.order || 0);
      setAuthorId(faq.author_id || '');
      setStatus(faq.status);
      setSeoMetaTitle(faq.seo_meta_title || '');
      setSeoMetaDescription(faq.seo_meta_description || '');
      setKeywords(faq.keywords?.join(', ') || '');
      setSelectedBlogPosts(faq.related_blog_posts || []);
      setSelectedFaqs(faq.related_faqs || []);
      setViews(faq.views || 0);
      setFetchLoading(false);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      toast.error('Failed to load FAQ');
      navigate('/admin/faqs');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/faq-categories');
      console.log('✅ Categories fetched:', response.data);
      setCategories(response.data);
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await axios.get('/authors?status=active');
      console.log('✅ Authors fetched:', response.data);
      setAuthors(response.data);
    } catch (error) {
      console.error('❌ Error fetching authors:', error);
      toast.error('Failed to load authors');
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await axios.get('/blog/posts?status=published');
      setBlogPosts(response.data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    }
  };

  const fetchFAQs = async () => {
    const response = await axios.get('/faqs?status=published');
    setAllFaqs(response.data.filter(f => f.id !== faqId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedAuthor = authors.find(a => a.id === authorId);
      
      const faqData = {
        question,
        answer,
        category,
        category_slug: categorySlug,
        slug,
        order: parseInt(order) || 0,
        seo_meta_title: seoMetaTitle,
        seo_meta_description: seoMetaDescription,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        author_id: authorId,
        author_name: selectedAuthor?.full_name || '',
        author_credentials: selectedAuthor?.credentials || [],
        related_blog_posts: selectedBlogPosts,
        related_faqs: selectedFaqs,
        status,
      };

      await axios.put(`/faqs/${faqId}`, faqData);
      toast.success('FAQ updated successfully');
      navigate('/admin/faqs');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return <div className="text-center py-8">Loading FAQ...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Edit FAQ</h1>
          <p className="text-muted-foreground mt-2">Views: {views}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/faqs')}>← Back</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>FAQ Content</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Question *</Label>
              <Input value={question} onChange={(e) => setQuestion(e.target.value)} required />
            </div>
            <div>
              <Label>URL Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div>
              <Label>Answer *</Label>
              <RichTextEditor content={answer} onChange={setAnswer} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Organization</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Category *</Label>
              <Select value={categorySlug} onValueChange={(v) => {
                const cat = categories.find(c => c.slug === v);
                if (cat) { setCategory(cat.name); setCategorySlug(cat.slug); }
              }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat.id} value={cat.slug}>{cat.icon} {cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} min="0" />
            </div>
            <div>
              <Label>Author</Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {authors.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name} - {a.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>SEO Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Meta Title ({seoMetaTitle.length}/60)</Label>
              <Input value={seoMetaTitle} onChange={(e) => setSeoMetaTitle(e.target.value)} maxLength={60} />
            </div>
            <div>
              <Label>Meta Description ({seoMetaDescription.length}/160)</Label>
              <Textarea value={seoMetaDescription} onChange={(e) => setSeoMetaDescription(e.target.value)} maxLength={160} rows={3} />
            </div>
            <div>
              <Label>Keywords (comma-separated)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/admin/faqs')}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update FAQ'}</Button>
        </div>
      </form>
    </div>
  );
}
