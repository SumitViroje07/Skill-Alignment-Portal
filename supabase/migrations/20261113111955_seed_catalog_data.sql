/*
# Seed catalog: skills, job roles, role requirements, learning resources

1. Data
- `skills`: master list of common technical + soft skills.
- `job_roles`: six target roles (Python Developer, Frontend Developer,
  Full Stack Developer, Java Developer, Data Analyst, Cybersecurity Analyst).
- `role_required_skills`: required skills per role with a minimum
  proficiency (used by the rule-based gap analysis).
- `learning_resources`: curated free resources per commonly missing skill.

2. Security
- No policy changes; rows respect existing RLS (read-only catalog).
*/

INSERT INTO skills (name) VALUES
  ('Python'), ('SQL'), ('Django'), ('Git'), ('REST APIs'),
  ('JavaScript'), ('React'), ('HTML/CSS'), ('TypeScript'), ('Node.js'),
  ('Java'), ('Spring Boot'), ('Data Structures'), ('Excel'), ('Tableau'),
  ('Power BI'), ('Statistics'), ('Networking'), ('Linux'), ('SIEM Tools'),
  ('Communication'), ('Problem Solving'), ('MongoDB'), ('Tailwind CSS')
ON CONFLICT (name) DO NOTHING;

INSERT INTO job_roles (name) VALUES
  ('Python Developer'),
  ('Frontend Developer'),
  ('Full Stack Developer'),
  ('Java Developer'),
  ('Data Analyst'),
  ('Cybersecurity Analyst')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_required_skills (role_id, skill_id, min_proficiency)
SELECT r.id, s.id, reqs.min
FROM (VALUES
  ('Python Developer', 'Python', 'advanced'),
  ('Python Developer', 'SQL', 'intermediate'),
  ('Python Developer', 'Django', 'intermediate'),
  ('Python Developer', 'Git', 'intermediate'),
  ('Python Developer', 'REST APIs', 'intermediate'),
  ('Frontend Developer', 'JavaScript', 'intermediate'),
  ('Frontend Developer', 'React', 'intermediate'),
  ('Frontend Developer', 'HTML/CSS', 'advanced'),
  ('Frontend Developer', 'Git', 'beginner'),
  ('Frontend Developer', 'Tailwind CSS', 'beginner'),
  ('Full Stack Developer', 'JavaScript', 'intermediate'),
  ('Full Stack Developer', 'React', 'intermediate'),
  ('Full Stack Developer', 'Node.js', 'intermediate'),
  ('Full Stack Developer', 'SQL', 'intermediate'),
  ('Full Stack Developer', 'Git', 'intermediate'),
  ('Full Stack Developer', 'MongoDB', 'beginner'),
  ('Java Developer', 'Java', 'advanced'),
  ('Java Developer', 'Spring Boot', 'intermediate'),
  ('Java Developer', 'SQL', 'intermediate'),
  ('Java Developer', 'Data Structures', 'intermediate'),
  ('Java Developer', 'Git', 'beginner'),
  ('Data Analyst', 'SQL', 'advanced'),
  ('Data Analyst', 'Excel', 'intermediate'),
  ('Data Analyst', 'Tableau', 'intermediate'),
  ('Data Analyst', 'Statistics', 'intermediate'),
  ('Data Analyst', 'Python', 'beginner'),
  ('Cybersecurity Analyst', 'Networking', 'intermediate'),
  ('Cybersecurity Analyst', 'Linux', 'intermediate'),
  ('Cybersecurity Analyst', 'SIEM Tools', 'intermediate'),
  ('Cybersecurity Analyst', 'Problem Solving', 'intermediate')
) AS reqs(role_name, skill_name, min)
JOIN job_roles r ON r.name = reqs.role_name
JOIN skills s ON s.name = reqs.skill_name
ON CONFLICT DO NOTHING;

