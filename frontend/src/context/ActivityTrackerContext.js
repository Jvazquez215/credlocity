/**
 * Activity Tracker Context & Hook
 * Tracks user activity for employee performance metrics
 */

import React, { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Activity Tracker Context
const ActivityTrackerContext = createContext(null);

// Configuration
const CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  BATCH_INTERVAL: 10000, // 10 seconds
  IDLE_THRESHOLD: 60000, // 1 minute of no activity = idle
  MAX_BATCH_SIZE: 50,
};

export const ActivityTrackerProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  const sessionIdRef = useRef(null);
  const eventQueueRef = useRef([]);
  const lastActivityRef = useRef(Date.now());
  const isIdleRef = useRef(false);
  const heartbeatIntervalRef = useRef(null);
  const batchIntervalRef = useRef(null);
  
  const [isTracking, setIsTracking] = useState(false);

  // Get headers for API calls
  const getHeaders = useCallback(() => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (user) {
      headers['X-User-ID'] = user.id || user._id || '';
      headers['X-User-Email'] = user.email || '';
      headers['X-User-Name'] = user.full_name || user.name || '';
      headers['X-User-Role'] = user.role || 'user';
    }
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }, [user]);

  // Start a new session
  const startSession = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log('Activity tracking: Not authenticated or no user');
      return;
    }
    
    console.log('Activity tracking: Starting session for user:', {
      id: user.id || user._id,
      email: user.email,
      name: user.full_name || user.name,
      role: user.role
    });
    
    try {
      const response = await fetch(`${API_URL}/api/activity/session/start`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ip_address: null,
          user_agent: navigator.userAgent
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        sessionIdRef.current = data.session_id;
        setIsTracking(true);
        console.log('Activity tracking session started:', data.session_id, 'for user:', user.email);
      } else {
        console.error('Activity tracking: Failed to start session', await response.text());
      }
    } catch (error) {
      console.error('Failed to start activity session:', error);
    }
  }, [isAuthenticated, user, getHeaders]);

  // End the current session
  const endSession = useCallback(async () => {
    if (!sessionIdRef.current) return;
    
    try {
      // Flush any remaining events
      await flushEventQueue();
      
      await fetch(`${API_URL}/api/activity/session/${sessionIdRef.current}/end`, {
        method: 'POST',
        headers: getHeaders()
      });
      
      console.log('Activity tracking session ended');
    } catch (error) {
      console.error('Failed to end activity session:', error);
    } finally {
      sessionIdRef.current = null;
      setIsTracking(false);
    }
  }, [getHeaders]);

  // Queue an event for batch sending
  const queueEvent = useCallback((eventType, eventData = {}, pageUrl = null, pageTitle = null) => {
    if (!sessionIdRef.current) return;
    
    eventQueueRef.current.push({
      event_type: eventType,
      event_data: eventData,
      page_url: pageUrl || window.location.pathname,
      page_title: pageTitle || document.title,
      timestamp: new Date().toISOString()
    });
    
    // Update last activity
    lastActivityRef.current = Date.now();
    isIdleRef.current = false;
    
    // Flush if queue is getting large
    if (eventQueueRef.current.length >= CONFIG.MAX_BATCH_SIZE) {
      flushEventQueue();
    }
  }, []);

  // Flush event queue to server
  const flushEventQueue = useCallback(async () => {
    if (!sessionIdRef.current || eventQueueRef.current.length === 0) return;
    
    const events = [...eventQueueRef.current];
    eventQueueRef.current = [];
    
    try {
      await fetch(`${API_URL}/api/activity/events/batch`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          session_id: sessionIdRef.current,
          events
        })
      });
    } catch (error) {
      // Re-queue events on failure
      eventQueueRef.current = [...events, ...eventQueueRef.current];
      console.error('Failed to send activity events:', error);
    }
  }, [getHeaders]);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!sessionIdRef.current) return;
    
    const now = Date.now();
    const isIdle = (now - lastActivityRef.current) > CONFIG.IDLE_THRESHOLD;
    
    if (isIdle !== isIdleRef.current) {
      isIdleRef.current = isIdle;
      queueEvent(isIdle ? 'idle' : 'active');
    }
    
    try {
      await fetch(`${API_URL}/api/activity/heartbeat/${sessionIdRef.current}?is_active=${!isIdle}`, {
        method: 'POST',
        headers: getHeaders()
      });
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }, [getHeaders, queueEvent]);

  // Track page views
  useEffect(() => {
    if (sessionIdRef.current && location.pathname.startsWith('/admin')) {
      queueEvent('page_view', {
        pathname: location.pathname,
        search: location.search
      }, location.pathname, document.title);
    }
  }, [location, queueEvent]);

  // Setup event listeners
  useEffect(() => {
    if (!isTracking || !location.pathname.startsWith('/admin')) return;
    
    const handleClick = (e) => {
      const target = e.target;
      const tagName = target.tagName?.toLowerCase();
      const isInteractive = ['a', 'button', 'input', 'select', 'textarea'].includes(tagName);
      
      if (isInteractive) {
        queueEvent('click', {
          element: tagName,
          text: target.textContent?.substring(0, 50),
          id: target.id,
          className: target.className?.substring?.(0, 50)
        });
      }
    };
    
    const handleSubmit = (e) => {
      const form = e.target;
      queueEvent('form_submit', {
        formId: form.id,
        formAction: form.action,
        formMethod: form.method
      });
    };
    
    const handleKeydown = () => {
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
    };
    
    const handleMouseMove = () => {
      lastActivityRef.current = Date.now();
      isIdleRef.current = false;
    };
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        queueEvent('tab_hidden');
        flushEventQueue();
      } else {
        queueEvent('tab_visible');
        lastActivityRef.current = Date.now();
      }
    };
    
    const handleBeforeUnload = () => {
      queueEvent('page_unload');
      flushEventQueue();
      endSession();
    };
    
    // Add listeners
    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleSubmit, true);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleSubmit, true);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isTracking, location.pathname, queueEvent, flushEventQueue, endSession]);

  // Start/end session based on auth state - only once per login
  useEffect(() => {
    let isMounted = true;
    
    const initSession = async () => {
      if (isAuthenticated && user && location.pathname.startsWith('/admin')) {
        // Only start if we don't have a session
        if (!sessionIdRef.current && !isTracking) {
          console.log('ActivityTracker: Starting new session for', user.email);
          await startSession();
        }
      } else if (sessionIdRef.current) {
        console.log('ActivityTracker: Ending session');
        await endSession();
      }
    };
    
    if (isMounted) {
      initSession();
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]); // Removed location.pathname to prevent new sessions on navigation

  // Setup intervals
  useEffect(() => {
    if (!isTracking) return;
    
    // Heartbeat interval
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, CONFIG.HEARTBEAT_INTERVAL);
    
    // Batch send interval
    batchIntervalRef.current = setInterval(flushEventQueue, CONFIG.BATCH_INTERVAL);
    
    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
      if (batchIntervalRef.current) clearInterval(batchIntervalRef.current);
    };
  }, [isTracking, sendHeartbeat, flushEventQueue]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionIdRef.current) {
        endSession();
      }
    };
  }, [endSession]);

  const value = {
    isTracking,
    sessionId: sessionIdRef.current,
    queueEvent,
    flushEventQueue
  };

  return (
    <ActivityTrackerContext.Provider value={value}>
      {children}
    </ActivityTrackerContext.Provider>
  );
};

export const useActivityTracker = () => {
  const context = useContext(ActivityTrackerContext);
  if (!context) {
    return {
      isTracking: false,
      sessionId: null,
      queueEvent: () => {},
      flushEventQueue: () => {}
    };
  }
  return context;
};

export default ActivityTrackerProvider;
