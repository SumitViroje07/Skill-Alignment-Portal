import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Users,
  Plus,
  Loader2,
  MapPin,
  Trash2,
  PlusCircle,
} from 'lucide-react';
import {
  supabase,
  STATUS_LABEL,
  STATUS_STYLE,
  type Job,
  type Application,
  type Company,
  type Skill,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { StatCard, EmptyState, Alert, Spinner } from '@/components/ui';

export default function CompanyDashboard() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('user_id', profile!.id)
        .maybeSingle();
      setCompany(data ?? null);
      setLoading(false);
    })();
  }, [profile]);

  const load = useCallback(async () => {
    if (!company) return;
    const [jobsRes, appsRes] = await Promise.all([
      supabase
        .from('jobs')
        .select('*, job_required_skills(skill_id, skill:skills(name))')
        .eq('company_id', company.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('*, jobs(title, company_id), profiles(full_name, college_name, department)')
        .eq('jobs.company_id', company.id)
        .order('applied_at', { ascending: false }),
    ]);
    setJobs((jobsRes.data as Job[]) ?? []);
    setApplications((appsRes.data as Application[]) ?? []);
    setLoading(false);
  }, [company]);

  useEffect(() => {
    if (company) load();
  }, [company, load]);

  if (loading || !profile) return <Spinner />;

  const pending = applications.filter((a) => a.status === 'applied' || a.status === 'under_review').length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">{company?.name ?? 'Company'} Dashboard</h2>
        <p className="mt-1 text-sm text-primary-100">
          Manage your postings and review applicants.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Briefcase} label="Active Postings" value={jobs.length} />
        <StatCard icon={FileText} label="Total Applications" value={applications.length} accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Users} label="Needs Review" value={pending} accent="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="card p-6">
        <h3 className="mb-4 font-bold text-ink">Quick Actions</h3>
        <Link to="/dashboard/company/postings" className="btn-primary">
          <PlusCircle size={18} />
          Create New Posting
        </Link>
      </div>

      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-bold text-ink">Recent Applications</h3>
          <Link to="/dashboard/company/applications" className="text-sm font-semibold text-primary-500 hover:text-primary-600">
            View all
          </Link>
        </div>
        {applications.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">No applications received yet.</p>
        ) : (
          <ul className="space-y-3">
            {applications.slice(0, 5).map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{a.profiles?.full_name ?? 'Student'}</p>
                  <p className="text-xs text-ink-soft">applied for {a.jobs?.title}</p>
                </div>
                <span className={`badge ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function CompanyPostings() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'job' | 'internship'>('job');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data: comp } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();
    setCompany(comp ?? null);
    if (comp) {
      const [jobsRes, skillsRes] = await Promise.all([
        supabase
          .from('jobs')
          .select('*, job_required_skills(skill_id, skill:skills(name))')
          .eq('company_id', comp.id)
          .order('created_at', { ascending: false }),
        supabase.from('skills').select('*').order('name'),
      ]);
      setJobs((jobsRes.data as Job[]) ?? []);
      setSkills(skillsRes.data ?? []);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!company) return;
    setSaving(true);
    setMessage('');
    setError('');
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        company_id: company.id,
        title,
        type,
        location: location || null,
        description: description || null,
        qualifications: qualifications || null,
      })
      .select()
      .single();
    if (jobError || !job) {
      setError('Could not create the posting. Please try again.');
      setSaving(false);
      return;
    }
    if (selectedSkills.length > 0) {
      const { error: skillsError } = await supabase
        .from('job_required_skills')
        .insert(selectedSkills.map((skill_id) => ({ job_id: job.id, skill_id })));
      if (skillsError) {
        setError('Posting created, but some required skills could not be saved.');
        setSaving(false);
        await load();
        return;
      }
    }
    setMessage(`"${title}" posted successfully.`);
    setTitle('');
    setLocation('');
    setDescription('');
    setQualifications('');
    setSelectedSkills([]);
    setShowForm(false);
    setSaving(false);
    await load();
  }

  async function handleDelete(jobId: string, jobTitle: string) {
    setMessage('');
    setError('');
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) setError('Could not delete this posting.');
    else {
      setMessage(`"${jobTitle}" was removed.`);
      await load();
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold">My Postings</h2>
            <p className="mt-1 text-sm text-primary-100">Create and manage your job and internship openings.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-600 transition-colors hover:bg-primary-50"
          >
            <Plus size={18} />
            {showForm ? 'Close Form' : 'New Posting'}
          </button>
        </div>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      {showForm && (
        <form onSubmit={handleCreate} className="card animate-fade-up space-y-5 p-6">
          <h3 className="font-bold text-ink">New Posting</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="form-label">Job Title</label>
              <input id="title" required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Python Developer" />
            </div>
            <div>
              <label htmlFor="type" className="form-label">Type</label>
              <select id="type" className="input-field" value={type} onChange={(e) => setType(e.target.value as 'job' | 'internship')}>
                <option value="job">Job</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label htmlFor="loc" className="form-label">Location</label>
              <input id="loc" className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Chennai / Remote" />
            </div>
            <div>
              <label htmlFor="qual" className="form-label">Qualifications</label>
              <input id="qual" className="input-field" value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="e.g. B.E./B.Tech, 2025-2026 batch" />
            </div>
          </div>
          <div>
            <label htmlFor="desc" className="form-label">Description</label>
            <textarea id="desc" rows={3} className="input-field resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role, responsibilities, and perks…" />
          </div>
          <div>
            <label className="form-label">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => {
                const on = selectedSkills.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() =>
                      setSelectedSkills((prev) =>
                        on ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                      on
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-primary-200 bg-white text-ink-soft hover:border-primary-400'
                    }`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving && <Loader2 size={18} className="animate-spin" />}
            Publish Posting
          </button>
        </form>
      )}

      {jobs.length === 0 ? (
        <EmptyState icon={Briefcase} title="No postings yet" hint="Create your first job or internship posting." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {jobs.map((job) => (
            <div key={job.id} className="card flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-ink">{job.title}</h3>
                  <p className="text-xs text-ink-soft">
                    Posted {new Date(job.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="badge bg-primary-100 text-primary-700">
                  {job.type === 'job' ? 'Job' : 'Internship'}
                </span>
              </div>
              {job.location && (
                <p className="mt-2 inline-flex items-center gap-1 text-xs text-ink-soft">
                  <MapPin size={13} /> {job.location}
                </p>
              )}
              {job.job_required_skills && job.job_required_skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.job_required_skills.map((jrs) => (
                    <span key={jrs.skill_id} className="badge bg-surface-lav text-primary-700">
                      {jrs.skill?.name}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-primary-100 pt-4 mt-4">
                <Link to="/dashboard/company/applications" className="text-sm font-semibold text-primary-500 hover:text-primary-600">
                  View applications
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(job.id, job.title)}
                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                  aria-label={`Delete ${job.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CompanyApplications() {
  const { profile } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    const { data: comp } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', profile.id)
      .maybeSingle();
    setCompany(comp ?? null);
    if (comp) {
      const { data, error } = await supabase
        .from('applications')
        .select('*, jobs!inner(title, company_id), profiles(full_name, college_name, department)')
        .eq('jobs.company_id', comp.id)
        .order('applied_at', { ascending: false });
      if (error) setError('Could not load applications. Please refresh.');
      setApplications((data as Application[]) ?? []);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: Application['status'], studentName: string) {
    setMessage('');
    setError('');
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) setError('Could not update the application status.');
    else {
      setMessage(`Updated status for ${studentName}.`);
      await load();
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Applications Received</h2>
        <p className="mt-1 text-sm text-primary-100">
          Review applicants for {company?.name ?? 'your company'} and update their status.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      {applications.length === 0 ? (
        <EmptyState icon={Users} title="No applications yet" hint="Applications to your postings will appear here." />
      ) : (
        <div className="card overflow-x-auto p-6">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-primary-100 text-xs uppercase tracking-wide text-ink-soft">
                <th className="pb-3 pr-4 font-semibold">Student</th>
                <th className="pb-3 pr-4 font-semibold">College</th>
                <th className="pb-3 pr-4 font-semibold">Applied For</th>
                <th className="pb-3 pr-4 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-b border-primary-50 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-ink">{a.profiles?.full_name ?? 'Student'}</td>
                  <td className="py-3 pr-4 text-ink-soft">{a.profiles?.college_name ?? '—'}</td>
                  <td className="py-3 pr-4 text-ink-soft">{a.jobs?.title}</td>
                  <td className="py-3 pr-4 text-ink-soft">{new Date(a.applied_at).toLocaleDateString()}</td>
                  <td className="py-3">
                    <select
                      value={a.status}
                      onChange={(e) =>
                        updateStatus(a.id, e.target.value as Application['status'], a.profiles?.full_name ?? 'student')
                      }
                      className={`badge cursor-pointer border-0 ${STATUS_STYLE[a.status]}`}
                    >
                      {(Object.keys(STATUS_LABEL) as Application['status'][]).map((s) => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