INSERT INTO learning_resources (skill_id, title, description, platform, url)
SELECT s.id, res.title, res.description, res.platform, res.url
FROM (VALUES
  ('Python', 'Python for Everybody', 'Beginner-friendly course covering Python fundamentals with hands-on exercises.', 'Coursera', 'https://www.coursera.org/specializations/python'),
  ('Python', 'Automate the Boring Stuff with Python', 'Practical Python book teaching automation through real projects.', 'AutomateTheBoringStuff', 'https://automatetheboringstuff.com'),
  ('SQL', 'SQL Tutorial', 'Interactive lessons covering queries, joins, and database design.', 'SQLBolt', 'https://sqlbolt.com'),
  ('SQL', 'SQL for Data Analysis', 'Practice-based course on analyzing data with SQL.', 'Mode', 'https://mode.com/sql-tutorial'),
  ('Django', 'Django Getting Started', 'Official Django tutorial building a complete web application.', 'Django Docs', 'https://docs.djangoproject.com/en/stable/intro/tutorial01'),
  ('Git', 'Git & GitHub Crash Course', 'Learn version control basics: commits, branches, and pull requests.', 'freeCodeCamp', 'https://www.freecodecamp.org/news/git-and-github-for-beginners'),
  ('REST APIs', 'REST API Tutorial', 'Clear guide to designing and consuming REST APIs.', 'restfulapi.net', 'https://restfulapi.net'),
  ('JavaScript', 'JavaScript Algorithms and Data Structures', 'Project-based certification covering core JavaScript.', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures'),
  ('JavaScript', 'The Modern JavaScript Tutorial', 'Deep, structured guide from basics to advanced language features.', 'javascript.info', 'https://javascript.info'),
  ('React', 'React Official Tutorial', 'Build a tic-tac-toe game while learning React fundamentals.', 'React Docs', 'https://react.dev/learn'),
  ('HTML/CSS', 'Responsive Web Design Certification', 'Learn HTML and CSS by building real web pages.', 'freeCodeCamp', 'https://www.freecodecamp.org/learn/2022/responsive-web-design'),
  ('Tailwind CSS', 'Tailwind CSS Documentation', 'Utility-first CSS framework with guided examples.', 'Tailwind Docs', 'https://tailwindcss.com/docs'),
  ('TypeScript', 'TypeScript Handbook', 'Official guide to typed JavaScript for larger apps.', 'TypeScript Docs', 'https://www.typescriptlang.org/docs/handbook/intro.html'),
  ('Node.js', 'Introduction to Node.js', 'Official beginner guide to building server-side apps with Node.', 'Node.js Docs', 'https://nodejs.org/en/learn'),
  ('Java', 'Java Programming', 'University-level Java course with interactive practice.', 'edX', 'https://www.edx.org/learn/java'),
  ('Spring Boot', 'Spring Boot Reference Guide', 'Official guides for building Java web services.', 'Spring', 'https://spring.io/guides/gs/spring-boot'),
  ('Data Structures', 'Data Structures Easy to Advanced', 'Visual explanations of core data structures and algorithms.', 'freeCodeCamp', 'https://www.freecodecamp.org/news/tag/data-structures'),
  ('Excel', 'Excel Skills for Business', 'Build workplace Excel skills from basics to advanced.', 'Coursera', 'https://www.coursera.org/learn/excel'),
  ('Tableau', 'Tableau Training Videos', 'Free official video training for visualizing data.', 'Tableau', 'https://www.tableau.com/learn/training/20221'),
  ('Statistics', 'Introduction to Statistics', 'Foundational statistics course with real-world examples.', 'Coursera', 'https://www.coursera.org/learn/stanford-statistics'),
  ('Networking', 'Networking Basics', 'Learn how networks, protocols, and the internet work.', 'Cisco Networking Academy', 'https://www.netacad.com/courses/networking-basics'),
  ('Linux', 'Introduction to Linux', 'Beginner course on the Linux command line and administration.', 'Linux Foundation', 'https://training.linuxfoundation.org/training/introduction-to-linux'),
  ('SIEM Tools', 'Google Cybersecurity Certificate', 'Hands-on course covering SIEM tools and security monitoring.', 'Coursera', 'https://www.coursera.org/professional-certificates/google-cybersecurity'),
  ('MongoDB', 'MongoDB University Free Courses', 'Official courses on NoSQL data modeling and queries.', 'MongoDB', 'https://learn.mongodb.com')
) AS res(skill_name, title, description, platform, url)
JOIN skills s ON s.name = res.skill_name
WHERE NOT EXISTS (
  SELECT 1 FROM learning_resources lr
  WHERE lr.skill_id = s.id AND lr.title = res.title
);
