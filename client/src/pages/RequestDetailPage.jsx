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
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
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
    return <div className="p-12 text-center text-xs font-mono text-slate-400">LOADING_REQUEST_DETAIL...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white rounded-md border border-slate-200 shadow-2xs max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
        <h2 className="text-xs font-bold text-slate-900 uppercase">Error Loading Request</h2>
        <p className="text-xs text-slate-600 mt-1">{error || 'Request not found'}</p>
        <Link to="/requests" className="mt-4 inline-block px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-mono font-bold">RETURN_TO_QUEUE</Link>
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
    <div className="space-y-4 w-full font-sans text-slate-900">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <Link to="/requests" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition">
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Central Requests Queue</span>
        </Link>
        <div className="text-[10px] font-mono text-slate-400">
          SUBMITTED: {new Date(request.submitted_at).toLocaleString()}
        </div>
      </div>

      {/* Summary Header Box */}
      <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-xs">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge sla={request.sla} />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight mt-1.5">{request.title}</h1>
            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-4">
              <span>Workflow: <strong className="text-slate-900 font-semibold">{request.request_type_name}</strong></span>
              <span>Priority: <strong className="text-slate-900 font-semibold">{request.priority}</strong></span>
              <span>Required: <strong className="text-slate-900 font-semibold">{request.required_date || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 p-2.5 rounded-xs border border-slate-200 min-w-[190px]">
            <div className="text-[9px] font-mono font-bold text-slate-500 uppercase">REQUESTER_CONTEXT</div>
            <div className="text-xs font-bold text-slate-900 mt-0.5">{request.requester_name}</div>
            <div className="text-[10px] text-slate-600 font-medium">{request.requester_dept_name} Department</div>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div>
          <div className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-1">STAGE_PROGRESS_PIPELINE</div>
          <StageTimeline stages={stages} currentStageId={request.current_stage_id} status={request.status} />
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        <div className="lg:col-span-2 space-y-4">
          
          {/* Action Management Panel (Dark Slate Container - One Deliberate Weight-Shift Per Screen) */}
          {!isTerminal && (
            <div className="bg-slate-900 text-white rounded-md border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <h2 className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                    STAGE_ACTION_PANEL // {request.stage_name}
                  </h2>
                </div>
                {isRequester && (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-xs font-bold">
                    REQUESTER_MODE (NO_SELF_APPROVAL)
                  </span>
                )}
              </div>

              {error && (
                <div className="p-2 rounded bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter decision comments or notes..."
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus-ring"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {canApprove && (
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 transition disabled:opacity-50 focus-ring"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Request</span>
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionSubmitting}
                    className="px-3 py-1.5 border border-rose-400/40 text-rose-300 hover:bg-rose-950/40 font-semibold text-xs rounded-md flex items-center gap-1.5 transition disabled:opacity-50 focus-ring"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Request</span>
                  </button>
                )}

                {canRequestChanges && (
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={actionSubmitting}
                    className="px-3 py-1.5 border border-amber-400/40 text-amber-300 hover:bg-amber-950/40 font-semibold text-xs rounded-md flex items-center gap-1.5 transition disabled:opacity-50 focus-ring"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>
                )}

                {canProcess && (
                  <button
                    onClick={() => handleAction('START_PROCESSING')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 transition disabled:opacity-50 focus-ring"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Processing</span>
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionSubmitting}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-md flex items-center gap-1.5 transition disabled:opacity-50 focus-ring"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Form Data Values */}
          <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">FORM_FIELD_VALUES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(request.form_data || {}).map(([key, value]) => (
                <div key={key} className="bg-slate-50 p-2.5 rounded-xs border border-slate-200">
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold text-slate-900 mt-0.5 whitespace-pre-wrap">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500">
                SUPPORTING_ATTACHMENTS ({attachments?.length || 0})
              </h3>

              <label htmlFor="detail-upload" className="px-2 py-0.5 bg-slate-900 text-white rounded-xs text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-slate-800 transition cursor-pointer">
                <Plus className="w-3 h-3" />
                <span>UPLOAD_FILE</span>
                <input
                  type="file"
                  id="detail-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {uploading && <div className="text-xs font-mono text-teal-700">UPLOADING_FILE...</div>}

            {attachments?.length > 0 ? (
              <div className="space-y-1.5">
                {attachments.map(att => (
                  <div key={att.id} className="p-2.5 bg-slate-50 rounded-xs border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 text-xs">{att.original_name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        By {att.uploader_name} • {(att.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/api/requests/attachments/${att.id}/download`}
                      download
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-xs text-xs font-semibold flex items-center gap-1 transition focus-ring"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">No attachments uploaded</div>
            )}
          </div>

        </div>

        {/* Right Column: Comments & Audit Log */}
        <div className="space-y-4">
          
          <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              IN_THREAD_COMMENTS
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {comments?.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-2.5 rounded-xs bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{c.user_name} ({c.user_role})</span>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-700 mt-1 text-xs">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 text-center py-3 font-mono">NO_COMMENTS</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-slate-200">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write clarification note..."
                rows={2}
                className="w-full p-2 border border-slate-300 rounded-md text-xs focus-ring"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="mt-1.5 w-full py-1 bg-slate-900 hover:bg-slate-800 text-white font-mono font-bold text-xs rounded-md transition focus-ring"
              >
                POST_COMMENT
              </button>
            </form>
          </div>

          <div className="bg-white rounded-md border border-slate-200 p-4 space-y-3">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1.5">
              IMMUTABLE_AUDIT_TRAIL
            </h3>

            <div className="relative border-l-2 border-slate-200 ml-2 space-y-3 py-1">
              {auditTrail?.map(log => (
                <div key={log.id} className="mb-3 ml-3 relative">
                  <div className="absolute -left-[19px] top-0.5 w-3 h-3 rounded-full bg-slate-900 ring-4 ring-white"></div>
                  <div className="text-xs font-bold text-slate-900">{log.action}</div>
                  <div className="text-[10px] text-slate-600">By {log.actor_name} ({log.actor_role})</div>
                  <div className="text-[9px] font-mono text-slate-400">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 p-4 max-w-md w-full shadow-xl space-y-3">
            <h3 className="font-mono text-xs font-bold text-rose-700 uppercase">REJECTION_REASON_REQUIRED</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State explicit rejection reason..."
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus-ring"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-md">Cancel</button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-3.5 py-1.5 bg-rose-700 text-white font-bold text-xs rounded-md disabled:opacity-50 focus-ring"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md border border-slate-300 p-4 max-w-md w-full shadow-xl space-y-3">
            <h3 className="font-mono text-xs font-bold text-amber-700 uppercase">REQUEST_CHANGES_DETAILS</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe required changes..."
              rows={3}
              className="w-full p-2 border border-slate-300 rounded-md text-xs focus-ring"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowChangesModal(false)} className="px-3 py-1.5 bg-slate-100 text-slate-700 font-bold text-xs rounded-md">Cancel</button>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-3.5 py-1.5 bg-amber-700 text-white font-bold text-xs rounded-md disabled:opacity-50 focus-ring"
              >
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
