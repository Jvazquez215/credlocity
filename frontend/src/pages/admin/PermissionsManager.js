import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  Shield, Users, Plus, Search, Loader2, Save, Trash2, Edit2,
  Check, X, ChevronDown, ChevronRight, Lock, UserCheck
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PermissionsManager() {
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const token = localStorage.getItem('auth_token');

  // Dialogs
  const [editGroup, setEditGroup] = useState(null);
  const [assignUser, setAssignUser] = useState(null);

  const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAll = useCallback(async () => {
    try {
      const [gRes, uRes, pRes] = await Promise.all([
        fetch(`${API_URL}/api/rbac/groups`, { headers }),
        fetch(`${API_URL}/api/rbac/users`, { headers }),
        fetch(`${API_URL}/api/rbac/permissions`, { headers }),
      ]);
      if (gRes.ok) setGroups((await gRes.json()).groups);
      if (uRes.ok) setUsers((await uRes.json()).users);
      if (pRes.ok) setPermissions((await pRes.json()).permissions);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.group_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

  return (
    <div className="p-6 space-y-6" data-testid="permissions-manager">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="w-6 h-6 text-blue-500" /> Access Control</h1>
        <p className="text-gray-500 mt-1">Manage groups, permissions, and user access</p>
      </div>

      <Tabs defaultValue="groups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="groups" data-testid="groups-tab"><Shield className="w-4 h-4 mr-1" /> Groups</TabsTrigger>
          <TabsTrigger value="users" data-testid="users-tab"><Users className="w-4 h-4 mr-1" /> Users</TabsTrigger>
        </TabsList>

        {/* GROUPS TAB */}
        <TabsContent value="groups">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setEditGroup({ id: '', name: '', description: '', permissions: [], is_system: false })} data-testid="add-group-btn">
                <Plus className="w-4 h-4 mr-1" /> New Group
              </Button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {groups.map(g => (
                <Card key={g.id} className="hover:shadow-md transition-shadow" data-testid={`group-${g.id}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {g.name}
                        {g.is_system && <Badge variant="outline" className="text-xs"><Lock className="w-3 h-3 mr-1" />System</Badge>}
                      </CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => setEditGroup({...g})} data-testid={`edit-group-${g.id}`}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardDescription>{g.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{g.permissions?.length || 0} permissions</span>
                      <Badge className="bg-blue-50 text-blue-700">{g.member_count || 0} member(s)</Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(g.permissions || []).slice(0, 6).map(p => (
                        <Badge key={p} variant="outline" className="text-xs">{p}</Badge>
                      ))}
                      {(g.permissions || []).length > 6 && <Badge variant="outline" className="text-xs">+{g.permissions.length - 6} more</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>User Access Assignments</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" data-testid="user-search" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-2 font-medium">Name</th>
                      <th className="pb-2 font-medium">Email</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium">Group</th>
                      <th className="pb-2 font-medium">Overrides</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 font-medium">{u.full_name || '-'}</td>
                        <td className="py-3 text-gray-500">{u.email}</td>
                        <td className="py-3"><Badge variant="outline" className="text-xs">{u.role}</Badge></td>
                        <td className="py-3">
                          {u.group_name ? (
                            <Badge className="bg-blue-50 text-blue-700">{u.group_name}</Badge>
                          ) : (
                            <span className="text-gray-400 text-xs">No group</span>
                          )}
                        </td>
                        <td className="py-3">
                          {(u.extra_permissions?.length > 0 || u.revoked_permissions?.length > 0) ? (
                            <div className="flex gap-1">
                              {u.extra_permissions?.length > 0 && <Badge className="bg-green-50 text-green-700 text-xs">+{u.extra_permissions.length}</Badge>}
                              {u.revoked_permissions?.length > 0 && <Badge className="bg-red-50 text-red-700 text-xs">-{u.revoked_permissions.length}</Badge>}
                            </div>
                          ) : <span className="text-gray-400 text-xs">None</span>}
                        </td>
                        <td className="py-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => setAssignUser({...u})} data-testid={`assign-user-${u.id}`}>
                            <UserCheck className="w-4 h-4 mr-1" /> Assign
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* EDIT GROUP DIALOG */}
      {editGroup && (
        <GroupEditDialog
          group={editGroup}
          permissions={permissions}
          onClose={() => setEditGroup(null)}
          onSave={async (updated) => {
            const isNew = !updated.id || updated.id === '';
            const url = isNew ? `${API_URL}/api/rbac/groups` : `${API_URL}/api/rbac/groups/${updated.id}`;
            const method = isNew ? 'POST' : 'PUT';
            const res = await fetch(url, { method, headers, body: JSON.stringify(updated) });
            if (res.ok) { toast.success(isNew ? 'Group created' : 'Group updated'); fetchAll(); setEditGroup(null); }
            else toast.error('Failed to save group');
          }}
          onDelete={async () => {
            if (!window.confirm('Delete this group?')) return;
            const res = await fetch(`${API_URL}/api/rbac/groups/${editGroup.id}`, { method: 'DELETE', headers });
            if (res.ok) { toast.success('Group deleted'); fetchAll(); setEditGroup(null); }
            else { const d = await res.json(); toast.error(d.detail || 'Failed'); }
          }}
        />
      )}

      {/* ASSIGN USER DIALOG */}
      {assignUser && (
        <UserAssignDialog
          user={assignUser}
          groups={groups}
          permissions={permissions}
          onClose={() => setAssignUser(null)}
          onSave={async (assignment) => {
            const res = await fetch(`${API_URL}/api/rbac/users/${assignUser.id}/assignment`, {
              method: 'PUT', headers, body: JSON.stringify(assignment)
            });
            if (res.ok) { toast.success('User access updated'); fetchAll(); setAssignUser(null); }
            else toast.error('Failed to update');
          }}
        />
      )}
    </div>
  );
}


function GroupEditDialog({ group, permissions, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({ ...group });
  const [expandedCats, setExpandedCats] = useState({});

  const togglePerm = (perm) => {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(perm)
        ? f.permissions.filter(p => p !== perm)
        : [...f.permissions, perm]
    }));
  };

  const toggleCategory = (cat) => {
    const catPerms = permissions[cat]?.perms || [];
    const allSelected = catPerms.every(p => form.permissions.includes(p));
    setForm(f => ({
      ...f,
      permissions: allSelected
        ? f.permissions.filter(p => !catPerms.includes(p))
        : [...new Set([...f.permissions, ...catPerms])]
    }));
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group.id ? 'Edit Group' : 'New Group'}</DialogTitle>
          <DialogDescription>Configure group name and permissions</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Group Name</label>
              <Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} data-testid="group-name-input" />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Permissions ({form.permissions.length} selected)</label>
            <div className="space-y-1 border rounded-lg p-3 max-h-[40vh] overflow-y-auto">
              {Object.entries(permissions).map(([cat, info]) => {
                const catPerms = info.perms;
                const selectedCount = catPerms.filter(p => form.permissions.includes(p)).length;
                const allSelected = selectedCount === catPerms.length;
                const isOpen = expandedCats[cat];
                return (
                  <div key={cat} className="border-b last:border-0 pb-1">
                    <div className="flex items-center justify-between py-1.5 cursor-pointer hover:bg-gray-50 px-2 rounded"
                      onClick={() => setExpandedCats(e => ({...e, [cat]: !e[cat]}))}>
                      <div className="flex items-center gap-2">
                        {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                        <span className="font-medium text-sm">{info.label}</span>
                        <Badge variant="outline" className="text-xs">{selectedCount}/{catPerms.length}</Badge>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleCategory(cat); }}
                        className={`text-xs px-2 py-0.5 rounded ${allSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
                      >{allSelected ? 'Deselect All' : 'Select All'}</button>
                    </div>
                    {isOpen && (
                      <div className="pl-8 pb-2 space-y-1">
                        {catPerms.map(p => (
                          <label key={p} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                            <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePerm(p)} className="w-4 h-4 rounded" />
                            <span className="text-gray-700">{p}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <div>
            {group.id && !group.is_system && (
              <Button variant="outline" className="text-red-600 hover:bg-red-50" onClick={onDelete}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(form)} data-testid="save-group-btn"><Save className="w-4 h-4 mr-1" /> Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


function UserAssignDialog({ user, groups, permissions, onClose, onSave }) {
  const [groupId, setGroupId] = useState(user.group_id || '');
  const [extraPerms, setExtraPerms] = useState(user.extra_permissions || []);
  const [revokedPerms, setRevokedPerms] = useState(user.revoked_permissions || []);

  const selectedGroup = groups.find(g => g.id === groupId);
  const groupPerms = selectedGroup?.permissions || [];

  const allPerms = Object.values(permissions).flatMap(c => c.perms);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Access: {user.full_name}</DialogTitle>
          <DialogDescription>{user.email} | Current role: {user.role}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Group</label>
            <select value={groupId} onChange={e => { setGroupId(e.target.value); setExtraPerms([]); setRevokedPerms([]); }}
              className="w-full p-2 border rounded-lg text-sm mt-1" data-testid="user-group-select">
              <option value="">No Group</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name} ({g.permissions?.length} perms)</option>)}
            </select>
          </div>

          {groupId && (
            <>
              <div>
                <label className="text-sm font-medium">Group Permissions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {groupPerms.map(p => (
                    <Badge key={p} variant="outline" className={`text-xs cursor-pointer ${revokedPerms.includes(p) ? 'bg-red-50 text-red-600 line-through' : ''}`}
                      onClick={() => setRevokedPerms(r => r.includes(p) ? r.filter(x => x !== p) : [...r, p])}>
                      {p} {revokedPerms.includes(p) ? <X className="w-3 h-3 ml-1" /> : null}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Click a permission to revoke it for this user</p>
              </div>

              <div>
                <label className="text-sm font-medium">Extra Permissions</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {allPerms.filter(p => !groupPerms.includes(p)).map(p => (
                    <Badge key={p} variant="outline" className={`text-xs cursor-pointer ${extraPerms.includes(p) ? 'bg-green-50 text-green-700' : 'opacity-50'}`}
                      onClick={() => setExtraPerms(e => e.includes(p) ? e.filter(x => x !== p) : [...e, p])}>
                      {extraPerms.includes(p) && <Check className="w-3 h-3 mr-1" />} {p}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Click to grant extra permissions beyond the group</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave({ group_id: groupId, extra_permissions: extraPerms, revoked_permissions: revokedPerms })} data-testid="save-assignment-btn">
            <Save className="w-4 h-4 mr-1" /> Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
