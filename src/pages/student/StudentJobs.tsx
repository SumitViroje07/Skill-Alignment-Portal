import { useEffect, useState, useCallback, useMemo } from 'react';
import { Briefcase, Search, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';
import {
  supabase,
  STATUS_LABEL,
  STATUS_STYLE,
  type Job,
  type Application,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert, EmptyState, Spinner } from '@/components/ui';

export default function StudentJobs() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'job' | 'internship'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    const [jobsRes, appsRes] = await Promise.all([
      supabase
        .from('jobs')
        .select('*, companies(name), job_required_skills(skill_id, skill:skills(name))')
        .order('created_at', { ascending: false }),
      supabase
        .from('applications')
        .select('*, jobs(*, companies(name))')
        .eq('student_id', profile.id),
    ]);
    if (jobsRes.error || appsRes.error) {
      setError('Could not load opportunities. Please refresh.');
    }
    setJobs((jobsRes.data as Job[]) ?? []);
    setApplications((appsRes.data as Application[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  const locations = useMemo(
    () => Array.from(new Set(jobs.map((j) => j.location).filter(Boolean))) as string[],
    [jobs]
  );

  const filtered = useMemo(
    () =>
      jobs.filter((j) => {
        if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== 'all' && j.type !== typeFilter) return false;
        if (locationFilter !== 'all' && j.location !== locationFilter) return false;
        return true;
      }),
    [jobs, search, typeFilter, locationFilter]
  );

  const appliedJobIds = new Set(applications.map((a) => a.job_id));

  async function apply(job: Job) {
    if (!profile) return;
    setApplying(job.id);
    setMessage('');
    setError('');
    const { error } = await supabase.from('applications').insert({ job_id: job.id });
    setApplying(null);
    if (error) {
      setError('Could not submit this application. You may have already applied.');
    } else {
      setMessage(`Application submitted for ${job.title}.`);
      await load();
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Jobs &amp; Internships</h2>
        <p className="mt-1 text-sm text-primary-100">
          Browse opportunities, check required skills, and apply in one click.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      {/* Filters */}
      <div className="card grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto]">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title…"
            className="input-field pl-10"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="input-field sm:w-40"
        >
          <option value="all">All types</option>
          <option value="job">Jobs</option>
          <option value="internship">Internships</option>
        </select>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="input-field sm:w-44"
        >
          <option value="all">All locations</option>
          {locations.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      {/* Listings */}
      {filtered.length === 0 ? (
        <EmptyState icon={Briefcase} title="No matching opportunities" hint="Try changing your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((job) => {
            const applied = appliedJobIds.has(job.id);
            const app = applications.find((a) => a.job_id === job.id);
            return (
              <div key={job.id} className="card flex flex-col p-6 transition-shadow duration-200 hover:shadow-card-hover">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-ink">{job.title}</h3>
                    <p className="text-sm text-ink-soft">{job.companies?.name ?? 'Company'}</p>
                  </div>
                  <span className="badge bg-primary-100 text-primary-700">
                    {job.type === 'job' ? 'Job' : 'Internship'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                  {job.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={13} /> {job.location}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} />
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                {job.description && (
                  <p className="mt-3 line-clamp-2 text-sm text-ink-soft">{job.description}</p>
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

                {job.qualifications && (
                  <p className="mt-3 text-xs text-ink-soft">
                    <span className="font-semibold text-ink">Qualifications: </span>
                    {job.qualifications}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                  {applied && app ? (
                    <span className={`badge ${STATUS_STYLE[app.status]}`}>
                      <CheckCircle2 size={13} />
                      {STATUS_LABEL[app.status]}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-soft">Not applied yet</span>
                  )}
                  <button
                    type="button"
                    onClick={() => apply(job)}
                    disabled={applied || applying === job.id}
                    className="btn-primary px-4 py-2 text-xs disabled:opacity-50"
                  >
                    <Send size={14} />
                    {applied ? 'Applied' : applying === job.id ? 'Applying…' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* My applications */}
      {applications.length > 0 && (
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-ink">My Applications</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-primary-100 text-xs uppercase tracking-wide text-ink-soft">
                  <th className="pb-3 pr-4 font-semibold">Role</th>
                  <th className="pb-3 pr-4 font-semibold">Company</th>
                  <th className="pb-3 pr-4 font-semibold">Applied</th>
                  <th className="pb-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((a) => (
                  <tr key={a.id} className="border-b border-primary-50 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-ink">{a.jobs?.title}</td>
                    <td className="py-3 pr-4 text-ink-soft">{a.jobs?.companies?.name}</td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {new Date(a.applied_at).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <span className={`badge ${STATUS_STYLE[a.status]}`}>{STATUS_LABEL[a.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
