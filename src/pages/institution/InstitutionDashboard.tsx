import { useEffect, useState, useCallback, useMemo } from 'react';
import { School, Users, Wrench, Target, Save, Loader2 } from 'lucide-react';
import {
  supabase,
  PROFICIENCY_LABEL,
  PROFICIENCY_ORDER,
  type Profile,
  type StudentSkill,
  type Institution,
  type JobRole,
  type RoleRequiredSkill,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { StatCard, EmptyState, Alert, Spinner } from '@/components/ui';

async function getInstitution(userId: string): Promise<Institution | null> {
  const { data } = await supabase
    .from('institutions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data ?? null;
}

export function InstitutionProfile() {
  const { profile, refreshProfile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const inst = await getInstitution(profile!.id);
      setInstitution(inst);
      setName(inst?.name ?? '');
      setLoading(false);
    })();
  }, [profile]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    const { error } = await supabase
      .from('institutions')
      .update({ name })
      .eq('user_id', profile!.id);
    setSaving(false);
    if (error) setError('Could not save your profile. Please try again.');
    else {
      setMessage('Institution profile saved successfully.');
      await refreshProfile();
    }
  }

  if (loading) return <Spinner />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Institution Profile</h2>
        <p className="mt-1 text-sm text-primary-100">
          Your institution name links your account to your students.
        </p>
      </div>

      {message && <Alert kind="success" message={message} />}
      {error && <Alert kind="error" message={error} />}

      <form onSubmit={handleSubmit} className="card space-y-5 p-6">
        <div>
          <label htmlFor="instName" className="form-label">
            <span className="inline-flex items-center gap-1.5">
              <School size={15} className="text-primary-500" /> Institution Name
            </span>
          </label>
          <input
            id="instName"
            required
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Anna University"
          />
        </div>
        <p className="text-xs text-ink-soft">
          Students who register with this exact college name will appear in your student list.
        </p>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </button>
      </form>
    </div>
  );
}

interface StudentRow {
  profile: Profile;
  skills: StudentSkill[];
  readiness: number;
}

