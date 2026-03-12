import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { toast } from 'sonner';
import ImageUpload from '../../../components/ui/ImageUpload';
import {
  Users, Plus, Search, Filter, Edit, Trash2, Shield, UserPlus, Building2, RefreshCw, Image
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ROLES = [
  { id: 'admin', name: 'Administrator', color: 'bg-red-100 text-red-700' },
  { id: 'director', name: 'Director', color: 'bg-purple-100 text-purple-700' },
  { id: 'collections_manager', name: 'Collections Manager', color: 'bg-blue-100 text-blue-700' },
  { id: 'team_leader', name: 'Team Leader', color: 'bg-cyan-100 text-cyan-700' },
  { id: 'collections_agent', name: 'Collections Agent', color: 'bg-green-100 text-green-700' },
  { id: 'contractor', name: 'Contractor', color: 'bg-orange-100 text-orange-700' },
  { id: 'affiliate', name: 'Affiliate', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'attorney', name: 'Attorney', color: 'bg-indigo-100 text-indigo-700' }
];

const MEMBER_TYPES = ['employee', 'contractor', 'affiliate', 'attorney', 'partner'];
const DEPARTMENTS = ['collections', 'sales', 'support', 'legal', 'operations', 'management'];

export default function TeamManagement() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total_members: 0, by_role: {}, by_type: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({
    email: '', full_name: '', phone: '', role: 'collections_agent',
    member_type: 'employee', department: 'collections', password: '', photo_url: ''
  });

  useEffect(() => {
    fetchMembers();
    fetchStats();
  }, [search, roleFilter, typeFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (typeFilter) params.append('member_type', typeFilter);
      
      const res = await fetch(`${API_URL}/api/team/members?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to fetch team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/team/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const url = editMember 
        ? `${API_URL}/api/team/members/${editMember.id}`
        : `${API_URL}/api/team/members`;
      
      const res = await fetch(url, {
        method: editMember ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        toast.success(editMember ? 'Member updated!' : 'Member created!');
        setShowModal(false);
        setEditMember(null);
        setForm({ email: '', full_name: '', phone: '', role: 'collections_agent', member_type: 'employee', department: 'collections', password: '', photo_url: '' });
        fetchMembers();
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Operation failed');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete ${member.full_name}? This cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/team/members/${member.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Member deleted');
        fetchMembers();
        fetchStats();
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Delete failed');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const openEdit = (member) => {
    setEditMember(member);
    setForm({
      email: member.email,
      full_name: member.full_name,
      phone: member.phone || '',
      role: member.role,
      member_type: member.member_type,
      department: member.department || 'collections',
      password: '',
      photo_url: member.photo_url || ''
    });
    setShowModal(true);
  };

  const getRoleBadge = (role) => {
    const r = ROLES.find(x => x.id === role);
    return <Badge className={r?.color || 'bg-gray-100'}>{r?.name || role}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500">Manage team members, roles, and permissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchMembers(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={() => { setEditMember(null); setForm({ email: '', full_name: '', phone: '', role: 'collections_agent', member_type: 'employee', department: 'collections', password: '', photo_url: '' }); setShowModal(true); }} className="bg-primary-blue">
            <UserPlus className="w-4 h-4 mr-2" />Add Member
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.total_members}</p>
                <p className="text-xs text-gray-500">Total Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><Shield className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.by_type?.employee || 0}</p>
                <p className="text-xs text-gray-500">Employees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg"><Building2 className="w-5 h-5 text-orange-600" /></div>
              <div>
                <p className="text-2xl font-bold">{stats.by_type?.contractor || 0}</p>
                <p className="text-xs text-gray-500">Contractors</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
              <div>
                <p className="text-2xl font-bold">{(stats.by_type?.affiliate || 0) + (stats.by_type?.attorney || 0)}</p>
                <p className="text-xs text-gray-500">Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 px-3 border rounded-md"
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 px-3 border rounded-md"
        >
          <option value="">All Types</option>
          {MEMBER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : members.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">No team members found</TableCell></TableRow>
              ) : members.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {member.photo_url ? (
                        <img 
                          src={member.photo_url} 
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-medium">
                          {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{member.full_name}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(member.role)}</TableCell>
                  <TableCell><Badge variant="outline">{member.member_type}</Badge></TableCell>
                  <TableCell className="capitalize">{member.department}</TableCell>
                  <TableCell>
                    <Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>{member.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(member)}><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(member)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Profile Photo */}
            <div>
              <Label className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                Profile Photo
              </Label>
              <div className="mt-2">
                <ImageUpload
                  value={form.photo_url}
                  onChange={(url) => setForm({...form, photo_url: url})}
                  label="Upload profile photo"
                  maxSizeMB={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required className="mt-1" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required disabled={!!editMember} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="mt-1" />
              </div>
              <div>
                <Label>Role *</Label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md">
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Member Type</Label>
                <select value={form.member_type} onChange={(e) => setForm({...form, member_type: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md">
                  {MEMBER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
                </select>
              </div>
            </div>
            {!editMember && (
              <div>
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Leave blank to set later" className="mt-1" />
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary-blue">{editMember ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
