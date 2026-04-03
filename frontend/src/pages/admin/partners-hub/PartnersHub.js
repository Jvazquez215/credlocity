import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { toast } from 'sonner';
import {
  Star, Plus, X, Edit3, Trash2, Check, Clock, MessageCircle, Users, FileText,
  Calendar, DollarSign, Loader2, ChevronDown, ChevronRight, CheckCircle, 
  AlertCircle, Search, BookOpen, TrendingUp, Receipt, User, BarChart3,
  CreditCard, GraduationCap, ShieldCheck, Download, GitMerge
} from 'lucide-react';
import CPRMergerTab from './CPRMergerTab';

const API = process.env.REACT_APP_BACKEND_URL;
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`
});

// ============ REUSABLE MODAL ============
const Modal = ({ title, onClose, children, width = 'max-w-lg' }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className={`bg-white rounded-2xl shadow-xl w-full ${width} max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);


// ============ TODO LIST ============
const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/partners-hub/todos`, { headers: getHeaders() });
      if (res.ok) setTodos(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleTodo = async (todo) => {
    const newStatus = todo.status === 'done' ? 'pending' : 'done';
    await fetch(`${API}/api/partners-hub/todos/${todo.id}`, {
      method: 'PUT', headers: getHeaders(),
      body: JSON.stringify({ status: newStatus })
    });
    load();
  };

  const deleteTodo = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    await fetch(`${API}/api/partners-hub/todos/${id}`, { method: 'DELETE', headers: getHeaders() });
    load(); toast.success('Task deleted');
  };

  const saveTodo = async (data) => {
    const method = editTodo ? 'PUT' : 'POST';
    const url = editTodo ? `${API}/api/partners-hub/todos/${editTodo.id}` : `${API}/api/partners-hub/todos`;
    const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(data) });
    if (res.ok) { toast.success(editTodo ? 'Task updated' : 'Task created'); setShowForm(false); setEditTodo(null); load(); }
  };

  const filtered = todos.filter(t => {
    if (filter === 'active') return t.status !== 'done';
    if (filter === 'done') return t.status === 'done';
    return true;
  });

  const priorityColors = { high: 'border-l-red-500 bg-red-50/50', medium: 'border-l-amber-500 bg-amber-50/30', low: 'border-l-blue-500 bg-blue-50/30' };
  const statusIcons = { done: <CheckCircle className="w-5 h-5 text-green-500" />, in_progress: <Clock className="w-5 h-5 text-amber-500" />, pending: <AlertCircle className="w-5 h-5 text-gray-300" /> };

  if (loading) return <div className="text-center py-12 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;

  return (
    <div data-testid="todo-list">
      <div className="flex items-center justify-between mb-5">
        <div className="flex gap-1">
          {['all', 'active', 'done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${filter === f ? 'bg-slate-900 text-white' : 'text-gray-500 hover:bg-gray-100'}`}>
              {f === 'all' ? `All (${todos.length})` : f === 'active' ? `Active (${todos.filter(t => t.status !== 'done').length})` : `Done (${todos.filter(t => t.status === 'done').length})`}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditTodo(null); setShowForm(true); }} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800" data-testid="add-todo-btn">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No tasks yet</p>
          </div>
        ) : filtered.map(todo => (
          <div key={todo.id} className={`flex items-start gap-3 p-3 border-l-4 rounded-lg border transition hover:shadow-sm ${priorityColors[todo.priority] || 'border-l-gray-300'} ${todo.status === 'done' ? 'opacity-60' : ''}`} data-testid={`todo-${todo.id}`}>
            <button onClick={() => toggleTodo(todo)} className="mt-0.5 flex-shrink-0">
              {statusIcons[todo.status] || statusIcons.pending}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${todo.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900'}`}>{todo.title}</p>
              {todo.description && <p className="text-xs text-gray-500 mt-0.5">{todo.description}</p>}
              <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                {todo.assigned_to && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {todo.assigned_to}</span>}
                {todo.due_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(todo.due_date).toLocaleDateString()}</span>}
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${todo.priority === 'high' ? 'bg-red-100 text-red-600' : todo.priority === 'medium' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>{todo.priority}</span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              <button onClick={() => { setEditTodo(todo); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
              <button onClick={() => deleteTodo(todo.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TodoForm
          todo={editTodo}
          onSave={saveTodo}
          onClose={() => { setShowForm(false); setEditTodo(null); }}
        />
      )}
    </div>
  );
};

const TodoForm = ({ todo, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: todo?.title || '', description: todo?.description || '',
    priority: todo?.priority || 'medium', status: todo?.status || 'pending',
    due_date: todo?.due_date || '', assigned_to: todo?.assigned_to || '',
  });
  return (
    <Modal title={todo ? 'Edit Task' : 'New Task'} onClose={onClose}>
      <div className="space-y-3">
        <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Task title" data-testid="todo-title" />
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Description (optional)" />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="low">Low Priority</option><option value="medium">Medium</option><option value="high">High Priority</option>
          </select>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="done">Done</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={form.due_date} onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="text" value={form.assigned_to} onChange={e => setForm(p => ({ ...p, assigned_to: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Assigned to" />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800" data-testid="save-todo-btn">Save</button>
        </div>
      </div>
    </Modal>
  );
};


// ============ MEETING MINUTES ============
const MeetingMinutes = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMeeting, setEditMeeting] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/partners-hub/meetings`, { headers: getHeaders() });
      if (res.ok) setMeetings(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteMeeting = async (id) => {
    if (!window.confirm('Delete this meeting?')) return;
    await fetch(`${API}/api/partners-hub/meetings/${id}`, { method: 'DELETE', headers: getHeaders() });
    load(); toast.success('Meeting deleted');
  };

  const meetingTypeColors = { regular: 'bg-blue-100 text-blue-700', special: 'bg-purple-100 text-purple-700', emergency: 'bg-red-100 text-red-700', quarterly: 'bg-emerald-100 text-emerald-700' };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div data-testid="meeting-minutes">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{meetings.length} meetings recorded</p>
        <button onClick={() => { setEditMeeting(null); setShowForm(true); }} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800" data-testid="add-meeting-btn">
          <Plus className="w-4 h-4" /> New Meeting
        </button>
      </div>

      <div className="space-y-3">
        {meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No meetings recorded yet</p>
          </div>
        ) : meetings.map(m => (
          <div key={m.id} className="bg-white border rounded-xl overflow-hidden" data-testid={`meeting-${m.id}`}>
            <button onClick={() => setExpandedId(expandedId === m.id ? null : m.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                    <span>{new Date(m.date).toLocaleDateString()}</span>
                    {m.start_time && <span>{m.start_time} - {m.end_time}</span>}
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${meetingTypeColors[m.meeting_type] || 'bg-gray-100 text-gray-600'}`}>{m.meeting_type}</span>
                    {m.topics?.length > 0 && <span>{m.topics.length} topics</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={e => { e.stopPropagation(); setEditMeeting(m); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                <button onClick={e => { e.stopPropagation(); deleteMeeting(m.id); }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                {expandedId === m.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {expandedId === m.id && (
              <div className="border-t p-4 bg-gray-50 space-y-4 text-sm">
                {m.location && <p className="text-gray-600"><strong>Location:</strong> {m.location}</p>}
                {m.attendees?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Attendees</p>
                    <div className="flex flex-wrap gap-1.5">{m.attendees.map((a, i) => (
                      <span key={i} className="px-2 py-1 bg-white border rounded-full text-xs text-gray-600">{a}</span>
                    ))}</div>
                  </div>
                )}
                {m.topics?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-2">Topics Discussed</p>
                    <div className="space-y-2">
                      {m.topics.map((t, i) => (
                        <div key={i} className="bg-white border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{i + 1}. {t.title}</p>
                            {t.duration_minutes > 0 && <span className="text-xs text-gray-400">{t.duration_minutes} min</span>}
                          </div>
                          {t.presenter && <p className="text-xs text-gray-500 mt-0.5">Presented by: {t.presenter}</p>}
                          {t.notes && <p className="text-gray-600 mt-1 text-xs leading-relaxed whitespace-pre-wrap">{t.notes}</p>}
                          {t.decision && <p className="text-xs mt-1"><strong className="text-green-700">Decision:</strong> {t.decision}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {m.notes && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">General Notes</p>
                    <p className="text-gray-600 whitespace-pre-wrap text-xs leading-relaxed bg-white border rounded-lg p-3">{m.notes}</p>
                  </div>
                )}
                {m.decisions?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Decisions Made</p>
                    <ul className="space-y-1">{m.decisions.map((d, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs"><CheckCircle className="w-3.5 h-3.5 text-green-500 mt-0.5 flex-shrink-0" /> {d}</li>
                    ))}</ul>
                  </div>
                )}
                {m.action_items?.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Action Items</p>
                    <ul className="space-y-1">{m.action_items.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs"><AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> {a}</li>
                    ))}</ul>
                  </div>
                )}
                {m.next_meeting_date && <p className="text-xs text-gray-500"><strong>Next Meeting:</strong> {new Date(m.next_meeting_date).toLocaleDateString()}</p>}
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <MeetingForm
          meeting={editMeeting}
          onClose={() => { setShowForm(false); setEditMeeting(null); }}
          onSaved={() => { setShowForm(false); setEditMeeting(null); load(); }}
        />
      )}
    </div>
  );
};

const MeetingForm = ({ meeting, onClose, onSaved }) => {
  const [form, setForm] = useState({
    title: meeting?.title || '', date: meeting?.date || new Date().toISOString().split('T')[0],
    start_time: meeting?.start_time || '', end_time: meeting?.end_time || '',
    location: meeting?.location || '', meeting_type: meeting?.meeting_type || 'regular',
    attendees: meeting?.attendees?.join(', ') || '', notes: meeting?.notes || '',
    decisions: meeting?.decisions?.join('\n') || '', action_items: meeting?.action_items?.join('\n') || '',
    next_meeting_date: meeting?.next_meeting_date || '',
  });
  const [topics, setTopics] = useState(meeting?.topics || []);
  const [saving, setSaving] = useState(false);

  const addTopic = () => setTopics([...topics, { title: '', notes: '', duration_minutes: 0, presenter: '', decision: '' }]);
  const updateTopic = (i, field, val) => { const t = [...topics]; t[i] = { ...t[i], [field]: val }; setTopics(t); };
  const removeTopic = (i) => setTopics(topics.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    setSaving(true);
    const payload = {
      ...form,
      attendees: form.attendees.split(',').map(a => a.trim()).filter(Boolean),
      decisions: form.decisions.split('\n').filter(Boolean),
      action_items: form.action_items.split('\n').filter(Boolean),
      topics,
    };
    const method = meeting ? 'PUT' : 'POST';
    const url = meeting ? `${API}/api/partners-hub/meetings/${meeting.id}` : `${API}/api/partners-hub/meetings`;
    const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
    if (res.ok) { toast.success(meeting ? 'Meeting updated' : 'Meeting created'); onSaved(); }
    else toast.error('Save failed');
    setSaving(false);
  };

  return (
    <Modal title={meeting ? 'Edit Meeting Minutes' : 'New Meeting Minutes'} onClose={onClose} width="max-w-2xl">
      <div className="space-y-4">
        <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Meeting title" data-testid="meeting-title" />
        <div className="grid grid-cols-3 gap-3">
          <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
          <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Start" />
          <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" placeholder="End" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="text" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Location" />
          <select value={form.meeting_type} onChange={e => setForm(p => ({ ...p, meeting_type: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="regular">Regular</option><option value="special">Special</option><option value="emergency">Emergency</option><option value="quarterly">Quarterly</option>
          </select>
        </div>
        <input type="text" value={form.attendees} onChange={e => setForm(p => ({ ...p, attendees: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Attendees (comma-separated)" />

        {/* Topics */}
        <div className="border rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">Topics / Agenda</label>
            <button onClick={addTopic} className="flex items-center gap-1 text-xs bg-white border px-2.5 py-1 rounded-lg hover:bg-gray-50" data-testid="add-topic-btn">
              <Plus className="w-3 h-3" /> Add Topic
            </button>
          </div>
          {topics.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No topics added. Click "Add Topic" to start.</p>
          ) : (
            <div className="space-y-3">
              {topics.map((t, i) => (
                <div key={i} className="bg-white border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 w-5">{i + 1}.</span>
                    <input type="text" value={t.title} onChange={e => updateTopic(i, 'title', e.target.value)} className="flex-1 px-2 py-1.5 border rounded text-sm" placeholder="Topic title" />
                    <input type="number" value={t.duration_minutes} onChange={e => updateTopic(i, 'duration_minutes', parseInt(e.target.value) || 0)} className="w-16 px-2 py-1.5 border rounded text-sm text-center" placeholder="min" />
                    <button onClick={() => removeTopic(i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                  <input type="text" value={t.presenter} onChange={e => updateTopic(i, 'presenter', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs" placeholder="Presenter" />
                  <textarea value={t.notes} onChange={e => updateTopic(i, 'notes', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs" rows={2} placeholder="Discussion notes..." />
                  <input type="text" value={t.decision} onChange={e => updateTopic(i, 'decision', e.target.value)} className="w-full px-2 py-1.5 border rounded text-xs" placeholder="Decision made (if any)" />
                </div>
              ))}
            </div>
          )}
        </div>

        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="General meeting notes..." />
        <textarea value={form.decisions} onChange={e => setForm(p => ({ ...p, decisions: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Decisions made (one per line)" />
        <textarea value={form.action_items} onChange={e => setForm(p => ({ ...p, action_items: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Action items (one per line)" />
        <input type="date" value={form.next_meeting_date} onChange={e => setForm(p => ({ ...p, next_meeting_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Next meeting date" />

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800 disabled:opacity-50" data-testid="save-meeting-btn">
            {saving ? 'Saving...' : 'Save Meeting'}
          </button>
        </div>
      </div>
    </Modal>
  );
};


// ============ DISCUSSIONS ============
const Discussions = () => {
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [replyText, setReplyText] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/partners-hub/discussions`, { headers: getHeaders() });
      if (res.ok) setDiscussions(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const createDiscussion = async (data) => {
    const res = await fetch(`${API}/api/partners-hub/discussions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (res.ok) { toast.success('Discussion created'); setShowForm(false); load(); }
  };

  const addReply = async (discussionId) => {
    if (!replyText.trim()) return;
    await fetch(`${API}/api/partners-hub/discussions/${discussionId}/reply`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ content: replyText })
    });
    setReplyText(''); load();
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div data-testid="discussions">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{discussions.length} topics</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800" data-testid="add-discussion-btn">
          <Plus className="w-4 h-4" /> New Topic
        </button>
      </div>

      <div className="space-y-3">
        {discussions.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No discussions yet</p>
          </div>
        ) : discussions.map(d => (
          <div key={d.id} className="bg-white border rounded-xl overflow-hidden" data-testid={`discussion-${d.id}`}>
            <button onClick={() => setExpandedId(expandedId === d.id ? null : d.id)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition text-left">
              <div>
                <p className="font-medium text-gray-900 text-sm">{d.title}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                  <span>by {d.created_by}</span>
                  <span>{d.replies?.length || 0} replies</span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              {expandedId === d.id ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
            </button>

            {expandedId === d.id && (
              <div className="border-t p-4 bg-gray-50 space-y-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{d.content}</p>
                {d.replies?.map((r, i) => (
                  <div key={i} className="bg-white border rounded-lg p-3 ml-4">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                      <strong className="text-gray-700">{r.author}</strong>
                      <span>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">{r.content}</p>
                  </div>
                ))}
                <div className="flex gap-2 ml-4">
                  <input type="text" value={replyText} onChange={e => setReplyText(e.target.value)} onKeyDown={e => e.key === 'Enter' && addReply(d.id)} className="flex-1 px-3 py-2 border rounded-lg text-sm" placeholder="Write a reply..." data-testid="reply-input" />
                  <button onClick={() => addReply(d.id)} className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800" data-testid="send-reply">Reply</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showForm && (
        <Modal title="New Discussion" onClose={() => setShowForm(false)}>
          <DiscussionForm onSave={createDiscussion} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
};

const DiscussionForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ title: '', content: '' });
  return (
    <div className="space-y-3">
      <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Topic title" data-testid="discussion-title" />
      <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={4} placeholder="What would you like to discuss?" />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800" data-testid="save-discussion-btn">Post</button>
      </div>
    </div>
  );
};


// ============ COMPANY COSTS ============
const CompanyCosts = () => {
  const [costs, setCosts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCost, setEditCost] = useState(null);

  const load = useCallback(async () => {
    try {
      const [costsRes, summaryRes] = await Promise.all([
        fetch(`${API}/api/partners-hub/costs`, { headers: getHeaders() }),
        fetch(`${API}/api/partners-hub/costs/summary`, { headers: getHeaders() }),
      ]);
      if (costsRes.ok) setCosts(await costsRes.json());
      if (summaryRes.ok) setSummary(await summaryRes.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteCost = async (id) => {
    if (!window.confirm('Delete this cost entry?')) return;
    await fetch(`${API}/api/partners-hub/costs/${id}`, { method: 'DELETE', headers: getHeaders() });
    load(); toast.success('Cost entry deleted');
  };

  const saveCost = async (data) => {
    const method = editCost ? 'PUT' : 'POST';
    const url = editCost ? `${API}/api/partners-hub/costs/${editCost.id}` : `${API}/api/partners-hub/costs`;
    const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(data) });
    if (res.ok) { toast.success(editCost ? 'Cost updated' : 'Cost added'); setShowForm(false); setEditCost(null); load(); }
  };

  const categoryColors = {
    software: 'bg-blue-100 text-blue-700', marketing: 'bg-purple-100 text-purple-700',
    legal: 'bg-amber-100 text-amber-700', operations: 'bg-emerald-100 text-emerald-700',
    personnel: 'bg-pink-100 text-pink-700', office: 'bg-cyan-100 text-cyan-700',
    subscription: 'bg-indigo-100 text-indigo-700', general: 'bg-gray-100 text-gray-700',
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div data-testid="company-costs">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="bg-white border rounded-xl p-4 text-center">
            <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">${summary.monthly_total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Monthly Cost</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <TrendingUp className="w-5 h-5 text-blue-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">${summary.annual_total.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Annual Cost</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <Receipt className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{summary.active_count}</p>
            <p className="text-xs text-gray-500">Active Items</p>
          </div>
          <div className="bg-white border rounded-xl p-4 text-center">
            <Star className="w-5 h-5 text-purple-500 mx-auto mb-1" />
            <p className="text-2xl font-bold text-gray-900">{Object.keys(summary.by_category).length}</p>
            <p className="text-xs text-gray-500">Categories</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{costs.length} cost entries</p>
        <button onClick={() => { setEditCost(null); setShowForm(true); }} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800" data-testid="add-cost-btn">
          <Plus className="w-4 h-4" /> Add Cost
        </button>
      </div>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Item</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Vendor</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Frequency</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {costs.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No cost entries yet</td></tr>
            ) : costs.map(c => (
              <tr key={c.id} className="hover:bg-gray-50" data-testid={`cost-${c.id}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{c.title}</p>
                  {c.description && <p className="text-xs text-gray-400">{c.description}</p>}
                </td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[c.category] || 'bg-gray-100 text-gray-700'}`}>{c.category}</span></td>
                <td className="px-4 py-3 text-gray-600">{c.vendor || '-'}</td>
                <td className="px-4 py-3 text-right font-semibold">${c.amount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 capitalize">{c.frequency?.replace('-', ' ')}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-700' : c.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{c.status}</span></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditCost(c); setShowForm(true); }} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"><Edit3 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => deleteCost(c.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <CostForm cost={editCost} onSave={saveCost} onClose={() => { setShowForm(false); setEditCost(null); }} />
      )}
    </div>
  );
};

const CostForm = ({ cost, onSave, onClose }) => {
  const [form, setForm] = useState({
    title: cost?.title || '', description: cost?.description || '', amount: cost?.amount || 0,
    category: cost?.category || 'general', vendor: cost?.vendor || '',
    frequency: cost?.frequency || 'monthly', payment_date: cost?.payment_date || '',
    is_recurring: cost?.is_recurring ?? true, status: cost?.status || 'active',
  });
  return (
    <Modal title={cost ? 'Edit Cost' : 'Add Cost'} onClose={onClose}>
      <div className="space-y-3">
        <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Cost item name" data-testid="cost-title" />
        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={2} placeholder="Description" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Amount ($)</label>
            <input type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="w-full px-3 py-2 border rounded-lg text-sm" data-testid="cost-amount" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Vendor</label>
            <input type="text" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Company name" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="general">General</option><option value="software">Software</option><option value="marketing">Marketing</option>
            <option value="legal">Legal</option><option value="operations">Operations</option><option value="personnel">Personnel</option>
            <option value="office">Office</option><option value="subscription">Subscription</option>
          </select>
          <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="one-time">One-Time</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Annually</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" placeholder="Payment date" />
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
            <option value="active">Active</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
          <button onClick={() => onSave(form)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800" data-testid="save-cost-btn">Save</button>
        </div>
      </div>
    </Modal>
  );
};


// ============ IDEAS BOARD ============
const IdeasBoard = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/partners-hub/ideas`, { headers: getHeaders() });
      if (res.ok) setIdeas(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const vote = async (id) => {
    await fetch(`${API}/api/partners-hub/ideas/${id}/vote`, { method: 'POST', headers: getHeaders() });
    load();
  };

  const createIdea = async (data) => {
    const res = await fetch(`${API}/api/partners-hub/ideas`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(data) });
    if (res.ok) { toast.success('Idea submitted'); setShowForm(false); load(); }
  };

  if (loading) return <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>;

  return (
    <div data-testid="ideas-board">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-gray-500">{ideas.length} ideas</p>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800" data-testid="add-idea-btn">
          <Plus className="w-4 h-4" /> New Idea
        </button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {ideas.map(idea => (
          <div key={idea.id} className="bg-white border rounded-xl p-4" data-testid={`idea-${idea.id}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{idea.title}</p>
                <p className="text-xs text-gray-500 mt-1">{idea.description}</p>
                <p className="text-xs text-gray-400 mt-2">by {idea.created_by}</p>
              </div>
              <button onClick={() => vote(idea.id)} className="flex flex-col items-center gap-0.5 ml-3 p-2 bg-gray-50 hover:bg-indigo-50 rounded-lg transition">
                <Star className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-gray-700">{idea.votes || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <Modal title="New Idea" onClose={() => setShowForm(false)}>
          <IdeaForm onSave={createIdea} onClose={() => setShowForm(false)} />
        </Modal>
      )}
    </div>
  );
};

const IdeaForm = ({ onSave, onClose }) => {
  const [form, setForm] = useState({ title: '', description: '' });
  return (
    <div className="space-y-3">
      <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="Idea title" data-testid="idea-title" />
      <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} placeholder="Describe your idea..." />
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
        <button onClick={() => onSave(form)} className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-800" data-testid="save-idea-btn">Submit</button>
      </div>
    </div>
  );
};


// ============ MAIN PARTNERS HUB ============
export default function PartnersHub() {
  return (
    <div className="space-y-6" data-testid="partners-hub">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Star className="w-6 h-6 text-indigo-600" /> Partners Hub
        </h1>
        <p className="text-sm text-gray-500 mt-1">Collaboration workspace for Credlocity partners</p>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-xl w-full justify-start gap-1 flex-wrap h-auto">
          <TabsTrigger value="todos" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-todos">
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-meetings">
            <FileText className="w-3.5 h-3.5 mr-1.5" /> Minutes
          </TabsTrigger>
          <TabsTrigger value="discussions" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-discussions">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" /> Discussions
          </TabsTrigger>
          <TabsTrigger value="costs" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-costs">
            <DollarSign className="w-3.5 h-3.5 mr-1.5" /> Costs
          </TabsTrigger>
          <TabsTrigger value="ideas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-ideas">
            <Star className="w-3.5 h-3.5 mr-1.5" /> Ideas
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-reports">
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Reports
          </TabsTrigger>
          <TabsTrigger value="cpr-merger" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg text-xs px-3 py-2" data-testid="tab-cpr-merger">
            <GitMerge className="w-3.5 h-3.5 mr-1.5" /> CPR Merger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-5"><TodoList /></TabsContent>
        <TabsContent value="meetings" className="mt-5"><MeetingMinutes /></TabsContent>
        <TabsContent value="discussions" className="mt-5"><Discussions /></TabsContent>
        <TabsContent value="costs" className="mt-5"><CompanyCosts /></TabsContent>
        <TabsContent value="ideas" className="mt-5"><IdeasBoard /></TabsContent>
        <TabsContent value="reports" className="mt-5"><ReportsCenter /></TabsContent>
        <TabsContent value="cpr-merger" className="mt-5"><CPRMergerTab /></TabsContent>
      </Tabs>
    </div>
  );
}


// ============ REPORTS CENTER ============
const ReportsCenter = () => {
  const [summary, setSummary] = useState(null);
  const [activeReport, setActiveReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [period, setPeriod] = useState('all');

  useEffect(() => {
    fetch(`${API}/api/reports/summary`, { headers: getHeaders() })
      .then(r => r.json()).then(d => setSummary(d.summary)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadReport = async (type) => {
    setActiveReport(type);
    setReportLoading(true);
    setReportData(null);
    try {
      const url = type === 'collections' || type === 'payroll'
        ? `${API}/api/reports/${type}?period=${period}`
        : `${API}/api/reports/${type}`;
      const res = await fetch(url, { headers: getHeaders() });
      const data = await res.json();
      setReportData(data.report);
    } catch { toast.error('Failed to load report'); }
    finally { setReportLoading(false); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>;

  const reportTypes = [
    { id: 'collections', label: 'Collections', icon: Receipt, color: 'bg-red-50 text-red-600 border-red-200',
      stats: summary ? [`${summary.collections?.total_accounts || 0} accounts`, `$${(summary.collections?.total_balance || 0).toLocaleString()} balance`] : [] },
    { id: 'payroll', label: 'Payroll & Commissions', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      stats: summary ? [`${summary.payroll?.total_employees || 0} employees`, `$${(summary.payroll?.total_commissions_paid || 0).toLocaleString()} paid`] : [] },
    { id: 'credit-builder', label: 'Credit Builder', icon: CreditCard, color: 'bg-blue-50 text-blue-600 border-blue-200',
      stats: summary ? [`${summary.credit_builder?.total_accounts || 0} accounts`] : [] },
    { id: 'school', label: 'School & Education', icon: GraduationCap, color: 'bg-violet-50 text-violet-600 border-violet-200',
      stats: summary ? [`${summary.school?.total_students || 0} students`, `${summary.school?.total_enrollments || 0} enrollments`, `$${(summary.school?.revenue_collected || 0).toLocaleString()} revenue`] : [] },
    { id: 'credit-reporting', label: 'Credit Bureau Reporting', icon: ShieldCheck, color: 'bg-amber-50 text-amber-600 border-amber-200',
      stats: summary ? [`${summary.credit_reporting?.total_reportable_accounts || 0} reportable accounts`] : [] },
  ];

  return (
    <div className="space-y-6" data-testid="reports-center">
      {!activeReport ? (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Business Reports</h3>
              <p className="text-sm text-gray-500">Financial and operational reports across all CMS areas</p>
            </div>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => {
                const a = document.createElement('a');
                a.href = `${API}/api/reports/state-of-company/pdf`;
                a.download = 'State_of_Company.pdf';
                fetch(`${API}/api/reports/state-of-company/pdf`, { headers: getHeaders() })
                  .then(r => r.blob())
                  .then(blob => { const url = URL.createObjectURL(blob); a.href = url; a.click(); URL.revokeObjectURL(url); toast.success('Report downloaded!'); })
                  .catch(() => toast.error('Download failed'));
              }}
              data-testid="download-state-report"
            >
              <Download className="w-4 h-4 mr-1" /> State of the Company (PDF)
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map(r => (
              <button
                key={r.id}
                onClick={() => loadReport(r.id)}
                className={`text-left p-5 rounded-xl border-2 ${r.color} hover:shadow-md transition group`}
                data-testid={`report-${r.id}`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <r.icon className="w-6 h-6" />
                  <span className="font-semibold text-sm">{r.label}</span>
                </div>
                <div className="space-y-1">
                  {r.stats.map((s, i) => <p key={i} className="text-xs opacity-80">{s}</p>)}
                </div>
                <p className="text-xs mt-3 opacity-60 group-hover:opacity-100 transition">Click to view full report</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => { setActiveReport(null); setReportData(null); }} className="text-sm text-indigo-600 hover:text-indigo-800">&larr; Back to Reports</button>
            <h3 className="text-lg font-bold text-gray-900">{reportTypes.find(r => r.id === activeReport)?.label} Report</h3>
            {(activeReport === 'collections' || activeReport === 'payroll') && (
              <select className="ml-auto text-sm border rounded-lg px-3 py-1.5" value={period} onChange={e => { setPeriod(e.target.value); loadReport(activeReport); }} data-testid="report-period">
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="year">This Year</option>
              </select>
            )}
          </div>

          {reportLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
          ) : reportData ? (
            <div className="bg-white rounded-xl border p-6 space-y-4">
              <ReportDataView type={activeReport} data={reportData} />
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

const ReportDataView = ({ type, data }) => {
  const StatCard = ({ label, value, sub }) => (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );

  if (type === 'collections') {
    const d = data;
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Accounts" value={d.total_accounts} />
          <StatCard label="Outstanding Balance" value={`$${(d.total_balance_outstanding || 0).toLocaleString()}`} />
          <StatCard label="Total Collected" value={`$${(d.total_collected || 0).toLocaleString()}`} />
          <StatCard label="Recovery Rate" value={`${d.recovery_rate || 0}%`} />
        </div>
        {d.by_status && Object.keys(d.by_status).length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">By Status</h4>
            <div className="grid sm:grid-cols-3 gap-2">
              {Object.entries(d.by_status).map(([status, vals]) => (
                <div key={status} className="bg-gray-50 rounded-lg p-3 text-sm">
                  <span className="font-medium text-gray-700 capitalize">{status.replace(/_/g, ' ')}</span>
                  <span className="ml-2 text-gray-500">{vals.count} accts - ${(vals.balance || 0).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (type === 'payroll') {
    const d = data;
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard label="Total Commissions Paid" value={`$${(d.total_commissions || 0).toLocaleString()}`} />
          <StatCard label="Commission Entries" value={d.commission_entries || 0} />
          <StatCard label="Active Employees" value={d.active_employees || 0} />
        </div>
        {(d.by_employee || []).length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">By Employee</h4>
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50"><th className="text-left p-2">Employee</th><th className="text-left p-2">Entries</th><th className="text-left p-2">Total</th></tr></thead>
              <tbody>
                {d.by_employee.map((e, i) => (
                  <tr key={i} className="border-t"><td className="p-2 text-gray-600">{e.employee_id.slice(0, 8)}</td><td className="p-2">{e.count}</td><td className="p-2 font-medium">${e.total.toLocaleString()}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  if (type === 'credit-builder') {
    const d = data;
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Accounts" value={d.total_accounts || 0} />
        <StatCard label="Total Balance" value={`$${(d.total_balance || 0).toLocaleString()}`} />
        <StatCard label="Total Credit Limit" value={`$${(d.total_credit_limit || 0).toLocaleString()}`} />
        <StatCard label="Utilization Rate" value={`${d.utilization_rate || 0}%`} />
      </div>
    );
  }

  if (type === 'school') {
    const d = data;
    const pp = d.payment_plans || {};
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Students" value={d.total_students || 0} />
          <StatCard label="Enrollments" value={d.total_enrollments || 0} />
          <StatCard label="Completion Rate" value={`${d.completion_rate || 0}%`} />
          <StatCard label="Certificates Issued" value={d.certificates_issued || 0} />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Payment Plans</h4>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Active Plans" value={pp.active || 0} />
            <StatCard label="Completed Plans" value={pp.completed || 0} />
            <StatCard label="Total Value" value={`$${(pp.total_value || 0).toLocaleString()}`} />
            <StatCard label="Total Collected" value={`$${(pp.total_collected || 0).toLocaleString()}`} />
          </div>
        </div>
        {(d.by_course || []).length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Enrollments by Course</h4>
            {d.by_course.map((c, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-700">{c.course}</span>
                <span className="text-sm font-medium">{c.enrollments} enrolled</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (type === 'credit-reporting') {
    const d = data;
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-medium text-amber-800">Credit Bureau Reporting begins: <strong>{d.reporting_start_date || 'August 2026'}</strong></p>
          <p className="text-xs text-amber-600 mt-1">All payments recorded before this date will be reported retroactively.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard label="Collections (Installment)" value={`${d.collections?.ready || 0}/${d.collections?.total || 0} ready`} sub={d.collections?.type} />
          <StatCard label="Credit Builder (Revolving)" value={`${d.credit_builder?.ready || 0}/${d.credit_builder?.total || 0} ready`} sub={d.credit_builder?.type} />
          <StatCard label="School (Educational)" value={`${d.school?.ready || 0}/${d.school?.total || 0} ready`} sub={d.school?.type} />
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard label="Total Reportable" value={d.total_accounts || 0} />
          <StatCard label="Total Ready" value={d.total_ready || 0} />
          <StatCard label="Metro 2 Exports" value={d.metro2_exports || 0} />
        </div>
      </div>
    );
  }

  return <pre className="text-xs text-gray-500">{JSON.stringify(data, null, 2)}</pre>;
};