export default function InstitutionDashboard() {
  const { profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const inst = await getInstitution(profile!.id);
      setInstitution(inst);
      if (!inst) {
        setLoading(false);
        return;
      }
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .or(`institution_id.eq.${inst.id},college_name.ilike.${inst.name}`);
      const rows: StudentRow[] = [];
      for (const sp of (studentProfiles as Profile[]) ?? []) {
        const { data: sk } = await supabase
          .from('student_skills')
          .select('*, skill:skills(*)')
          .eq('student_id', sp.id);
        const skills = (sk as StudentSkill[]) ?? [];
        const advanced = skills.filter((s) => s.proficiency === 'advanced').length;
        const intermediate = skills.filter((s) => s.proficiency === 'intermediate').length;
        const readiness = skills.length
          ? Math.round(((advanced + intermediate * 0.6) / skills.length) * 100)
          : 0;
        rows.push({ profile: sp, skills, readiness });
      }
      setStudents(rows);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <Spinner />;

  const avgReadiness = students.length
    ? Math.round(students.reduce((sum, s) => sum + s.readiness, 0) / students.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">{institution?.name ?? 'Institution'} Dashboard</h2>
        <p className="mt-1 text-sm text-primary-100">
          Overview of your registered students and their skill development.
        </p>
      </div>

      {error && <Alert kind="error" message={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Students" value={students.length} />
        <StatCard icon={Wrench} label="Avg Skills per Student" value={
          students.length
            ? (students.reduce((sum, s) => sum + s.skills.length, 0) / students.length).toFixed(1)
            : 0
        } accent="bg-amber-100 text-amber-600" />
        <StatCard icon={Target} label="Avg Readiness" value={`${avgReadiness}%`} accent="bg-emerald-100 text-emerald-600" />
      </div>

      <div className="card p-6">
        <h3 className="mb-4 font-bold text-ink">Student Skill Overview</h3>
        {students.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students yet"
            hint="Students who register with your institution name will appear here."
          />
        ) : (
          <div className="space-y-3">
            {students.map((s) => (
              <div key={s.profile.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{s.profile.full_name}</p>
                  <p className="text-xs text-ink-soft">
                    {s.profile.department ?? '—'} · {s.skills.length} skills
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-32 overflow-hidden rounded-full bg-primary-100">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-500"
                      style={{ width: `${s.readiness}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-primary-500">{s.readiness}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function InstitutionStudents() {
  const { profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudentRow | null>(null);

  useEffect(() => {
    (async () => {
      const inst = await getInstitution(profile!.id);
      setInstitution(inst);
      if (!inst) {
        setLoading(false);
        return;
      }
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .or(`institution_id.eq.${inst.id},college_name.ilike.${inst.name}`);
      const rows: StudentRow[] = [];
      for (const sp of (studentProfiles as Profile[]) ?? []) {
        const { data: sk } = await supabase
          .from('student_skills')
          .select('*, skill:skills(*)')
          .eq('student_id', sp.id);
        rows.push({ profile: sp, skills: (sk as StudentSkill[]) ?? [], readiness: 0 });
      }
      setStudents(rows);
      setLoading(false);
    })();
  }, [profile]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Student List</h2>
        <p className="mt-1 text-sm text-primary-100">
          Select a student to view their skills and proficiency levels.
        </p>
      </div>

      {students.length === 0 ? (
        <EmptyState icon={Users} title="No students yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((s) => (
            <button
              key={s.profile.id}
              type="button"
              onClick={() => setSelected(s)}
              className="card p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-sm font-bold text-white">
                  {(s.profile.full_name ?? 'S').slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="font-semibold text-ink">{s.profile.full_name}</p>
                  <p className="text-xs text-ink-soft">{s.profile.department ?? '—'}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-soft">{s.skills.length} skills added</p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setSelected(null)} />
          <div className="card relative max-h-[80vh] w-full max-w-lg overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-ink">{selected.profile.full_name}</h3>
            <p className="text-sm text-ink-soft">
              {selected.profile.college_name} · {selected.profile.department ?? '—'}
            </p>
            {selected.profile.career_goal && (
              <p className="mt-2 rounded-xl bg-surface-lav px-4 py-3 text-sm text-primary-700">
                Career goal: {selected.profile.career_goal}
              </p>
            )}
            <h4 className="mt-5 mb-3 font-semibold text-ink">Skills</h4>
            {selected.skills.length === 0 ? (
              <p className="text-sm text-ink-soft">No skills added yet.</p>
            ) : (
              <div className="space-y-2">
                {selected.skills.map((sk) => (
                  <div key={sk.id} className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-2.5">
                    <span className="text-sm font-semibold text-ink">{sk.skill?.name}</span>
                    <span className="badge bg-surface-lav text-primary-700">
                      {PROFICIENCY_LABEL[sk.proficiency]}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button type="button" onClick={() => setSelected(null)} className="btn-secondary mt-6 w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function InstitutionGaps() {
  const { profile } = useAuth();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [requirements, setRequirements] = useState<RoleRequiredSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const inst = await getInstitution(profile!.id);
      setInstitution(inst);
      const [rolesRes, reqRes] = await Promise.all([
        supabase.from('job_roles').select('*').order('name'),
        supabase.from('role_required_skills').select('*, skill:skills(*)'),
      ]);
      setRoles(rolesRes.data ?? []);
      setRequirements(reqRes.data ?? []);
      if (!inst) {
        setLoading(false);
        return;
      }
      const { data: studentProfiles } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .or(`institution_id.eq.${inst.id},college_name.ilike.${inst.name}`);
      const rows: StudentRow[] = [];
      for (const sp of (studentProfiles as Profile[]) ?? []) {
        const { data: sk } = await supabase
          .from('student_skills')
          .select('*, skill:skills(*)')
          .eq('student_id', sp.id);
        rows.push({ profile: sp, skills: (sk as StudentSkill[]) ?? [], readiness: 0 });
      }
      setStudents(rows);
      setLoading(false);
    })();
  }, [profile]);

  const gapSummary = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of students) {
      for (const sk of s.skills) {
        const name = sk.skill?.name ?? '';
        counts.set(name, (counts.get(name) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [students]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Student Skill Gaps</h2>
        <p className="mt-1 text-sm text-primary-100">
          Most common skills across your students, based on real skill data.
        </p>
      </div>

      {gapSummary.length === 0 ? (
        <EmptyState icon={Target} title="No skill data yet" hint="Once students add skills, trends will appear here." />
      ) : (
        <div className="card p-6">
          <h3 className="mb-4 font-bold text-ink">Most Common Skills</h3>
          <div className="space-y-3">
            {gapSummary.map((g) => {
              const pct = students.length ? Math.round((g.count / students.length) * 100) : 0;
              return (
                <div key={g.name} className="flex items-center gap-4">
                  <span className="w-40 shrink-0 truncate text-sm font-semibold text-ink">{g.name}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-primary-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-xs font-bold text-primary-500">
                    {g.count}/{students.length}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
