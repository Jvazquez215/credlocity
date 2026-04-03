import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { toast } from 'sonner';
import { useAuth } from '../../../context/AuthContext';
import {
  GraduationCap, Users, BookOpen, Award, Clock, CheckCircle, XCircle,
  Plus, Loader2, Search, Eye, Trash2, Edit, ShieldCheck, AlertCircle,
  BarChart3, UserPlus, Copy, FileText, ChevronDown, ChevronUp,
  Video, CreditCard, Calendar, ExternalLink, DollarSign
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const getToken = () => localStorage.getItem('auth_token');

/* ============================== MAIN COMPONENT ============================== */
export default function SchoolManagement() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isTeacher = user?.role === 'guest_teacher';

  const tabs = isAdmin
    ? [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'courses', label: 'All Courses', icon: BookOpen },
        { id: 'pending', label: 'Pending Approval', icon: AlertCircle },
        { id: 'live-classes', label: 'Live Classes', icon: Video },
        { id: 'payment-plans', label: 'Payment Plans', icon: CreditCard },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'teachers', label: 'Guest Teachers', icon: GraduationCap },
      ]
    : [
        { id: 'my-courses', label: 'My Courses', icon: BookOpen },
        { id: 'create', label: 'Create Course', icon: Plus },
        { id: 'my-live-classes', label: 'Live Classes', icon: Video },
        { id: 'badge', label: 'Teacher Badge', icon: Award },
      ];

  return (
    <div className="space-y-6" data-testid="school-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">School Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isAdmin ? 'Manage courses, students, and guest teachers' : 'Create and manage your courses'}
          </p>
        </div>
        {isAdmin && (
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setTab('create-course')} data-testid="create-course-btn">
            <Plus className="w-4 h-4 mr-1" /> New Course
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            data-testid={`tab-${t.id}`}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              tab === t.id
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview' && isAdmin && <OverviewTab />}
      {tab === 'courses' && isAdmin && <CoursesTab onEdit={(id) => setTab(`edit-${id}`)} />}
      {tab === 'pending' && isAdmin && <PendingTab />}
      {tab === 'students' && isAdmin && <StudentsTab />}
      {tab === 'teachers' && isAdmin && <TeachersTab />}
      {tab === 'live-classes' && isAdmin && <LiveClassesTab />}
      {tab === 'payment-plans' && isAdmin && <PaymentPlansTab />}
      {tab === 'create-course' && isAdmin && <CourseForm onDone={() => setTab('courses')} />}
      {tab.startsWith('edit-') && !tab.startsWith('edit-teacher-') && isAdmin && <CourseForm courseId={tab.replace('edit-', '')} onDone={() => setTab('courses')} />}

      {/* Guest teacher views */}
      {tab === 'my-courses' && isTeacher && <MyCoursesTab onEdit={(id) => setTab(`edit-teacher-${id}`)} />}
      {tab === 'create' && isTeacher && <CourseForm onDone={() => setTab('my-courses')} />}
      {tab.startsWith('edit-teacher-') && isTeacher && <CourseForm courseId={tab.replace('edit-teacher-', '')} onDone={() => setTab('my-courses')} />}
      {tab === 'my-live-classes' && isTeacher && <LiveClassesTab />}
      {tab === 'badge' && isTeacher && <TeacherBadgeTab />}
    </div>
  );
}

