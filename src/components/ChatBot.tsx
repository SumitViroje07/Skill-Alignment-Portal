import { useEffect, useRef, useState } from 'react';
import { Bot, X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase, type StudentSkill, type Application } from '@/lib/supabase';

interface ChatMessage {
  from: 'bot' | 'user';
  text: string;
}

const QUICK_REPLIES = [
  'How do I add my skills?',
  'What is skill gap analysis?',
  'How is my readiness calculated?',
  'How do I apply for jobs?',
];

export default function ChatBot() {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      from: 'bot',
      text: "Hi! I'm the Skill Assistant. Ask me how to use the portal — adding skills, gap analysis, jobs, and more.",
    },
  ]);
  const [stats, setStats] = useState<{ skills: number; apps: number; readiness: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open || !profile || profile.role !== 'student') return;
    (async () => {
      const [skillsRes, appsRes] = await Promise.all([
        supabase
          .from('student_skills')
          .select('proficiency')
          .eq('student_id', profile.id),
        supabase
          .from('applications')
          .select('status')
          .eq('student_id', profile.id),
      ]);
      const skills = (skillsRes.data as Pick<StudentSkill, 'proficiency'>[]) ?? [];
      const apps = (appsRes.data as Pick<Application, 'status'>[]) ?? [];
      const advanced = skills.filter((s) => s.proficiency === 'advanced').length;
      const intermediate = skills.filter((s) => s.proficiency === 'intermediate').length;
      const readiness = skills.length
        ? Math.round(((advanced + intermediate * 0.6) / skills.length) * 100)
        : 0;
      setStats({ skills: skills.length, apps: apps.length, readiness });
    })();
  }, [open, profile]);

  function answer(raw: string): string {
    const q = raw.toLowerCase();
    const isStudent = profile?.role === 'student';

    if (/\b(hi|hello|hey|good (morning|afternoon|evening))\b/.test(q)) {
      return "Hello! I can explain how the portal works — try asking about skills, gap analysis, jobs, or learning resources.";
    }

    if (/(add|manage|update).*skill|skill.*(add|manage|update)/.test(q)) {
      return "Open 'My Skills' in the sidebar, pick a skill from the dropdown, choose your level (Beginner, Intermediate, or Advanced), and click Add. You can change the level anytime or remove skills with the trash icon.";
    }

    if (/gap|analy/i.test(q)) {
      return "Skill Gap Analysis compares your skills with what a target job role needs. Open 'Skill Gap Analysis', pick a role like Python Developer, and you'll see which skills are Available (green), Need Improvement (yellow), or Missing (red), plus your readiness percentage.";
    }

    if (/readiness|percentage|percent|score|calculat/i.test(q)) {
      if (isStudent && stats) {
        return stats.skills === 0
          ? "Your readiness is 0% right now because no skills have been added yet. Add skills in 'My Skills' and it will update instantly."
          : `You currently have ${stats.skills} skill${stats.skills === 1 ? '' : 's'} and your readiness is about ${stats.readiness}%. Readiness = required skills meeting the minimum level, divided by total required skills for the role you pick.`;
      }
      return "Readiness = (number of required skills meeting the minimum proficiency ÷ total required skills) × 100. For example, if a role needs 4 skills and you meet 2, your readiness is 50%.";
    }

    if (/apply|application|job|internship/i.test(q)) {
      return isStudent && stats && stats.apps > 0
        ? `You have ${stats.apps} application${stats.apps === 1 ? '' : 's'} so far. Browse 'Jobs & Internships', use the search and filters, open a posting to see required skills, and click Apply. Track statuses in the 'My Applications' table.`
        : "Go to 'Jobs & Internships' to browse openings. You can search by title, filter by type or location, view required skills, and click Apply. Companies update your status afterward: Applied, Under Review, Shortlisted, or Rejected.";
    }

    if (/learn|resource|course|tutorial|improve/i.test(q)) {
      return "'Learning Resources' lists curated courses for each skill. After a gap analysis, resources for your weak skills are suggested first. Click 'Start Learning' to open the course, and 'Mark Done' when you finish to build your progress bar.";
    }

    if (/profil|college|department|career goal/i.test(q)) {
      return "Open 'My Profile' in the sidebar to update your name, college, department, education, and career goal. Keeping this current helps institutions and companies see accurate information.";
    }

    if (/company|post|hir/i.test(q)) {
      return "Company accounts can create postings under 'My Postings' — add the title, type (job or internship), location, qualifications, and required skills. Applications from students appear under 'Applications', where you can update their status.";
    }

    if (/institution|student|college account/i.test(q)) {
      return "Institution accounts see students who registered with the institution's name. The dashboard shows totals and readiness bars, 'Students' lists each student's skills, and 'Student Skill Gaps' shows the most common skills across your students.";
    }

    if (/status|shortlist|review|reject/i.test(q)) {
      return "Application statuses are: Applied (just submitted), Under Review (company is looking), Shortlisted (you're a candidate), and Rejected. You can see the current status in the 'My Applications' table under Jobs & Internships.";
    }

    if (/thank/i.test(q)) {
      return "You're welcome! Good luck with your skill building.";
    }

    return "I'm not sure about that one. I can help with: adding skills, gap analysis, readiness score, jobs and applications, learning resources, and profiles. Try one of the suggestions below.";
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }]);
    setInput('');
    setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: answer(trimmed) }]);
    }, 350);
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-500 text-white shadow-float transition-all duration-200 hover:scale-105"
          aria-label="Open chat assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-4 z-50 flex h-[520px] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-float animate-fade-up sm:right-6">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary-500 to-primary-400 px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <Bot size={20} />
              </span>
              <div>
                <p className="text-sm font-bold">Skill Assistant</p>
                <p className="text-xs text-primary-100">Always here to help</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
              aria-label="Close chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-surface-soft px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.from === 'user'
                      ? 'rounded-br-md bg-primary-500 text-white'
                      : 'rounded-bl-md border border-primary-100 bg-white text-ink'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies */}
          <div className="flex gap-2 overflow-x-auto border-t border-primary-100 bg-white px-3 py-2">
            {QUICK_REPLIES.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors duration-200 hover:bg-primary-100"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-primary-100 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="input-field py-2"
            />
            <button
              type="submit"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-500 text-white transition-colors duration-200 hover:bg-primary-600"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
