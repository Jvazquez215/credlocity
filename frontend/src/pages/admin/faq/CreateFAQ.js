import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/api';
import RichTextEditor from '../../../components/RichTextEditor';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { toast } from 'sonner';

export default function CreateFAQ() {
  const navigate = useNavigate();
  

  // Form fields
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [slug, setSlug] = useState('');
  const [order, setOrder] = useState(0);
  const [authorId, setAuthorId] = useState('');
  const [status, setStatus] = useState('published');

  // SEO fields
  const [seoMetaTitle, setSeoMetaTitle] = useState('');
  const [seoMetaDescription, setSeoMetaDescription] = useState('');
  const [keywords, setKeywords] = useState('');

  // Related content
  const [selectedBlogPosts, setSelectedBlogPosts] = useState([]);
  const [selectedFaqs, setSelectedFaqs] = useState([]);

  // Data from API
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [allFaqs, setAllFaqs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [showSeoPanel, setShowSeoPanel] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAuthors();
    fetchBlogPosts();
    fetchFAQs();
  }, []);

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
      // Default to Joey (CEO)
      const joey = response.data.find(a => a.slug === 'joeziel-joey-vazquez-davila');
      if (joey) {
        setAuthorId(joey.id);
        console.log('✅ Auto-selected Joey as default author');
      }
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
    try {
      const response = await axios.get('/faqs?status=published');
      setAllFaqs(response.data);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleQuestionChange = (value) => {
    setQuestion(value);
    // Auto-generate slug from question
    if (!slug || slug === generateSlug(question)) {
      setSlug(generateSlug(value));
    }
    // Auto-generate SEO meta title if empty
    if (!seoMetaTitle) {
      setSeoMetaTitle(value.substring(0, 60));
    }
  };

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 60);
  };

  const handleCategoryChange = (value) => {
    const selectedCategory = categories.find(c => c.slug === value);
    if (selectedCategory) {
      setCategory(selectedCategory.name);
      setCategorySlug(selectedCategory.slug);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question || !answer || !category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const selectedAuthor = authors.find(a => a.id === authorId);

      const faqData = {
        question,
        answer,
        category,
        category_slug: categorySlug,
        slug: slug || generateSlug(question),
        order: parseInt(order) || 0,
        seo_meta_title: seoMetaTitle || question.substring(0, 60),
        seo_meta_description: seoMetaDescription,
        keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
        author_id: authorId,
        author_name: selectedAuthor?.full_name || '',
        author_credentials: selectedAuthor?.credentials || [],
        related_blog_posts: selectedBlogPosts,
        related_faqs: selectedFaqs,
        status,
      };

      await axios.post('/faqs', faqData);

      toast.success('FAQ created successfully');

      navigate('/admin/faqs');
    } catch (error) {
      console.error('Error creating FAQ:', error);
      toast.error(error.response?.data?.detail || 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New FAQ</h1>
          <p className="text-muted-foreground mt-2">
            Add a new frequently asked question
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/faqs')}>
          ← Back to FAQs
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>FAQ Content</CardTitle>
            <CardDescription>
              Enter the question and answer content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question */}
            <div>
              <Label htmlFor="question">
                Question <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question"
                value={question}
                onChange={(e) => handleQuestionChange(e.target.value)}
                placeholder="What is credit repair and how does it work?"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">
                URL Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="what-is-credit-repair"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from question. Edit if needed.
              </p>
            </div>

            {/* Answer */}
            <div>
              <Label htmlFor="answer">
                Answer <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                content={answer}
                onChange={setAnswer}
                placeholder="Enter detailed answer with formatting..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card>
          <CardHeader>
            <CardTitle>Organization</CardTitle>
            <CardDescription>
              Categorize and organize the FAQ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category */}
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={categorySlug} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No categories available. Create categories first.
                    </div>
                  ) : (
                    categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Order */}
            <div>
              <Label htmlFor="order">
                Display Order
              </Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower numbers appear first within category (0 = top)
              </p>
            </div>

            {/* Author */}
            <div>
              <Label htmlFor="author">
                Author Attribution (E-E-A-T)
              </Label>
              <Select value={authorId} onValueChange={setAuthorId}>
                <SelectTrigger id="author">
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {authors.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      No authors available
                    </div>
                  ) : (
                    authors.map(author => (
                      <SelectItem key={author.id} value={author.id}>
                        {author.full_name} - {author.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                Author attribution helps with E-E-A-T SEO ranking
              </p>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Related Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>Related Content</CardTitle>
            <CardDescription>
              Link to related blog posts and FAQs for better SEO
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Related Blog Posts */}
            <div>
              <Label>Related Blog Posts</Label>
              <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-2">
                {blogPosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No blog posts available</p>
                ) : (
                  blogPosts.map(post => (
                    <label key={post.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedBlogPosts.includes(post.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBlogPosts([...selectedBlogPosts, post.id]);
                          } else {
                            setSelectedBlogPosts(selectedBlogPosts.filter(id => id !== post.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm">{post.title}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {selectedBlogPosts.length} posts
              </p>
            </div>

            {/* Related FAQs */}
            <div>
              <Label>Related FAQs</Label>
              <div className="border rounded p-3 max-h-60 overflow-y-auto space-y-2">
                {allFaqs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No other FAQs available</p>
                ) : (
                  allFaqs.map(faq => (
                    <label key={faq.id} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="checkbox"
                        checked={selectedFaqs.includes(faq.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFaqs([...selectedFaqs, faq.id]);
                          } else {
                            setSelectedFaqs(selectedFaqs.filter(id => id !== faq.id));
                          }
                        }}
                        className="mt-1"
                      />
                      <span className="text-sm">{faq.question}</span>
                    </label>
                  ))
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {selectedFaqs.length} FAQs
              </p>
            </div>
          </CardContent>
        </Card>

        {/* SEO Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>
                  Optimize for search engines
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSeoPanel(!showSeoPanel)}
              >
                {showSeoPanel ? 'Hide' : 'Show'} SEO Settings
              </Button>
            </div>
          </CardHeader>
          {showSeoPanel && (
            <CardContent className="space-y-4">
              {/* Meta Title */}
              <div>
                <Label htmlFor="seo-title">
                  Meta Title ({seoMetaTitle.length}/60)
                </Label>
                <Input
                  id="seo-title"
                  value={seoMetaTitle}
                  onChange={(e) => setSeoMetaTitle(e.target.value)}
                  placeholder="What is credit repair? | Credlocity FAQ"
                  maxLength={60}
                />
              </div>

              {/* Meta Description */}
              <div>
                <Label htmlFor="seo-description">
                  Meta Description ({seoMetaDescription.length}/160)
                </Label>
                <Textarea
                  id="seo-description"
                  value={seoMetaDescription}
                  onChange={(e) => setSeoMetaDescription(e.target.value)}
                  placeholder="Learn what credit repair is and how it can help improve your credit score..."
                  maxLength={160}
                  rows={3}
                />
              </div>

              {/* Keywords */}
              <div>
                <Label htmlFor="keywords">
                  Focus Keywords (comma-separated)
                </Label>
                <Input
                  id="keywords"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="credit repair, credit score, FCRA"
                />
              </div>
            </CardContent>
          )}
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/faqs')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create FAQ'}
          </Button>
        </div>
      </form>
    </div>
  );
}
