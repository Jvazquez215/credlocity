import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import {
  BookOpen, Award, Shield, CheckCircle, ArrowRight, ArrowLeft, Lock,
  Loader2, Copy, Download, Send, MessageSquare, Users, Clock, X,
  ChevronRight, FileText, Star, GraduationCap, AlertCircle
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;
const fmt = (n) => (n || 0).toLocaleString();

/* ============================== AUTH CONTEXT ============================== */
function useSchoolAuth() {
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('school_token'));

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/school/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setStudent(d.student); else { localStorage.removeItem('school_token'); setToken(null); } })
        .catch(() => {});
    }
  }, [token]);

  const login = (tk, stu) => { localStorage.setItem('school_token', tk); setToken(tk); setStudent(stu); };
  const logout = () => { localStorage.removeItem('school_token'); setToken(null); setStudent(null); };
  return { student, token, login, logout, isAuth: !!token };
}

/* ============================== MAIN APP ============================== */
export default function SchoolApp() {
  const auth = useSchoolAuth();
  const { page, courseId } = useParams();

  if (page === 'login') return <AuthPage auth={auth} mode="login" />;
  if (page === 'register') return <AuthPage auth={auth} mode="register" />;
  if (page === 'dashboard' && auth.isAuth) return <StudentDashboard auth={auth} />;
  if (page === 'course' && courseId) return <CoursePage auth={auth} courseId={courseId} />;
  if (page === 'quiz' && courseId) return <QuizPage auth={auth} courseId={courseId} />;
  if (page === 'certificate' && courseId) return <CertificatePage auth={auth} courseId={courseId} />;
  if (page === 'community' && courseId) return <CommunityPage auth={auth} courseId={courseId} />;
  return <LandingPage auth={auth} />;
}

