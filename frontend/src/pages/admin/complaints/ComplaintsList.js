import React, { useState, useEffect } from 'react';
import { complaintAPI } from '../../../utils/api';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Eye, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const ComplaintsList = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await complaintAPI.getAll();
      setComplaints(response.data);
    } catch (error) {
      toast.error('Failed to load complaints');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await complaintAPI.updateStatus(id, status);
      toast.success('Status updated successfully');
      fetchComplaints();
      if (selectedComplaint?.id === id) {
        setSelectedComplaint({ ...selectedComplaint, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-cinzel text-3xl font-bold text-primary-blue mb-2">
          Company Complaints
        </h2>
        <p className="text-gray-600">
          Review complaints submitted about other credit repair companies. Use this information for investigations and educational content.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Complaints List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="border-b p-4 bg-gray-50">
            <h3 className="font-semibold">All Complaints ({complaints.length})</h3>
          </div>
          <div className="max-h-[600px] overflow-y-auto">
            {complaints.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No complaints received yet
              </div>
            ) : (
              complaints.map((complaint) => (
                <div
                  key={complaint.id}
                  onClick={() => setSelectedComplaint(complaint)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition ${
                    selectedComplaint?.id === complaint.id ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-primary-blue">
                        {complaint.company_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {complaint.complainant_name} • {complaint.state || 'N/A'}
                      </p>
                    </div>
                    <Badge
                      variant={
                        complaint.status === 'resolved' ? 'default' :
                        complaint.status === 'investigating' ? 'secondary' : 'outline'
                      }
                    >
                      {complaint.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {complaint.complaint_details}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(complaint.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Complaint Detail */}
        <div className="bg-white rounded-xl shadow p-6">
          {selectedComplaint ? (
            <div>
              <div className="mb-6">
                <h3 className="font-cinzel text-2xl font-bold text-primary-blue mb-2">
                  {selectedComplaint.company_name}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Status: <Badge variant="outline">{selectedComplaint.status}</Badge></span>
                  <span>Date: {new Date(selectedComplaint.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-1">Complainant Information</h4>
                  <p className="text-gray-700">{selectedComplaint.complainant_name}</p>
                  <p className="text-gray-600 text-sm">{selectedComplaint.complainant_email}</p>
                  {selectedComplaint.state && (
                    <p className="text-gray-600 text-sm">State: {selectedComplaint.state}</p>
                  )}
                  {selectedComplaint.date_of_service && (
                    <p className="text-gray-600 text-sm">Service Date: {selectedComplaint.date_of_service}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Complaint Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedComplaint.complaint_details}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Update Status</h4>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant={selectedComplaint.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedComplaint.id, 'pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedComplaint.status === 'investigating' ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedComplaint.id, 'investigating')}
                  >
                    Investigating
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedComplaint.status === 'resolved' ? 'default' : 'outline'}
                    onClick={() => updateStatus(selectedComplaint.id, 'resolved')}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolved
                  </Button>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Use this information responsibly for investigation and educational purposes. Complainant information is confidential.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Select a complaint to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;
