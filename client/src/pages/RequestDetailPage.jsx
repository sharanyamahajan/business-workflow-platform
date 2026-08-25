import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/config';
import StatusBadge from '../components/common/StatusBadge';
import SlaBadge from '../components/common/SlaBadge';
import StageTimeline from '../components/common/StageTimeline';
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  Play, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  Download, 
  Clock, 
  User, 
  Building, 
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronLeft,
  Upload,
  Plus
} from 'lucide-react';

export default function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionComments, setActionComments] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
  }, [id, user]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to fetch request');
      }
      setData(resData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, payload = {}) => {
    setActionSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          comments: payload.comments || actionComments,
          reason: payload.reason || rejectionReason,
          version: data?.request?.version
        })
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Action failed');
      }

      setShowRejectModal(false);
      setShowChangesModal(false);
      setActionComments('');
      setRejectionReason('');
      fetchRequestDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      });

      if (res.ok) {
        setNewComment('');
        fetchRequestDetails();
      }
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleFileUpload = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selected);

      const res = await fetch(`${API_BASE_URL}/api/requests/${id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });

      if (res.ok) {
        setUploadFile(null);
        fetchRequestDetails();
      } else {
        const errData = await res.json();
        alert(errData.error || 'File upload failed');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading request detail...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-xs">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2" />
        <h2 className="text-xs font-bold text-slate-800">Error Loading Request</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Request not found'}</p>
        <Link to="/requests" className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold">Back to Queue</Link>
      </div>
    );
  }

  const { request, stages, approvals, comments, attachments, auditTrail } = data;

  const isRequester = request.requester_id === user.id;
  const isTerminal = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status);
  const currentStage = stages.find(s => s.id === request.current_stage_id);

  const canApprove = !isRequester && !isTerminal && currentStage?.can_approve;
  const canReject = !isRequester && !isTerminal && currentStage?.can_reject;
  const canRequestChanges = !isTerminal && currentStage?.can_request_changes;
  const canProcess = !isTerminal && currentStage?.can_process && request.status !== 'PROCESSING';
  const canComplete = !isRequester && !isTerminal && (currentStage?.can_complete || request.status === 'PROCESSING');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <Link to="/requests" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-indigo-600 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Central Requests Queue</span>
        </Link>
        <div className="text-[11px] text-slate-400 font-medium">
          Submitted: {new Date(request.submitted_at).toLocaleString()}
        </div>
      </div>

      {/* Request Summary Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge sla={request.sla} />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-2">{request.title}</h1>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-4">
              <span>Workflow: <strong className="text-slate-800">{request.request_type_name}</strong></span>
              <span>Priority: <strong className="text-slate-800">{request.priority}</strong></span>
              <span>Required: <strong className="text-slate-800">{request.required_date || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-3 rounded-lg border border-slate-200/80 min-w-[200px]">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Requester Context</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">{request.requester_name}</div>
            <div className="text-[10px] text-slate-500 font-medium">{request.requester_dept_name} Department</div>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Workflow Lifecycle Progress</div>
          <StageTimeline stages={stages} currentStageId={request.current_stage_id} status={request.status} />
        </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Management Panel */}
          {!isTerminal && (
            <div className="bg-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <h2 className="text-xs font-bold flex items-center gap-2 text-indigo-400 uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Role Approval & Action Panel</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 mt-0.5">Current Stage: {request.stage_name} ({request.assigned_role_code})</p>
                </div>
                {isRequester && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                    Requester Mode (No Self-Approval)
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 mb-4 rounded-lg bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Decision Comments / Notes</label>
                <input
                  type="text"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Provide comments for approval decision or fulfillment update..."
                  className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                {canApprove && (
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Request</span>
                  </button>
                )}

                {canRequestChanges && (
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                )}

                {canProcess && (
                  <button
                    onClick={() => handleAction('START_PROCESSING')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Processing</span>
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Form Data Card */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">Form Data Values</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(request.form_data || {}).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold text-slate-800 mt-1 whitespace-pre-wrap">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                <span>Supporting Attachments ({attachments?.length || 0})</span>
              </h3>

              <label htmlFor="detail-upload" className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-100 transition cursor-pointer">
                <Plus className="w-3 h-3" />
                <span>Upload File</span>
                <input
                  type="file"
                  id="detail-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && <div className="text-xs text-indigo-600 font-medium">Uploading attachment...</div>}

            {attachments?.length > 0 ? (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800 text-xs">{att.original_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Uploaded by {att.uploader_name} • {(att.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/api/requests/attachments/${att.id}/download`}
                      download
                      className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No document attachments uploaded for this request.</div>
            )}
          </div>

        </div>

        {/* Right Column: Comments Thread & Audit Log */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
              <span>In-Thread Clarifications</span>
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {comments?.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{c.user_name} ({c.user_role})</span>
                      <span className="text-[10px] text-slate-400 font-normal">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-600 mt-1 text-xs">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-4">No comments added yet</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-100">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write clarification note..."
                rows={2}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="mt-2 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition"
              >
                Post Comment
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immutable Audit Trail</span>
            </h3>

            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 py-1">
              {auditTrail?.map(log => (
                <div key={log.id} className="mb-4 ml-4 relative">
                  <div className="absolute -left-[23px] top-0 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                  <div className="text-xs font-bold text-slate-900">{log.action}</div>
                  <div className="text-[11px] text-slate-600">By {log.actor_name} ({log.actor_role})</div>
                  <div className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm text-rose-600">Rejection Reason Required</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State reason for rejecting request..."
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">Cancel</button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-lg disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-bold text-slate-900 text-sm text-amber-600">Request Changes / Clarifications</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe required changes or missing documents..."
              rows={3}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowChangesModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">Cancel</button>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-3 py-1.5 bg-amber-600 text-white font-bold text-xs rounded-lg disabled:opacity-50"
              >
                Send Change Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
