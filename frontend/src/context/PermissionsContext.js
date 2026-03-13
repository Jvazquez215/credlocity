import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PermissionsContext = createContext(null);

const API_URL = process.env.REACT_APP_BACKEND_URL;

export function PermissionsProvider({ children }) {
  const [permissions, setPermissions] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [tokenKey, setTokenKey] = useState(localStorage.getItem('auth_token') || '');

  const fetchPermissions = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) { setLoaded(true); return; }
    try {
      const res = await fetch(`${API_URL}/api/rbac/my-permissions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions(data.permissions || []);
        setGroupName(data.group_name || '');
        setIsAdmin(data.is_admin || false);
      }
    } catch (e) { console.error('Failed to fetch permissions:', e); }
    finally { setLoaded(true); }
  }, []);

  // Re-fetch when token changes (login/logout)
  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem('auth_token') || '';
      if (current !== tokenKey) {
        setTokenKey(current);
        setLoaded(false);
        fetchPermissions();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [tokenKey, fetchPermissions]);

  useEffect(() => { fetchPermissions(); }, [fetchPermissions]);

  const hasPerm = useCallback((perm) => {
    if (!loaded) return true; // Show everything while loading
    if (isAdmin) return true;
    return permissions.includes(perm);
  }, [permissions, isAdmin, loaded]);

  const hasAnyPerm = useCallback((perms) => {
    if (!loaded) return true; // Show everything while loading
    if (isAdmin) return true;
    return perms.some(p => permissions.includes(p));
  }, [permissions, isAdmin, loaded]);

  return (
    <PermissionsContext.Provider value={{ permissions, groupName, isAdmin, loaded, hasPerm, hasAnyPerm, refetch: fetchPermissions }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionsContext);
  if (!ctx) return { permissions: [], isAdmin: true, loaded: true, hasPerm: () => true, hasAnyPerm: () => true, refetch: () => {} };
  return ctx;
}
