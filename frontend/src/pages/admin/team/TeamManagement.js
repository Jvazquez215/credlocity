import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { toast } from 'sonner';
import ImageUpload from '../../../components/ui/ImageUpload';
import OrgChart from './OrgChart';
import { useTranslation } from '../../../context/TranslationContext';
import {
  Users, Plus, Search, Edit, Trash2, Shield, UserPlus, Building2, RefreshCw,
  Image, LayoutGrid, List, Mail, Phone, MapPin, Calendar, Briefcase,
  ChevronRight, ArrowLeft, GraduationCap, Heart, Linkedin, X, Tag, Network
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
const DEPARTMENTS = ['collections', 'sales', 'support', 'legal', 'operations', 'management', 'marketing', 'hr', 'finance'];
const DEPT_COLORS = {
  collections: 'bg-blue-500', sales: 'bg-emerald-500', support: 'bg-amber-500',
  legal: 'bg-red-500', operations: 'bg-slate-500', management: 'bg-purple-500',
  marketing: 'bg-pink-500', hr: 'bg-violet-500', finance: 'bg-teal-500'
};

const getRoleBadge = (role) => {
  const r = ROLES.find(x => x.id === role);
  return <Badge className={r?.color || 'bg-gray-100'}>{r?.name || role}</Badge>;
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';

const getTenure = (hireDate) => {
  if (!hireDate) return null;
  const start = new Date(hireDate);
  const now = new Date();
  const months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (months < 1) return 'New';
  if (months < 12) return `${months}mo`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  return rem > 0 ? `${years}y ${rem}mo` : `${years}y`;
};

// ==================== EMPLOYEE PROFILE VIEW ====================
function EmployeeProfile({ member, onBack, onEdit }) {
  const [training, setTraining] = useState(null);

  useEffect(() => {
    fetchTraining();
  }, [member.id]);

  const fetchTraining = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/team/members/${member.id}/training-progress`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTraining(await res.json());
    } catch (e) { /* training data optional */ }
  };

  return (
    <div className="space-y-6" data-testid="employee-profile">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors" data-testid="back-to-directory">
        <ArrowLeft className="w-4 h-4" /> Back to Directory
      </button>

      {/* Profile Header */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className={`h-28 ${DEPT_COLORS[member.department] || 'bg-slate-500'} relative`}>
          <div className="absolute -bottom-12 left-6">
            {member.photo_url ? (
              <img src={member.photo_url} alt={member.full_name} className="w-24 h-24 rounded-xl border-4 border-white object-cover shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-xl border-4 border-white bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-gray-400">
                {member.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="absolute top-4 right-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(member)} className="bg-white/90 hover:bg-white" data-testid="edit-employee-btn">
              <Edit className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.full_name}</h1>
              <p className="text-gray-500">{member.title || member.role_name || member.role}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {getRoleBadge(member.role)}
                <Badge variant="outline" className="capitalize">{member.member_type}</Badge>
                <Badge className={`${member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{member.status}</Badge>
              </div>
            </div>
            {member.hire_date && (
              <div className="text-right text-sm text-gray-500">
                <p>Tenure: <span className="font-semibold text-gray-700">{getTenure(member.hire_date)}</span></p>
                <p>Since {formatDate(member.hire_date)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact & Details */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${member.email}`} className="text-blue-600 hover:underline">{member.email}</a>
                </div>
                {member.phone && <div className="flex items-center gap-3 text-sm"><Phone className="w-4 h-4 text-gray-400" /><span>{member.phone}</span></div>}
                {member.location && <div className="flex items-center gap-3 text-sm"><MapPin className="w-4 h-4 text-gray-400" /><span>{member.location}</span></div>}
                {member.linkedin_url && <div className="flex items-center gap-3 text-sm"><Linkedin className="w-4 h-4 text-gray-400" /><a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">LinkedIn Profile</a></div>}
              </div>
            </CardContent>
          </Card>

          {/* Employment */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider">Employment</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Department</span><span className="font-medium capitalize">{member.department}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium capitalize">{member.member_type}</span></div>
                {member.hire_date && <div className="flex justify-between"><span className="text-gray-500">Hire Date</span><span className="font-medium">{formatDate(member.hire_date)}</span></div>}
                {member.birthday && <div className="flex justify-between"><span className="text-gray-500">Birthday</span><span className="font-medium">{formatDate(member.birthday)}</span></div>}
                {member.hourly_rate && <div className="flex justify-between"><span className="text-gray-500">Hourly Rate</span><span className="font-medium">${member.hourly_rate}/hr</span></div>}
                {member.commission_rate && <div className="flex justify-between"><span className="text-gray-500">Commission</span><span className="font-medium">{member.commission_rate}%</span></div>}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {member.emergency_contact_name && (
            <Card>
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2"><Heart className="w-4 h-4 text-red-400" /> Emergency Contact</h3>
                <div className="text-sm space-y-1">
                  <p className="font-medium">{member.emergency_contact_name}</p>
                  {member.emergency_contact_relation && <p className="text-gray-500">{member.emergency_contact_relation}</p>}
                  {member.emergency_contact_phone && <p className="text-gray-500">{member.emergency_contact_phone}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Bio, Skills, Training */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {member.bio && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">About</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{member.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Skills */}
          {member.skills?.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">{skill}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Training Progress */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-violet-500" /> Training Progress
                </h3>
                {training && (
                  <span className="text-sm text-gray-500">{training.completed_modules}/{training.total_modules} completed</span>
                )}
              </div>
              {training ? (
                <div className="space-y-3">
                  {/* Overall progress bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Overall Completion</span>
                      <span className="font-semibold">{training.overall_pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all ${training.overall_pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${training.overall_pct}%` }} />
                    </div>
                  </div>
                  {training.modules?.map(mod => (
                    <div key={mod.module_id} className="flex items-center gap-3 py-2 border-b last:border-0">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mod.module_title}</p>
                        <p className="text-xs text-gray-400">{mod.department} | {mod.completed_steps}/{mod.total_steps} steps</p>
                      </div>
                      <div className="w-24">
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${mod.progress_pct === 100 ? 'bg-green-500' : 'bg-blue-400'}`} style={{ width: `${mod.progress_pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-medium w-10 text-right">{mod.progress_pct}%</span>
                      {mod.quiz_passed !== null && (
                        <Badge className={mod.quiz_passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} variant="outline">
                          {mod.quiz_passed ? `${mod.quiz_score}%` : 'Failed'}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No training data available</p>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {member.notes && (
            <Card>
              <CardContent className="p-5">
                <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wider mb-3">Admin Notes</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{member.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================
export default function TeamManagement() {
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({ total_members: 0, by_role: {}, by_type: {}, by_department: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    email: '', full_name: '', phone: '', role: 'collections_agent',
    member_type: 'employee', department: 'collections', password: '', photo_url: '',
    title: '', location: '', hire_date: '', birthday: '', bio: '', linkedin_url: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    skills: [], reports_to: ''
  });

  useEffect(() => { fetchMembers(); fetchStats(); }, [search, roleFilter, typeFilter, deptFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (typeFilter) params.append('member_type', typeFilter);
      if (deptFilter) params.append('department', deptFilter);
      const res = await fetch(`${API_URL}/api/team/members?${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const data = await res.json(); setMembers(data.members || []); }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/team/stats`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch (e) { console.error(e); }
  };

  const resetForm = () => setForm({
    email: '', full_name: '', phone: '', role: 'collections_agent',
    member_type: 'employee', department: 'collections', password: '', photo_url: '',
    title: '', location: '', hire_date: '', birthday: '', bio: '', linkedin_url: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    skills: [], reports_to: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('auth_token');
      const url = editMember ? `${API_URL}/api/team/members/${editMember.id}` : `${API_URL}/api/team/members`;
      const res = await fetch(url, {
        method: editMember ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success(editMember ? 'Employee updated!' : 'Employee created!');
        setShowModal(false);
        setEditMember(null);
        resetForm();
        fetchMembers();
        fetchStats();
        if (selectedMember && editMember) {
          const updated = await res.json();
          setSelectedMember(updated);
        }
      } else {
        const err = await res.json();
        toast.error(err.detail || 'Operation failed');
      }
    } catch (e) { toast.error('Operation failed'); }
  };

  const handleDelete = async (member) => {
    if (!window.confirm(`Delete ${member.full_name}? This cannot be undone.`)) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`${API_URL}/api/team/members/${member.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { toast.success('Employee removed'); fetchMembers(); fetchStats(); setSelectedMember(null); }
      else { const err = await res.json(); toast.error(err.detail || 'Delete failed'); }
    } catch (e) { toast.error('Delete failed'); }
  };

  const openEdit = (member) => {
    setEditMember(member);
    setForm({
      email: member.email, full_name: member.full_name, phone: member.phone || '',
      role: member.role, member_type: member.member_type, department: member.department || 'collections',
      password: '', photo_url: member.photo_url || '', title: member.title || '',
      location: member.location || '', hire_date: member.hire_date?.split('T')[0] || '',
      birthday: member.birthday?.split('T')[0] || '', bio: member.bio || '',
      linkedin_url: member.linkedin_url || '',
      emergency_contact_name: member.emergency_contact_name || '',
      emergency_contact_phone: member.emergency_contact_phone || '',
      emergency_contact_relation: member.emergency_contact_relation || '',
      skills: member.skills || [],
      reports_to: member.reports_to || ''
    });
    setShowModal(true);
  };

  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm({ ...form, skills: [...form.skills, skillInput.trim()] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => setForm({ ...form, skills: form.skills.filter(s => s !== skill) });

  // ==================== PROFILE VIEW ====================
  if (selectedMember) {
    return (
      <EmployeeProfile
        member={selectedMember}
        onBack={() => setSelectedMember(null)}
        onEdit={openEdit}
      />
    );
  }

  // ==================== DIRECTORY VIEW ====================
  return (
    <div className="space-y-6" data-testid="employee-directory">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('team.title')}</h1>
          <p className="text-gray-500">{t('team.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} data-testid="grid-view-btn" title="Grid">
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} data-testid="list-view-btn" title="List">
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('org')} className={`p-2 ${viewMode === 'org' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`} data-testid="org-chart-btn" title={t('team.org_chart')}>
              <Network className="w-4 h-4" />
            </button>
          </div>
          <Button variant="outline" onClick={() => { fetchMembers(); fetchStats(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />Refresh
          </Button>
          <Button onClick={() => { setEditMember(null); resetForm(); setShowModal(true); }} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="add-employee-btn">
            <UserPlus className="w-4 h-4 mr-2" />Add Employee
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-blue-100 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold">{stats.total_members}</p><p className="text-xs text-gray-500">Total Members</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-green-100 rounded-lg"><Shield className="w-5 h-5 text-green-600" /></div><div><p className="text-2xl font-bold">{stats.by_type?.employee || 0}</p><p className="text-xs text-gray-500">Employees</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-orange-100 rounded-lg"><Building2 className="w-5 h-5 text-orange-600" /></div><div><p className="text-2xl font-bold">{stats.by_type?.contractor || 0}</p><p className="text-xs text-gray-500">Contractors</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center gap-3"><div className="p-2 bg-purple-100 rounded-lg"><Briefcase className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold">{Object.entries(stats.by_department || {}).length}</p><p className="text-xs text-gray-500">Departments</p></div></div></CardContent></Card>
      </div>

      {/* Department chips */}
      {Object.keys(stats.by_department || {}).length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setDeptFilter('')} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${!deptFilter ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} data-testid="dept-filter-all">
            All ({stats.total_members})
          </button>
          {Object.entries(stats.by_department).sort((a,b) => b[1]-a[1]).map(([dept, count]) => (
            <button key={dept} onClick={() => setDeptFilter(deptFilter === dept ? '' : dept)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${deptFilter === dept ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} data-testid={`dept-filter-${dept}`}>
              {dept} ({count})
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" data-testid="search-employees" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-10 px-3 border rounded-md text-sm" data-testid="role-filter">
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-10 px-3 border rounded-md text-sm" data-testid="type-filter">
          <option value="">All Types</option>
          {MEMBER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array(8).fill(0).map((_, i) => <div key={i} className="bg-white rounded-xl border p-5 animate-pulse"><div className="w-16 h-16 bg-gray-200 rounded-xl mx-auto mb-3" /><div className="h-4 bg-gray-200 rounded mx-auto mb-2 w-24" /><div className="h-3 bg-gray-100 rounded mx-auto w-32" /></div>)
          ) : members.length === 0 ? (
            <div className="col-span-full text-center py-16 text-gray-400"><Users className="w-16 h-16 mx-auto mb-3 opacity-30" /><p>No employees found</p></div>
          ) : members.map(member => (
            <Card key={member.id} className="hover:shadow-md transition-shadow cursor-pointer group" onClick={() => setSelectedMember(member)} data-testid={`employee-card-${member.id}`}>
              <CardContent className="p-5 text-center relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); openEdit(member); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit className="w-3.5 h-3.5 text-gray-400" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(member); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                </div>
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.full_name} className="w-16 h-16 rounded-xl mx-auto mb-3 object-cover border" />
                ) : (
                  <div className="w-16 h-16 rounded-xl mx-auto mb-3 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xl font-bold text-gray-400">
                    {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                )}
                <h3 className="font-semibold text-gray-900 text-sm">{member.full_name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{member.title || member.role_name || member.role}</p>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <span className={`w-2 h-2 rounded-full ${DEPT_COLORS[member.department] || 'bg-gray-400'}`} />
                  <span className="text-xs text-gray-400 capitalize">{member.department}</span>
                </div>
                {member.hire_date && <p className="text-xs text-gray-300 mt-1">{getTenure(member.hire_date)}</p>}
                <ChevronRight className="w-4 h-4 text-gray-300 mx-auto mt-2 group-hover:text-blue-400 transition-colors" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Employee</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Department</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tenure</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                ) : members.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-gray-400">No employees found</td></tr>
                ) : members.map(member => (
                  <tr key={member.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedMember(member)} data-testid={`employee-row-${member.id}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img src={member.photo_url} alt={member.full_name} className="w-9 h-9 rounded-lg object-cover border" />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-500">{member.full_name?.charAt(0)?.toUpperCase()}</div>
                        )}
                        <div>
                          <p className="font-medium text-sm">{member.full_name}</p>
                          <p className="text-xs text-gray-400">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(member.role)}</td>
                    <td className="px-4 py-3"><span className="capitalize text-sm">{member.department}</span></td>
                    <td className="px-4 py-3"><Badge variant="outline" className="capitalize text-xs">{member.member_type}</Badge></td>
                    <td className="px-4 py-3"><Badge className={member.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}>{member.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-gray-500">{getTenure(member.hire_date) || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); openEdit(member); }}><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(member); }}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Org Chart View */}
      {viewMode === 'org' && (
        <Card>
          <CardContent className="p-6">
            <OrgChart members={members} onSelectMember={setSelectedMember} />
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editMember ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Photo */}
            <div>
              <Label className="flex items-center gap-2"><Image className="w-4 h-4" /> Profile Photo</Label>
              <div className="mt-2"><ImageUpload value={form.photo_url} onChange={(url) => setForm({...form, photo_url: url})} label="Upload profile photo" maxSizeMB={2} /></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div><Label>Full Name *</Label><Input value={form.full_name} onChange={(e) => setForm({...form, full_name: e.target.value})} required className="mt-1" data-testid="form-full-name" /></div>
              <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} required disabled={!!editMember} className="mt-1" data-testid="form-email" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Job Title</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="e.g. Senior Collections Agent" className="mt-1" data-testid="form-title" /></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="mt-1" data-testid="form-phone" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Role *</Label><select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md" data-testid="form-role">{ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></div>
              <div><Label>Department</Label><select value={form.department} onChange={(e) => setForm({...form, department: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md" data-testid="form-department">{DEPARTMENTS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}</select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Member Type</Label><select value={form.member_type} onChange={(e) => setForm({...form, member_type: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md" data-testid="form-type">{MEMBER_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}</select></div>
              <div><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} placeholder="City, State" className="mt-1" data-testid="form-location" /></div>
            </div>
            <div>
              <Label>Reports To</Label>
              <select value={form.reports_to} onChange={(e) => setForm({...form, reports_to: e.target.value})} className="w-full h-10 mt-1 px-3 border rounded-md text-sm" data-testid="form-reports-to">
                <option value="">No one (top level)</option>
                {members.filter(m => !editMember || m.id !== editMember.id).map(m => (
                  <option key={m.id} value={m.id}>{m.full_name} - {m.role_name || m.role} ({m.department})</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Hire Date</Label><Input type="date" value={form.hire_date} onChange={(e) => setForm({...form, hire_date: e.target.value})} className="mt-1" data-testid="form-hire-date" /></div>
              <div><Label>Birthday</Label><Input type="date" value={form.birthday} onChange={(e) => setForm({...form, birthday: e.target.value})} className="mt-1" data-testid="form-birthday" /></div>
            </div>
            <div><Label>LinkedIn URL</Label><Input value={form.linkedin_url} onChange={(e) => setForm({...form, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/..." className="mt-1" data-testid="form-linkedin" /></div>
            <div><Label>Bio</Label><Textarea value={form.bio} onChange={(e) => setForm({...form, bio: e.target.value})} rows={3} placeholder="Brief bio or description..." className="mt-1" data-testid="form-bio" /></div>

            {/* Skills */}
            <div>
              <Label className="flex items-center gap-2"><Tag className="w-4 h-4" /> Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}} placeholder="Add a skill and press Enter" data-testid="form-skill-input" />
                <Button type="button" variant="outline" onClick={addSkill}>Add</Button>
              </div>
              {form.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1 bg-blue-50">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)}><X className="w-3 h-3 text-gray-400 hover:text-red-500" /></button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Emergency Contact */}
            <div className="border-t pt-4">
              <Label className="flex items-center gap-2 mb-3"><Heart className="w-4 h-4 text-red-400" /> Emergency Contact</Label>
              <div className="grid grid-cols-3 gap-3">
                <Input value={form.emergency_contact_name} onChange={(e) => setForm({...form, emergency_contact_name: e.target.value})} placeholder="Name" data-testid="form-ec-name" />
                <Input value={form.emergency_contact_phone} onChange={(e) => setForm({...form, emergency_contact_phone: e.target.value})} placeholder="Phone" data-testid="form-ec-phone" />
                <Input value={form.emergency_contact_relation} onChange={(e) => setForm({...form, emergency_contact_relation: e.target.value})} placeholder="Relation" data-testid="form-ec-relation" />
              </div>
            </div>

            {!editMember && (
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} placeholder="Leave blank to set later" className="mt-1" /></div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="submit-employee-form">{editMember ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
