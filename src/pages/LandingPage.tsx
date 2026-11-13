import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Target,
  BookOpen,
  Briefcase,
  UserPlus,
  PenSquare,
  GitCompare,
  Rocket,
  Menu,
  X,
  ArrowRight,
  Building2,
  School,
  UserRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

const FEATURES = [
  {
    icon: Target,
    title: 'Discover Skill Gaps',
    body: 'Understand which skills you already have and which skills you need to learn.',
  },
  {
    icon: BookOpen,
    title: 'Improve Your Skills',
    body: 'Find helpful learning resources to develop the skills needed for your career.',
  },
  {
    icon: Briefcase,
    title: 'Explore Opportunities',
    body: 'Find jobs and internships that match your skills and career goals.',
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    body: 'Sign up as a student and tell us about your education and career goal.',
  },
  {
    icon: PenSquare,
    title: 'Add Your Skills',
    body: 'List the skills you already have and set your proficiency level for each.',
  },
  {
    icon: GitCompare,
    title: 'Analyze Your Skill Gap',
    body: 'Pick a target job role and see exactly which skills match, need work, or are missing.',
  },
  {
    icon: Rocket,
    title: 'Explore Jobs and Internships',
    body: 'Browse real opportunities, apply in one click, and track your applications.',
  },
];

const ROLES = [
  {
    icon: UserRound,
    title: 'Students',
    body: 'Measure readiness, close skill gaps, and apply to matched opportunities.',
  },
  {
    icon: School,
    title: 'Institutions',
    body: 'See how your students are developing skills and where they need support.',
  },
  {
    icon: Building2,
    title: 'Companies',
    body: 'Post jobs and internships, then review applicants with the right skills.',
  },
];

export default function LandingPage() {
  const { session, profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const dashboardLink =
    session && profile ? `/dashboard/${profile.role}` : '/login';

  return (
    <div id="home" className="min-h-screen bg-surface-soft">
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-2xl bg-white/95 px-5 py-3 shadow-card backdrop-blur">
          <a href="#home" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-500 text-white">
              <GraduationCap size={20} />
            </span>
            <span className="text-base font-bold text-ink">Skill Alignment Portal</span>
          </a>

          <div className="hidden items-center gap-7 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-primary-500"
              >
                {link.label}
              </a>
            ))}
            {session && profile ? (
              <Link to={dashboardLink} className="btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-primary-500"
                >
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-lg p-2 text-ink md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl bg-white p-4 shadow-card md:hidden">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-ink hover:bg-primary-50"
                >
                  {link.label}
                </a>
              ))}
              {session && profile ? (
                <Link to={dashboardLink} className="btn-primary mt-2">
                  Go to Dashboard
                </Link>
              ) : (
                <div className="mt-2 flex flex-col gap-2">
                  <Link to="/login" className="btn-secondary w-full">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary w-full">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="bg-hero-grad pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-8">
          <div className="animate-fade-up">
            <span className="badge mb-5 bg-white text-primary-600 shadow-sm">
              <GraduationCap size={14} />
              For students, institutions, and companies
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-ink md:text-5xl md:leading-[1.2]">
              Bridge the Gap Between Your Skills and Your{' '}
              <span className="bg-gradient-to-r from-primary-400 to-primary-500 bg-clip-text text-transparent">
                Dream Career
              </span>
              .
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-soft">
              Discover your missing skills, improve your knowledge, and connect
              with the right job opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                Get Started
                <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-secondary px-7 py-3 text-base">
                Explore Features
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden animate-fade-up delay-200 md:block">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-primary-200/50 blur-2xl" />
            <div className="absolute -bottom-10 -right-4 h-52 w-52 rounded-full bg-primary-100 blur-3xl" />
            <div className="card relative p-8 shadow-float">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink-soft">Target Role</p>
                  <p className="text-lg font-bold text-ink">Python Developer</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
                  <Target size={22} />
                </span>
              </div>

              <div className="mt-6 flex items-center gap-4 rounded-xl bg-surface-lav p-4">
                <div className="relative h-20 w-20 shrink-0">
                  <svg viewBox="0 0 80 80" className="h-20 w-20 -rotate-90">
                    <circle cx="40" cy="40" r="32" fill="none" stroke="#EDE1FC" strokeWidth="10" />
                    <circle
                      cx="40" cy="40" r="32" fill="none" stroke="#713FD0" strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${0.5 * 2 * Math.PI * 32} ${2 * Math.PI * 32}`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary-500">
                    50%
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-semibold text-ink">Skill Readiness</p>
                  <p className="text-ink-soft">2 of 4 required skills met</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {[
                  { name: 'Python', level: 'Advanced', ok: true },
                  { name: 'SQL', level: 'Beginner', ok: null },
                  { name: 'Django', level: 'Missing', ok: false },
                  { name: 'Git', level: 'Intermediate', ok: true },
                ].map((s) => (
                  <div
                    key={s.name}
                    className="flex items-center justify-between rounded-lg border border-primary-100 px-4 py-2.5"
                  >
                    <span className="text-sm font-semibold text-ink">{s.name}</span>
                    <span
                      className={`badge ${
                        s.ok === true
                          ? 'bg-emerald-100 text-emerald-700'
                          : s.ok === false
                            ? 'bg-red-100 text-red-600'
                            : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {s.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-20 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
            Everything You Need to Grow
          </h2>
          <p className="mt-3 text-ink-soft">
            A simple, focused toolkit that connects what you learn with what employers need.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={`card animate-fade-up delay-${(i + 1) * 100} group p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover`}
            >
              <span className="mb-5 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 p-3 text-primary-500 transition-colors duration-300 group-hover:from-primary-400 group-hover:to-primary-500 group-hover:text-white">
                <f.icon size={26} />
              </span>
              <h3 className="text-lg font-bold text-ink">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-28 bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-ink-soft">
              Four simple steps from sign-up to your first application.
            </p>
          </div>

          <div className="relative mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
            <div className="absolute left-0 right-0 top-7 hidden h-0.5 bg-primary-100 md:block" />
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center">
                <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-card">
                  <s.icon size={24} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-primary-400">
                  Step {i + 1}
                </p>
                <h3 className="mt-1 font-bold text-ink">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          {/* Roles */}
          <div className="mt-20 grid gap-6 md:grid-cols-3">
            {ROLES.map((r) => (
              <div
                key={r.title}
                className="flex items-start gap-4 rounded-2xl border border-primary-100 bg-surface-soft p-6 transition-all duration-200 hover:border-primary-200 hover:shadow-card"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-primary-500">
                  <r.icon size={22} />
                </span>
                <div>
                  <h3 className="font-bold text-ink">{r.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-400 to-primary-300 px-8 py-14 text-center shadow-float">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-white/10" />
          <h2 className="relative text-3xl font-extrabold text-white md:text-4xl">
            Ready to Close Your Skill Gap?
          </h2>
          <p className="relative mx-auto mt-3 max-w-xl text-primary-100">
            Create your free account today and take the first step toward your dream career.
          </p>
          <Link
            to="/register"
            className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-bold text-primary-600 shadow-sm transition-all duration-200 hover:bg-primary-50"
          >
            Get Started Free
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-8">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white">
              <GraduationCap size={16} />
            </span>
            <span className="font-bold text-ink">Skill Alignment Portal</span>
          </div>
          <p className="text-sm text-ink-soft">
            Connecting students, institutions, and companies.
          </p>
          <p className="text-sm text-ink-soft">
            © {new Date().getFullYear()} Skill Alignment Portal
          </p>
        </div>
      </footer>
    </div>
  );
}
