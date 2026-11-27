import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Label } from "@/Components/ui/Label";
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  Scale,
  Search,
  Sparkles,
  Clock,
  GraduationCap,
  Briefcase,
  MessageSquare,
  X,
  Send,
  Copy,
  Check,
  Video,
} from 'lucide-react';

const LawyerConnect = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [allSpecializations, setAllSpecializations] = useState([]);

  // Consultation request modal state
  const [connectTarget, setConnectTarget] = useState(null);
  const [note, setNote] = useState('');
  const [contactMethod, setContactMethod] = useState('email');
  const [contactValue, setContactValue] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [createdMeetLink, setCreatedMeetLink] = useState('');
  const [copiedMeet, setCopiedMeet] = useState(false);

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const response = await axios.get('api/auth/lawyers/');
        const lawyersData = response.data || [];
        setLawyers(lawyersData);

        const specs = new Set();
        lawyersData.forEach((lawyer) => {
          if (Array.isArray(lawyer.specializations)) {
            lawyer.specializations.forEach((spec) => specs.add(spec));
          }
        });
        setAllSpecializations(Array.from(specs).sort());
      } catch (err) {
        console.error('Failed to load lawyers:', err);
        setError('Failed to load verified lawyers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const openConnectModal = (lawyer) => {
    setConnectTarget(lawyer);
    setNote('');
    setContactMethod('email');
    setContactValue(user?.email || '');
    setPreferredTime('');
    setCreatedMeetLink('');
    setCopiedMeet(false);
  };

  const handleSubmitConnect = async (e) => {
    e.preventDefault();
    if (!connectTarget?.user?.id) return;

    let preferredTimeIso = null;
    if (preferredTime.trim()) {
      const parsedDate = new Date(preferredTime);
      if (Number.isNaN(parsedDate.getTime())) {
        toast.error('Please select a valid consultation date and time.');
        return;
      }
      preferredTimeIso = parsedDate.toISOString();
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`api/auth/lawyers/${connectTarget.user.id}/connect/`, {
        message: note.trim(),
        preferred_contact_method: contactMethod,
        preferred_contact_value: contactValue.trim() || user?.email || '',
        preferred_time: preferredTimeIso,
      });

      const meetingLink = response.data?.meeting_link || response.data?.request?.meeting_link;
      if (meetingLink) {
        setCreatedMeetLink(meetingLink);
      }
      toast.success(response.data?.message || 'Connection request sent!');
      if (!meetingLink) {
        setConnectTarget(null);
      }
    } catch (err) {
      console.error('Failed to connect with lawyer:', err);
      toast.error(err.response?.data?.error || 'Unable to send connection request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyMeet = () => {
    if (!createdMeetLink) return;
    navigator.clipboard.writeText(createdMeetLink);
    setCopiedMeet(true);
    toast.success('Meeting link copied!');
    setTimeout(() => setCopiedMeet(false), 2000);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredLawyers = lawyers.filter((lawyer) => {
    const matchesSpec =
      !selectedSpecialization ||
      (Array.isArray(lawyer.specializations) &&
        lawyer.specializations.some((s) =>
          s.toLowerCase().includes(selectedSpecialization.toLowerCase())
        ));
    const fullName = (lawyer?.user?.name || lawyer?.user?.username || '').toLowerCase();
    const firm = (lawyer.law_firm || '').toLowerCase();
    const specText = Array.isArray(lawyer.specializations) ? lawyer.specializations.join(' ').toLowerCase() : '';
    const matchesSearch =
      !normalizedQuery ||
      fullName.includes(normalizedQuery) ||
      firm.includes(normalizedQuery) ||
      specText.includes(normalizedQuery);
    return matchesSpec && matchesSearch;
  });

  const getInitials = (lawyer) => {
    const label = lawyer?.user?.name || lawyer?.user?.username || 'L';
    return label
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill">
          <Scale className="w-3.5 h-3.5 text-emerald-300" />
          <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
            Verified Legal Professionals
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight font-display">
          Lawyer Connect
        </h1>
        <p className="text-sm text-slate-300/85 max-w-2xl mx-auto">
          Consult with verified attorneys, schedule video reviews, and collaborate securely inside AdvocAI.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel glass-reactive p-4 sm:p-5 rounded-[2rem] border border-white/25 space-y-4">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lawyer name, firm, or specialty..."
              className="h-10 pl-10 pr-4 text-xs rounded-full"
            />
          </div>

          <Button
            type="button"
            variant="glass"
            size="sm"
            onClick={() => navigate('/chat')}
            className="h-10 px-5 text-xs w-full sm:w-auto"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
            <span>Open Messages</span>
          </Button>
        </div>

        {allSpecializations.length > 0 && (
          <div className="relative z-10 flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={selectedSpecialization === '' ? 'default' : 'glass'}
              onClick={() => setSelectedSpecialization('')}
              className="h-7 px-3.5 text-[11px]"
            >
              All Specialties
            </Button>
            {allSpecializations.map((spec) => (
              <Button
                key={spec}
                type="button"
                size="sm"
                variant={selectedSpecialization === spec ? 'default' : 'glass'}
                onClick={() => setSelectedSpecialization(spec)}
                className="h-7 px-3.5 text-[11px]"
              >
                {spec}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Lawyers Grid */}
      {loading ? (
        <div className="glass-panel p-14 rounded-[2.25rem] text-center text-xs text-slate-300">
          Loading verified lawyers...
        </div>
      ) : error ? (
        <div className="glass-panel p-14 rounded-[2.25rem] text-center text-sm text-rose-400">
          {error}
        </div>
      ) : filteredLawyers.length === 0 ? (
        <div className="glass-panel p-14 rounded-[2.25rem] text-center space-y-2">
          <Scale className="w-10 h-10 text-cyan-300 mx-auto opacity-60" />
          <p className="text-sm font-bold text-white">No matching verified lawyers found</p>
          <p className="text-xs text-slate-300/80">
            {selectedSpecialization || searchQuery
              ? 'Try clearing your filter or search terms.'
              : 'New lawyer applications are reviewed by admins before listing.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLawyers.map((lawyer, index) => {
            const isSelf = String(user?.id) === String(lawyer?.user?.id);
            return (
              <div
                key={lawyer.id || lawyer.user?.id || index}
                className="glass-panel glass-reactive glass-panel-interactive p-6 rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col justify-between gap-5"
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3.5">
                    <div className="glass-circle w-14 h-14 flex-shrink-0 text-base font-black text-cyan-200 shadow-glass-glow">
                      {lawyer?.user?.profile_picture ? (
                        <img
                          src={lawyer.user.profile_picture}
                          alt={lawyer?.user?.name || 'Lawyer'}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(lawyer)
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-extrabold text-white truncate font-display">
                        {lawyer?.user?.name || lawyer?.user?.username || 'Verified Lawyer'}
                      </h3>
                      <span className="inline-flex items-center gap-1 glass-pill px-2.5 py-0.5 text-[10px] font-bold text-emerald-300 mt-0.5">
                        ✓ Verified Counsel
                      </span>
                    </div>
                  </div>

                  {Array.isArray(lawyer.specializations) && lawyer.specializations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {lawyer.specializations.slice(0, 4).map((spec, idx) => (
                        <span key={idx} className="glass-pill px-2.5 py-0.5 text-[10px] font-semibold text-cyan-200">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-300/85 glass-subtle p-3.5 rounded-2xl">
                    {typeof lawyer.experience_years === 'number' && (
                      <p className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                        <span>{lawyer.experience_years} {lawyer.experience_years === 1 ? 'year' : 'years'} experience</span>
                      </p>
                    )}
                    {lawyer.law_firm && (
                      <p className="flex items-center gap-2 truncate">
                        <Briefcase className="w-3.5 h-3.5 text-amber-300 flex-shrink-0" />
                        <span className="truncate">{lawyer.law_firm}</span>
                      </p>
                    )}
                    {lawyer.education && (
                      <p className="flex items-center gap-2 truncate">
                        <GraduationCap className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
                        <span className="truncate">{lawyer.education}</span>
                      </p>
                    )}
                    {lawyer.consultation_fee && (
                      <p className="text-[11px] font-bold text-white pt-1">
                        Fee: <span className="text-cyan-300">{lawyer.consultation_fee}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-2.5 pt-3 border-t border-white/15">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => navigate(`/lawyer-profile/${lawyer?.user?.id || lawyer.id}`)}
                    className="flex-1 h-9 text-xs"
                  >
                    View Profile
                  </Button>
                  {!isSelf && (
                    <Button
                      variant="aurora"
                      size="sm"
                      onClick={() => openConnectModal(lawyer)}
                      className="flex-1 h-9 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Connect</span>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fluffy Glass Consultation Request Modal */}
      {connectTarget && (
        <div
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setConnectTarget(null)}
        >
          <div
            className="w-full max-w-md glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/30 shadow-fluffy space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-3">
                <div className="glass-circle w-10 h-10 shadow-glass-glow">
                  <Scale className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-display">
                    Connect with {connectTarget?.user?.name || connectTarget?.user?.username}
                  </h3>
                  <p className="text-[11px] text-slate-300/80">Request legal consultation & direct chat</p>
                </div>
              </div>
              <Button
                type="button"
                variant="glass-circle"
                size="icon-sm"
                onClick={() => setConnectTarget(null)}
                className="w-8 h-8 text-slate-300"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {createdMeetLink ? (
              <div className="relative z-10 space-y-4 py-2">
                <div className="glass-subtle p-4 rounded-2xl border border-emerald-300/40 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
                    <Video className="w-4 h-4" />
                    <span>Request Submitted! Google Meet Link Ready</span>
                  </div>
                  <p className="text-xs font-mono text-white break-all">{createdMeetLink}</p>
                </div>
                <div className="flex gap-2.5">
                  <Button variant="glass" onClick={handleCopyMeet} className="flex-1 h-10 text-xs">
                    {copiedMeet ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5 text-cyan-300" />}
                    <span>{copiedMeet ? 'Copied' : 'Copy Link'}</span>
                  </Button>
                  <Button variant="aurora" onClick={() => setConnectTarget(null)} className="flex-1 h-10 text-xs">
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitConnect} className="relative z-10 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">Note for Counsel (optional)</Label>
                  <textarea
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Briefly describe your contract or legal matter..."
                    className="glass-input w-full p-3.5 rounded-2xl text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    size="sm"
                    variant={contactMethod === 'email' ? 'default' : 'glass'}
                    onClick={() => {
                      setContactMethod('email');
                      setContactValue(user?.email || '');
                    }}
                    className="h-9 text-xs"
                  >
                    Prefer Email
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={contactMethod === 'phone' ? 'default' : 'glass'}
                    onClick={() => {
                      setContactMethod('phone');
                      setContactValue(user?.phone || '');
                    }}
                    className="h-9 text-xs"
                  >
                    Prefer Phone
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">
                    {contactMethod === 'email' ? 'Contact Email' : 'Contact Phone'}
                  </Label>
                  <Input
                    type="text"
                    value={contactValue}
                    onChange={(e) => setContactValue(e.target.value)}
                    placeholder={contactMethod === 'email' ? 'you@example.com' : '+1-555-0199'}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-200 pl-1">Preferred Time (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="h-10 px-4 text-xs rounded-full"
                  />
                </div>

                <Button type="submit" variant="aurora" disabled={submitting} className="w-full h-11 text-xs">
                  <Send className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{submitting ? 'Sending Request...' : 'Send Connection Request'}</span>
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerConnect;
