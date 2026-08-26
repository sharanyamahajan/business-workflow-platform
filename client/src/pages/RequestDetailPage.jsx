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
    return <div className="p-12 text-center text-xs font-mono text-[#6C63FF]">LOADING_REQUEST_DETAILS...</div>;
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center p-6 rounded-[32px] neu-extruded max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-[#E53E3E] mx-auto mb-2" />
        <h2 className="text-xs font-display font-bold text-[#3D4852] uppercase">Error Loading Request</h2>
        <p className="text-xs text-[#6B7280] mt-1">{error || 'Request not found'}</p>
        <Link to="/requests" className="mt-4 inline-block px-4 py-2 neu-button-primary text-white rounded-2xl text-xs font-mono font-bold">RETURN_TO_QUEUE</Link>
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
    <div className="space-y-6 max-w-7xl mx-auto pb-8 font-body text-[#3D4852]">
      
      {/* Back Nav */}
      <div className="flex items-center justify-between pb-3 border-b border-[#6B7280]/20">
        <Link to="/requests" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6C63FF] hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Central Requests Queue</span>
        </Link>
        <div className="text-[10px] font-mono text-[#6B7280]">
          SUBMITTED: {new Date(request.submitted_at).toLocaleString()}
        </div>
      </div>

      {/* Contract Summary Box */}
      <div className="p-6 rounded-[32px] neu-extruded space-y-4">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#6B7280]/20 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#6C63FF] neu-inset-sm px-2.5 py-0.5 rounded-full">
                {request.request_number}
              </span>
              <StatusBadge status={request.status} />
              <SlaBadge sla={request.sla} />
            </div>
            <h1 className="text-xl sm:text-2xl font-display font-extrabold text-[#3D4852] tracking-tight">{request.title}</h1>
            <div className="text-xs text-[#6B7280] flex items-center gap-4 pt-1 font-body">
              <span>Workflow: <strong className="text-[#3D4852]">{request.request_type_name}</strong></span>
              <span>Priority: <strong className="text-[#3D4852]">{request.priority}</strong></span>
              <span>Required: <strong className="text-[#3D4852]">{request.required_date || 'N/A'}</strong></span>
            </div>
          </div>

          <div className="text-left sm:text-right p-4 rounded-2xl neu-inset min-w-[200px]">
            <div className="text-[9px] font-mono font-bold text-[#6C63FF] uppercase tracking-wider">REQUESTER_CONTEXT</div>
            <div className="text-xs font-display font-bold text-[#3D4852] mt-0.5">{request.requester_name}</div>
            <div className="text-[10px] text-[#6B7280] font-medium">{request.requester_dept_name} Department</div>
          </div>
        </div>

        {/* Visual Pipeline */}
        <div>
          <div className="text-[9px] font-mono font-bold text-[#6C63FF] uppercase tracking-wider mb-2">STAGE_APPROVAL_PIPELINE</div>
          <StageTimeline stages={stages} currentStageId={request.current_stage_id} status={request.status} />
        </div>

      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Management Panel */}
          {!isTerminal && (
            <div className="p-6 rounded-[32px] neu-extruded space-y-4">
              <div className="flex items-center justify-between border-b border-[#6B7280]/20 pb-3">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6C63FF]">
                  STAGE_ACTION_PANEL // {request.stage_name}
                </h2>
                {isRequester && (
                  <span className="text-[9px] font-mono neu-inset-sm text-[#DD6B20] px-2 py-0.5 rounded-full font-bold">
                    REQUESTER_MODE (NO_SELF_APPROVAL)
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-2xl neu-inset text-[#E53E3E] text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={actionComments}
                  onChange={(e) => setActionComments(e.target.value)}
                  placeholder="Enter decision comments or notes..."
                  className="w-full px-4 py-2.5 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {canApprove && (
                  <button
                    onClick={() => handleAction('APPROVE')}
                    disabled={actionSubmitting}
                    className="px-5 py-2.5 neu-button-primary text-white font-display font-bold text-xs rounded-2xl flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                )}

                {canReject && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2.5 neu-button-secondary text-[#E53E3E] font-display font-bold text-xs rounded-2xl flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-[#E53E3E]" />
                    <span>Reject Request</span>
                  </button>
                )}

                {canRequestChanges && (
                  <button
                    onClick={() => setShowChangesModal(true)}
                    disabled={actionSubmitting}
                    className="px-4 py-2.5 neu-button-secondary text-[#DD6B20] font-display font-bold text-xs rounded-2xl flex items-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4 text-[#DD6B20]" />
                    <span>Request Changes</span>
                  </button>
                )}

                {canProcess && (
                  <button
                    onClick={() => handleAction('START_PROCESSING')}
                    disabled={actionSubmitting}
                    className="px-4 py-2.5 neu-button-secondary text-[#38B2AC] font-display font-bold text-xs rounded-2xl flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 text-[#38B2AC]" />
                    <span>Start Processing</span>
                  </button>
                )}

                {canComplete && (
                  <button
                    onClick={() => handleAction('COMPLETE')}
                    disabled={actionSubmitting}
                    className="px-5 py-2.5 neu-button-secondary text-[#38B2AC] font-display font-bold text-xs rounded-2xl flex items-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4 text-[#38B2AC]" />
                    <span>Mark Completed</span>
                  </button>
                )}
              </div>

            </div>
          )}

          {/* Form Field Values */}
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C63FF] border-b border-[#6B7280]/20 pb-2">FORM_FIELD_VALUES</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {Object.entries(request.form_data || {}).map(([key, value]) => (
                <div key={key} className="p-3.5 rounded-2xl neu-inset">
                  <div className="text-[9px] font-mono font-bold text-[#6B7280] uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</div>
                  <div className="font-semibold text-[#3D4852] mt-1 whitespace-pre-wrap">{String(value)}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <div className="flex items-center justify-between border-b border-[#6B7280]/20 pb-2">
              <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C63FF]">
                SUPPORTING_ATTACHMENTS ({attachments?.length || 0})
              </h3>

              <label htmlFor="detail-upload" className="px-3 py-1.5 neu-button-primary text-white rounded-2xl text-[10px] font-mono font-bold flex items-center gap-1.5 cursor-pointer">
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

            {uploading && <div className="text-xs font-mono text-[#6C63FF]">UPLOADING_FILE...</div>}

            {attachments?.length > 0 ? (
              <div className="space-y-2">
                {attachments.map(att => (
                  <div key={att.id} className="p-3.5 rounded-2xl neu-inset flex items-center justify-between">
                    <div>
                      <div className="font-display font-bold text-[#3D4852] text-xs">{att.original_name}</div>
                      <div className="text-[10px] text-[#6B7280] font-mono mt-0.5">
                        By {att.uploader_name} • {(att.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    <a
                      href={`${API_BASE_URL}/api/requests/attachments/${att.id}/download`}
                      download
                      className="px-3 py-1.5 neu-button-secondary text-[#6C63FF] rounded-xl text-xs font-mono font-bold flex items-center gap-1 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-[#6B7280] italic text-center py-2">No attachments uploaded</div>
            )}
          </div>

        </div>

        {/* Right Column: Comments & Audit Log */}
        <div className="space-y-6">
          
          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C63FF] border-b border-[#6B7280]/20 pb-2">
              IN_THREAD_COMMENTS
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {comments?.length > 0 ? (
                comments.map(c => (
                  <div key={c.id} className="p-3.5 rounded-2xl neu-inset text-xs">
                    <div className="flex items-center justify-between font-display font-bold text-[#3D4852]">
                      <span>{c.user_name} ({c.user_role})</span>
                      <span className="text-[9px] font-mono text-[#6B7280]">{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-[#3D4852] mt-1 text-xs">{c.content}</div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-[#6B7280] text-center py-4 font-mono">NO_COMMENTS</div>
              )}
            </div>

            <form onSubmit={handleAddComment} className="pt-2 border-t border-[#6B7280]/20">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write clarification note..."
                rows={2}
                className="w-full p-3 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] placeholder-[#6B7280] neu-focus-ring"
              />
              <button
                type="submit"
                disabled={commentSubmitting}
                className="mt-2 w-full py-2 neu-button-secondary text-[#6C63FF] font-mono font-bold text-xs rounded-2xl"
              >
                POST_COMMENT
              </button>
            </form>
          </div>

          <div className="p-6 rounded-[32px] neu-extruded space-y-4">
            <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#6C63FF] border-b border-[#6B7280]/20 pb-2">
              IMMUTABLE_AUDIT_TRAIL
            </h3>

            <div className="relative border-l-2 border-[#6C63FF]/30 ml-2 space-y-4 py-1">
              {auditTrail?.map(log => (
                <div key={log.id} className="mb-3 ml-4 relative">
                  <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#6C63FF]"></div>
                  <div className="text-xs font-display font-bold text-[#3D4852]">{log.action}</div>
                  <div className="text-[10px] text-[#6B7280]">By {log.actor_name} ({log.actor_role})</div>
                  <div className="text-[9px] font-mono text-[#6C63FF]">{new Date(log.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-[#3D4852]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-[32px] neu-extruded bg-[#E0E5EC] max-w-md w-full space-y-4">
            <h3 className="font-mono text-xs font-bold text-[#E53E3E] uppercase">REJECTION_REASON_REQUIRED</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="State explicit rejection reason..."
              rows={3}
              className="w-full p-3 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] neu-focus-ring"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 neu-button-secondary text-[#6B7280] font-bold text-xs rounded-2xl">Cancel</button>
              <button
                onClick={() => handleAction('REJECT')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-5 py-2 neu-button-primary bg-[#E53E3E] text-white font-bold text-xs rounded-2xl disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {showChangesModal && (
        <div className="fixed inset-0 bg-[#3D4852]/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="p-6 rounded-[32px] neu-extruded bg-[#E0E5EC] max-w-md w-full space-y-4">
            <h3 className="font-mono text-xs font-bold text-[#DD6B20] uppercase">REQUEST_CHANGES_DETAILS</h3>
            <textarea
              required
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Describe required changes..."
              rows={3}
              className="w-full p-3 bg-[#E0E5EC] neu-inset-deep rounded-2xl text-xs text-[#3D4852] neu-focus-ring"
            />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setShowChangesModal(false)} className="px-4 py-2 neu-button-secondary text-[#6B7280] font-bold text-xs rounded-2xl">Cancel</button>
              <button
                onClick={() => handleAction('REQUEST_CHANGES')}
                disabled={!rejectionReason.trim() || actionSubmitting}
                className="px-5 py-2 neu-button-primary bg-[#DD6B20] text-white font-bold text-xs rounded-2xl disabled:opacity-50"
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
