import React, { useState, useEffect } from 'react';
import { Plus, FileText, Check, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { toast } from 'sonner';
import api from '../../../utils/api';

const AUTH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const CreditBuilderReporting = () => {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCycles(); }, []);
  const fetchCycles = async () => {
    try { const res = await api.get('/credit-builder/reporting/cycles', AUTH()); setCycles(res.data || []); }
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const startCycle = async () => {
    try {
      await api.post('/credit-builder/reporting/cycles', {}, AUTH());
      toast.success('Reporting cycle created');
      fetchCycles();
    } catch (e) { toast.error('Failed to create cycle'); }
  };

  const toggleBureau = async (cycleId, bureau, current) => {
    try {
      await api.put(`/credit-builder/reporting/cycles/${cycleId}`, { [`${bureau}_submitted`]: !current }, AUTH());
      fetchCycles();
    } catch (e) { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6" data-testid="cb-reporting">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reporting Cycles</h1>
        <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={startCycle} data-testid="start-cycle-btn">
          <Plus className="w-4 h-4 mr-2" />Start New Reporting Cycle
        </Button>
      </div>
      <Card>
        {loading ? <CardContent className="p-12 text-center"><div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto" /></CardContent> : cycles.length === 0 ? (
          <CardContent className="p-12 text-center"><FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="font-semibold">No Reporting Cycles</p></CardContent>
        ) : (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50 border-b"><tr>
            <th className="px-4 py-3 text-left text-gray-500">Date</th>
            <th className="px-4 py-3 text-left text-gray-500">Total</th>
            <th className="px-4 py-3 text-left text-gray-500">Current</th>
            <th className="px-4 py-3 text-left text-gray-500">Delinquent</th>
            <th className="px-4 py-3 text-center text-gray-500">Equifax</th>
            <th className="px-4 py-3 text-center text-gray-500">Experian</th>
            <th className="px-4 py-3 text-center text-gray-500">TransUnion</th>
          </tr></thead><tbody className="divide-y">{cycles.map(c => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono">{c.cycle_date}</td>
              <td className="px-4 py-3">{c.total_accounts}</td>
              <td className="px-4 py-3 text-green-600">{c.accounts_current}</td>
              <td className="px-4 py-3 text-amber-600">{c.accounts_delinquent}</td>
              {['equifax','experian','transunion'].map(b => (
                <td key={b} className="px-4 py-3 text-center">
                  <button onClick={() => toggleBureau(c.id, b, c[`${b}_submitted`])} className={`w-6 h-6 rounded inline-flex items-center justify-center ${c[`${b}_submitted`] ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {c[`${b}_submitted`] ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  </button>
                </td>
              ))}
            </tr>
          ))}</tbody></table></div>
        )}
      </Card>
    </div>
  );
};

export default CreditBuilderReporting;
