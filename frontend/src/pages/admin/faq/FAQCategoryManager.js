import React, { useState, useEffect } from 'react';
import axios from '../../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../../components/ui/alert-dialog';

export default function FAQCategoryManager() {
  const [categories, setCategories] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    const response = await axios.get('/faq-categories');
    setCategories(response.data);
  };

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setSlug(category.slug);
      setIcon(category.icon || '');
      setDescription(category.description || '');
      setOrder(category.order || 0);
    } else {
      setEditingCategory(null);
      setName('');
      setSlug('');
      setIcon('');
      setDescription('');
      setOrder(categories.length + 1);
    }
    setDialogOpen(true);
  };

  const generateSlug = (text) => {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = { name, slug, icon, description, order: parseInt(order) };
      
      if (editingCategory) {
        await axios.put(`/faq-categories/${editingCategory.id}`, data);
        toast.success('Category updated successfully');
      } else {
        await axios.post('/faq-categories', data);
        toast.success('Category created successfully');
      }

      fetchCategories();
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await axios.delete(`/faq-categories/${categoryToDelete.id}`);
      toast.success('Category deleted successfully');
      fetchCategories();
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">FAQ Category Manager</h1>
        <Button onClick={() => handleOpenDialog()}>+ Add Category</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Categories ({categories.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between border p-4 rounded">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <div className="font-medium">{cat.name}</div>
                    <div className="text-sm text-muted-foreground">{cat.slug} · {cat.faq_count} FAQs · Order: {cat.order}</div>
                    {cat.description && <div className="text-sm text-gray-600 mt-1">{cat.description}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleOpenDialog(cat)}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={() => { setCategoryToDelete(cat); setDeleteDialogOpen(true); }}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>Organize your FAQs with categories</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Name *</Label>
              <Input value={name} onChange={(e) => { setName(e.target.value); if (!editingCategory) setSlug(generateSlug(e.target.value)); }} required />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} required />
            </div>
            <div>
              <Label>Icon (Emoji)</Label>
              <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="📊" maxLength={4} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} min="0" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete "{categoryToDelete?.name}". This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