/* ============================== OVERVIEW TAB ============================== */
function OverviewTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/school/admin/stats`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setStats(d.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  const cards = [
    { label: 'Total Students', value: stats?.total_students || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Enrollments', value: stats?.total_enrollments || 0, icon: BookOpen, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Certificates Issued', value: stats?.total_certificates || 0, icon: Award, color: 'bg-amber-50 text-amber-600' },
    { label: 'Completion Rate', value: `${stats?.completion_rate || 0}%`, icon: CheckCircle, color: 'bg-violet-50 text-violet-600' },
    { label: 'Pending Courses', value: stats?.pending_courses || 0, icon: AlertCircle, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" data-testid="school-overview">
      {cards.map(c => (
        <Card key={c.label} className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                <p className="text-xs text-slate-500">{c.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ============================== COURSES TAB (ADMIN) ============================== */
function CoursesTab({ onEdit }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCourses = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/school/admin/courses`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and all its data? This cannot be undone.')) return;
    const res = await fetch(`${API}/api/school/admin/courses/${id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.ok) { toast.success('Course deleted'); fetchCourses(); }
    else toast.error('Failed to delete');
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  const statusColors = {
    published: 'bg-green-100 text-green-700',
    pending_approval: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="space-y-4" data-testid="courses-tab">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="search-courses" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : filtered.length === 0 ? (
        <p className="text-center text-slate-500 py-8">No courses found</p>
      ) : (
        <div className="space-y-3">
          {filtered.map(c => (
            <Card key={c.id} className="border-slate-200 hover:border-slate-300 transition" data-testid={`course-row-${c.id}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c.badge_accent || '#c6a035'}20` }}>
                    <BookOpen className="w-5 h-5" style={{ color: c.badge_accent || '#c6a035' }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <Badge className={`text-[10px] ${statusColors[c.status] || statusColors.draft}`}>
                        {c.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{c.short_name}</span>
                      <span>{c.total_questions || 0} questions</span>
                      <span>{c.passing_score}% to pass</span>
                      {c.created_by_name && <span>by {c.created_by_name}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(c.id)} data-testid={`edit-course-${c.id}`}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c.id)} data-testid={`delete-course-${c.id}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== PENDING TAB (ADMIN) ============================== */
function PendingTab() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/school/admin/pending-courses`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleApprove = async (id) => {
    const res = await fetch(`${API}/api/school/admin/courses/${id}/approve`, {
      method: 'PUT', headers: { Authorization: `Bearer ${getToken()}` }
    });
    if (res.ok) { toast.success('Course approved and published!'); fetchPending(); }
    else toast.error('Failed to approve');
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):');
    if (reason === null) return;
    const res = await fetch(`${API}/api/school/admin/courses/${id}/reject`, {
      method: 'PUT', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) { toast.success('Course rejected'); fetchPending(); }
    else toast.error('Failed to reject');
  };

  return (
    <div className="space-y-4" data-testid="pending-tab">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : courses.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No pending courses</p>
            <p className="text-sm text-slate-500">All submissions have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        courses.map(c => (
          <Card key={c.id} className="border-amber-200 bg-amber-50/30" data-testid={`pending-course-${c.id}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 text-lg">{c.title}</p>
                    <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{c.description?.slice(0, 200)}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>By: <strong>{c.created_by_name || 'Unknown'}</strong></span>
                    <span>{(c.lessons || []).length} lessons</span>
                    <span>{c.total_questions || 0} quiz questions</span>
                    <span>{c.passing_score}% to pass</span>
                    <span>Submitted: {c.created_at?.slice(0, 10)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button className="bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => handleApprove(c.id)} data-testid={`approve-${c.id}`}>
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleReject(c.id)} data-testid={`reject-${c.id}`}>
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/* ============================== STUDENTS TAB ============================== */
function StudentsTab() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/school/admin/students`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setStudents(d.students || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const viewStudent = async (studentId) => {
    setSelectedStudent(studentId);
    setDetailLoading(true);
    try {
      const res = await fetch(`${API}/api/school/admin/students/${studentId}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      const data = await res.json();
      setDetail(data);
    } catch { toast.error('Failed to load'); }
    finally { setDetailLoading(false); }
  };

  const filtered = students.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (selectedStudent && detail) {
    return <StudentDetailView detail={detail} onBack={() => { setSelectedStudent(null); setDetail(null); }} />;
  }

  return (
    <div className="space-y-4" data-testid="students-tab">
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="search-students" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left p-3 font-medium text-slate-600">Name</th>
                <th className="text-left p-3 font-medium text-slate-600">Email</th>
                <th className="text-left p-3 font-medium text-slate-600">Company</th>
                <th className="text-left p-3 font-medium text-slate-600">Courses</th>
                <th className="text-left p-3 font-medium text-slate-600">Certs</th>
                <th className="text-left p-3 font-medium text-slate-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b last:border-0 hover:bg-indigo-50 cursor-pointer transition"
                    onClick={() => viewStudent(s.id)} data-testid={`student-row-${s.id}`}>
                  <td className="p-3 font-medium text-indigo-600 hover:text-indigo-800">{s.full_name}</td>
                  <td className="p-3 text-slate-600">{s.email}</td>
                  <td className="p-3 text-slate-600">{s.company_name || '-'}</td>
                  <td className="p-3">{(s.enrolled_courses || []).length}</td>
                  <td className="p-3">{(s.certificates || []).length}</td>
                  <td className="p-3 text-slate-500">{s.created_at?.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-slate-500">No students found</p>}
        </div>
      )}
      {detailLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      )}
    </div>
  );
}

