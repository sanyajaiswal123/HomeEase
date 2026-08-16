import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { API_ENDPOINTS } from '../config/constants';
import { Sparkles, Send, AlertTriangle, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

const examplePrompts = [
  'My AC is blowing warm air instead of cooling.',
  'Water is leaking under the kitchen sink.',
  'Short circuit in the living room switchboard.',
  'Need full house deep cleaning before Diwali.',
  'Washing machine stops during the spin cycle.'
];

export const AIDiagnose = () => {
  const [issueText, setIssueText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Analyzing your problem...');
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const loadingMessages = [
    'Analyzing your problem...',
    'Finding the possible cause...',
    'Checking safety recommendations...',
    'Estimating repair cost...'
  ];

  // Rotating loading message effect
  React.useEffect(() => {
    let interval;
    if (loading) {
      let idx = 0;
      interval = setInterval(() => {
        idx = (idx + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[idx]);
      }, 2000);
    } else {
      setLoadingText('Analyzing your problem...');
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleDiagnose = async (e) => {
    e.preventDefault();
    if (!issueText.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const res = await apiClient.post(API_ENDPOINTS.AI.DIAGNOSE, { issueText });
      setResult(res.data.data);
    } catch (err) {
      setErrorMsg(err.friendlyMessage || 'AI Diagnosis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyBadgeVariant = (level) => {
    switch (level?.toLowerCase()) {
      case 'emergency':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'success';
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-10 py-12 px-4 sm:px-6">
      {/* Page Title */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 flex items-center justify-center gap-3 text-gray-900 font-outfit tracking-tight">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-sm">
            <Sparkles size={24} />
          </div>
          AI Service Diagnostic
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto font-medium leading-relaxed mt-4">
          Describe your problem in detail, and our AI will recommend categories, calculate pricing,
          and list critical safety actions.
        </p>
      </div>

      {/* Query Form */}
      <Card className="shadow-soft border-border-light rounded-[24px]">
        <Card.Body className="p-8">
          <form onSubmit={handleDiagnose} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                What seems to be the issue? Describe it below:
              </label>

              {/* Example Prompts */}
              <div className="flex flex-wrap gap-2 mb-4">
                {examplePrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setIssueText(prompt)}
                    className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full hover:bg-teal-50 hover:text-primary transition-colors border border-gray-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <textarea
                className="w-full bg-bg-secondary border border-border-light rounded-[16px] text-gray-900 px-6 py-5 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary transition-all resize-y min-h-[160px] shadow-inner text-base font-medium leading-relaxed"
                required
                placeholder="e.g. 'My kitchen sink is completely clogged and water is overflowing onto the floor when I run the dishwasher...'"
                value={issueText}
                onChange={(e) => setIssueText(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full font-bold shadow-elevated rounded-xl group py-4"
              variant="primary"
              disabled={!issueText.trim() || loading}
            >
              <span className="flex items-center gap-2">
                {loading ? (
                  <span className="flex items-center gap-2 animate-pulse">
                    <Sparkles size={18} className="animate-spin" /> {loadingText}
                  </span>
                ) : (
                  'Diagnose Problem'
                )}
                {!loading && (
                  <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                )}
              </span>
            </Button>
          </form>
        </Card.Body>
      </Card>

      {errorMsg && (
        <div className="bg-red-50 text-red-600 p-5 rounded-[16px] border border-red-200 text-center font-bold shadow-sm animate-fade-in flex items-center justify-center gap-2">
          <AlertTriangle size={18} /> {errorMsg}
        </div>
      )}

      {/* AI Diagnostic Report Output */}
      {result && (
        <div className="bg-white border border-border-light rounded-[24px] shadow-elevated overflow-hidden animate-fade-in">
          <div className="p-8 md:p-10 flex flex-col gap-8">
            {/* Header Report Card */}
            <div className="flex justify-between items-start flex-wrap gap-4 border-b border-border-light pb-6">
              <div>
                <span className="text-xs text-text-secondary font-bold uppercase tracking-widest">
                  Issue Detected
                </span>
                <h2 className="text-2xl md:text-3xl text-gray-900 mt-2 font-extrabold font-outfit tracking-tight">
                  {result.issueDetected}
                </h2>
                <div className="mt-4 flex items-center gap-2 text-primary font-bold text-lg">
                  <Sparkles size={18} /> {result.recommendedService} Recommended
                </div>
              </div>

              {/* Urgency Badge */}
              <Badge
                variant={getUrgencyBadgeVariant(result.urgency)}
                icon={<AlertTriangle size={16} />}
                className="px-4 py-2 text-sm uppercase tracking-widest font-bold shadow-sm rounded-xl"
              >
                Urgency: {result.urgency}
              </Badge>
            </div>

            {/* Possible Cause */}
            <div className="bg-bg-alternate p-6 rounded-2xl border border-primary-light shadow-sm">
              <h3 className="text-lg font-extrabold mb-3 flex items-center gap-2 text-gray-900 uppercase tracking-wide">
                <HelpCircle size={20} className="text-primary" /> Possible Cause
              </h3>
              <p className="text-gray-900 leading-relaxed text-base font-medium">
                {result.possibleCause}
              </p>
            </div>

            {/* Safety Advice */}
            {result.safetyAdvice && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-6 shadow-sm">
                <h3 className="text-red-700 font-extrabold mb-4 flex items-center gap-2 text-base uppercase tracking-wide">
                  <ShieldAlert size={20} /> Safety Advice
                </h3>
                <p className="text-red-900 font-bold text-sm leading-relaxed">
                  {result.safetyAdvice}
                </p>
              </div>
            )}

            {/* AI Extra Data Grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border border-border-light rounded-2xl bg-gray-50">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-bold block mb-1">
                  Estimated Time
                </span>
                <span className="text-lg font-extrabold text-gray-900">{result.estimatedTime}</span>
              </div>
              <div className="p-6 border border-border-light rounded-2xl bg-gray-50">
                <span className="text-xs text-text-secondary uppercase tracking-widest font-bold block mb-1">
                  Confidence Score
                </span>
                <span className="text-lg font-extrabold text-gray-900">
                  {result.confidenceScore}
                </span>
              </div>
            </div>

            {/* Preventive Tips */}
            {result.preventiveTips?.length > 0 && (
              <div className="px-2">
                <h3 className="text-sm font-extrabold mb-3 text-gray-900 uppercase tracking-wide">
                  Preventive Tips
                </h3>
                <ul className="pl-5 flex flex-col gap-2 list-disc marker:text-primary">
                  {result.preventiveTips.map((tip, idx) => (
                    <li key={idx} className="text-gray-700 font-medium text-sm">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Cost and Book Button */}
            <div className="bg-bg-secondary rounded-2xl p-8 border border-border-light flex justify-between items-center flex-wrap gap-6 shadow-sm mt-2">
              <div>
                <span className="text-xs text-text-secondary uppercase tracking-widest font-bold">
                  Estimated Cost Range
                </span>
                <h3 className="text-3xl text-gray-900 font-extrabold mt-2 font-outfit">
                  {result.estimatedPrice}
                </h3>
                {result.bookImmediately?.toLowerCase() === 'yes' && (
                  <span className="inline-block mt-2 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">
                    Immediate Booking Recommended
                  </span>
                )}
              </div>

              {result.serviceId ? (
                <Button
                  onClick={() => navigate(`/service/${result.serviceId}`)}
                  variant="primary"
                  size="lg"
                  className="rounded-xl shadow-md font-bold px-8 group py-4"
                >
                  <span className="flex items-center gap-2">
                    Book Service Now{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </Button>
              ) : (
                <Button
                  onClick={() => navigate('/dashboard')}
                  variant="secondary"
                  size="lg"
                  className="rounded-xl font-bold px-8 group py-4"
                >
                  <span className="flex items-center gap-2">
                    Explore Services{' '}
                    <ArrowRight
                      size={18}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Diagnosis History Mock */}
      {!result && !loading && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4 font-outfit">
            Recent Diagnosis Examples
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                q: 'Ceiling fan making loud grinding noise',
                cat: 'Electrician',
                status: 'Resolved'
              },
              { q: 'Water heater taking too long to heat', cat: 'Plumbing', status: 'Pending' }
            ].map((h, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col gap-2 shadow-sm"
              >
                <span className="text-sm font-medium text-gray-600">"{h.q}"</span>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                    {h.cat}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase ${h.status === 'Resolved' ? 'text-green-600' : 'text-orange-500'}`}
                  >
                    {h.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDiagnose;
