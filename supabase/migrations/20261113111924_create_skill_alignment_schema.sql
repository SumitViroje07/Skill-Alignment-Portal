/*
# Skill Alignment Portal — full schema

1. New Tables
- `institutions`: one row per institution account (name + owner user).
- `companies`: one row per company account (name + owner user).
- `profiles`: one row per user; role = student | institution | company.
  Students also store full_name, college_name, department, education, career_goal,
  and an optional link to the matching institutions row.
- `skills`: master list of skill names.
- `student_skills`: a student's skills with proficiency (beginner/intermediate/advanced).
- `job_roles`: target career roles (e.g. Python Developer).
- `role_required_skills`: skills required per role with a minimum proficiency.
- `jobs`: job/internship postings created by companies (title, type, location,
  description, qualifications, status).
- `job_required_skills`: skills required for a specific posting.
- `applications`: a student's application to a job, with status
  (applied / under_review / shortlisted / rejected). Unique per (job, student)
  to prevent duplicate applications.
- `learning_resources`: predefined learning resources per skill.
- `student_learning_progress`: a student marking a resource completed.

2. Security
- RLS enabled on every table.
- Students: full CRUD on their own profile, skills, learning progress;
  INSERT own applications; read all job postings.
- Companies: manage own company row and own postings (including required
  skills); read + update status of applications to their postings.
- Institutions: manage own institution row and profile; read profiles and
  skills of students linked to their institution (by institution_id or by
  matching college name).
- Shared catalog tables (skills, job_roles, role_required_skills,
  learning_resources, jobs) readable by all authenticated users.
- All grants limited to the verbs each role needs.
*/

-- ---------------------------------------------------------------- institutions
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------- companies
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- -------------------------------------------------------------------- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('student', 'institution', 'company')),
  full_name text,
  college_name text,
  department text,
  education text,
  career_goal text,
  institution_id uuid REFERENCES institutions(id),
  company_id uuid REFERENCES companies(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------- skills
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- -------------------------------------------------------------- student_skills
CREATE TABLE IF NOT EXISTS student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  proficiency text NOT NULL DEFAULT 'beginner'
    CHECK (proficiency IN ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, skill_id)
);

-- ------------------------------------------------------------------- job_roles
CREATE TABLE IF NOT EXISTS job_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE
);

-- ------------------------------------------------------- role_required_skills
CREATE TABLE IF NOT EXISTS role_required_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES job_roles(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  min_proficiency text NOT NULL DEFAULT 'intermediate'
    CHECK (min_proficiency IN ('beginner', 'intermediate', 'advanced')),
  UNIQUE (role_id, skill_id)
);

-- ------------------------------------------------------------------------ jobs
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title text NOT NULL,
  type text NOT NULL DEFAULT 'job' CHECK (type IN ('job', 'internship')),
  location text,
  description text,
  qualifications text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS job_required_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  UNIQUE (job_id, skill_id)
);

-- ---------------------------------------------------------------- applications
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied'
    CHECK (status IN ('applied', 'under_review', 'shortlisted', 'rejected')),
  applied_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (job_id, student_id)
);

-- --------------------------------------------------------- learning resources
CREATE TABLE IF NOT EXISTS learning_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id uuid NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  platform text NOT NULL,
  url text NOT NULL
);

CREATE TABLE IF NOT EXISTS student_learning_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES learning_resources(id) ON DELETE CASCADE,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  UNIQUE (student_id, resource_id)
);

-- ================================================================== RLS + grants

ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_required_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_learning_progress ENABLE ROW LEVEL SECURITY;

-- institutions: readable by authenticated (needed for college-name matching),
-- writable by owner.
GRANT SELECT, INSERT, UPDATE ON institutions TO authenticated;
DROP POLICY IF EXISTS "institutions_select" ON institutions;
CREATE POLICY "institutions_select" ON institutions FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "institutions_insert_own" ON institutions;
CREATE POLICY "institutions_insert_own" ON institutions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "institutions_update_own" ON institutions;
CREATE POLICY "institutions_update_own" ON institutions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- companies: same pattern.
GRANT SELECT, INSERT, UPDATE ON companies TO authenticated;
DROP POLICY IF EXISTS "companies_select" ON companies;
CREATE POLICY "companies_select" ON companies FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
CREATE POLICY "companies_insert_own" ON companies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "companies_update_own" ON companies;
CREATE POLICY "companies_update_own" ON companies FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- profiles
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
DROP POLICY IF EXISTS "profiles_select_own_or_linked" ON profiles;
CREATE POLICY "profiles_select_own_or_linked" ON profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM institutions i
      WHERE i.user_id = auth.uid()
        AND (profiles.institution_id = i.id
             OR lower(profiles.college_name) = lower(i.name))
    )
    OR EXISTS (
      SELECT 1
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN companies c ON c.id = j.company_id
      WHERE c.user_id = auth.uid() AND a.student_id = profiles.id
    )
  );
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- skills: everyone reads; students may add new skill names to the catalog.
GRANT SELECT, INSERT ON skills TO authenticated;
DROP POLICY IF EXISTS "skills_select" ON skills;
CREATE POLICY "skills_select" ON skills FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "skills_insert" ON skills;
CREATE POLICY "skills_insert" ON skills FOR INSERT
  TO authenticated WITH CHECK (true);