/* ============================== LANDING PAGE ============================== */
function LandingPage({ auth }) {
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/api/school/courses`, auth.token ? { headers: { Authorization: `Bearer ${auth.token}` } } : {})
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {});
  }, [auth.token]);

  return (
    <div className="min-h-screen bg-slate-950 text-white" data-testid="school-landing">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/school" className="flex items-center gap-2">
            <Shield className="w-7 h-7 text-amber-400" />
            <div>
              <span className="font-bold text-lg">CROA Ethics School</span>
              <span className="text-[10px] text-slate-500 block -mt-1">by Credlocity</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            {auth.isAuth ? (
              <>
                <span className="text-sm text-slate-400">{auth.student?.full_name}</span>
                <Button size="sm" variant="outline" className="border-slate-700 text-slate-300" onClick={() => navigate('/school/dashboard')} data-testid="dashboard-btn">Dashboard</Button>
                <Button size="sm" variant="ghost" className="text-slate-400" onClick={auth.logout}>Logout</Button>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="text-slate-300" onClick={() => navigate('/school/login')} data-testid="login-btn">Sign In</Button>
                <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={() => navigate('/school/register')} data-testid="register-btn">Join Free</Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <Badge className="bg-amber-500/20 text-amber-400 mb-4 px-3 py-1">Industry-Leading Certification</Badge>
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            Earn Your <span className="text-amber-400">Credit Repair</span> Certification
          </h1>
          <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
            Master CROA compliance, FCRA regulations, and ethical practices. Get certified, earn trust badges for your website, and build credibility with your clients.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8" onClick={() => navigate(auth.isAuth ? '/school/dashboard' : '/school/register')} data-testid="hero-cta">
              {auth.isAuth ? 'Go to Dashboard' : 'Start Learning Free'} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex justify-center gap-6 mt-8 text-sm text-slate-500">
            <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> 3 Courses</span>
            <span className="flex items-center gap-1"><Award className="w-4 h-4" /> Certificates</span>
            <span className="flex items-center gap-1"><Shield className="w-4 h-4" /> Trust Badges</span>
            <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Community</span>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">Available Certifications</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-amber-500/50 transition group" data-testid={`course-card-${c.id}`}>
                <div className="h-2" style={{ background: c.badge_accent || '#c6a035' }} />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <Badge className="text-xs" style={{ background: `${c.badge_accent}30`, color: c.badge_accent }}>{c.short_name}</Badge>
                    {c.is_free !== false ? <Badge className="bg-green-500/20 text-green-400 text-xs">Free</Badge> : <Badge className="bg-amber-500/20 text-amber-400 text-xs">${c.price || 0}</Badge>}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{c.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-3">{c.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {c.duration}</span>
                    <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {c.total_questions}q test</span>
                    <span>{c.passing_score}% to pass</span>
                  </div>
                  {c.is_completed ? (
                    <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate(`/school/certificate/${c.id}`)}>
                      <Award className="w-4 h-4 mr-1" /> View Certificate
                    </Button>
                  ) : c.is_enrolled ? (
                    <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => navigate(`/school/course/${c.id}`)}>
                      Continue Learning <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={() => navigate(auth.isAuth ? `/school/course/${c.id}` : '/school/register')}>
                      Start Course <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badge Example */}
      <section className="py-16 px-6 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Earn Trust Badges for Your Website</h2>
          <p className="text-slate-400 mb-8">Upon completion, get embeddable HTML trust badges that build credibility and showcase your compliance knowledge.</p>
          <div className="flex justify-center gap-6">
            {['CROA', 'FCRA', 'ETHICS'].map((name, i) => (
              <div key={name} className="bg-slate-800 border-2 border-amber-500/50 rounded-xl p-4 text-center w-44">
                <div className="text-[10px] tracking-widest text-amber-400 mb-1">CERTIFIED</div>
                <div className="text-xl font-bold">{name}</div>
                <div className="w-8 h-0.5 bg-amber-500 mx-auto my-2" />
                <div className="text-[9px] text-slate-500">Verified by Credlocity</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 px-6 text-center text-sm text-slate-600">
        <p>CROA Ethics School is a program of <a href="https://www.credlocity.com" className="text-amber-500 hover:underline">Credlocity</a></p>
      </footer>
    </div>
  );
}

/* ============================== AUTH PAGE ============================== */
function AuthPage({ auth, mode }) {
  const [form, setForm] = useState({ email: '', password: '', full_name: '', company_name: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { if (auth.isAuth) navigate('/school/dashboard'); }, [auth.isAuth, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = mode === 'register' ? '/api/school/auth/register' : '/api/school/auth/login';
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        auth.login(data.access_token, data.student);
        navigate('/school/dashboard');
      } else {
        toast.error(data.detail || 'Failed');
      }
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/school" className="flex items-center gap-2 justify-center mb-8">
          <Shield className="w-7 h-7 text-amber-400" />
          <span className="font-bold text-lg text-white">CROA Ethics School</span>
        </Link>
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white text-center">{mode === 'register' ? 'Create Your Account' : 'Welcome Back'}</CardTitle>
            <p className="text-sm text-slate-400 text-center">{mode === 'register' ? 'Free registration — start learning today' : 'Sign in to continue learning'}</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="school-auth-form">
              {mode === 'register' && (
                <>
                  <Input placeholder="Full Name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required className="bg-slate-800 border-slate-700 text-white" data-testid="input-name" />
                  <Input placeholder="Company Name (optional)" value={form.company_name} onChange={e => setForm({ ...form, company_name: e.target.value })} className="bg-slate-800 border-slate-700 text-white" data-testid="input-company" />
                </>
              )}
              <Input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="bg-slate-800 border-slate-700 text-white" data-testid="input-email" />
              <Input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required className="bg-slate-800 border-slate-700 text-white" data-testid="input-password" />
              <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" data-testid="auth-submit">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'register' ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
            <p className="text-center text-sm text-slate-500 mt-4">
              {mode === 'register' ? (
                <>Already have an account? <Link to="/school/login" className="text-amber-400 hover:underline">Sign in</Link></>
              ) : (
                <>Don't have an account? <Link to="/school/register" className="text-amber-400 hover:underline">Register free</Link></>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================== STUDENT DASHBOARD ============================== */
function StudentDashboard({ auth }) {
  const [courses, setCourses] = useState([]);
  const [certs, setCerts] = useState([]);
  const [liveClasses, setLiveClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) { navigate('/school/login'); return; }
    fetch(`${API}/api/school/courses`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => setCourses(d.courses || [])).catch(() => {});
    fetch(`${API}/api/school/certificates`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => setCerts(d.certificates || [])).catch(() => {});
    fetch(`${API}/api/school/live-classes`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => setLiveClasses(d.live_classes || [])).catch(() => {});
  }, [auth.token, auth.isAuth, navigate]);

  const registerForClass = async (classId) => {
    try {
      const res = await fetch(`${API}/api/school/live-classes/${classId}/register`, {
        method: 'POST', headers: { Authorization: `Bearer ${auth.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        if (data.meeting_link) window.open(data.meeting_link, '_blank');
        // Refresh
        fetch(`${API}/api/school/live-classes`, { headers: { Authorization: `Bearer ${auth.token}` } })
          .then(r => r.json()).then(d => setLiveClasses(d.live_classes || [])).catch(() => {});
      } else toast.error(data.detail || 'Failed');
    } catch { toast.error('Connection error'); }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/school" className="flex items-center gap-2"><Shield className="w-6 h-6 text-amber-400" /><span className="font-bold">CROA Ethics School</span></Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">{auth.student?.full_name}</span>
            <Button size="sm" variant="ghost" className="text-slate-400" onClick={auth.logout}>Logout</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6 space-y-8" data-testid="student-dashboard">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {auth.student?.full_name?.split(' ')[0]}</h1>
          <p className="text-slate-400 mt-1">{auth.student?.company_name && `${auth.student.company_name} — `}{certs.length} certification{certs.length !== 1 ? 's' : ''} earned</p>
        </div>

        {/* Certificates */}
        {certs.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Your Certificates</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {certs.map(c => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4" data-testid={`cert-${c.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-amber-500/20 text-amber-400">{c.course_short_name}</Badge>
                    <span className="text-xs text-slate-500">{c.issued_at?.slice(0, 10)}</span>
                  </div>
                  <p className="font-medium text-sm mb-3">{c.course_title}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 border-slate-700 text-slate-300" onClick={() => navigate(`/school/certificate/${c.course_id}`)} data-testid={`view-cert-${c.id}`}>
                      <Award className="w-3 h-3 mr-1" /> Badge & PDF
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Live Classes */}
        {liveClasses.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2"><span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Upcoming Live Classes</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {liveClasses.map(lc => (
                <div key={lc.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4" data-testid={`live-class-student-${lc.id}`}>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={lc.platform === 'zoom' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}>
                      {lc.platform === 'zoom' ? 'Zoom' : 'Google Meet'}
                    </Badge>
                    <span className="text-xs text-slate-500">{lc.attendee_count || 0}/{lc.max_attendees} spots</span>
                  </div>
                  <p className="font-medium text-sm mb-1">{lc.title}</p>
                  <p className="text-xs text-slate-500 mb-3">{new Date(lc.scheduled_at).toLocaleString()} - {lc.duration_minutes}min</p>
                  <Button
                    size="sm"
                    className={lc.is_registered ? "bg-green-600 hover:bg-green-700 w-full" : "bg-amber-500 hover:bg-amber-600 text-black w-full"}
                    onClick={() => !lc.is_registered && registerForClass(lc.id)}
                    data-testid={`register-live-${lc.id}`}
                  >
                    {lc.is_registered ? 'Registered' : 'Register'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Courses */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Courses</h2>
          <div className="space-y-3">
            {courses.map(c => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between hover:border-slate-700 transition" data-testid={`course-${c.id}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${c.badge_accent || '#c6a035'}30` }}>
                    {c.is_completed ? <CheckCircle className="w-5 h-5 text-green-400" /> : c.is_enrolled ? <BookOpen className="w-5 h-5" style={{ color: c.badge_accent }} /> : <Lock className="w-5 h-5 text-slate-500" />}
                  </div>
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span>{c.duration}</span>
                      <span>{c.total_questions} questions</span>
                      <span>{c.passing_score}% to pass</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {c.is_completed && <Badge className="bg-green-500/20 text-green-400">Completed</Badge>}
                  {c.is_enrolled && !c.is_completed && <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>}
                  <Button size="sm" className={c.is_completed ? "bg-green-600 hover:bg-green-700" : "bg-amber-500 hover:bg-amber-600 text-black"} onClick={() => navigate(c.is_completed ? `/school/certificate/${c.id}` : `/school/course/${c.id}`)}>
                    {c.is_completed ? 'Certificate' : c.is_enrolled ? 'Continue' : 'Start'} <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== COURSE PAGE ============================== */
function CoursePage({ auth, courseId }) {
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [showPaymentPlan, setShowPaymentPlan] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) { navigate('/school/login'); return; }
    fetch(`${API}/api/school/courses/${courseId}`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => {
        setCourse(d.course);
        if (!d.course?.is_enrolled) {
          if (d.course?.is_free === false && d.course?.price > 0) {
            setShowPaymentPlan(true);
          } else {
            fetch(`${API}/api/school/courses/${courseId}/enroll`, { method: 'POST', headers: { Authorization: `Bearer ${auth.token}` } })
              .then(r => r.json()).then(() => { setCourse(prev => ({ ...prev, is_enrolled: true })); });
          }
        }
      }).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, auth.token, auth.isAuth, navigate]);

  const markComplete = async () => {
    await fetch(`${API}/api/school/courses/${courseId}/lessons/${currentLesson}/complete`, {
      method: 'POST', headers: { Authorization: `Bearer ${auth.token}` }
    });
    setCompletedLessons(prev => [...new Set([...prev, currentLesson])]);
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>;
  if (!course) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Course not found</div>;

  if (showPaymentPlan) {
    return <PaymentPlanForm auth={auth} course={course} onSuccess={() => { setShowPaymentPlan(false); setCourse(prev => ({ ...prev, is_enrolled: true })); }} onCancel={() => navigate('/school/dashboard')} />;
  }

  const lessons = course.lessons || [];
  const lesson = lessons[currentLesson];
  const allCompleted = lessons.length > 0 && completedLessons.length >= lessons.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/school/dashboard')} className="text-slate-400"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          <span className="text-sm font-medium">{course.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/school/community/${courseId}`)} className="text-slate-400"><MessageSquare className="w-4 h-4 mr-1" /> Community</Button>
          <span className="text-xs text-slate-500">Lesson {currentLesson + 1} of {lessons.length}</span>
        </div>
      </nav>

      <div className="flex" data-testid="course-viewer">
        {/* Sidebar */}
        <div className="w-64 border-r border-slate-800 p-4 hidden lg:block">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Lessons</p>
          {lessons.map((l, i) => (
            <button key={i} onClick={() => setCurrentLesson(i)} className={`w-full text-left p-2 rounded-lg mb-1 text-sm flex items-center gap-2 transition ${i === currentLesson ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/50'}`}>
              {completedLessons.includes(i) ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" /> : <div className="w-4 h-4 rounded-full border border-slate-600 flex-shrink-0" />}
              <span className="truncate">{l.title}</span>
            </button>
          ))}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={() => navigate(`/school/quiz/${courseId}`)} disabled={!allCompleted} data-testid="take-quiz-btn">
              {allCompleted ? 'Take the Test' : `Complete all lessons first`}
            </Button>
            {!allCompleted && <p className="text-xs text-slate-500 mt-2 text-center">{completedLessons.length}/{lessons.length} complete</p>}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-4xl mx-auto p-6 lg:p-10">
          {lesson ? (
            <>
              <article className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-a:text-amber-400 prose-blockquote:border-amber-500 prose-blockquote:bg-slate-900 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg">
                <div dangerouslySetInnerHTML={{ __html: markdownToHtml(lesson.content) }} />
              </article>
              <div className="flex items-center justify-between mt-10 pt-6 border-t border-slate-800">
                <Button variant="outline" onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))} disabled={currentLesson === 0} className="border-slate-700 text-slate-300">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <div className="flex gap-2">
                  {!completedLessons.includes(currentLesson) && (
                    <Button onClick={markComplete} className="bg-green-600 hover:bg-green-700" data-testid="complete-lesson-btn">
                      <CheckCircle className="w-4 h-4 mr-1" /> Mark Complete
                    </Button>
                  )}
                  {currentLesson < lessons.length - 1 ? (
                    <Button onClick={() => { markComplete(); setCurrentLesson(currentLesson + 1); }} className="bg-amber-500 hover:bg-amber-600 text-black">
                      Next Lesson <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button onClick={() => { markComplete(); navigate(`/school/quiz/${courseId}`); }} className="bg-amber-500 hover:bg-amber-600 text-black" data-testid="go-to-quiz">
                      Take the Test <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : <p>No lessons available.</p>}

          {/* Mobile lesson nav */}
          <div className="lg:hidden mt-6 flex flex-wrap gap-2">
            {lessons.map((l, i) => (
              <button key={i} onClick={() => setCurrentLesson(i)} className={`px-3 py-1.5 rounded-full text-xs ${i === currentLesson ? 'bg-amber-500 text-black' : completedLessons.includes(i) ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-400'}`}>
                {i + 1}. {l.title.slice(0, 20)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================== QUIZ PAGE ============================== */
function QuizPage({ auth, courseId }) {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) { navigate('/school/login'); return; }
    fetch(`${API}/api/school/courses/${courseId}/quiz`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => setQuiz(d.quiz)).catch(() => {}).finally(() => setLoading(false));
  }, [courseId, auth.token, auth.isAuth, navigate]);

  const submit = async () => {
    if (Object.keys(answers).length < (quiz?.total_questions || 0)) {
      toast.error(`Please answer all ${quiz.total_questions} questions`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/school/courses/${courseId}/quiz/submit`, {
        method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      const data = await res.json();
      setResult(data);
    } catch { toast.error('Failed to submit'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-400" /></div>;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/school/course/${courseId}`)} className="text-slate-400"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Course</Button>
        <span className="text-sm font-medium">{quiz?.course_title} — Test</span>
      </nav>

      <div className="max-w-3xl mx-auto p-6" data-testid="quiz-page">
        {result ? (
          <div className="text-center py-10">
            <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center text-3xl font-bold mb-4 ${result.passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {result.score}%
            </div>
            <h2 className="text-2xl font-bold mb-2">{result.passed ? 'Congratulations!' : 'Not quite there yet'}</h2>
            <p className="text-slate-400 mb-6">
              {result.passed
                ? `You passed with ${result.score}%! You answered ${result.attempt?.correct} out of ${result.attempt?.total} correctly.`
                : `You scored ${result.score}% but needed ${quiz?.passing_score}% to pass. You can retake the test.`}
            </p>
            {result.passed ? (
              <div className="flex justify-center gap-3">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold" onClick={() => navigate(`/school/certificate/${courseId}`)} data-testid="view-certificate-btn">
                  <Award className="w-4 h-4 mr-1" /> View Certificate & Badge
                </Button>
              </div>
            ) : (
              <Button onClick={() => { setResult(null); setAnswers({}); }} className="bg-amber-500 hover:bg-amber-600 text-black">
                Retake Test
              </Button>
            )}

            {/* Show incorrect answers */}
            {result.results && (
              <div className="mt-8 text-left space-y-3">
                <h3 className="font-semibold text-lg">Review</h3>
                {result.results.filter(r => !r.is_correct).slice(0, 10).map((r, i) => (
                  <div key={i} className="bg-slate-900 border border-red-500/30 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-300">{r.question}</p>
                    <p className="text-xs text-slate-400 mt-1">{r.explanation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold">{quiz?.course_title} — Certification Test</h2>
              <p className="text-slate-400 text-sm mt-1">{quiz?.total_questions} questions — Need {quiz?.passing_score}% to pass</p>
              <p className="text-xs text-slate-500 mt-1">{Object.keys(answers).length}/{quiz?.total_questions || 0} answered</p>
            </div>
            <div className="space-y-6">
              {quiz?.questions?.map((q, qi) => (
                <div key={q.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5" data-testid={`question-${qi}`}>
                  <p className="font-medium mb-3"><span className="text-amber-400 mr-2">Q{qi + 1}.</span>{q.question}</p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))} className={`w-full text-left p-3 rounded-lg text-sm transition ${answers[q.id] === oi ? 'bg-amber-500/20 border-amber-500 border text-amber-200' : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                        <span className="font-medium mr-2 text-slate-500">{String.fromCharCode(65 + oi)}.</span>{opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-slate-950/90 backdrop-blur py-4 mt-6 flex items-center justify-between border-t border-slate-800">
              <p className="text-sm text-slate-400">{Object.keys(answers).length} of {quiz?.total_questions} answered</p>
              <Button onClick={submit} disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8" data-testid="submit-quiz-btn">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Test'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ============================== CERTIFICATE PAGE ============================== */
function CertificatePage({ auth, courseId }) {
  const [cert, setCert] = useState(null);
  const [badgeHtml, setBadgeHtml] = useState('');
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.isAuth) { navigate('/school/login'); return; }
    fetch(`${API}/api/school/certificates`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => {
        const c = (d.certificates || []).find(c => c.course_id === courseId);
        if (c) {
          setCert(c);
          fetch(`${API}/api/school/certificates/${c.id}/badge-html`, { headers: { Authorization: `Bearer ${auth.token}` } })
            .then(r => r.json()).then(b => setBadgeHtml(b.badge_html || ''));
        }
      }).catch(() => {});
  }, [courseId, auth.token, auth.isAuth, navigate]);

  const copyBadge = async () => {
    navigator.clipboard.writeText(badgeHtml);
    setCopied(true);
    toast.success('Badge HTML copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
    // Track badge usage
    try {
      await fetch(`${API}/api/school/certificates/${cert.id}/track-badge`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'copy' })
      });
    } catch {}
  };

  const downloadPdf = () => {
    window.open(`${API}/api/school/certificates/${cert.id}/pdf?token=${auth.token}`, '_blank');
  };

  if (!cert) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <p>No certificate found for this course.</p>
        <Button className="mt-4" onClick={() => navigate(`/school/course/${courseId}`)}>Go to Course</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/school/dashboard')} className="text-slate-400"><ArrowLeft className="w-4 h-4 mr-1" /> Dashboard</Button>
      </nav>

      <div className="max-w-3xl mx-auto p-6 space-y-8" data-testid="certificate-page">
        <div className="text-center">
          <Award className="w-12 h-12 text-amber-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">{cert.course_title}</h1>
          <p className="text-slate-400 mt-1">Certificate ID: {cert.id} — Issued {cert.issued_at?.slice(0, 10)}</p>
        </div>

        {/* Download PDF */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-3">Download Certificate</h3>
            <p className="text-sm text-slate-400 mb-4">Get your official PDF certificate of completion</p>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold" onClick={downloadPdf} data-testid="download-pdf-btn">
              <Download className="w-4 h-4 mr-1" /> Download PDF Certificate
            </Button>
          </CardContent>
        </Card>

        {/* Badge Preview + Copy HTML + Instructions */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-1 text-center text-lg">Trust Badge for Your Website</h3>
            <p className="text-sm text-slate-400 text-center mb-6">Display your certification and build credibility with potential clients</p>

            {/* Live Preview */}
            <div className="flex justify-center mb-6 p-8 bg-white rounded-xl shadow-inner">
              <div dangerouslySetInnerHTML={{ __html: badgeHtml }} />
            </div>

            {/* HTML Code */}
            <div className="relative mb-4">
              <pre className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto max-h-40" data-testid="badge-html-code">
                {badgeHtml}
              </pre>
              <Button size="sm" onClick={copyBadge} className={`absolute top-2 right-2 ${copied ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`} data-testid="copy-badge-btn">
                {copied ? <><CheckCircle className="w-3 h-3 mr-1" /> Copied!</> : <><Copy className="w-3 h-3 mr-1" /> Copy HTML</>}
              </Button>
            </div>

            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-6">
              <p className="text-sm font-medium text-emerald-300 mb-1">SEO Benefits</p>
              <p className="text-xs text-emerald-400/80">This badge includes schema.org structured data that tells Google this is a verified educational credential. The embedded link helps build your site's authority.</p>
            </div>

            {/* Installation Instructions */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> How to Add This Badge to Your Website
              </h4>

              <div className="space-y-3 text-sm">
                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="font-medium text-white mb-2">HTML Website</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Click <strong className="text-amber-400">"Copy HTML"</strong> above</li>
                    <li>Open your website's HTML file (usually <code className="bg-slate-700 px-1 rounded">index.html</code> or <code className="bg-slate-700 px-1 rounded">footer.html</code>)</li>
                    <li>Paste the code where you want the badge to appear (footer or sidebar recommended)</li>
                    <li>Save and upload the file to your server</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="font-medium text-white mb-2">WordPress</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Go to <strong className="text-amber-400">Appearance &gt; Widgets</strong></li>
                    <li>Add a <strong className="text-amber-400">"Custom HTML"</strong> widget to your footer or sidebar</li>
                    <li>Paste the badge code and click <strong>Save</strong></li>
                    <li>Alternative: Use the <strong>Gutenberg block editor</strong> and add a "Custom HTML" block on any page</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="font-medium text-white mb-2">Wix</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Open the Wix Editor and go to your footer section</li>
                    <li>Click <strong className="text-amber-400">+ Add &gt; Embed Code &gt; Custom Code</strong></li>
                    <li>Paste the badge HTML into the code window</li>
                    <li>Resize and position the element, then Publish</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="font-medium text-white mb-2">Squarespace</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Go to the page where you want the badge</li>
                    <li>Add a <strong className="text-amber-400">Code Block</strong></li>
                    <li>Paste the badge HTML and uncheck "Display Source"</li>
                    <li>Save and exit the editor</li>
                  </ol>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                  <p className="font-medium text-white mb-2">Shopify</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-400 text-xs">
                    <li>Go to <strong className="text-amber-400">Online Store &gt; Themes &gt; Edit Code</strong></li>
                    <li>Open <code className="bg-slate-700 px-1 rounded">footer.liquid</code> or the relevant section</li>
                    <li>Paste the badge code before the closing tag</li>
                    <li>Save</li>
                  </ol>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center pt-2">
                Best placement: website footer, about page sidebar, or compliance/certifications page. The badge automatically links back to Credlocity for verification.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ============================== COMMUNITY PAGE ============================== */
function CommunityPage({ auth, courseId }) {
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newThread, setNewThread] = useState('');
  const [newMsg, setNewMsg] = useState('');
  const [tab, setTab] = useState('discussion');
  const [activeThread, setActiveThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const chatRef = useRef(null);
  const navigate = useNavigate();

  const fetchDiscussions = useCallback(() => {
    fetch(`${API}/api/school/courses/${courseId}/discussions`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => setThreads(d.discussions || [])).catch(() => {});
  }, [courseId, auth.token]);

  const fetchChat = useCallback(() => {
    fetch(`${API}/api/school/courses/${courseId}/chat`, { headers: { Authorization: `Bearer ${auth.token}` } })
      .then(r => r.json()).then(d => { setMessages(d.messages || []); setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100); }).catch(() => {});
  }, [courseId, auth.token]);

  useEffect(() => {
    if (!auth.isAuth) { navigate('/school/login'); return; }
    fetchDiscussions();
    fetchChat();
    const iv = setInterval(fetchChat, 5000);
    return () => clearInterval(iv);
  }, [auth.isAuth, navigate, fetchDiscussions, fetchChat]);

  const postThread = async () => {
    if (!newThread.trim()) return;
    await fetch(`${API}/api/school/courses/${courseId}/discussions`, {
      method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newThread })
    });
    setNewThread('');
    fetchDiscussions();
  };

  const postReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    await fetch(`${API}/api/school/courses/${courseId}/discussions`, {
      method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: replyText, parent_id: activeThread.id })
    });
    setReplyText('');
    loadReplies(activeThread.id);
  };

  const loadReplies = async (threadId) => {
    const res = await fetch(`${API}/api/school/courses/${courseId}/discussions/${threadId}/replies`, { headers: { Authorization: `Bearer ${auth.token}` } });
    const d = await res.json();
    setReplies(d.replies || []);
  };

  const sendChat = async () => {
    if (!newMsg.trim()) return;
    await fetch(`${API}/api/school/courses/${courseId}/chat`, {
      method: 'POST', headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newMsg })
    });
    setNewMsg('');
    fetchChat();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/school/course/${courseId}`)} className="text-slate-400"><ArrowLeft className="w-4 h-4 mr-1" /> Back to Course</Button>
        <span className="text-sm font-medium">Community</span>
      </nav>

      <div className="max-w-4xl mx-auto p-6" data-testid="community-page">
        <div className="flex gap-2 mb-6">
          <Button size="sm" className={tab === 'discussion' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'} onClick={() => setTab('discussion')}>
            <MessageSquare className="w-4 h-4 mr-1" /> Discussion Board
          </Button>
          <Button size="sm" className={tab === 'chat' ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'} onClick={() => setTab('chat')}>
            <Send className="w-4 h-4 mr-1" /> Live Chat
          </Button>
        </div>

        {tab === 'discussion' ? (
          <div className="space-y-4">
            {/* New Thread */}
            <div className="flex gap-2">
              <Input value={newThread} onChange={e => setNewThread(e.target.value)} placeholder="Start a discussion..." className="bg-slate-800 border-slate-700 text-white flex-1" onKeyDown={e => e.key === 'Enter' && postThread()} data-testid="new-thread-input" />
              <Button onClick={postThread} className="bg-amber-500 hover:bg-amber-600 text-black" data-testid="post-thread-btn"><Send className="w-4 h-4" /></Button>
            </div>

            {activeThread ? (
              <div>
                <Button variant="ghost" size="sm" onClick={() => { setActiveThread(null); setReplies([]); }} className="text-slate-400 mb-3"><ArrowLeft className="w-3 h-3 mr-1" /> Back to threads</Button>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">{activeThread.author_name}</span>
                    {activeThread.author_company && <span className="text-xs text-slate-500">{activeThread.author_company}</span>}
                    <span className="text-xs text-slate-600">{new Date(activeThread.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-300">{activeThread.content}</p>
                </div>
                <div className="space-y-2 ml-6">
                  {replies.map(r => (
                    <div key={r.id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium">{r.author_name}</span>
                        <span className="text-[10px] text-slate-600">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-300">{r.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3 ml-6">
                  <Input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="bg-slate-800 border-slate-700 text-white flex-1" onKeyDown={e => e.key === 'Enter' && postReply()} />
                  <Button onClick={postReply} size="sm" className="bg-slate-700 hover:bg-slate-600"><Send className="w-3 h-3" /></Button>
                </div>
              </div>
            ) : (
              threads.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No discussions yet. Start one above!</p>
              ) : threads.map(t => (
                <button key={t.id} onClick={() => { setActiveThread(t); loadReplies(t.id); }} className="w-full text-left bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition" data-testid={`thread-${t.id}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{t.author_name}</span>
                      {t.author_company && <Badge className="bg-slate-800 text-slate-400 text-[10px]">{t.author_company}</Badge>}
                    </div>
                    <span className="text-xs text-slate-600">{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{t.content}</p>
                  <p className="text-xs text-slate-500 mt-2">{t.reply_count || 0} replies</p>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Live Chat */
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div ref={chatRef} className="h-96 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
              {messages.length === 0 ? (
                <p className="text-center text-slate-500 py-16">No messages yet. Say hello!</p>
              ) : messages.map(m => {
                const isMe = m.author_id === auth.student?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs px-3 py-2 rounded-xl text-sm ${isMe ? 'bg-amber-500/20 text-amber-200' : 'bg-slate-800 text-slate-300'}`}>
                      {!isMe && <p className="text-[10px] font-medium text-slate-500 mb-0.5">{m.author_name}</p>}
                      <p>{m.content}</p>
                      <p className="text-[9px] opacity-50 mt-0.5">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2 p-3 border-t border-slate-800">
              <Input value={newMsg} onChange={e => setNewMsg(e.target.value)} placeholder="Type a message..." className="bg-slate-800 border-slate-700 text-white flex-1" onKeyDown={e => e.key === 'Enter' && sendChat()} data-testid="chat-input" />
              <Button onClick={sendChat} className="bg-amber-500 hover:bg-amber-600 text-black" data-testid="send-chat-btn"><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================== HELPERS ============================== */
function markdownToHtml(md) {
  if (!md) return '';
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}


/* ============================== PAYMENT PLAN FORM ============================== */
function PaymentPlanForm({ auth, course, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', ssn: '',
    address: '', phone: '', employer: '', num_payments: 3
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/api/school/payment-plan/request`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${auth.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, course_id: course.id, plan_amount: course.price })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Payment plan created!');
        onSuccess();
      } else {
        toast.error(data.detail || 'Failed');
      }
    } catch { toast.error('Connection error'); }
    finally { setSubmitting(false); }
  };

  const monthly = course.price && form.num_payments > 0 ? (course.price / form.num_payments).toFixed(2) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-lg w-full" data-testid="payment-plan-form">
        <button onClick={onCancel} className="text-sm text-slate-400 hover:text-white mb-4 flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">{course.title}</h2>
            <p className="text-3xl font-bold text-amber-400 mt-2">${course.price?.toFixed(2)}</p>
            <p className="text-sm text-slate-400 mt-1">Payment Plan - {form.num_payments} payments of ${monthly}</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-blue-300">No credit check required!</p>
            <p className="text-xs text-blue-400/80 mt-1">Your payments will be reported to credit bureaus (Equifax, Experian, TransUnion) starting August 2026. All payments made before that date will be included retroactively to help build your credit.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Personal Information (Required for Credit Reporting)</p>
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="First Name *" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} required data-testid="pp-first-name" />
              <input className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Last Name *" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} required data-testid="pp-last-name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="date" className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Date of Birth *" value={form.date_of_birth} onChange={e => setForm({ ...form, date_of_birth: e.target.value })} required data-testid="pp-dob" />
              <input className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="SSN *" type="password" value={form.ssn} onChange={e => setForm({ ...form, ssn: e.target.value })} required data-testid="pp-ssn" />
            </div>
            <input className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Full Address *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} required data-testid="pp-address" />
            <div className="grid grid-cols-2 gap-3">
              <input className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Phone Number *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required data-testid="pp-phone" />
              <input className="bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm focus:border-amber-500 outline-none" placeholder="Employer *" value={form.employer} onChange={e => setForm({ ...form, employer: e.target.value })} required data-testid="pp-employer" />
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-2">Number of payments</p>
              <div className="flex gap-2">
                {[2, 3, 4, 6].map(n => (
                  <button key={n} type="button" onClick={() => setForm({ ...form, num_payments: n })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${form.num_payments === n ? 'bg-amber-500 text-black border-amber-500' : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'}`}>
                    {n}x ${(course.price / n).toFixed(0)}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" disabled={submitting} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl transition disabled:opacity-50" data-testid="submit-payment-plan">
                {submitting ? 'Processing...' : `Start Payment Plan - $${monthly}/mo`}
              </button>
            </div>
            <p className="text-[10px] text-center text-slate-600 mt-2">By submitting, you authorize Credlocity to report payment activity to credit bureaus.</p>
          </form>
        </div>
      </div>
    </div>
  );
}