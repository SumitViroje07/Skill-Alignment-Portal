import { useEffect, useState, useCallback } from 'react';
import { Plus, Trash2, Loader2, Wrench } from 'lucide-react';
import {
  supabase,
  PROFICIENCY_LABEL,
  type Skill,
  type StudentSkill,
  type Proficiency,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert, EmptyState, Spinner } from '@/components/ui';

const LEVELS: Proficiency[] = ['beginner', 'intermediate', 'advanced'];

const LEVEL_STYLE: Record<Proficiency, string> = {
  beginner: 'bg-amber-100 text-amber-700 border-amber-200',
  intermediate: 'bg-primary-100 text-primary-700 border-primary-200',
  advanced: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

export default function StudentSkills() {
  const { profile } = useAuth();
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [catalog, setCatalog] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<Proficiency>('beginner');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!profile) return;
    const [mine, all] = await Promise.all([
      supabase
        .from('student_skills')
        .select('*, skill:skills(*)')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: true }),
      supabase.from('skills').select('*').order('name'),
    ]);
    if (mine.error || all.error) {
      setError('Could not load your skills. Please refresh.');
    }
    setMySkills(mine.data ?? []);
    setCatalog(all.data ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    load();
  }, [load]);

  async function addSkill() {
    if (!selectedSkill || !profile) return;
    setBusy(true);
    setMessage('');
    setError('');
    const { error } = await supabase.from('student_skills').insert({
      student_id: profile.id,
      skill_id: selectedSkill,
      proficiency: selectedLevel,
    });
    setBusy(false);
    if (error) {
      setError('Could not add this skill. It may already be in your list.');
    } else {
      setMessage('Skill added successfully.');
      setSelectedSkill('');
      await load();
    }
  }

  async function updateProficiency(id: string, level: Proficiency) {
    setMessage('');
    setError('');
    const { error } = await supabase
      .from('student_skills')
      .update({ proficiency: level })
      .eq('id', id);
    if (error) setError('Could not update the skill level.');
    else await load();
  }

  async function removeSkill(id: string) {
    setMessage('');
    setError('');
    const { error } = await supabase.from('student_skills').delete().eq('id', id);
    if (error) setError('Could not remove this skill.');
    else {
      setMessage('Skill removed.');
      await load();
    }
  }

  if (loading) return <Spinner />;

  const available = catalog.filter((c) => !mySkills.some((m) => m.skill_id === c.id));

  return (
    <div className="max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">My Skills</h2>
        <p className="mt-1 text-sm text-primary-100">
          Add the skills you have and keep your proficiency levels up to date.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      {/* Add skill form */}
      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-ink">
          <Plus size={18} className="text-primary-500" />
          Add a Skill
        </h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="input-field"
          >
            <option value="">Choose a skill…</option>
            {available.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value as Proficiency)}
            className="input-field sm:w-44"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{PROFICIENCY_LABEL[l]}</option>
            ))}
          </select>
          <button type="button" onClick={addSkill} disabled={!selectedSkill || busy} className="btn-primary">
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Add
          </button>
        </div>
      </div>

      {/* Skill list */}
      {mySkills.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No skills yet"
          hint="Add your first skill above to start tracking your readiness."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {mySkills.map((ms) => (
            <div
              key={ms.id}
              className="card flex items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{ms.skill?.name}</p>
                <span className={`badge mt-1 border ${LEVEL_STYLE[ms.proficiency]}`}>
                  {PROFICIENCY_LABEL[ms.proficiency]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={ms.proficiency}
                  onChange={(e) => updateProficiency(ms.id, e.target.value as Proficiency)}
                  className="input-field w-36 px-3 py-1.5 text-xs"
                  aria-label={`Update level for ${ms.skill?.name}`}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>{PROFICIENCY_LABEL[l]}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removeSkill(ms.id)}
                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                  aria-label={`Remove ${ms.skill?.name}`}
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