/* ============================== STUDENT DETAIL VIEW ============================== */
function StudentDetailView({ detail, onBack }) {
  const { student, enrollments, certificates, payment_plans, registered_classes, missed_classes, upcoming_classes, quiz_attempts, badge_tracking, login_history, stats } = detail;

  const StatBox = ({ label, value, color = 'bg-slate-100 text-slate-700' }) => (
    <div className={`rounded-lg px-3 py-2 text-center ${color}`}>
      <p className="text-lg font-bold">{value}</p>
      <p className="text-[10px] text-slate-500">{label}</p>
    </div>
  );

  return (
    <div className="space-y-5" data-testid="student-detail">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Students</button>
        <h2 className="text-xl font-bold text-slate-900">{student?.full_name}</h2>
        <Badge className="bg-indigo-100 text-indigo-700">{student?.email}</Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        <StatBox label="Logins" value={stats?.total_logins || 0} color="bg-blue-50 text-blue-700" />
        <StatBox label="Enrolled" value={stats?.courses_enrolled || 0} color="bg-emerald-50 text-emerald-700" />
        <StatBox label="Completed" value={stats?.courses_completed || 0} color="bg-green-50 text-green-700" />
        <StatBox label="Certificates" value={stats?.certificates_earned || 0} color="bg-amber-50 text-amber-700" />
        <StatBox label="Classes" value={stats?.classes_registered || 0} color="bg-violet-50 text-violet-700" />
        <StatBox label="Missed" value={stats?.classes_missed || 0} color="bg-red-50 text-red-700" />
        <StatBox label="Plans" value={stats?.payment_plans_active || 0} color="bg-cyan-50 text-cyan-700" />
        <StatBox label="Badges" value={stats?.badges_shared || 0} color="bg-orange-50 text-orange-700" />
      </div>

      {/* Profile info */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-sm">Profile</CardTitle></CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3 text-sm">
            <div><span className="text-slate-500">Company:</span> <strong>{student?.company_name || '-'}</strong></div>
            <div><span className="text-slate-500">Phone:</span> <strong>{student?.phone || '-'}</strong></div>
            <div><span className="text-slate-500">Joined:</span> <strong>{student?.created_at?.slice(0, 10)}</strong></div>
            <div><span className="text-slate-500">Last Login:</span> <strong>{student?.last_login?.slice(0, 16)?.replace('T', ' ') || 'Never'}</strong></div>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-sm">Login History (Last 20)</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(login_history || []).slice(-20).reverse().map((l, i) => (
              <Badge key={i} className="bg-slate-100 text-slate-600 text-[10px]">
                {l.timestamp?.slice(0, 16)?.replace('T', ' ')}
              </Badge>
            ))}
            {(!login_history || login_history.length === 0) && <p className="text-xs text-slate-400">No login history</p>}
          </div>
        </CardContent>
      </Card>

      {/* Enrollments */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-sm">Course Enrollments</CardTitle></CardHeader>
        <CardContent>
          {enrollments?.length > 0 ? (
            <div className="space-y-2">
              {enrollments.map((e, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">{e.course_title}</span>
                    <Badge className="text-[10px] bg-slate-100">{e.course_short_name}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">{e.enrolled_at?.slice(0, 10)}</span>
                    {e.completed_at ? <Badge className="bg-green-100 text-green-700 text-[10px]">Completed</Badge> : <Badge className="bg-amber-100 text-amber-700 text-[10px]">In Progress</Badge>}
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-xs text-slate-400">No enrollments</p>}
        </CardContent>
      </Card>

      {/* Registered Classes */}
      {(registered_classes || []).length > 0 && (
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm">Live Classes ({registered_classes.length} registered, {missed_classes?.length || 0} missed)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {registered_classes.map((c, i) => {
                const isMissed = missed_classes?.some(m => m.id === c.id);
                return (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg text-sm ${isMissed ? 'bg-red-50' : 'bg-slate-50'}`}>
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-violet-500" />
                      <span className="font-medium">{c.title}</span>
                      <Badge className={c.platform === 'zoom' ? 'text-[10px] bg-blue-100 text-blue-700' : 'text-[10px] bg-green-100 text-green-700'}>
                        {c.platform === 'zoom' ? 'Zoom' : 'Meet'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{c.scheduled_at?.slice(0, 16)?.replace('T', ' ')}</span>
                      {isMissed && <Badge className="bg-red-100 text-red-700 text-[10px]">Missed</Badge>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Certificates */}
      {certificates?.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm">Certificates Earned</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {certificates.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span className="font-medium">{c.course_title || c.course_short_name}</span>
                    <span className="text-xs text-slate-500">Score: {c.score}%</span>
                  </div>
                  <span className="text-xs text-slate-500">{c.issued_at?.slice(0, 10)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Plans */}
      {payment_plans?.length > 0 && (
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm">Payment Plans</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payment_plans.map((p, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-lg text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{p.course_title}</span>
                    <Badge className={p.status === 'completed' ? 'bg-green-100 text-green-700' : p.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}>{p.status}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Total: ${p.plan_amount?.toFixed(2)}</span>
                    <span>Paid: ${p.amount_paid?.toFixed(2)}</span>
                    <span>Remaining: ${p.amount_remaining?.toFixed(2)}</span>
                    <span>{p.payments_made}/{p.num_payments} payments</span>
                  </div>
                  {(p.payments || []).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p className="text-[10px] text-slate-400 mb-1">Payment History</p>
                      {p.payments.map((pay, pi) => (
                        <div key={pi} className="flex justify-between text-xs py-0.5">
                          <span>${pay.amount?.toFixed(2)}</span>
                          <span className="text-slate-400">{pay.payment_date?.slice(0, 10)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badge Tracking */}
      {(badge_tracking || []).length > 0 && (
        <Card className="border-slate-200">
          <CardHeader><CardTitle className="text-sm">Trust Badge Usage ({badge_tracking.length} actions)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-1">
              {badge_tracking.map((b, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded">
                  <span className="font-medium capitalize">{b.action}</span>
                  {b.website_url && <span className="text-indigo-600">{b.website_url}</span>}
                  <span className="text-slate-400">{b.timestamp?.slice(0, 16)?.replace('T', ' ')}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ============================== TEACHERS TAB (ADMIN) ============================== */
function TeachersTab() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', password: '', bio: '', specialization: '' });
  const [creating, setCreating] = useState(false);

  const fetchTeachers = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/school/admin/teachers`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setTeachers(d.teachers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(`${API}/api/school/admin/teachers`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Guest teacher account created');
        setForm({ full_name: '', email: '', password: '', bio: '', specialization: '' });
        setShowCreate(false);
        fetchTeachers();
      } else {
        toast.error(data.detail || 'Failed to create');
      }
    } catch { toast.error('Connection error'); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-4" data-testid="teachers-tab">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{teachers.length} guest teacher(s)</p>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="invite-teacher-btn">
          <UserPlus className="w-4 h-4 mr-1" /> Invite Teacher
        </Button>
      </div>

      {showCreate && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Create Guest Teacher Account</h3>
            <form onSubmit={handleCreate} className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Full Name *" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required data-testid="teacher-name" />
              <Input type="email" placeholder="Email *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required data-testid="teacher-email" />
              <Input type="password" placeholder="Password *" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required data-testid="teacher-password" />
              <Input placeholder="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} data-testid="teacher-specialization" />
              <div className="sm:col-span-2">
                <Input placeholder="Short bio" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} data-testid="teacher-bio" />
              </div>
              <div className="sm:col-span-2 flex gap-2">
                <Button type="submit" disabled={creating} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="create-teacher-submit">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : teachers.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No guest teachers yet. Invite one above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {teachers.map(t => (
            <Card key={t.id} className="border-slate-200" data-testid={`teacher-row-${t.id}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-700">{t.full_name?.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{t.full_name}</p>
                    <p className="text-xs text-slate-500">{t.email} {t.specialization && `- ${t.specialization}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Badge className="bg-green-100 text-green-700">{t.published_courses || 0} published</Badge>
                  <Badge className="bg-amber-100 text-amber-700">{t.pending_courses || 0} pending</Badge>
                  <Badge className="bg-slate-100 text-slate-600">{t.total_courses || 0} total</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== COURSE FORM ============================== */
function CourseForm({ courseId, onDone }) {
  const [form, setForm] = useState({
    title: '', description: '', short_name: '', duration: 'Self-paced',
    is_free: true, passing_score: 80, badge_color: '#1a365d', badge_accent: '#c6a035',
    lessons: [], quiz: { questions: [], passing_score: 80 }
  });
  const [loading, setLoading] = useState(!!courseId);
  const [saving, setSaving] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetch(`${API}/api/school/admin/courses`, { headers: { Authorization: `Bearer ${getToken()}` } })
        .then(r => r.json()).then(d => {
          const c = (d.courses || []).find(x => x.id === courseId);
          if (c) setForm({
            title: c.title || '', description: c.description || '', short_name: c.short_name || '',
            duration: c.duration || 'Self-paced', is_free: c.is_free !== false, passing_score: c.passing_score || 80,
            badge_color: c.badge_color || '#1a365d', badge_accent: c.badge_accent || '#c6a035',
            lessons: c.lessons || [], quiz: c.quiz || { questions: [], passing_score: 80 }
          });
        }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [courseId]);

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Course title required'); return; }
    setSaving(true);
    try {
      const url = courseId ? `${API}/api/school/admin/courses/${courseId}` : `${API}/api/school/admin/courses`;
      const method = courseId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quiz: { ...form.quiz, passing_score: form.passing_score } })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Saved');
        onDone();
      } else {
        toast.error(data.detail || 'Failed');
      }
    } catch { toast.error('Connection error'); }
    finally { setSaving(false); }
  };

  const addLesson = (lesson) => {
    setForm(prev => ({ ...prev, lessons: [...prev.lessons, { title: lesson.title, content: lesson.content }] }));
    setShowLessonForm(false);
  };

  const removeLesson = (idx) => {
    setForm(prev => ({ ...prev, lessons: prev.lessons.filter((_, i) => i !== idx) }));
  };

  const addQuestion = (q) => {
    const question = {
      id: `q${Date.now()}`,
      question: q.question,
      options: q.options,
      correct_answer: parseInt(q.correct_answer),
      explanation: q.explanation || ''
    };
    setForm(prev => ({
      ...prev,
      quiz: { ...prev.quiz, questions: [...prev.quiz.questions, question] }
    }));
    setShowQuizForm(false);
  };

  const removeQuestion = (idx) => {
    setForm(prev => ({
      ...prev,
      quiz: { ...prev.quiz, questions: prev.quiz.questions.filter((_, i) => i !== idx) }
    }));
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  return (
    <div className="space-y-6 max-w-3xl" data-testid="course-form">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">{courseId ? 'Edit Course' : 'Create New Course'}</h2>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>

      {/* Basic Info */}
      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Course Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="course-title-input" />
          <textarea className="w-full rounded-md border border-slate-200 p-3 text-sm min-h-[80px]" placeholder="Course Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} data-testid="course-desc-input" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input placeholder="Short Name (e.g. CROA)" value={form.short_name} onChange={e => setForm({ ...form, short_name: e.target.value })} data-testid="course-short-name" />
            <Input placeholder="Duration" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
            <Input type="number" placeholder="Pass %" value={form.passing_score} onChange={e => setForm({ ...form, passing_score: parseInt(e.target.value) || 80 })} data-testid="course-pass-score" />
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_free} onChange={e => setForm({ ...form, is_free: e.target.checked })} id="is-free" />
              <label htmlFor="is-free" className="text-sm text-slate-600">Free Course</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 block mb-1">Badge Color</label>
              <input type="color" value={form.badge_color} onChange={e => setForm({ ...form, badge_color: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1">Badge Accent</label>
              <input type="color" value={form.badge_accent} onChange={e => setForm({ ...form, badge_accent: e.target.value })} className="w-10 h-10 rounded cursor-pointer" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lessons */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Lessons ({form.lessons.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowLessonForm(true)} data-testid="add-lesson-btn">
              <Plus className="w-3 h-3 mr-1" /> Add Lesson
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.lessons.map((l, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg" data-testid={`lesson-${i}`}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-6">{i + 1}.</span>
                <span className="text-sm font-medium text-slate-700">{l.title}</span>
                <span className="text-xs text-slate-400">{l.content?.length || 0} chars</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeLesson(i)} className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
          {form.lessons.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No lessons yet</p>}

          {showLessonForm && <LessonFormInline onAdd={addLesson} onCancel={() => setShowLessonForm(false)} />}
        </CardContent>
      </Card>

      {/* Quiz */}
      <Card className="border-slate-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Quiz Questions ({form.quiz.questions.length})</CardTitle>
            <Button size="sm" variant="outline" onClick={() => setShowQuizForm(true)} data-testid="add-question-btn">
              <Plus className="w-3 h-3 mr-1" /> Add Question
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {form.quiz.questions.map((q, i) => (
            <div key={i} className="flex items-start justify-between p-3 bg-slate-50 rounded-lg" data-testid={`question-${i}`}>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">Q{i + 1}: {q.question}</p>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {q.options?.map((opt, oi) => (
                    <span key={oi} className={`text-xs px-2 py-0.5 rounded ${oi === q.correct_answer ? 'bg-green-100 text-green-700 font-semibold' : 'bg-slate-100 text-slate-500'}`}>
                      {String.fromCharCode(65 + oi)}. {opt}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeQuestion(i)} className="text-red-500"><Trash2 className="w-3 h-3" /></Button>
            </div>
          ))}
          {form.quiz.questions.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No questions yet</p>}

          {showQuizForm && <QuestionFormInline onAdd={addQuestion} onCancel={() => setShowQuizForm(false)} />}
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex gap-3">
        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8" onClick={handleSave} disabled={saving} data-testid="save-course-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
          {courseId ? 'Update Course' : 'Create Course'}
        </Button>
        <Button variant="outline" onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}

/* ============================== INLINE FORMS ============================== */
function LessonFormInline({ onAdd, onCancel }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/30 space-y-3" data-testid="lesson-form">
      <Input placeholder="Lesson Title *" value={title} onChange={e => setTitle(e.target.value)} data-testid="lesson-title-input" />
      <textarea className="w-full rounded-md border border-slate-200 p-3 text-sm min-h-[120px]" placeholder="Lesson Content (Markdown supported)" value={content} onChange={e => setContent(e.target.value)} data-testid="lesson-content-input" />
      <div className="flex gap-2">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { if (title.trim()) onAdd({ title, content }); }} data-testid="save-lesson-btn">Add Lesson</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

function QuestionFormInline({ onAdd, onCancel }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState('');

  const updateOption = (idx, val) => {
    const newOpts = [...options];
    newOpts[idx] = val;
    setOptions(newOpts);
  };

  return (
    <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/30 space-y-3" data-testid="question-form">
      <Input placeholder="Question *" value={question} onChange={e => setQuestion(e.target.value)} data-testid="question-text-input" />
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input type="radio" name="correct" checked={correctAnswer === i} onChange={() => setCorrectAnswer(i)} />
          <Input placeholder={`Option ${String.fromCharCode(65 + i)}`} value={opt} onChange={e => updateOption(i, e.target.value)} data-testid={`option-${i}-input`} />
        </div>
      ))}
      <Input placeholder="Explanation (shown after answer)" value={explanation} onChange={e => setExplanation(e.target.value)} data-testid="explanation-input" />
      <p className="text-xs text-slate-500">Select the radio button next to the correct answer</p>
      <div className="flex gap-2">
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => {
          if (question.trim() && options.every(o => o.trim())) onAdd({ question, options, correct_answer: correctAnswer, explanation });
          else toast.error('Fill all fields');
        }} data-testid="save-question-btn">Add Question</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

/* ============================== MY COURSES (GUEST TEACHER) ============================== */
function MyCoursesTab({ onEdit }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/school/admin/my-courses`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = {
    published: 'bg-green-100 text-green-700',
    pending_approval: 'bg-amber-100 text-amber-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4" data-testid="my-courses-tab">
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : courses.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No courses yet</p>
            <p className="text-sm text-slate-500">Create your first course to get started</p>
          </CardContent>
        </Card>
      ) : (
        courses.map(c => (
          <Card key={c.id} className="border-slate-200" data-testid={`my-course-${c.id}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{c.title}</p>
                  <Badge className={`text-[10px] ${statusColors[c.status] || 'bg-slate-100 text-slate-600'}`}>
                    {c.status?.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{(c.lessons || []).length} lessons</span>
                  <span>{c.total_questions || 0} questions</span>
                  <span>Created {c.created_at?.slice(0, 10)}</span>
                </div>
                {c.rejection_reason && (
                  <p className="text-xs text-red-500 mt-1">Rejected: {c.rejection_reason}</p>
                )}
              </div>
              {(c.status === 'pending_approval' || c.status === 'rejected') && (
                <Button variant="outline" size="sm" onClick={() => onEdit(c.id)}>
                  <Edit className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

/* ============================== TEACHER BADGE TAB ============================== */
function TeacherBadgeTab() {
  const [badge, setBadge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/school/admin/teacher-badge`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : null).then(d => { if (d) setBadge(d); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const copyBadge = () => {
    navigator.clipboard.writeText(badge.badge_html);
    setCopied(true);
    toast.success('Badge HTML copied!');
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  if (!badge) return (
    <Card className="border-slate-200">
      <CardContent className="p-8 text-center">
        <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="font-semibold text-slate-700">No Teacher Badge Yet</p>
        <p className="text-sm text-slate-500">You need at least one approved/published course to earn your Teacher Trust Badge</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-2xl" data-testid="teacher-badge-tab">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-500" /> Your Teacher Trust Badge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center p-6 bg-white rounded-xl border border-slate-100">
            <div dangerouslySetInnerHTML={{ __html: badge.badge_html }} />
          </div>
          <p className="text-sm text-slate-600 text-center">{badge.approved_courses} published course(s)</p>
          <div className="relative">
            <pre className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-600 overflow-x-auto max-h-40" data-testid="teacher-badge-html">
              {badge.badge_html}
            </pre>
            <Button size="sm" onClick={copyBadge} className={`absolute top-2 right-2 ${copied ? 'bg-green-600 text-white' : ''}`} variant={copied ? 'default' : 'outline'} data-testid="copy-teacher-badge">
              {copied ? <><CheckCircle className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy HTML</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


/* ============================== LIVE CLASSES TAB ============================== */
function LiveClassesTab() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', platform: 'zoom', meeting_link: '', meeting_id: '',
    meeting_passcode: '', scheduled_at: '', duration_minutes: 60, max_attendees: 100,
    course_id: '', is_free: true, price: 0
  });
  const [saving, setSaving] = useState(false);
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const fetchClasses = useCallback(() => {
    setLoading(true);
    fetch(`${API}/api/school/admin/live-classes`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setClasses(d.live_classes || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.scheduled_at) { toast.error('Title and scheduled date required'); return; }
    if (!form.meeting_link.trim()) { toast.error('Meeting link is required'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API}/api/school/admin/live-classes`, {
        method: 'POST', headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) { toast.success(data.message); setShowForm(false); setForm({ title: '', description: '', platform: 'zoom', meeting_link: '', meeting_id: '', meeting_passcode: '', scheduled_at: '', duration_minutes: 60, max_attendees: 100, course_id: '', is_free: true, price: 0 }); fetchClasses(); }
      else toast.error(data.detail || 'Failed');
    } catch { toast.error('Connection error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this live class?')) return;
    const res = await fetch(`${API}/api/school/admin/live-classes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) { toast.success('Deleted'); fetchClasses(); }
  };

  const platformLabel = (p) => p === 'zoom' ? 'Zoom' : 'Google Meet';
  const platformColor = (p) => p === 'zoom' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700';

  return (
    <div className="space-y-4" data-testid="live-classes-tab">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{classes.length} live class(es)</p>
        <Button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 hover:bg-indigo-700 text-white" data-testid="create-live-class-btn">
          <Video className="w-4 h-4 mr-1" /> Schedule Live Class
        </Button>
      </div>

      {showForm && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="p-5 space-y-3">
            <h3 className="font-semibold text-slate-900">Schedule Live Video Class</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Class Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="live-class-title" />
              <select className="rounded-md border border-slate-200 p-2 text-sm" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })} data-testid="live-class-platform">
                <option value="zoom">Zoom</option>
                <option value="google_meet">Google Meet</option>
              </select>
              <Input placeholder="Meeting Link *" value={form.meeting_link} onChange={e => setForm({ ...form, meeting_link: e.target.value })} data-testid="live-class-link" />
              <Input placeholder="Meeting ID (optional)" value={form.meeting_id} onChange={e => setForm({ ...form, meeting_id: e.target.value })} />
              <Input placeholder="Meeting Passcode (optional)" value={form.meeting_passcode} onChange={e => setForm({ ...form, meeting_passcode: e.target.value })} />
              <Input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({ ...form, scheduled_at: e.target.value })} data-testid="live-class-date" />
              <Input type="number" placeholder="Duration (min)" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
              <Input type="number" placeholder="Max Attendees" value={form.max_attendees} onChange={e => setForm({ ...form, max_attendees: parseInt(e.target.value) || 100 })} />
            </div>
            <textarea className="w-full rounded-md border border-slate-200 p-3 text-sm min-h-[60px]" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <div className="flex gap-2">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleCreate} disabled={saving} data-testid="save-live-class-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Schedule Class'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : classes.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No live classes scheduled</p>
            <p className="text-sm text-slate-500">Schedule your first live video class above</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <Card key={c.id} className="border-slate-200" data-testid={`live-class-${c.id}`}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{c.title}</p>
                      <Badge className={`text-[10px] ${platformColor(c.platform)}`}>{platformLabel(c.platform)}</Badge>
                      <Badge className={`text-[10px] ${c.status === 'scheduled' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                        {c.status?.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {c.scheduled_at ? new Date(c.scheduled_at).toLocaleString() : 'TBD'}</span>
                      <span>{c.duration_minutes}min</span>
                      <span>{(c.registered_students || []).length}/{c.max_attendees} registered</span>
                      <span>By: {c.instructor_name}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.meeting_link && (
                    <a href={c.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {isAdmin && (
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================== PAYMENT PLANS TAB (ADMIN) ============================== */
function PaymentPlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/school/admin/payment-plans`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json()).then(d => setPlans(d.plans || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    defaulted: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-4" data-testid="payment-plans-tab">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{plans.length} payment plan(s)</p>
          <p className="text-xs text-slate-400 mt-0.5">No credit check required. Payments reported to credit bureaus starting August 2026.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
      ) : plans.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">No payment plans yet</p>
            <p className="text-sm text-slate-500">Payment plans will appear here when students request them for paid courses</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="text-left p-3 font-medium text-slate-600">Student</th>
                <th className="text-left p-3 font-medium text-slate-600">Course</th>
                <th className="text-left p-3 font-medium text-slate-600">Amount</th>
                <th className="text-left p-3 font-medium text-slate-600">Paid</th>
                <th className="text-left p-3 font-medium text-slate-600">Remaining</th>
                <th className="text-left p-3 font-medium text-slate-600">Payments</th>
                <th className="text-left p-3 font-medium text-slate-600">Status</th>
                <th className="text-left p-3 font-medium text-slate-600">Bureau</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50" data-testid={`plan-row-${p.id}`}>
                  <td className="p-3 text-slate-900">{p.student_id?.slice(0, 8)}</td>
                  <td className="p-3 text-slate-700">{p.course_title}</td>
                  <td className="p-3 font-medium">${p.plan_amount?.toFixed(2)}</td>
                  <td className="p-3 text-green-600">${p.amount_paid?.toFixed(2)}</td>
                  <td className="p-3 text-amber-600">${p.amount_remaining?.toFixed(2)}</td>
                  <td className="p-3">{p.payments_made}/{p.num_payments}</td>
                  <td className="p-3">
                    <Badge className={`text-[10px] ${statusColors[p.status] || 'bg-slate-100 text-slate-600'}`}>{p.status}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge className="text-[10px] bg-violet-100 text-violet-700">Reports Aug 2026</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}