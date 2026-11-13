import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2, UserRound, School, Building2 } from 'lucide-react';
import { supabase, type Role } from '@/lib/supabase';
import { Alert } from '@/components/ui';

const ROLE_OPTIONS: { value: Role; label: string; icon: typeof UserRound; hint: string }[] = [
  { value: 'student', label: 'Student', icon: UserRound, hint: 'Analyze skills and find jobs' },
  { value: 'institution', label: 'Institution', icon: School, hint: 'Track your students' },
  { value: 'company', label: 'Company', icon: Building2, hint: 'Post jobs and hire' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>('student');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleLabel = ROLE_OPTIONS.find((r) => r.value === role)!.label;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in.');
        }
        throw signUpError;
      }
      if (!data.session) {
        setError('Account created! Please confirm your email, then sign in.');
        return;
      }
      const userId = data.user!.id;

      if (role === 'student') {
        const { error } = await supabase.from('profiles').insert({
          id: userId,
          role: 'student',
          full_name: name,
          college_name: college,
          department: department,
        });
        if (error) throw error;
      } else if (role === 'institution') {
        const { data: inst, error: instError } = await supabase
          .from('institutions')
          .insert({ user_id: userId, name })
          .select()
          .single();
        if (instError) throw instError;
        const { error } = await supabase
          .from('profiles')
          .insert({ id: userId, role: 'institution', institution_id: inst.id });
        if (error) throw error;
      } else {
        const { data: comp, error: compError } = await supabase
          .from('companies')
          .insert({ user_id: userId, name })
          .select()
          .single();
        if (compError) throw compError;
        const { error } = await supabase
          .from('profiles')
          .insert({ id: userId, role: 'company', company_id: comp.id });
        if (error) throw error;
      }

      navigate(`/dashboard/${role}`, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grad px-4 py-12">
      <div className="w-full max-w-lg">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-primary-500"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="card animate-fade-up p-8 shadow-float">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white">
              <GraduationCap size={28} />
            </span>
            <h1 className="text-2xl font-extrabold text-ink">Create Your Account</h1>
            <p className="mt-1 text-sm text-ink-soft">Join as a student, institution, or company.</p>
          </div>

          <div className="mb-6 grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-4 text-sm font-semibold transition-all duration-200 ${
                  role === opt.value
                    ? 'border-primary-500 bg-primary-50 text-primary-600 shadow-sm'
                    : 'border-primary-100 bg-white text-ink-soft hover:border-primary-300'
                }`}
              >
                <opt.icon size={22} />
                {opt.label}
                <span className="text-[11px] font-normal leading-tight">{opt.hint}</span>
              </button>
            ))}
          </div>

          {error && <div className="mb-4"><Alert kind="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="form-label">
                {role === 'student'
                  ? 'Full Name'
                  : role === 'institution'
                    ? 'Institution Name'
                    : 'Company Name'}
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${roleLabel.toLowerCase()} name`}
                className="input-field"
              />
            </div>

            {role === 'student' && (
              <div>
                <label htmlFor="college" className="form-label">College Name</label>
                <input
                  id="college"
                  type="text"
                  required
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="Enter your college name"
                  className="input-field"
                />
              </div>
            )}

            {role === 'student' && (
              <div>
                <label htmlFor="department" className="form-label">Department</label>
                <input
                  id="department"
                  type="text"
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science"
                  className="input-field"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="input-field"
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading && <Loader2 size={18} className="animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
