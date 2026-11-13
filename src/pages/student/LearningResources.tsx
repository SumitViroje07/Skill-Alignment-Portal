import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Circle,
  GraduationCap,
} from 'lucide-react';
import {
  supabase,
  type LearningResource,
  type LearningProgress,
  type StudentSkill,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert, EmptyState, Spinner } from '@/components/ui';

export default function LearningResourcesPage() {
  const { profile } = useAuth();
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [progress, setProgress] = useState<LearningProgress[]>([]);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [skillFilter, setSkillFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    const [resRes, progRes, skillsRes] = await Promise.all([
      supabase.from('learning_resources').select('*, skill:skills(*)').order('title'),
      supabase.from('student_learning_progress').select('*').eq('student_id', profile.id),
      supabase.from('student_skills').select('*, skill:skills(*)').eq('student_id', profile.id),
    ]);
    if (resRes.error || progRes.error || skillsRes.error) {
      setError('Could not load learning resources. Please refresh.');
    }
    setResources(resRes.data ?? []);
    setProgress(progRes.data ?? []);
    setMySkills(skillsRes.data ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleCompleted(resource: LearningResource) {
    if (!profile) return;
    setMessage('');
    setError('');
    const existing = progress.find((p) => p.resource_id === resource.id);
    if (existing?.completed) {
      const { error } = await supabase
        .from('student_learning_progress')
        .update({ completed: false, completed_at: null })
        .eq('id', existing.id);
      if (error) setError('Could not update progress.');
    } else if (existing) {
      const { error } = await supabase
        .from('student_learning_progress')
        .update({ completed: true, completed_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) setError('Could not update progress.');
      else setMessage(`Marked "${resource.title}" as completed.`);
    } else {
      const { error } = await supabase.from('student_learning_progress').insert({
        student_id: profile.id,
        resource_id: resource.id,
        completed: true,
        completed_at: new Date().toISOString(),
      });
      if (error) setError('Could not save progress.');
      else setMessage(`Marked "${resource.title}" as completed.`);
    }
    await load();
  }

  const relevantSkillIds = useMemo(
    () => new Set(mySkills.map((s) => s.skill_id)),
    [mySkills]
  );

  const sortedResources = useMemo(() => {
    const filtered =
      skillFilter === 'all'
        ? resources
        : resources.filter((r) => r.skill_id === skillFilter);
    return [...filtered].sort(
      (a, b) => Number(relevantSkillIds.has(b.skill_id)) - Number(relevantSkillIds.has(a.skill_id))
    );
  }, [resources, skillFilter, relevantSkillIds]);

  const completedCount = progress.filter((p) => p.completed).length;
  const overall = resources.length
    ? Math.round((completedCount / resources.length) * 100)
    : 0;

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Learning Resources</h2>
        <p className="mt-1 text-sm text-primary-100">
          Curated courses and tutorials to strengthen the skills you need.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      {/* Progress */}
      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-ink">Your Learning Progress</p>
          <p className="text-sm text-ink-soft">
            {completedCount} of {resources.length} resources completed
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2.5 w-40 overflow-hidden rounded-full bg-primary-100">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-500"
              style={{ width: `${overall}%` }}
            />
          </div>
          <span className="text-sm font-bold text-primary-500">{overall}%</span>
        </div>
      </div>

      {/* Filter */}
      <div className="card p-5">
        <select
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="all">All skills</option>
          {Array.from(new Set(resources.map((r) => r.skill?.name ?? '')))
            .filter(Boolean)
            .sort()
            .map((name) => (
              <option key={name} value={resources.find((r) => r.skill?.name === name)?.skill_id}>
                {name}
              </option>
            ))}
        </select>
      </div>

      {sortedResources.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources found" hint="Try a different skill filter." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedResources.map((r) => {
            const p = progress.find((x) => x.resource_id === r.id);
            const done = p?.completed ?? false;
            const relevant = relevantSkillIds.has(r.skill_id);
            return (
              <div
                key={r.id}
                className={`card flex flex-col p-6 transition-all duration-200 hover:shadow-card-hover ${
                  done ? 'opacity-75' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="badge mb-2 bg-surface-lav text-primary-700">
                      <GraduationCap size={13} />
                      {r.skill?.name}
                      {relevant && !done && (
                        <span className="ml-1 text-primary-400">· in your plan</span>
                      )}
                    </span>
                    <h3 className="font-bold text-ink">{r.title}</h3>
                  </div>
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{r.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-primary-100 pt-4">
                  <span className="text-xs font-semibold text-ink-soft">{r.platform}</span>
                  <div className="flex items-center gap-2">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-secondary px-4 py-2 text-xs"
                    >
                      Start Learning
                      <ExternalLink size={14} />
                    </a>
                    <button
                      type="button"
                      onClick={() => toggleCompleted(r)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors duration-200 ${
                        done
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                          : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                      {done ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
