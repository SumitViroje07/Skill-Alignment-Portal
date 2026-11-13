import { useState, useEffect, type FormEvent } from 'react';
import { GraduationCap, Target, Building2, Save, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert, Spinner } from '@/components/ui';

export default function StudentProfile() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [education, setEducation] = useState('');
  const [careerGoal, setCareerGoal] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    setFullName(profile.full_name ?? '');
    setCollege(profile.college_name ?? '');
    setDepartment(profile.department ?? '');
    setEducation(profile.education ?? '');
    setCareerGoal(profile.career_goal ?? '');
    setLoading(false);
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        college_name: college,
        department: department,
        education: education,
        career_goal: careerGoal,
      })
      .eq('id', profile!.id);
    setSaving(false);
    if (error) {
      setError('Could not save your profile. Please try again.');
    } else {
      setMessage('Profile saved successfully.');
      await refreshProfile();
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">My Profile</h2>
        <p className="mt-1 text-sm text-primary-100">
          Keep your details up to date so institutions and companies see the real you.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <label htmlFor="fullName" className="form-label">
            <span className="inline-flex items-center gap-1.5">
              <GraduationCap size={15} className="text-primary-500" /> Full Name
            </span>
          </label>
          <input id="fullName" className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your full name" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="college" className="form-label">
              <span className="inline-flex items-center gap-1.5">
                <Building2 size={15} className="text-primary-500" /> College
              </span>
            </label>
            <input id="college" className="input-field" value={college} onChange={(e) => setCollege(e.target.value)} placeholder="Your college name" />
          </div>
          <div>
            <label htmlFor="department" className="form-label">Department</label>
            <input id="department" className="input-field" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Computer Science" />
          </div>
        </div>

        <div>
          <label htmlFor="education" className="form-label">Education</label>
          <textarea
            id="education"
            rows={3}
            className="input-field resize-none"
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="e.g. B.Tech in Information Technology, 2022 - 2026"
          />
        </div>

        <div>
          <label htmlFor="careerGoal" className="form-label">
            <span className="inline-flex items-center gap-1.5">
              <Target size={15} className="text-primary-500" /> Career Goal
            </span>
          </label>
          <textarea
            id="careerGoal"
            rows={2}
            className="input-field resize-none"
            value={careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            placeholder="e.g. Become a Full Stack Developer at a product company"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}
