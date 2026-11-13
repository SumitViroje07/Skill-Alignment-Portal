import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wrench, Target, CircleAlert, Briefcase, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { supabase, PROFICIENCY_ORDER, type Job, type LearningResource, type StudentSkill } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { StatCard, Spinner, Alert } from '@/components/ui';

export default function StudentDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [applications, setApplications] = useState<{ id: string }[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    (async () => {
      setLoading(true);
      const [skillsRes, appsRes, jobsRes, resRes] = await Promise.all([
        supabase.from('student_skills').select('*, skill:skills(*)').eq('student_id', profile.id),
        supabase.from('applications').select('id').eq('student_id', profile.id),
        supabase.from('jobs').select('*, companies(*)').order('created_at', { ascending: false }).limit(5),
        supabase.from('learning_resources').select('*, skill:skills(*)').limit(4),
      ]);
      if (skillsRes.error || appsRes.error || jobsRes.error || resRes.error) {
        setError('Could not load your dashboard data. Please refresh.');
      }
      setSkills(skillsRes.data ?? []);
      setApplications(appsRes.data ?? []);
      setJobs(jobsRes.data ?? []);
      setResources(resRes.data ?? []);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <Spinner />;
  if (error) return <Alert kind="error" message={error} />;

  const advanced = skills.filter((s) => s.proficiency === 'advanced').length;
  const readiness = skills.length
    ? Math.round(((advanced * 1 + skills.filter((s) => s.proficiency === 'intermediate').length * 0.6) / skills.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 via-primary-400 to-primary-300 p-8 text-white shadow-card">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <h2 className="text-2xl font-extrabold">Welcome Back! Ready to Improve Your Skills?</h2>
        <p className="mt-1 max-w-lg text-primary-100">
          Track your progress, analyze your gaps, and discover new opportunities.
        </p>
        <Link
          to="/dashboard/student/gap-analysis"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-primary-600 transition-colors hover:bg-primary-50"
        >
          Run Skill Gap Analysis
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Wrench} label="My Skills" value={skills.length} onClick={() => navigate('/dashboard/student/skills')} />
        <StatCard icon={Target} label="Skill Readiness" value={`${readiness}%`} accent="bg-emerald-100 text-emerald-600" onClick={() => navigate('/dashboard/student/gap-analysis')} />
        <StatCard icon={CircleAlert} label="Missing Skills" value={Math.max(0, 6 - skills.length)} accent="bg-red-100 text-red-600" onClick={() => navigate('/dashboard/student/gap-analysis')} />
        <StatCard icon={Briefcase} label="Applied Jobs" value={applications.length} accent="bg-amber-100 text-amber-600" onClick={() => navigate('/dashboard/student/jobs')} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent jobs */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <Sparkles size={18} className="text-primary-500" />
              Recent Opportunities
            </h3>
            <Link to="/dashboard/student/jobs" className="text-sm font-semibold text-primary-500 hover:text-primary-600">
              View all
            </Link>
          </div>
          {jobs.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">No postings yet. Check back soon.</p>
          ) : (
            <ul className="space-y-3">
              {jobs.map((job) => (
                <li key={job.id} className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-ink">{job.title}</p>
                    <p className="text-xs text-ink-soft">{job.location || 'Anywhere'} · {job.type === 'job' ? 'Job' : 'Internship'}</p>
                  </div>
                  <Link to="/dashboard/student/jobs" className="text-primary-500 hover:text-primary-600">
                    <ArrowRight size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recommended resources */}
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <BookOpen size={18} className="text-primary-500" />
              Recommended Learning
            </h3>
            <Link to="/dashboard/student/resources" className="text-sm font-semibold text-primary-500 hover:text-primary-600">
              View all
            </Link>
          </div>
          {resources.length === 0 ? (
            <p className="py-6 text-center text-sm text-ink-soft">No resources available yet.</p>
          ) : (
            <ul className="space-y-3">
              {resources.map((r) => (
                <li key={r.id} className="rounded-xl border border-primary-100 px-4 py-3">
                  <p className="text-sm font-semibold text-ink">{r.title}</p>
                  <p className="text-xs text-ink-soft">{r.platform} · {r.skill?.name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

