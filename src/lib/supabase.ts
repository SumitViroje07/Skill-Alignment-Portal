import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'student' | 'institution' | 'company';
export type Proficiency = 'beginner' | 'intermediate' | 'advanced';
export type ApplicationStatus = 'applied' | 'under_review' | 'shortlisted' | 'rejected';

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  college_name: string | null;
  department: string | null;
  education: string | null;
  career_goal: string | null;
  institution_id: string | null;
  company_id: string | null;
}

export interface Institution {
  id: string;
  user_id: string;
  name: string;
}

export interface Company {
  id: string;
  user_id: string;
  name: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface StudentSkill {
  id: string;
  student_id: string;
  skill_id: string;
  proficiency: Proficiency;
  skill?: Skill;
}

export interface JobRole {
  id: string;
  name: string;
}

export interface RoleRequiredSkill {
  id: string;
  role_id: string;
  skill_id: string;
  min_proficiency: Proficiency;
  skill?: Skill;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  type: 'job' | 'internship';
  location: string | null;
  description: string | null;
  qualifications: string | null;
  created_at: string;
  companies?: Company;
  job_required_skills?: { skill_id: string; skill?: Skill }[];
}

export interface Application {
  id: string;
  job_id: string;
  student_id: string;
  status: ApplicationStatus;
  applied_at: string;
  jobs?: Job;
  profiles?: Profile;
}

export interface LearningResource {
  id: string;
  skill_id: string;
  title: string;
  description: string | null;
  platform: string;
  url: string;
  skill?: Skill;
}

export interface LearningProgress {
  id: string;
  student_id: string;
  resource_id: string;
  completed: boolean;
  completed_at: string | null;
}

export const PROFICIENCY_ORDER: Record<Proficiency, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
};

export const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  under_review: 'Under Review',
  shortlisted: 'Shortlisted',
  rejected: 'Rejected',
};

export const STATUS_STYLE: Record<ApplicationStatus, string> = {
  applied: 'bg-primary-100 text-primary-700',
  under_review: 'bg-amber-100 text-amber-700',
  shortlisted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
};
