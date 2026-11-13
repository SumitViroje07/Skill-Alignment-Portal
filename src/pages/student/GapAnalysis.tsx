import { useEffect, useState, useMemo } from 'react';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Target,
  ArrowRight,
} from 'lucide-react';
import {
  supabase,
  PROFICIENCY_LABEL,
  PROFICIENCY_ORDER,
  type JobRole,
  type RoleRequiredSkill,
  type StudentSkill,
  type Proficiency,
  type LearningResource,
} from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert, EmptyState, Spinner } from '@/components/ui';

type GapStatus = 'available' | 'improve' | 'missing';

interface GapResult {
  skillName: string;
  required: Proficiency;
  status: GapStatus;
  current?: Proficiency;
}

const STATUS_META: Record<GapStatus, { icon: typeof CheckCircle2; style: string; label: string }> = {
  available: { icon: CheckCircle2, style: 'bg-emerald-100 text-emerald-700', label: 'Available' },
  improve: { icon: AlertTriangle, style: 'bg-amber-100 text-amber-700', label: 'Needs Improvement' },
  missing: { icon: XCircle, style: 'bg-red-100 text-red-600', label: 'Missing' },
};

export default function GapAnalysis() {
  const { profile } = useAuth();
  const [roles, setRoles] = useState<JobRole[]>([]);
  const [requirements, setRequirements] = useState<RoleRequiredSkill[]>([]);
  const [mySkills, setMySkills] = useState<StudentSkill[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [rolesRes, reqRes] = await Promise.all([
        supabase.from('job_roles').select('*').order('name'),
        supabase.from('role_required_skills').select('*, skill:skills(*)'),
      ]);
      setRoles(rolesRes.data ?? []);
      setRequirements(reqRes.data ?? []);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [mine, resRes] = await Promise.all([
        supabase.from('student_skills').select('*, skill:skills(*)').eq('student_id', profile.id),
        supabase.from('learning_resources').select('*, skill:skills(*)'),
      ]);
      setMySkills(mine.data ?? []);
      setResources(resRes.data ?? []);
    })();
  }, [profile]);

  const results = useMemo<GapResult[]>(() => {
    if (!selectedRole) return [];
    return requirements
      .filter((r) => r.role_id === selectedRole)
      .map((r) => {
        const mine = mySkills.find((m) => m.skill_id === r.skill_id);
        let status: GapStatus;
        if (!mine) status = 'missing';
        else if (PROFICIENCY_ORDER[mine.proficiency] >= PROFICIENCY_ORDER[r.min_proficiency])
          status = 'available';
        else status = 'improve';
        return {
          skillName: r.skill?.name ?? '',
          required: r.min_proficiency,
          status,
          current: mine?.proficiency,
        };
      })
      .sort((a, b) => a.skillName.localeCompare(b.skillName));
  }, [selectedRole, requirements, mySkills]);

  const readiness = results.length
    ? Math.round((results.filter((r) => r.status === 'available').length / results.length) * 100)
    : 0;

  const suggestedResources = useMemo(() => {
    const weakSkillIds = new Set(
      requirements
        .filter((r) => r.role_id === selectedRole)
        .filter((r) => {
          const mine = mySkills.find((m) => m.skill_id === r.skill_id);
          return !mine || PROFICIENCY_ORDER[mine.proficiency] < PROFICIENCY_ORDER[r.min_proficiency];
        })
        .map((r) => r.skill_id)
    );
    return resources.filter((res) => weakSkillIds.has(res.skill_id)).slice(0, 6);
  }, [selectedRole, requirements, mySkills, resources]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-primary-400 p-6 text-white shadow-card">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <h2 className="text-xl font-extrabold">Skill Gap Analysis</h2>
        <p className="mt-1 text-sm text-primary-100">
          Choose a target role to see how your skills compare with what employers expect.
        </p>
      </div>

      {roles.length === 0 ? (
        <EmptyState icon={GitCompare} title="No job roles available yet" />
      ) : (
        <>
          {/* Role picker */}
          <div className="card p-6">
            <label htmlFor="role" className="form-label">
              <span className="inline-flex items-center gap-1.5">
                <Target size={15} className="text-primary-500" /> Target Job Role
              </span>
            </label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="input-field max-w-md"
            >
              <option value="">Select a role…</option>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          {selectedRole && results.length > 0 && (
            <div className="animate-fade-up space-y-6">
              {/* Readiness + breakdown */}
              <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                <div className="card flex flex-col items-center justify-center p-8">
                  <div className="relative h-44 w-44">
                    <svg viewBox="0 0 120 120" className="h-44 w-44 -rotate-90">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="#EDE1FC" strokeWidth="12" />
                      <circle
                        cx="60" cy="60" r="50" fill="none" stroke="#713FD0" strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${(readiness / 100) * 2 * Math.PI * 50} ${2 * Math.PI * 50}`}
                        className="transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-primary-500">{readiness}%</span>
                      <span className="text-xs font-semibold text-ink-soft">Readiness</span>
                    </div>
                  </div>
                  <p className="mt-4 text-center text-sm text-ink-soft">
                    {results.filter((r) => r.status === 'available').length} of {results.length} required
                    skills meet the minimum level
                  </p>
                </div>

                <div className="grid content-start gap-3 sm:grid-cols-2">
                  {results.map((r) => {
                    const meta = STATUS_META[r.status];
                    return (
                      <div key={r.skillName} className="card flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold text-ink">{r.skillName}</p>
                          <p className="text-xs text-ink-soft">
                            Required: {PROFICIENCY_LABEL[r.required]}
                            {r.current ? ` · You: ${PROFICIENCY_LABEL[r.current]}` : ''}
                          </p>
                        </div>
                        <span className={`badge ${meta.style}`}>
                          <meta.icon size={13} />
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Improvement suggestions */}
              {suggestedResources.length > 0 && (
                <div className="card p-6">
                  <h3 className="mb-1 font-bold text-ink">Suggested Learning</h3>
                  <p className="mb-4 text-sm text-ink-soft">
                    Resources for the skills you need to improve or add.
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suggestedResources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-primary-100 p-4 transition-all duration-200 hover:border-primary-300 hover:shadow-card"
                      >
                        <div>
                          <p className="text-sm font-semibold text-ink">{res.title}</p>
                          <p className="text-xs text-ink-soft">{res.platform} · {res.skill?.name}</p>
                        </div>
                        <ArrowRight size={16} className="text-primary-400 transition-transform duration-200 group-hover:translate-x-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {selectedRole && results.length === 0 && (
            <Alert kind="info" message="No skill requirements defined for this role yet." />
          )}

          {!selectedRole && (
            <EmptyState
              icon={GitCompare}
              title="Pick a role to begin"
              hint="Your readiness score and skill comparison will appear here."
            />
          )}
        </>
      )}
    </div>
  );
}
