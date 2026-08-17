import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  Upload,
  Lock,
  History,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import RetryState from '../components/ui/RetryState';

export const ProviderVerification = () => {
  const { user, setUser: setAuthUser } = useContext(AuthContext);

  const [statusData, setStatusData] = useState({
    verificationStatus: 'not_submitted',
    isVerified: false,
    documentUrl: '',
    idProofType: 'Aadhaar Card',
    idProofNumber: '',
    verificationHistory: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State
  const [legalName, setLegalName] = useState(user?.name || '');
  const [idProofType, setIdProofType] = useState('Aadhaar Card');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/auth/verification/status');
      const data = res.data.data;
      setStatusData(data);
      if (data.idProofType) setIdProofType(data.idProofType);
      if (data.idProofNumber) setIdProofNumber(data.idProofNumber);
      if (data.documentUrl) setDocumentUrl(data.documentUrl);
    } catch (err) {
      console.error('Error fetching verification status:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!idProofNumber.trim()) {
      return setSubmitError('Please enter a valid Government ID Proof Number.');
    }
    if (!documentUrl.trim()) {
      return setSubmitError('Please provide a valid document URL or image link.');
    }

    setSubmitting(true);
    try {
      const res = await apiClient.post('/auth/verification/submit', {
        legalName: legalName.trim(),
        idProofType,
        idProofNumber: idProofNumber.trim(),
        documentUrl: documentUrl.trim()
      });

      setSubmitSuccess(res.data.message || 'Verification submitted successfully!');
      fetchStatus();
      if (setAuthUser && res.data.data.user) {
        setAuthUser(res.data.data.user);
      }
    } catch (err) {
      setSubmitError(err.friendlyMessage || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const latestRejection = statusData.verificationHistory
    ?.slice()
    .reverse()
    .find((h) => h.action === 'rejected');

  const currentStatus = statusData.verificationStatus; // 'pending' | 'approved' | 'rejected' | 'not_submitted'

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 font-outfit tracking-tight">
          Provider Verification & KYC
        </h1>
        <p className="text-text-secondary font-medium text-sm sm:text-base mt-1">
          Submit government identity documents to get verified by HomeEase Administration and gain customer trust.
        </p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-[28px]" />
      ) : error ? (
        <RetryState error={error} onRetry={fetchStatus} />
      ) : (
        <>
          {/* Status Banner */}
          {currentStatus === 'approved' || statusData.isVerified ? (
            <Card className="p-6 sm:p-8 bg-emerald-50 border border-emerald-200 rounded-[28px] shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                    <CheckCircle2 size={32} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-extrabold text-emerald-950 font-outfit">
                        Account Fully Verified ✅
                      </h2>
                    </div>
                    <p className="text-xs text-emerald-800 font-medium mt-1">
                      Your identity and background credentials have been verified by HomeEase Administration. You enjoy maximum customer trust and search visibility.
                    </p>
                  </div>
                </div>
                <Badge variant="success" className="font-extrabold text-xs px-4 py-2 uppercase">
                  Verified Professional
                </Badge>
              </div>
            </Card>
          ) : currentStatus === 'pending' ? (
            <Card className="p-6 sm:p-8 bg-amber-50/80 border border-amber-200 rounded-[28px] shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                    <Clock size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-amber-950 font-outfit">
                      Verification Under Admin Review ⏳
                    </h2>
                    <p className="text-xs text-amber-800 font-medium mt-1">
                      Your submitted KYC documents are currently being reviewed by HomeEase Administration. Status updates will be notified here.
                    </p>
                  </div>
                </div>
                <Badge variant="warning" className="font-extrabold text-xs px-4 py-2 uppercase">
                  Review Pending
                </Badge>
              </div>
            </Card>
          ) : currentStatus === 'rejected' ? (
            <Card className="p-6 sm:p-8 bg-red-50 border border-red-200 rounded-[28px] shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center shrink-0 border border-red-200">
                    <XCircle size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-red-950 font-outfit">
                      Verification Application Rejected ❌
                    </h2>
                    <p className="text-xs text-red-800 font-medium mt-1">
                      Please review the administrative feedback below, update your documents, and resubmit.
                    </p>
                  </div>
                </div>
                <Badge variant="error" className="font-extrabold text-xs px-4 py-2 uppercase">
                  Action Required
                </Badge>
              </div>

              {latestRejection && (
                <div className="bg-white/80 p-4 rounded-2xl border border-red-200 text-xs text-red-900 font-semibold">
                  <strong className="block text-red-950 uppercase text-[10px] tracking-wider mb-1">
                    Admin Rejection Reason:
                  </strong>
                  "{latestRejection.reason}"
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-6 sm:p-8 bg-teal-50/50 border border-teal-200 rounded-[28px] shadow-soft">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 text-primary flex items-center justify-center shrink-0 border border-teal-200">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900 font-outfit">
                      Get Verified on HomeEase
                    </h2>
                    <p className="text-xs text-text-secondary font-medium mt-1">
                      Upload your Aadhaar, PAN Card, or Govt ID proof to get your official Verified badge.
                    </p>
                  </div>
                </div>
                <Badge variant="info" className="font-extrabold text-xs px-4 py-2 uppercase">
                  Not Submitted
                </Badge>
              </div>
            </Card>
          )}

          {/* Form & Documents Card */}
          <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft">
            <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
              <FileText size={20} className="text-primary" /> Identity Document Submission
            </h3>

            <form onSubmit={handleSubmitVerification} className="flex flex-col gap-6">
              {submitError && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} /> {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} /> {submitSuccess}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={currentStatus === 'approved' || currentStatus === 'pending'}
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    ID Proof Document Type *
                  </label>
                  <select
                    disabled={currentStatus === 'approved' || currentStatus === 'pending'}
                    value={idProofType}
                    onChange={(e) => setIdProofType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  >
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Driving License">Driving License</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    ID Proof Number *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={currentStatus === 'approved' || currentStatus === 'pending'}
                    placeholder="e.g. 1234-5678-9012"
                    value={idProofNumber}
                    onChange={(e) => setIdProofNumber(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
                    Document Image / PDF Link *
                  </label>
                  <input
                    type="url"
                    required
                    disabled={currentStatus === 'approved' || currentStatus === 'pending'}
                    placeholder="https://images.unsplash.com/photo-1554224155..."
                    value={documentUrl}
                    onChange={(e) => setDocumentUrl(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-60"
                  />
                </div>
              </div>

              {/* Sample Preset Picker for quick demo testing */}
              {currentStatus !== 'approved' && currentStatus !== 'pending' && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
                  <span className="font-bold text-gray-900 block mb-2">
                    Quick Sample Presets for Testing Upload:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Govt Aadhaar Sample', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800' },
                      { name: 'PAN Card Sample', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800' }
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setDocumentUrl(preset.url)}
                        className="bg-white border border-gray-300 hover:border-primary text-gray-800 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs"
                      >
                        Use {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Document Preview */}
              {documentUrl && (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row items-center gap-4">
                  <img
                    src={documentUrl}
                    alt="Uploaded Proof"
                    className="w-32 h-20 object-cover rounded-xl border border-gray-200 shadow-sm"
                  />
                  <div className="flex-1 text-xs">
                    <strong className="text-gray-900 font-bold block mb-0.5">
                      Attached Document Preview
                    </strong>
                    <a
                      href={documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      Open Full Document <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                {currentStatus === 'approved' ? (
                  <Button disabled variant="secondary" icon={<Lock size={16} className="text-gray-400" />}>
                    Verification Complete
                  </Button>
                ) : currentStatus === 'pending' ? (
                  <Button disabled variant="secondary" icon={<Clock size={16} className="text-amber-600" />}>
                    Under Review
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    loading={submitting}
                    icon={<Upload size={18} />}
                    className="rounded-2xl px-8 py-3.5 font-bold shadow-md"
                  >
                    {currentStatus === 'rejected' ? 'Resubmit Verification' : 'Submit for Verification'}
                  </Button>
                )}
              </div>
            </form>
          </Card>

          {/* Audit Trail Timeline */}
          {statusData.verificationHistory && statusData.verificationHistory.length > 0 && (
            <Card className="p-6 sm:p-8 bg-white border border-border-light rounded-[28px] shadow-soft">
              <h3 className="text-xl font-extrabold text-gray-900 font-outfit mb-6 pb-4 border-b border-gray-100 flex items-center gap-2">
                <History size={20} className="text-primary" /> Verification Action Log
              </h3>

              <div className="flex flex-col gap-4">
                {statusData.verificationHistory
                  .slice()
                  .reverse()
                  .map((log, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-gray-900 capitalize">
                            Action: {log.action}
                          </strong>
                          <Badge
                            variant={
                              log.action === 'approved'
                                ? 'success'
                                : log.action === 'rejected'
                                ? 'error'
                                : 'info'
                            }
                            className="uppercase text-[10px] font-bold"
                          >
                            {log.action}
                          </Badge>
                        </div>
                        <p className="text-gray-700 font-medium mt-1">"{log.reason}"</p>
                      </div>

                      <span className="text-text-secondary font-bold whitespace-nowrap shrink-0">
                        {formatDate(log.date)}
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderVerification;
