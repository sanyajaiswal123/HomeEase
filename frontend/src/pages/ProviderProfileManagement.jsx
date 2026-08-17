import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient';
import { AuthContext } from '../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Briefcase,
  Edit3,
  Award,
  Globe,
  AlertCircle,
  Lock,
  Sparkles,
  Camera
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import RetryState from '../components/ui/RetryState';

export const ProviderProfileManagement = () => {
  const { user: authUser, setUser: setAuthUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('1');
  const [skillsText, setSkillsText] = useState('');
  const [languagesText, setLanguagesText] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/auth/me');
      setProfile(res.data.data.user);
    } catch (err) {
      console.error('Error fetching provider profile:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const openEditModal = () => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setAvatar(profile.avatar || '');
    setBio(profile.providerDetails?.bio || '');
    setExperience(profile.providerDetails?.experience ? profile.providerDetails.experience.toString() : '1');
    setSkillsText(profile.providerDetails?.skills ? profile.providerDetails.skills.join(', ') : '');
    setLanguagesText(profile.providerDetails?.languages ? profile.providerDetails.languages.join(', ') : 'Hindi, English');
    setStreet(profile.address?.street || '');
    setCity(profile.address?.city || '');
    setZipCode(profile.address?.zipCode || '');
    setSaveError('');
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaveError('');

    // Frontend Validations
    if (!name.trim()) {
      return setSaveError('Full Name is required.');
    }
    if (phone && !/^\d{10}$/.test(phone.trim())) {
      return setSaveError('Please enter a valid 10-digit phone number.');
    }
    if (Number(experience) < 0) {
      return setSaveError('Experience years cannot be negative.');
    }

    const skillsArray = skillsText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const languagesArray = languagesText
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    setSaveLoading(true);
    try {
      const res = await apiClient.put('/auth/update-me', {
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar.trim(),
        address: {
          street: street.trim(),
          city: city.trim(),
          zipCode: zipCode.trim()
        },
        providerDetails: {
          bio: bio.trim(),
          experience: Number(experience),
          skills: skillsArray,
          languages: languagesArray
        }
      });

      const updated = res.data.data.user;
      setProfile(updated);
      if (setAuthUser) {
        setAuthUser(updated);
      }
      setIsEditModalOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      setSaveError(err.friendlyMessage || 'Failed to update profile.');
    } finally {
      setSaveLoading(false);
    }
  };

  const calculateCompletionScore = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.avatar) score += 20;
    if (profile.phone) score += 20;
    if (profile.providerDetails?.bio) score += 20;
    if (profile.providerDetails?.skills?.length > 0) score += 20;
    if (profile.address?.street || profile.address?.city) score += 20;
    return score;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const completionScore = calculateCompletionScore();

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-[30px] border border-border-light shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
        {loading ? (
          <Skeleton className="h-28 w-full rounded-2xl" />
        ) : error ? (
          <RetryState error={error} onRetry={fetchProfile} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-teal-50 text-primary font-extrabold text-3xl flex items-center justify-center border-2 border-teal-100 shadow-md shrink-0 overflow-hidden">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.name?.charAt(0) || 'P'
                  )}
                </div>

                {profile.providerDetails?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                    <CheckCircle2 size={24} className="text-primary fill-primary text-white" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-outfit">
                    {profile.name}
                  </h1>
                  <Badge
                    variant={
                      profile.providerDetails?.verificationStatus === 'approved' || profile.providerDetails?.isVerified
                        ? 'success'
                        : profile.providerDetails?.verificationStatus === 'rejected'
                        ? 'error'
                        : 'warning'
                    }
                    className="uppercase text-[10px] font-bold"
                  >
                    {profile.providerDetails?.verificationStatus === 'approved' || profile.providerDetails?.isVerified
                      ? 'Verified Professional'
                      : profile.providerDetails?.verificationStatus === 'rejected'
                      ? 'Verification Rejected'
                      : 'KYC Pending'}
                  </Badge>
                </div>

                <p className="text-sm font-bold text-primary">
                  {profile.providerDetails?.serviceCategory?.name || 'Home Services'} Expert • {profile.providerDetails?.experience || 1} Years Experience
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-text-secondary font-medium mt-2">
                  <span className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-500 fill-yellow-500" />{' '}
                    <strong className="text-gray-900 font-bold">{profile.providerDetails?.rating || 5.0}</strong> Rating
                  </span>
                  <span>•</span>
                  <span>Member since {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>

            <Button
              onClick={openEditModal}
              variant="primary"
              icon={<Edit3 size={18} />}
              className="rounded-2xl px-6 py-3 font-bold shadow-md shrink-0"
            >
              Edit Profile
            </Button>
          </>
        )}
      </div>

      {!loading && profile && (
        <>
          {/* Profile Completion Score Banner */}
          <Card className="p-6 bg-gradient-to-r from-teal-900 via-gray-900 to-gray-900 text-white rounded-[26px] shadow-soft">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <Sparkles className="text-teal-400" size={24} />
                <div>
                  <strong className="text-lg font-extrabold font-outfit block">
                    Profile Completion Strength: {completionScore}%
                  </strong>
                  <span className="text-xs text-teal-100/80 font-medium">
                    A complete profile increases customer booking trust by 3x.
                  </span>
                </div>
              </div>

              <Badge variant={completionScore === 100 ? 'success' : 'warning'} className="font-bold text-xs">
                {completionScore === 100 ? '100% Complete' : `${100 - completionScore}% Missing`}
              </Badge>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden border border-white/10">
              <div
                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </Card>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column: Personal & Contact */}
            <Card className="p-6 bg-white border border-border-light rounded-[26px] shadow-soft flex flex-col gap-5">
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit border-b border-gray-100 pb-3 flex items-center gap-2">
                <User size={18} className="text-primary" /> Contact Details
              </h3>

              <div className="flex flex-col gap-4 text-xs">
                <div>
                  <span className="text-text-secondary font-semibold block mb-0.5">Email Address (Account Identity)</span>
                  <div className="flex items-center gap-2 font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Mail size={16} className="text-gray-400" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                </div>

                <div>
                  <span className="text-text-secondary font-semibold block mb-0.5">Phone Number</span>
                  <div className="flex items-center gap-2 font-bold text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Phone size={16} className="text-primary" />
                    <span>{profile.phone || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <span className="text-text-secondary font-semibold block mb-0.5">Service Location / Address</span>
                  <div className="flex items-start gap-2 font-medium text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
                    <span>
                      {profile.address?.street
                        ? `${profile.address.street}, ${profile.address.city || ''} ${profile.address.zipCode || ''}`
                        : profile.address?.city || 'Delhi NCR'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Middle Column: Professional Profile */}
            <Card className="p-6 bg-white border border-border-light rounded-[26px] shadow-soft md:col-span-2 flex flex-col gap-6">
              <h3 className="text-lg font-extrabold text-gray-900 font-outfit border-b border-gray-100 pb-3 flex items-center gap-2">
                <Briefcase size={18} className="text-primary" /> Professional Bio & Skills
              </h3>

              {/* Bio */}
              <div>
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider block mb-2">
                  About Me / Bio
                </span>
                <p className="text-sm text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  {profile.providerDetails?.bio ||
                    'No professional bio provided yet. Click Edit Profile to describe your services and experience to customers.'}
                </p>
              </div>

              {/* Skills */}
              <div>
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider block mb-2">
                  Skills & Expertise Tags
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.providerDetails?.skills && profile.providerDetails.skills.length > 0 ? (
                    profile.providerDetails.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-teal-50 text-primary px-3.5 py-1.5 rounded-xl text-xs font-bold border border-teal-100"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">No skills added yet.</span>
                  )}
                </div>
              </div>

              {/* Languages Spoken */}
              <div>
                <span className="text-xs font-extrabold text-text-secondary uppercase tracking-wider block mb-2">
                  Languages Spoken
                </span>
                <div className="flex flex-wrap gap-2">
                  {profile.providerDetails?.languages && profile.providerDetails.languages.length > 0 ? (
                    profile.providerDetails.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-gray-200"
                      >
                        {lang}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">Hindi, English</span>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* System Protected Fields Notice */}
          <Card className="p-6 bg-gray-50 border border-gray-200 rounded-[26px]">
            <div className="flex items-start gap-3 text-xs text-gray-600 font-medium">
              <Lock size={18} className="text-gray-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900 font-bold block mb-0.5">
                  System Protected Account Fields
                </strong>
                <span>
                  Account Role (<strong className="text-gray-900">Provider</strong>), System ID (<strong className="text-gray-900">#{profile._id}</strong>), Verification Status (<strong className="text-gray-900">{profile.providerDetails?.verificationStatus || 'Pending'}</strong>), and Ratings are administrative parameters managed strictly by HomeEase platform logic.
                </span>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Edit Profile Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Provider Profile Information"
      >
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4 p-2 max-h-[75vh] overflow-y-auto">
          {saveError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} /> {saveError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Phone Number (10 Digits) *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Profile Photo URL
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Years of Experience
            </label>
            <input
              type="number"
              min="0"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Professional Bio / About Me
            </label>
            <textarea
              rows={3}
              placeholder="Describe your expertise, work experience, and service guarantee..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Skills (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. AC Installation, PCB Repair, Gas Refill"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
              Languages Spoken (Comma Separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Hindi, English, Punjabi"
              value={languagesText}
              onChange={(e) => setLanguagesText(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                Street / Area
              </label>
              <input
                type="text"
                placeholder="Sector 62"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-900 mb-1 uppercase tracking-wider">
                City
              </label>
              <input
                type="text"
                placeholder="Noida / Delhi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsEditModalOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saveLoading}
              className="rounded-xl font-bold shadow-md"
            >
              Save Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProviderProfileManagement;
