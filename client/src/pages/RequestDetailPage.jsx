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
  FileText,
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
    return <div className="p-12 text-center text-xs font-mono text-purple-300">LOADING_REQUEST_DETAIL...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-rose-500/30 max-w-lg mx-auto shadow-2xl">
        <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
        <h2 className="text-xs font-bold text-slate-100 uppercase">Error Loading Request</h2>
        <p className="text-xs text-slate-400 mt-1">{error || 'Request not found'}</p>
        <Link to="/requests" className="mt-4 inline-block px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-mono font-bold">RETURN_TO_QUEUE</Link>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-sans text-slate-100">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
        <Link to="/requests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Central Requests Queue</span>
        </Link>
        <div className="text-[10px] font-mono text-slate-400">
          SUBMITTED: {new Date(request.submitted_at).toLocaleString()}
        </div>
      </div>

      {/* Summary Header Box */}
      <div className="glass-card rounded-2xl p-6 border border-purple-500/20 shadow-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 rounded-lg">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge sla={request.sla} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent mt-2">
              {request.title}
            </h1>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-4">
              <span>Workflow: <strong className="text-slate-200 font-semibold">{request.request_type_name}</strong></span>
              <span>Priority: <strong className="text-slate-200 font-semibold">{request.priority}</strong></span>
              <span>Required: <strong className="text-slate-200 font-semibold">{request.required_date || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-900/80 p-3 rounded-xl border border-slate-800 min-w-[200px]">
            <div className="text-[9px] font-mono font-bold text-purple-400 uppercase">REQUESTER_CONTEXT</div>
            <div className="text-xs font-bold text-slate-100 mt-0.5">{request.requester_name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{request.requester_dept_name} Department</div>
          </div>
        </div>

        {/* Visual Progress Timeline */}
        <div>
          <div className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-wider mb-1">STAGE_PROGRESS_PIPELINE</div>
          <StageTimeline stages={stages} currentStageId={request.current_stage_id} status={request.status} />
        </div>

      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Management Panel */}
          {!isTerminal && (
            <div className="rounded-2xl bg-gradient-to-br from-slate-900/90 to-purple-950/40 border border-purple-500/30 p-5 shadow-2xl space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div>
                  <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    <span>STAGE_ACTION_PANEL // {request.stage_name}</span>
                  </h2>
                </div>
                {isRequester && (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    REQUESTER_MODE (NO_SELF_APPROVAL)
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter decision comments or notes..."
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {canApprove && (
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40 border border-emerald-400/30 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-950/40 border border-rose-400/30 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Request</span>
                  </button>
                )}

                {canRequestChanges && (
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-950/40 border border-amber-400/30 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Request Changes</span>
                  </button>
                )}

                {canProcess && (
                  <button
                    onClick={() => handleAction('START_PROCESSING')}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Processing</span>
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-950/40 border border-purple-400/30 flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Form Data Values */}
          <div className="glass-card rounded-2xl border border-purple-500/20 p-5 shadow-2xl space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800/80 pb-2">FORM_FIELD_VALUES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {Object.entries(request.form_data || {}).map(([key, value]) => (
                <div key={key} className="bg-slate-900/70 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold text-slate-100 mt-1 whitespace-pre-wrap">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="glass-card rounded-2xl border border-purple-500/20 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400">
                SUPPORTING_ATTACHMENTS ({attachments?.length || 0})
              </h3>

              <label htmlFor="detail-upload" className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-purple-500/30 border border-purple-500/30 transition cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
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

            {uploading && <div className="text-xs font-mono text-purple-300">UPLOADING_FILE...</div>}

            {attachments?.length > 0 ? (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-100 text-xs">{att.original_name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        By {att.uploader_name} • {(att.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/api/requests/attachments/${att.id}/download`}
                      download
                      className="px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-md shadow-violet-950/40 border border-purple-400/30"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">No attachments uploaded</div>
            )}
          </div>

        </div>

        {/* Right Column: Comments & Audit Log */}
        <div className="space-y-6">
          
          <div className="glass-card rounded-2xl border border-purple-500/20 p-5 shadow-2xl space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800/80 pb-2">
              IN_THREAD_COMMENTS
            </h3>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {comments?.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-200">
                      <span>{c.user_name} ({c.user_role})</span>
                      <span className="text-[10px] font-mono text-purple-400/80">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-300 mt-1 text-xs">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-4 font-mono">NO_COMMENTS</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-3 border-t border-slate-800/80">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write clarification note..."
                rows={2}
                className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="mt-2 w-full py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-xl transition shadow-md shadow-violet-950/40 border border-purple-400/30"
              >
                POST_COMMENT
              </button>
            </form>
          </div>

          <div className="glass-card rounded-2xl border border-purple-500/20 p-5 shadow-2xl space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800/80 pb-2">
              IMMUTABLE_AUDIT_TRAIL
            </h3>

            <div className="relative border-l-2 border-slate-800 ml-3 space-y-4 py-1">
              {auditTrail?.map(log => (
                <div key={log.id} className="mb-4 ml-4 relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-violet-500 ring-4 ring-[#08080c]"></div>
                  <div className="text-xs font-bold text-slate-100">{log.action}</div>
                  <div className="text-[10px] text-slate-400">By {log.actor_name} ({log.actor_role})</div>
                  <div className="text-[9px] font-mono text-purple-400/80">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl border border-rose-500/40 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-mono text-xs font-bold text-rose-400 uppercase">REJECTION_REASON_REQUIRED</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State explicit rejection reason..."
              rows={3}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-card rounded-2xl border border-amber-500/40 p-5 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-mono text-xs font-bold text-amber-400 uppercase">REQUEST_CHANGES_DETAILS</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe required changes..."
              rows={3}
              className="w-full p-3 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowChangesModal(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl">Cancel</button>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl disabled:opacity-50"
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
