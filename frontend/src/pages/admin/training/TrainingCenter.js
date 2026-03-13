import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { toast } from 'sonner';
import RichTextEditor from '../../../components/RichTextEditor';
import ImageUpload from '../../../components/ui/ImageUpload';
import {
  BookOpen, Plus, Search, Edit, Trash2, Eye, GraduationCap, Shield,
  Loader2, ArrowLeft, FileText, Building2, CheckCircle, Clock, X,
  BarChart3, Users, Trophy, Check, Circle, CalendarDays, AlertTriangle, Send, UserPlus,
  HelpCircle, ListChecks, Award, RotateCcw, Download, ScrollText
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEPARTMENTS = [
  'General', 'Collections', 'Sales', 'Customer Support',
  'Legal', 'Operations', 'Management', 'HR', 'IT'
];

const StatusBadge = ({ status }) => {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-yellow-100 text-yellow-700'
  };
  return <Badge className={styles[status] || styles.draft}>{status}</Badge>;
};

const ProgressBar = ({ completed, total, className = '' }) => {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-gray-500 whitespace-nowrap">{completed}/{total}</span>
    </div>
  );
};

// ================ MODULE FORM ================

const ModuleForm = ({ module, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: '', description: '', department: 'General', content: '',
    steps: [], status: 'draft', order: 0,
    ...(module || {})
  });
  const [saving, setSaving] = useState(false);

  const addStep = () => {
    setForm({
      ...form,
      steps: [...form.steps, { id: Date.now().toString(), title: '', content: '', image_url: '', order: form.steps.length }]
    });
  };

  const updateStep = (idx, field, value) => {
    const steps = [...form.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setForm({ ...form, steps });
  };

  const removeStep = (idx) => {
    setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });
  };

  const moveStep = (idx, dir) => {
    const steps = [...form.steps];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= steps.length) return;
    [steps[idx], steps[newIdx]] = [steps[newIdx], steps[idx]];
    setForm({ ...form, steps });
  };

  const handleSave = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      await onSave({ ...form, status: status || form.status });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="module-form">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
            <Clock className="w-4 h-4 mr-1" /> Save Draft
          </Button>
          <Button onClick={() => handleSave('published')} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
            Publish
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{module ? 'Edit Training Module' : 'New Training Module'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., New Employee Onboarding" data-testid="module-title" />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" data-testid="module-department">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 p-3 border rounded-lg" placeholder="Brief overview of this training module" />
          </div>
          <div>
            <label className="text-sm font-medium">Content</label>
            <RichTextEditor content={form.content} onChange={c => setForm({ ...form, content: c })} placeholder="Write the main training content here..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Step-by-Step Guide</CardTitle>
            <Button size="sm" onClick={addStep} data-testid="add-step-btn"><Plus className="w-4 h-4 mr-1" /> Add Step</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.steps.length === 0 && (
            <p className="text-gray-400 text-center py-6">No steps added yet. Click "Add Step" to create a step-by-step guide.</p>
          )}
          {form.steps.map((step, idx) => (
            <div key={step.id || idx} className="border rounded-lg p-4 bg-gray-50" data-testid={`step-${idx}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-blue-600">Step {idx + 1}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => moveStep(idx, -1)} disabled={idx === 0}>Up</Button>
                  <Button variant="ghost" size="sm" onClick={() => moveStep(idx, 1)} disabled={idx === form.steps.length - 1}>Down</Button>
                  <Button variant="ghost" size="sm" onClick={() => removeStep(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <div className="space-y-3">
                <Input value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)} placeholder="Step title" />
                <textarea value={step.content} onChange={e => updateStep(idx, 'content', e.target.value)} rows={3} className="w-full p-3 border rounded-lg text-sm" placeholder="Step instructions..." />
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Step Image (optional)</label>
                  <ImageUpload value={step.image_url} onChange={url => updateStep(idx, 'image_url', url)} label="Upload step image" />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quiz Builder */}
      <QuizBuilder moduleId={form.id} token={localStorage.getItem('auth_token')} />
    </div>
  );
};

// ================ QUIZ BUILDER (Admin) ================

const QuizBuilder = ({ moduleId, token }) => {
  const [questions, setQuestions] = useState([]);
  const [passingScore, setPassingScore] = useState(80);
  const [loading, setLoading] = useState(!!moduleId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!moduleId) { setLoading(false); return; }
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/quiz`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          if (d.quiz) {
            setQuestions(d.quiz.questions || []);
            setPassingScore(d.quiz.passing_score || 80);
          }
        }
      } catch (e) { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchQuiz();
  }, [moduleId, token]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: ['', '', '', ''], correct_answer: 0, explanation: '' }]);
  };

  const updateQuestion = (idx, field, value) => {
    const q = [...questions];
    q[idx] = { ...q[idx], [field]: value };
    setQuestions(q);
  };

  const updateOption = (qIdx, optIdx, value) => {
    const q = [...questions];
    const opts = [...q[qIdx].options];
    opts[optIdx] = value;
    q[qIdx] = { ...q[qIdx], options: opts };
    setQuestions(q);
  };

  const addOption = (qIdx) => {
    const q = [...questions];
    q[qIdx] = { ...q[qIdx], options: [...q[qIdx].options, ''] };
    setQuestions(q);
  };

  const removeOption = (qIdx, optIdx) => {
    const q = [...questions];
    const opts = q[qIdx].options.filter((_, i) => i !== optIdx);
    let correct = q[qIdx].correct_answer;
    if (optIdx === correct) correct = 0;
    else if (optIdx < correct) correct--;
    q[qIdx] = { ...q[qIdx], options: opts, correct_answer: correct };
    setQuestions(q);
  };

  const removeQuestion = (idx) => setQuestions(questions.filter((_, i) => i !== idx));

  const saveQuiz = async () => {
    if (!moduleId) { toast.error('Save the module first before adding a quiz'); return; }
    if (questions.length === 0) { toast.error('Add at least one question'); return; }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim()) { toast.error(`Question ${i + 1} text is required`); return; }
      if (questions[i].options.filter(o => o.trim()).length < 2) { toast.error(`Question ${i + 1} needs at least 2 options`); return; }
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/quiz`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, passing_score: passingScore })
      });
      if (res.ok) toast.success('Quiz saved');
      else { const e = await res.json(); toast.error(e.detail || 'Failed'); }
    } catch (e) { toast.error('Failed to save quiz'); }
    finally { setSaving(false); }
  };

  if (loading) return <Card><CardContent className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></CardContent></Card>;

  return (
    <Card data-testid="quiz-builder">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-500" /> Quiz</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-600">Pass %:</label>
              <Input type="number" value={passingScore} onChange={e => setPassingScore(parseInt(e.target.value) || 80)}
                className="w-20 text-center" min={0} max={100} data-testid="passing-score" />
            </div>
            <Button size="sm" onClick={addQuestion} data-testid="add-question-btn"><Plus className="w-4 h-4 mr-1" /> Add Question</Button>
            {questions.length > 0 && (
              <Button size="sm" onClick={saveQuiz} disabled={saving} className="bg-purple-600 hover:bg-purple-700" data-testid="save-quiz-btn">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />} Save Quiz
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {questions.length === 0 && <p className="text-gray-400 text-center py-6">No quiz yet. Add questions to test employee comprehension.</p>}
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="border rounded-lg p-4 bg-purple-50/50" data-testid={`quiz-question-${qIdx}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-purple-600">Question {qIdx + 1}</span>
              <Button variant="ghost" size="sm" onClick={() => removeQuestion(qIdx)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
            </div>
            <Input value={q.question} onChange={e => updateQuestion(qIdx, 'question', e.target.value)} placeholder="Enter question..." className="mb-3" />
            <div className="space-y-2 mb-3">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qIdx}`} checked={q.correct_answer === oIdx}
                    onChange={() => updateQuestion(qIdx, 'correct_answer', oIdx)} className="w-4 h-4 text-green-600" />
                  <Input value={opt} onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                    className={`flex-1 ${q.correct_answer === oIdx ? 'border-green-400 bg-green-50' : ''}`} />
                  {q.options.length > 2 && (
                    <button type="button" onClick={() => removeOption(qIdx, oIdx)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <button type="button" onClick={() => addOption(qIdx)} className="text-sm text-purple-600 hover:text-purple-800 ml-6">+ Add Option</button>
              )}
            </div>
            <Input value={q.explanation || ''} onChange={e => updateQuestion(qIdx, 'explanation', e.target.value)}
              placeholder="Explanation (shown after answering)" className="text-sm" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// ================ MODULE VIEWER WITH PROGRESS ================

const ModuleViewer = ({ module, onBack, progress, onProgressUpdate }) => {
  const completedSteps = progress?.completed_steps || [];
  const isModuleComplete = progress?.is_complete || false;
  const totalSteps = module.steps?.length || 0;

  const toggleStep = (stepIdx) => {
    let newCompleted;
    if (completedSteps.includes(stepIdx)) {
      newCompleted = completedSteps.filter(s => s !== stepIdx);
    } else {
      newCompleted = [...completedSteps, stepIdx];
    }
    onProgressUpdate(module.id, newCompleted, newCompleted.length >= totalSteps);
  };

  const markAllComplete = () => {
    const allSteps = module.steps.map((_, i) => i);
    onProgressUpdate(module.id, allSteps, true);
  };

  return (
    <div className="space-y-6" data-testid="module-viewer">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        {totalSteps > 0 && !isModuleComplete && (
          <Button onClick={markAllComplete} className="bg-green-600 hover:bg-green-700" data-testid="mark-complete-btn">
            <CheckCircle className="w-4 h-4 mr-1" /> Mark All Complete
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge>{module.department}</Badge>
                {isModuleComplete && <Badge className="bg-green-100 text-green-700">Completed</Badge>}
              </div>
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              {module.description && <p className="text-gray-500 mt-2">{module.description}</p>}
            </div>
            <StatusBadge status={module.status} />
          </div>
          {totalSteps > 0 && (
            <ProgressBar completed={completedSteps.length} total={totalSteps} className="mt-4" />
          )}
        </CardHeader>
        {module.content && (
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: module.content }} />
          </CardContent>
        )}
      </Card>

      {totalSteps > 0 && (
        <Card>
          <CardHeader><CardTitle>Step-by-Step Guide</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {module.steps.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              return (
                <div key={idx} className={`flex gap-4 p-4 rounded-lg border transition-colors ${isDone ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`} data-testid={`step-view-${idx}`}>
                  <button onClick={() => toggleStep(idx)} className="flex-shrink-0 mt-0.5" data-testid={`step-check-${idx}`}>
                    {isDone
                      ? <CheckCircle className="w-7 h-7 text-green-500" />
                      : <Circle className="w-7 h-7 text-gray-300 hover:text-blue-400 transition-colors" />
                    }
                  </button>
                  <div className="flex-1">
                    <h4 className={`font-semibold text-lg mb-1 ${isDone ? 'text-green-700 line-through' : ''}`}>{step.title || `Step ${idx + 1}`}</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{step.content}</p>
                    {step.image_url && <img src={step.image_url} alt={step.title} className="mt-3 rounded-lg max-w-full border" />}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Quiz Section */}
      <QuizTaker moduleId={module.id} token={localStorage.getItem('auth_token')} progress={progress} />
    </div>
  );
};

// ================ QUIZ TAKER (Employee) ================

const QuizTaker = ({ moduleId, token, progress }) => {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/quiz`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const d = await res.json();
          setQuiz(d.quiz);
        }
      } catch (e) { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchQuiz();
  }, [moduleId, token]);

  const submitQuiz = async () => {
    if (Object.keys(answers).length < (quiz?.questions?.length || 0)) {
      toast.error('Please answer all questions');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/quiz/submit`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      if (res.ok) {
        const d = await res.json();
        setResult(d);
        if (d.passed) toast.success(`Passed! Score: ${d.score}%`);
        else toast.error(`Did not pass. Score: ${d.score}% (need ${d.passing_score}%)`);
      }
    } catch (e) { toast.error('Failed to submit quiz'); }
    finally { setSubmitting(false); }
  };

  const retakeQuiz = () => {
    setResult(null);
    setAnswers({});
  };

  if (loading) return null;
  if (!quiz) return null;

  const quizPassed = progress?.quiz_passed;

  // Show results view
  if (result) {
    return (
      <Card data-testid="quiz-result" className={result.passed ? 'border-green-300 bg-green-50/30' : 'border-red-300 bg-red-50/30'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {result.passed ? <Award className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
              {result.passed ? 'Quiz Passed!' : 'Quiz Not Passed'}
            </CardTitle>
            <div className="text-right">
              <p className="text-3xl font-bold">{result.score}%</p>
              <p className="text-sm text-gray-500">{result.correct}/{result.total} correct (need {result.passing_score}%)</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {result.results?.map((r, idx) => (
            <div key={idx} className={`p-3 rounded-lg border ${r.is_correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-start gap-2">
                {r.is_correct ? <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" /> : <X className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-medium">{r.question}</p>
                  <p className="text-sm mt-1">
                    Your answer: <span className={r.is_correct ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>{r.options[r.user_answer] || 'Not answered'}</span>
                    {!r.is_correct && <span className="text-green-700 ml-2">Correct: {r.options[r.correct_answer]}</span>}
                  </p>
                  {r.explanation && <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>}
                </div>
              </div>
            </div>
          ))}
          {!result.passed && (
            <Button onClick={retakeQuiz} className="w-full mt-4" variant="outline" data-testid="retake-quiz-btn">
              <RotateCcw className="w-4 h-4 mr-2" /> Retake Quiz
            </Button>
          )}
          {result.passed && (
            <Button onClick={generateCertificate} className="w-full mt-4 bg-green-600 hover:bg-green-700" data-testid="download-cert-btn-result">
              <Download className="w-4 h-4 mr-2" /> Download Certificate
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Quiz already passed
  const generateCertificate = async () => {
    try {
      const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/certificate`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const cert = await res.json();
        // Download PDF via fetch
        const pdfRes = await fetch(`${API_URL}/api/training/certificates/${cert.id}/download`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pdfRes.ok) {
          const blob = await pdfRes.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Credlocity_Certificate_${cert.module_title?.replace(/\s+/g, '_') || 'Training'}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success('Certificate downloaded!');
        }
      } else {
        const e = await res.json();
        toast.error(e.detail || 'Failed');
      }
    } catch (e) { toast.error('Failed to generate certificate'); }
  };

  if (quizPassed) {
    return (
      <Card className="border-green-200 bg-green-50/30">
        <CardContent className="py-6 text-center">
          <Award className="w-10 h-10 text-green-500 mx-auto mb-2" />
          <p className="font-semibold text-green-700">Quiz Passed</p>
          <p className="text-sm text-gray-500">Score: {progress?.quiz_score}%</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Button onClick={generateCertificate} size="sm" className="bg-green-600 hover:bg-green-700" data-testid="download-cert-btn">
              <Download className="w-4 h-4 mr-1" /> Download Certificate
            </Button>
            <Button onClick={retakeQuiz} variant="outline" size="sm"><RotateCcw className="w-4 h-4 mr-1" /> Retake</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Take quiz
  return (
    <Card data-testid="quiz-taker">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-purple-500" /> Knowledge Quiz</CardTitle>
        <p className="text-sm text-gray-500">Answer all questions. You need {quiz.passing_score || 80}% to pass.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {quiz.questions?.map((q, qIdx) => (
          <div key={qIdx} className="space-y-3" data-testid={`take-question-${qIdx}`}>
            <p className="font-medium"><span className="text-purple-600 mr-2">Q{qIdx + 1}.</span>{q.question}</p>
            <div className="space-y-2 ml-6">
              {q.options?.map((opt, oIdx) => (
                <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${answers[String(qIdx)] === oIdx ? 'border-purple-400 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name={`take-q-${qIdx}`} checked={answers[String(qIdx)] === oIdx}
                    onChange={() => setAnswers({ ...answers, [String(qIdx)]: oIdx })} className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button onClick={submitQuiz} disabled={submitting} className="w-full bg-purple-600 hover:bg-purple-700" data-testid="submit-quiz-btn">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
          Submit Quiz ({Object.keys(answers).length}/{quiz.questions?.length || 0} answered)
        </Button>
      </CardContent>
    </Card>
  );
};

// ================ POLICY FORM ================

const PolicyForm = ({ policy, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: '', description: '', department: 'General', category: 'General',
    content: '', sections: [], status: 'draft', effective_date: '', order: 0,
    ...(policy || {})
  });
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch(`${API_URL}/api/training/policy-categories`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) { const d = await res.json(); setCategories(d.categories || []); }
      } catch (e) { /* ignore */ }
    };
    fetchCats();
  }, []);

  const addSection = () => {
    setForm({
      ...form,
      sections: [...form.sections, { id: Date.now().toString(), title: '', content: '', order: form.sections.length }]
    });
  };

  const updateSection = (idx, field, value) => {
    const sections = [...form.sections];
    sections[idx] = { ...sections[idx], [field]: value };
    setForm({ ...form, sections });
  };

  const removeSection = (idx) => {
    setForm({ ...form, sections: form.sections.filter((_, i) => i !== idx) });
  };

  const handleSave = async (status) => {
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try { await onSave({ ...form, status: status || form.status }); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6" data-testid="policy-form">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onCancel} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}><Clock className="w-4 h-4 mr-1" /> Save Draft</Button>
          <Button onClick={() => handleSave('published')} disabled={saving} className="bg-green-600 hover:bg-green-700">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />} Publish
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{policy ? 'Edit Policy' : 'New Policy Document'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Collections Department Guidelines" data-testid="policy-title" />
            </div>
            <div>
              <label className="text-sm font-medium">Department</label>
              <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} className="w-full mt-1 p-2 border rounded-lg" data-testid="policy-department">
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full mt-1 p-2 border rounded-lg">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__new__">+ New Category</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Effective Date</label>
              <Input type="date" value={form.effective_date} onChange={e => setForm({ ...form, effective_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="w-full mt-1 p-3 border rounded-lg" placeholder="Brief overview of this policy" />
          </div>
          <div>
            <label className="text-sm font-medium">Main Content</label>
            <RichTextEditor content={form.content} onChange={c => setForm({ ...form, content: c })} placeholder="Write the policy content..." />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Policy Sections</CardTitle>
            <Button size="sm" onClick={addSection} data-testid="add-section-btn"><Plus className="w-4 h-4 mr-1" /> Add Section</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.sections.length === 0 && <p className="text-gray-400 text-center py-6">Add sections to organize this policy into areas.</p>}
          {form.sections.map((section, idx) => (
            <div key={section.id || idx} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-purple-600">Section {idx + 1}</span>
                <Button variant="ghost" size="sm" onClick={() => removeSection(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
              </div>
              <Input value={section.title} onChange={e => updateSection(idx, 'title', e.target.value)} placeholder="Section title" className="mb-3" />
              <RichTextEditor content={section.content} onChange={c => updateSection(idx, 'content', c)} placeholder="Section content..." />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

// ================ POLICY VIEWER ================

const PolicyViewer = ({ policy, onBack }) => (
  <div className="space-y-6" data-testid="policy-viewer">
    <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="w-4 h-4" /> Back</Button>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex gap-2 mb-2"><Badge>{policy.department}</Badge><Badge variant="outline">{policy.category}</Badge></div>
            <CardTitle className="text-2xl">{policy.title}</CardTitle>
            {policy.description && <p className="text-gray-500 mt-2">{policy.description}</p>}
            {policy.effective_date && <p className="text-xs text-gray-400 mt-1">Effective: {policy.effective_date}</p>}
          </div>
          <StatusBadge status={policy.status} />
        </div>
      </CardHeader>
      {policy.content && <CardContent><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: policy.content }} /></CardContent>}
    </Card>

    {policy.sections?.map((section, idx) => (
      <Card key={idx}>
        <CardHeader><CardTitle className="text-lg">{section.title || `Section ${idx + 1}`}</CardTitle></CardHeader>
        <CardContent><div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} /></CardContent>
      </Card>
    ))}
  </div>
);

// ================ PROGRESS DASHBOARD (Admin) ================

const ProgressDashboard = ({ token }) => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleReport, setModuleReport] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await window.fetch(`${API_URL}/api/training/progress/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) setDashboard(await res.json());
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [token]);

  const fetchModuleReport = async (moduleId) => {
    try {
      const res = await window.fetch(`${API_URL}/api/training/modules/${moduleId}/progress-report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setModuleReport(data);
        setSelectedModule(moduleId);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;
  if (!dashboard) return <p className="text-center text-gray-400 py-16">No progress data available yet.</p>;

  if (selectedModule && moduleReport) {
    return (
      <div className="space-y-6" data-testid="module-progress-report">
        <Button variant="ghost" onClick={() => { setSelectedModule(null); setModuleReport(null); }} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>{moduleReport.module_title} - Progress Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-6 mb-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">{moduleReport.completed}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">{moduleReport.in_progress}</p>
                <p className="text-sm text-gray-500">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-600">{moduleReport.total_assigned}</p>
                <p className="text-sm text-gray-500">Total Started</p>
              </div>
            </div>
            {moduleReport.employees?.length > 0 ? (
              <div className="space-y-3">
                {moduleReport.employees.map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{emp.user_name || emp.user_email}</p>
                      <p className="text-xs text-gray-400">{emp.user_email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <ProgressBar completed={emp.completed_steps?.length || 0} total={emp.total_steps || 0} className="w-32" />
                      {emp.quiz_passed && <Badge className="bg-purple-100 text-purple-700">Quiz: {emp.quiz_score}%</Badge>}
                      {emp.is_complete
                        ? <Badge className="bg-green-100 text-green-700">Done</Badge>
                        : <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                      }
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No employees have started this module yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="progress-dashboard">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{dashboard.total_modules}</p>
            <p className="text-sm text-gray-500">Published Modules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{dashboard.total_completions}</p>
            <p className="text-sm text-gray-500">Total Completions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <Clock className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-3xl font-bold">{dashboard.total_in_progress}</p>
            <p className="text-sm text-gray-500">In Progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Module Completion Rates */}
      <Card>
        <CardHeader><CardTitle>Module Completion Rates</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {dashboard.module_stats?.length === 0 && <p className="text-gray-400 text-center py-6">No modules or progress data yet.</p>}
          {dashboard.module_stats?.map(ms => (
            <div key={ms.module_id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors" onClick={() => fetchModuleReport(ms.module_id)}>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{ms.title}</p>
                <p className="text-xs text-gray-500">{ms.department} - {ms.total_steps} steps {ms.has_quiz && '+ Quiz'}</p>
              </div>
              <div className="w-40">
                <ProgressBar completed={ms.employees_completed} total={ms.employees_started || 1} />
              </div>
              {ms.has_quiz && ms.avg_quiz_score !== null && (
                <div className="text-right w-20">
                  <p className="text-xs text-purple-600 font-medium">Avg: {ms.avg_quiz_score}%</p>
                  <p className="text-xs text-gray-400">{ms.quiz_pass_rate}% pass</p>
                </div>
              )}
              <div className="text-right w-16">
                <p className="text-sm font-bold text-blue-600">{ms.completion_rate}%</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Performers */}
      {dashboard.top_performers?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Top Performers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboard.top_performers.map((p, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                    idx === 1 ? 'bg-gray-100 text-gray-700' :
                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  }`}>{idx + 1}</span>
                  <span className="font-medium flex-1">{p.user_name}</span>
                  <Badge variant="outline">{p.count} modules completed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Department Stats */}
      {Object.keys(dashboard.department_stats || {}).length > 0 && (
        <Card>
          <CardHeader><CardTitle>By Department</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(dashboard.department_stats).map(([dept, stats]) => (
                <div key={dept} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-sm">{dept}</p>
                  <p className="text-2xl font-bold mt-1">{stats.total_completions}</p>
                  <p className="text-xs text-gray-500">{stats.total_modules} modules, {stats.total_started} started</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// ================ ASSIGN MODAL ================

const AssignModal = ({ module, onClose, token }) => {
  const [employees, setEmployees] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [department, setDepartment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');
  const [searchQ, setSearchQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEmps = async () => {
      try {
        const res = await fetch(`${API_URL}/api/training/employees?q=${encodeURIComponent(searchQ)}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { const d = await res.json(); setEmployees(d.employees || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchEmps();
  }, [token, searchQ]);

  const toggleEmployee = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSubmit = async () => {
    if (!selectedIds.length && !department) { toast.error('Select employees or a department'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/training/assignments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module_id: module.id,
          employee_ids: selectedIds,
          department: department || undefined,
          due_date: dueDate || undefined,
          note
        })
      });
      if (res.ok) {
        const d = await res.json();
        toast.success(`Assigned to ${d.created} employee(s)`);
        onClose(true);
      } else {
        const e = await res.json();
        toast.error(e.detail || 'Failed to assign');
      }
    } catch (e) { toast.error('Failed to assign'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" data-testid="assign-modal">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <div className="p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Assign Training</h3>
            <p className="text-sm text-gray-500">{module.title}</p>
          </div>
          <button onClick={() => onClose(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Assign by department */}
          <div>
            <label className="text-sm font-medium">Assign to entire department (optional)</label>
            <select value={department} onChange={e => { setDepartment(e.target.value); if (e.target.value) setSelectedIds([]); }}
              className="w-full mt-1 p-2 border rounded-lg" data-testid="assign-department">
              <option value="">-- Select individual employees instead --</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {/* Or select individual employees */}
          {!department && (
            <div>
              <label className="text-sm font-medium">Select Employees</label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search employees..." className="pl-10" data-testid="assign-search" />
              </div>
              <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg">
                {loading ? (
                  <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
                ) : employees.length === 0 ? (
                  <p className="p-4 text-sm text-gray-400 text-center">No employees found</p>
                ) : (
                  employees.map(emp => (
                    <label key={emp.id} className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                      <input type="checkbox" checked={selectedIds.includes(emp.id)} onChange={() => toggleEmployee(emp.id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{emp.full_name || emp.email}</p>
                        <p className="text-xs text-gray-400">{emp.email}{emp.department ? ` - ${emp.department}` : ''}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>
              {selectedIds.length > 0 && <p className="text-xs text-blue-600 mt-1">{selectedIds.length} selected</p>}
            </div>
          )}

          {/* Due date */}
          <div>
            <label className="text-sm font-medium">Due Date (optional)</label>
            <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="mt-1" data-testid="assign-due-date" />
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium">Note (optional)</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} className="w-full mt-1 p-3 border rounded-lg text-sm" placeholder="Add a note for the assignee..." />
          </div>
        </div>

        <div className="p-5 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={() => onClose(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700" data-testid="assign-submit-btn">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />}
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

// ================ ASSIGNMENTS TAB ================

const AssignmentsTab = ({ token, modules }) => {
  const [assignments, setAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, assigned, overdue, completed

  const fetchAssignments = useCallback(async () => {
    try {
      const [adminRes, myRes] = await Promise.all([
        fetch(`${API_URL}/api/training/assignments`, { headers: { 'Authorization': `Bearer ${token}` } }).catch(() => null),
        fetch(`${API_URL}/api/training/my-assignments`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      if (adminRes?.ok) { const d = await adminRes.json(); setAssignments(d.assignments || []); }
      if (myRes.ok) { const d = await myRes.json(); setMyAssignments(d.assignments || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const cancelAssignment = async (id) => {
    if (!window.confirm('Cancel this assignment?')) return;
    try {
      await fetch(`${API_URL}/api/training/assignments/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Assignment cancelled');
      fetchAssignments();
    } catch (e) { toast.error('Failed'); }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'assigned': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="assignments-tab">
      {/* My Assignments (if any) */}
      {myAssignments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700"><UserPlus className="w-5 h-5" /> My Assignments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myAssignments.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.status === 'overdue' ? 'bg-red-50 border-red-200' : a.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                <div className="flex items-center gap-3">
                  {a.is_complete ? <CheckCircle className="w-5 h-5 text-green-500" /> : a.status === 'overdue' ? <AlertTriangle className="w-5 h-5 text-red-500" /> : <Circle className="w-5 h-5 text-blue-400" />}
                  <div>
                    <p className="font-medium">{a.module_title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {a.due_date && <span className={`flex items-center gap-1 ${a.status === 'overdue' ? 'text-red-600 font-semibold' : ''}`}><CalendarDays className="w-3 h-3" /> Due: {a.due_date}</span>}
                      {a.note && <span>- {a.note}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {a.total_steps > 0 && <ProgressBar completed={a.completed_steps} total={a.total_steps} className="w-24" />}
                  <Badge className={getStatusStyle(a.status)}>{a.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Admin: All Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Assignments</CardTitle>
            <div className="flex gap-2">
              {['all', 'assigned', 'overdue', 'completed'].map(f => (
                <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
                  {f}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAssignments.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No assignments {filter !== 'all' ? `with status "${filter}"` : 'yet'}. Assign modules from the Training Modules tab.</p>
          ) : (
            <div className="space-y-2">
              {filteredAssignments.map(a => (
                <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.status === 'overdue' ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`} data-testid={`assignment-${a.id}`}>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{a.employee_name || a.employee_email}</p>
                      <p className="text-xs text-gray-500 truncate">{a.module_title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {a.due_date && (
                      <span className={`text-xs flex items-center gap-1 ${a.status === 'overdue' ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                        <CalendarDays className="w-3 h-3" /> {a.due_date}
                      </span>
                    )}
                    {a.total_steps > 0 && <ProgressBar completed={a.completed_steps} total={a.total_steps} className="w-20" />}
                    <Badge className={getStatusStyle(a.status)}>{a.status}</Badge>
                    <Button variant="ghost" size="sm" onClick={() => cancelAssignment(a.id)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ================ CERTIFICATES TAB ================

const CertificatesTab = ({ token }) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/training/certificates`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) { const d = await res.json(); setCertificates(d.certificates || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchCerts();
  }, [token]);

  const downloadCert = async (cert) => {
    try {
      const res = await fetch(`${API_URL}/api/training/certificates/${cert.id}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Credlocity_Certificate_${cert.module_title?.replace(/\s+/g, '_') || 'Training'}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) { toast.error('Download failed'); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6" data-testid="certificates-tab">
      {certificates.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ScrollText className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No certificates yet</p>
          <p className="text-sm mt-1">Complete training modules and pass quizzes to earn certificates</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map(cert => (
            <Card key={cert.id} className="hover:shadow-md transition-shadow border-green-200" data-testid={`cert-${cert.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Award className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold truncate">{cert.module_title}</h3>
                    <p className="text-xs text-gray-500">{cert.department}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  {cert.quiz_score != null && (
                    <span className="text-green-600 font-medium">Score: {cert.quiz_score}%</span>
                  )}
                  <span>{cert.completed_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <code className="text-xs text-gray-400">{cert.id.slice(0, 8)}...</code>
                  <Button size="sm" onClick={() => downloadCert(cert)} className="bg-green-600 hover:bg-green-700" data-testid={`download-cert-${cert.id}`}>
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// ================ MAIN PAGE ================

export default function TrainingCenter() {
  const [tab, setTab] = useState('training');
  const [view, setView] = useState('list'); // list, form, view
  const [modules, setModules] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [myProgress, setMyProgress] = useState({});
  const [assignModule, setAssignModule] = useState(null);
  const token = localStorage.getItem('auth_token');

  const fetchModules = useCallback(async () => {
    try {
      const params = deptFilter ? `?department=${encodeURIComponent(deptFilter)}` : '';
      const res = await fetch(`${API_URL}/api/training/modules${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setModules(d.modules || []); }
    } catch (e) { console.error(e); }
  }, [token, deptFilter]);

  const fetchPolicies = useCallback(async () => {
    try {
      const params = deptFilter ? `?department=${encodeURIComponent(deptFilter)}` : '';
      const res = await fetch(`${API_URL}/api/training/policies${params}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setPolicies(d.policies || []); }
    } catch (e) { console.error(e); }
  }, [token, deptFilter]);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/training/my-progress`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) { const d = await res.json(); setMyProgress(d.progress || {}); }
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => {
    Promise.all([fetchModules(), fetchPolicies(), fetchProgress()]).then(() => setLoading(false));
  }, [fetchModules, fetchPolicies, fetchProgress]);

  const handleProgressUpdate = async (moduleId, completedSteps, isComplete) => {
    try {
      const res = await fetch(`${API_URL}/api/training/modules/${moduleId}/progress`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed_steps: completedSteps, is_complete: isComplete })
      });
      if (res.ok) {
        const data = await res.json();
        setMyProgress(prev => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            completed_steps: data.completed_steps,
            is_complete: data.is_complete,
            total_steps: data.total_steps
          }
        }));
        if (isComplete) toast.success('Module completed!');
      }
    } catch (e) { toast.error('Failed to save progress'); }
  };

  const saveModule = async (data) => {
    const url = data.id && selected
      ? `${API_URL}/api/training/modules/${data.id}`
      : `${API_URL}/api/training/modules`;
    const method = data.id && selected ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) { toast.success('Module saved'); setView('list'); setSelected(null); fetchModules(); }
    else toast.error('Failed to save');
  };

  const savePolicy = async (data) => {
    const url = data.id && selected
      ? `${API_URL}/api/training/policies/${data.id}`
      : `${API_URL}/api/training/policies`;
    const method = data.id && selected ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.ok) { toast.success('Policy saved'); setView('list'); setSelected(null); fetchPolicies(); }
    else toast.error('Failed to save');
  };

  const deleteItem = async (type, id) => {
    if (!window.confirm('Delete this item?')) return;
    const res = await fetch(`${API_URL}/api/training/${type}/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) { toast.success('Deleted'); type === 'modules' ? fetchModules() : fetchPolicies(); }
  };

  const filteredModules = modules.filter(m => !search || m.title.toLowerCase().includes(search.toLowerCase()));
  const filteredPolicies = policies.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  if (view === 'form' && tab === 'training') return <div className="p-6"><ModuleForm module={selected} onSave={saveModule} onCancel={() => { setView('list'); setSelected(null); }} /></div>;
  if (view === 'form' && tab === 'policies') return <div className="p-6"><PolicyForm policy={selected} onSave={savePolicy} onCancel={() => { setView('list'); setSelected(null); }} /></div>;
  if (view === 'view' && selected) return (
    <div className="p-6">
      {tab === 'training'
        ? <ModuleViewer module={selected} onBack={() => { setView('list'); setSelected(null); }} progress={myProgress[selected.id]} onProgressUpdate={handleProgressUpdate} />
        : <PolicyViewer policy={selected} onBack={() => { setView('list'); setSelected(null); }} />
      }
    </div>
  );

  return (
    <div className="p-6" data-testid="training-center">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-blue-500" /> Training & Policies
        </h1>
        <p className="text-gray-500 mt-1">Manage employee training modules and company rules & policies</p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="training" className="gap-2"><BookOpen className="w-4 h-4" /> Training Modules</TabsTrigger>
            <TabsTrigger value="policies" className="gap-2"><Shield className="w-4 h-4" /> Rules & Policies</TabsTrigger>
            <TabsTrigger value="progress" className="gap-2" data-testid="progress-tab"><BarChart3 className="w-4 h-4" /> Progress</TabsTrigger>
            <TabsTrigger value="assignments" className="gap-2" data-testid="assignments-tab"><UserPlus className="w-4 h-4" /> Assignments</TabsTrigger>
            <TabsTrigger value="certificates" className="gap-2" data-testid="certificates-tab"><ScrollText className="w-4 h-4" /> Certificates</TabsTrigger>
          </TabsList>
          {(tab === 'training' || tab === 'policies') && (
            <Button onClick={() => { setSelected(null); setView('form'); }} className="bg-blue-600 hover:bg-blue-700" data-testid="create-new-btn">
              <Plus className="w-4 h-4 mr-1" /> {tab === 'training' ? 'New Module' : 'New Policy'}
            </Button>
          )}
        </div>

        {/* Filters (not on progress tab) */}
        {(tab === 'training' || tab === 'policies') && (
          <div className="flex gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="pl-10" data-testid="search-input" />
            </div>
            <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" data-testid="dept-filter">
              <option value="">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        )}

        <TabsContent value="training">
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No training modules yet</p>
              <p className="text-sm mt-1">Create your first training module to get started</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredModules.map(mod => {
                const prog = myProgress[mod.id];
                const completedCount = prog?.completed_steps?.length || 0;
                const totalSteps = mod.steps?.length || 0;
                const isComplete = prog?.is_complete;
                return (
                  <Card key={mod.id} className={`hover:shadow-md transition-shadow ${isComplete ? 'border-green-200 bg-green-50/30' : ''}`}>
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isComplete ? 'bg-green-100' : 'bg-blue-100'}`}>
                          {isComplete
                            ? <CheckCircle className="w-6 h-6 text-green-600" />
                            : <GraduationCap className="w-6 h-6 text-blue-600" />
                          }
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold truncate">{mod.title}</h3>
                            <StatusBadge status={mod.status} />
                            {isComplete && <Badge className="bg-green-100 text-green-700">Completed</Badge>}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {mod.department}</span>
                            {totalSteps > 0 && <span>{totalSteps} steps</span>}
                          </div>
                          {totalSteps > 0 && (
                            <ProgressBar completed={completedCount} total={totalSteps} className="mt-2 max-w-xs" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => setAssignModule(mod)} title="Assign" data-testid={`assign-module-${mod.id}`}><UserPlus className="w-4 h-4 text-blue-500" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(mod); setView('view'); }} data-testid={`view-module-${mod.id}`}><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(mod); setView('form'); }}><Edit className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => deleteItem('modules', mod.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="policies">
          {loading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
          ) : filteredPolicies.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Shield className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No policies yet</p>
              <p className="text-sm mt-1">Create company rules and policies organized by department</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredPolicies.map(pol => (
                <Card key={pol.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">{pol.title}</h3>
                          <StatusBadge status={pol.status} />
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {pol.department}</span>
                          <Badge variant="outline" className="text-xs">{pol.category}</Badge>
                          {pol.sections?.length > 0 && <span>{pol.sections.length} sections</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(pol); setView('view'); }}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(pol); setView('form'); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteItem('policies', pol.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="progress">
          <ProgressDashboard token={token} />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentsTab token={token} modules={modules} />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificatesTab token={token} />
        </TabsContent>
      </Tabs>

      {/* Assign Modal */}
      {assignModule && (
        <AssignModal
          module={assignModule}
          token={token}
          onClose={(refresh) => {
            setAssignModule(null);
            if (refresh) setTab('assignments');
          }}
        />
      )}
    </div>
  );
}
