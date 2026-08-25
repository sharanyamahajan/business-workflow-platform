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
  Plus,
  Flame,
  Zap,
  Lock
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
    return (
      <div className="p-12 text-center font-mono text-xs text-[#FFD600]">
        FETCHING_BITCOIN_CONTRACT_DETAIL...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center btc-card rounded-2xl max-w-lg mx-auto border-rose-500/50">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 animate-bounce" />
        <h2 className="text-sm font-heading font-bold text-white uppercase">Error Loading Contract</h2>
        <p className="text-xs text-slate-300 mt-1">{error || 'Request not found'}</p>
        <Link to="/requests" className="mt-4 inline-block px-4 py-2 bg-[#F7931A] text-white rounded-full text-xs font-mono font-bold">RETURN_TO_QUEUE</Link>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-slate-100 bg-grid-pattern">
      
      {/* Top Back Nav */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <Link to="/requests" className="inline-flex items-center gap-1.5 text-xs font-mono text-[#F7931A] hover:text-[#FFD600] transition">
          <ChevronLeft className="w-4 h-4" />
          <span>BACK_TO_CENTRAL_QUEUE</span>
        </Link>
        <div className="text-[10px] font-mono text-slate-400">
          TIMESTAMPE_DEPOSIT: {new Date(request.submitted_at).toLocaleString()}
        </div>
      </div>

      {/* Contract Summary Box */}
      <div className="btc-card p-6 rounded-2xl space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#F7931A] bg-[#F7931A]/10 border border-[#F7931A]/30 px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(247,147,26,0.2)]">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge sla={request.sla} />
            </div>
            <h1 className="text-xl sm:text-2xl font-heading font-extrabold text-white tracking-tight">{request.title}</h1>
            <div className="text-xs text-slate-300 flex items-center gap-4 pt-1 font-body">
              <span>Workflow: <strong className="text-[#FFD600] font-mono">{request.request_type_name}</strong></span>
              <span>Priority: <strong className="text-[#F7931A] font-mono">{request.priority}</strong></span>
              <span>Target SLA: <strong className="text-white font-mono">{request.required_date || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right bg-[#030304]/80 p-3 rounded-xl border border-white/10 min-w-[200px]">
            <div className="text-[9px] font-mono font-bold text-[#F7931A] uppercase tracking-widest">REQUESTER_NODE</div>
            <div className="text-xs font-heading font-bold text-white mt-0.5">{request.requester_name}</div>
            <div className="text-[10px] text-slate-400 font-mono">{request.requester_dept_name} Department</div>
          </div>
        </div>

        {/* Visual Pipeline */}
        <div>
          <div className="text-[9px] font-mono font-bold text-[#F7931A] uppercase tracking-widest mb-2">STAGE_APPROVAL_PIPELINE</div>
          <StageTimeline stages={stages} currentStageId={request.current_stage_id} status={request.status} />
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Management Panel */}
          {!isTerminal && (
            <div className="btc-card p-5 rounded-2xl border-[#F7931A]/40 bg-gradient-to-br from-[#EA580C]/20 via-[#0F1115] to-[#0F1115] shadow-[0_0_40px_-10px_rgba(247,147,26,0.3)] space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#F7931A]" />
                  <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFD600]">
                    STAGE_DECISION_PANEL // {request.stage_name}
                  </h2>
                </div>
                {isRequester && (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                    REQUESTER_NODE (NO_SELF_APPROVAL)
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-200 text-xs font-mono">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter cryptographic audit notes or decision rationale..."
                  className="w-full px-4 py-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {canApprove && (
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-heading font-bold text-xs rounded-full shadow-[0_0_20px_rgba(247,147,26,0.6)] hover:scale-105 transition border border-white/20 flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2 border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-950/60 font-heading font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Reject Request</span>
                  </button>
                )}

                {canRequestChanges && (
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2 border border-[#FFD600]/40 bg-[#FFD600]/10 text-[#FFD600] hover:bg-[#FFD600]/20 font-heading font-bold text-xs rounded-full transition flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-4 h-4 text-[#FFD600]" />
                    <span>Request Changes</span>
                  </button>
                )}

                {canProcess && (
                  <button
                    onClick={() => handleAction('START_PROCESSING')}
                    disabled={actionSubmitting}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-heading font-bold text-xs rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition flex items-center gap-1.5"
                  >
                    <Play className="w-4 h-4" />
                    <span>Start Processing</span>
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionSubmitting}
                    className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-heading font-bold text-xs rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] transition flex items-center gap-1.5 border border-white/20"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Form Schema Values */}
          <div className="btc-card p-5 rounded-2xl space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F7931A] border-b border-white/10 pb-2">
              FORM_SCHEMA_FIELD_VALUES
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(request.form_data || {}).map(([key, value]) => (
                <div key={key} className="bg-black/50 p-3 rounded-xl border border-white/10">
                  <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold text-white mt-1 whitespace-pre-wrap">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="btc-card p-5 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F7931A]">
                SUPPORTING_ATTACHMENTS ({attachments?.length || 0})
              </h3>

              <label htmlFor="detail-upload" className="px-3 py-1 bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 hover:scale-105 transition cursor-pointer shadow-[0_0_15px_rgba(247,147,26,0.4)]">
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

            {uploading && <div className="text-xs font-mono text-[#FFD600]">UPLOADING_FILE_TO_LEDGER...</div>}

            {attachments?.length > 0 ? (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="p-3 bg-black/50 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-heading font-bold text-white text-xs">{att.original_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        By {att.uploader_name} • {(att.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/api/requests/attachments/${att.id}/download`}
                      download
                      className="px-3 py-1.5 bg-white/10 hover:bg-[#F7931A] hover:text-white border border-white/20 rounded-full text-xs font-mono font-bold flex items-center gap-1 transition shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-mono text-center py-2">NO_ATTACHMENTS_UPLOADED</div>
            )}
          </div>

        </div>

        {/* Right Column: Comments & Audit Trail */}
        <div className="space-y-6">
          
          <div className="btc-card p-5 rounded-2xl space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F7931A] border-b border-white/10 pb-2">
              IN_THREAD_AUDIT_COMMENTS
            </h3>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {comments?.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-3 rounded-xl bg-black/50 border border-white/10 text-xs">
                    <div className="flex items-center justify-between font-heading font-bold text-[#FFD600]">
                      <span>{c.user_name} ({c.user_role})</span>
                      <span className="text-[9px] font-mono text-slate-400">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-slate-200 mt-1 text-xs">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 text-center py-4 font-mono">NO_AUDIT_COMMENTS</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-white/10">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write audit clarification note..."
                rows={2}
                className="w-full p-2.5 bg-black/60 border-b-2 border-white/20 rounded-lg text-xs text-white placeholder:text-slate-500 focus-visible:border-[#F7931A] focus-visible:outline-none"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="mt-2 w-full py-1.5 bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-mono font-bold text-xs rounded-full shadow-[0_0_15px_rgba(247,147,26,0.4)] hover:scale-105 transition"
              >
                POST_AUDIT_COMMENT
              </button>
            </form>
          </div>

          <div className="btc-card p-5 rounded-2xl space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#F7931A] border-b border-white/10 pb-2">
              IMMUTABLE_BLOCKCHAIN_AUDIT_TRAIL
            </h3>

            <div className="relative border-l-2 border-[#F7931A]/30 ml-2 space-y-4 py-1">
              {auditTrail?.map(log => (
                <div key={log.id} className="mb-3 ml-4 relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#F7931A] shadow-[0_0_10px_#F7931A]"></div>
                  <div className="text-xs font-heading font-bold text-white">{log.action}</div>
                  <div className="text-[10px] text-slate-300">By {log.actor_name} ({log.actor_role})</div>
                  <div className="text-[9px] font-mono text-[#FFD600]">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="btc-card p-5 rounded-2xl max-w-md w-full border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.4)] space-y-4">
            <h3 className="font-mono text-xs font-bold text-rose-400 uppercase tracking-widest">REJECTION_REASON_REQUIRED</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State explicit rejection reason..."
              rows={3}
              className="w-full p-2.5 bg-black/60 border-b-2 border-rose-500/40 rounded-lg text-xs text-white focus-visible:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 bg-white/10 text-slate-300 font-bold text-xs rounded-full">Cancel</button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-full shadow-[0_0_20px_rgba(244,63,94,0.5)] disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="btc-card p-5 rounded-2xl max-w-md w-full border-[#FFD600]/50 shadow-[0_0_40px_rgba(255,214,0,0.3)] space-y-4">
            <h3 className="font-mono text-xs font-bold text-[#FFD600] uppercase tracking-widest">REQUEST_CHANGES_DETAILS</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe required changes..."
              rows={3}
              className="w-full p-2.5 bg-black/60 border-b-2 border-[#FFD600]/40 rounded-lg text-xs text-white focus-visible:outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowChangesModal(false)} className="px-4 py-2 bg-white/10 text-slate-300 font-bold text-xs rounded-full">Cancel</button>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-5 py-2 bg-[#FFD600] text-slate-950 font-heading font-bold text-xs rounded-full shadow-[0_0_20px_rgba(255,214,0,0.5)] disabled:opacity-50"
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