-- student_skills: owner only; institutions of the student can read.
GRANT SELECT, INSERT, UPDATE, DELETE ON student_skills TO authenticated;
DROP POLICY IF EXISTS "student_skills_select" ON student_skills;
CREATE POLICY "student_skills_select" ON student_skills FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM profiles p
      JOIN institutions i ON i.user_id = auth.uid()
      WHERE p.id = student_skills.student_id
        AND (p.institution_id = i.id OR lower(p.college_name) = lower(i.name))
    )
  );
DROP POLICY IF EXISTS "student_skills_insert_own" ON student_skills;
CREATE POLICY "student_skills_insert_own" ON student_skills FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "student_skills_update_own" ON student_skills;
CREATE POLICY "student_skills_update_own" ON student_skills FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "student_skills_delete_own" ON student_skills;
CREATE POLICY "student_skills_delete_own" ON student_skills FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- job_roles + role_required_skills: read-only catalog.
GRANT SELECT ON job_roles, role_required_skills TO authenticated;
DROP POLICY IF EXISTS "job_roles_select" ON job_roles;
CREATE POLICY "job_roles_select" ON job_roles FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "role_required_skills_select" ON role_required_skills;
CREATE POLICY "role_required_skills_select" ON role_required_skills FOR SELECT
  TO authenticated USING (true);

-- jobs: everyone authenticated reads postings; company manages its own.
GRANT SELECT, INSERT, UPDATE, DELETE ON jobs TO authenticated;
DROP POLICY IF EXISTS "jobs_select" ON jobs;
CREATE POLICY "jobs_select" ON jobs FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "jobs_insert_own" ON jobs;
CREATE POLICY "jobs_insert_own" ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "jobs_update_own" ON jobs;
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;
CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
  );

-- job_required_skills: everyone reads; company of the posting manages them.
GRANT SELECT, INSERT, DELETE ON job_required_skills TO authenticated;
DROP POLICY IF EXISTS "jrs_select" ON job_required_skills;
CREATE POLICY "jrs_select" ON job_required_skills FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "jrs_insert_own" ON job_required_skills;
CREATE POLICY "jrs_insert_own" ON job_required_skills FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = job_id AND c.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "jrs_delete_own" ON job_required_skills;
CREATE POLICY "jrs_delete_own" ON job_required_skills FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = job_id AND c.user_id = auth.uid()
    )
  );

-- applications: student manages own; company of the posting reads + sets status.
GRANT SELECT, INSERT, UPDATE, DELETE ON applications TO authenticated;
DROP POLICY IF EXISTS "applications_select" ON applications;
CREATE POLICY "applications_select" ON applications FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "applications_update_company" ON applications;
CREATE POLICY "applications_update_company" ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs j JOIN companies c ON c.id = j.company_id
      WHERE j.id = applications.job_id AND c.user_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "applications_delete_own" ON applications;
CREATE POLICY "applications_delete_own" ON applications FOR DELETE
  TO authenticated USING (auth.uid() = student_id);

-- learning resources: read-only catalog.
GRANT SELECT ON learning_resources TO authenticated;
DROP POLICY IF EXISTS "learning_resources_select" ON learning_resources;
CREATE POLICY "learning_resources_select" ON learning_resources FOR SELECT
  TO authenticated USING (true);

-- student_learning_progress: owner only.
GRANT SELECT, INSERT, UPDATE, DELETE ON student_learning_progress TO authenticated;
DROP POLICY IF EXISTS "slp_select_own" ON student_learning_progress;
CREATE POLICY "slp_select_own" ON student_learning_progress FOR SELECT
  TO authenticated USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "slp_insert_own" ON student_learning_progress;
CREATE POLICY "slp_insert_own" ON student_learning_progress FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "slp_update_own" ON student_learning_progress;
CREATE POLICY "slp_update_own" ON student_learning_progress FOR UPDATE
  TO authenticated USING (auth.uid() = student_id) WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "slp_delete_own" ON student_learning_progress;
CREATE POLICY "slp_delete_own" ON student_learning_progress FOR DELETE
  TO authenticated USING (auth.uid() = student_id);
