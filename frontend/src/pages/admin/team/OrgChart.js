import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { ChevronDown, ChevronRight, Users } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const DEPT_COLORS = {
  collections: { bg: 'bg-blue-500', light: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  sales: { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  support: { bg: 'bg-amber-500', light: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  legal: { bg: 'bg-red-500', light: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  operations: { bg: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200' },
  management: { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  marketing: { bg: 'bg-pink-500', light: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  hr: { bg: 'bg-violet-500', light: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200' },
  finance: { bg: 'bg-teal-500', light: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
};

const ROLE_HIERARCHY = { admin: 0, director: 1, collections_manager: 2, team_leader: 3, collections_agent: 4, contractor: 5, affiliate: 6, attorney: 6 };

function OrgNode({ member, children, depth = 0, onSelect }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const hasChildren = children && children.length > 0;
  const colors = DEPT_COLORS[member.department] || DEPT_COLORS.operations;

  return (
    <div className="flex flex-col items-center" data-testid={`org-node-${member.id}`}>
      {/* Node Card */}
      <div 
        className={`relative ${colors.light} border-2 ${colors.border} rounded-xl p-3 w-48 cursor-pointer hover:shadow-md transition-all text-center`}
        onClick={() => onSelect(member)}
      >
        <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${colors.bg}`} />
        {member.photo_url ? (
          <img src={member.photo_url} alt={member.full_name} className="w-12 h-12 rounded-full mx-auto mb-2 object-cover border-2 border-white shadow" />
        ) : (
          <div className={`w-12 h-12 rounded-full mx-auto mb-2 ${colors.bg} flex items-center justify-center text-white font-bold text-lg`}>
            {member.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
        )}
        <p className="font-semibold text-gray-900 text-sm leading-tight">{member.full_name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{member.title || member.role_name || member.role}</p>
        <Badge className={`${colors.light} ${colors.text} text-[10px] mt-1 capitalize border ${colors.border}`}>{member.department}</Badge>
        {hasChildren && (
          <button 
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-10"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <div className="mt-6 relative">
          {/* Vertical connector */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-4 bg-gray-300" style={{ top: '-16px' }} />
          
          {/* Horizontal connector for multiple children */}
          {children.length > 1 && (
            <div className="absolute top-0 bg-gray-300" style={{
              height: '1px',
              left: `${100 / (children.length * 2)}%`,
              right: `${100 / (children.length * 2)}%`,
              top: '-1px'
            }} />
          )}

          <div className="flex gap-6 justify-center">
            {children.map(child => (
              <div key={child.member.id} className="relative">
                {/* Vertical line from horizontal connector to child */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-3 bg-gray-300" style={{ top: '-12px' }} />
                <OrgNode 
                  member={child.member} 
                  children={child.children} 
                  depth={depth + 1}
                  onSelect={onSelect}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrgChart({ members, onSelectMember }) {
  // Build tree from flat member list
  const tree = useMemo(() => {
    if (!members || members.length === 0) return [];

    const memberMap = {};
    members.forEach(m => { memberMap[m.id] = { member: m, children: [] }; });

    const roots = [];
    members.forEach(m => {
      if (m.reports_to && memberMap[m.reports_to]) {
        memberMap[m.reports_to].children.push(memberMap[m.id]);
      } else {
        roots.push(memberMap[m.id]);
      }
    });

    // Sort children by role hierarchy
    const sortNodes = (nodes) => {
      nodes.sort((a, b) => (ROLE_HIERARCHY[a.member.role] || 99) - (ROLE_HIERARCHY[b.member.role] || 99));
      nodes.forEach(n => sortNodes(n.children));
    };

    // If no reports_to relationships, build by role hierarchy
    if (roots.length === members.length && members.length > 1) {
      const sorted = [...members].sort((a, b) => (ROLE_HIERARCHY[a.role] || 99) - (ROLE_HIERARCHY[b.role] || 99));
      
      // Group by department under highest-role members
      const topLevel = sorted.filter(m => (ROLE_HIERARCHY[m.role] || 99) <= 2);
      const rest = sorted.filter(m => (ROLE_HIERARCHY[m.role] || 99) > 2);
      
      if (topLevel.length > 0) {
        const builtRoots = topLevel.map(m => ({
          member: m,
          children: rest
            .filter(r => r.department === m.department || topLevel.length === 1)
            .map(r => ({ member: r, children: [] }))
        }));
        
        // Any unassigned members
        const assignedIds = new Set(builtRoots.flatMap(r => r.children.map(c => c.member.id)));
        const unassigned = rest.filter(r => !assignedIds.has(r.id));
        
        if (unassigned.length > 0 && builtRoots.length > 0) {
          unassigned.forEach(u => builtRoots[0].children.push({ member: u, children: [] }));
        }
        
        return builtRoots;
      }
    }

    sortNodes(roots);
    return roots;
  }, [members]);

  if (members.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Users className="w-16 h-16 mx-auto mb-3 opacity-30" />
        <p>No team members to display</p>
        <p className="text-sm mt-1">Add employees and set their "Reports To" field to build the org chart</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-8" data-testid="org-chart">
      <div className="min-w-max flex justify-center pt-4">
        <div className="flex gap-8">
          {tree.map(node => (
            <OrgNode 
              key={node.member.id} 
              member={node.member} 
              children={node.children} 
              onSelect={onSelectMember}
            />
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">Click a node to view employee profile. Set "Reports To" on employees to define hierarchy.</p>
    </div>
  );
}
