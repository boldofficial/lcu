-- Seed data for LCU SIS/LMS

-- Insert sample programs
INSERT INTO public.programs (id, name, code, description, degree_type, department, total_credits, duration_months, tuition_amount, is_active)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Bachelor of Arts in Biblical Studies', 'BA-BIB', 'A comprehensive study of the Bible, theology, and Christian ministry preparation.', 'bachelor', 'School of Theology', 120, 48, 24000.00, true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Master of Divinity', 'M-DIV', 'Advanced theological education preparing students for pastoral ministry and church leadership.', 'master', 'School of Theology', 90, 36, 36000.00, true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Bachelor of Science in Christian Counseling', 'BS-CC', 'Integration of psychology and Christian principles for effective counseling ministry.', 'bachelor', 'School of Psychology', 120, 48, 26000.00, true),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Certificate in Christian Leadership', 'CERT-CL', 'Foundational training in leadership principles from a biblical perspective.', 'certificate', 'School of Ministry', 30, 12, 6000.00, true),
  ('e5f6a7b8-c9d0-1234-efab-345678901234', 'Master of Arts in Christian Education', 'MA-CE', 'Equipping educators for effective teaching ministry in church and school settings.', 'master', 'School of Education', 60, 24, 18000.00, true)
ON CONFLICT (code) DO NOTHING;

-- Insert sample courses for Biblical Studies program
INSERT INTO public.courses (id, program_id, code, name, description, credits, duration_weeks, prerequisites, learning_objectives, is_active, order_index)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BIB101', 'Introduction to the Old Testament', 'Survey of the Old Testament books, themes, and historical context.', 3, 8, ARRAY[]::TEXT[], ARRAY['Understand the structure of the Old Testament', 'Identify major themes and characters', 'Apply Old Testament principles to modern life'], true, 1),
  ('22222222-2222-2222-2222-222222222222', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'BIB102', 'Introduction to the New Testament', 'Survey of the New Testament books, focusing on the life of Christ and the early church.', 3, 8, ARRAY['BIB101'], ARRAY['Understand the historical context of the New Testament', 'Trace the narrative of Jesus ministry', 'Analyze the teachings of the apostles'], true, 2),
  ('33333333-3333-3333-3333-333333333333', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'THE201', 'Systematic Theology I', 'Study of fundamental Christian doctrines including God, Scripture, and creation.', 3, 8, ARRAY['BIB101', 'BIB102'], ARRAY['Articulate core Christian beliefs', 'Defend theological positions biblically', 'Apply theology to daily life'], true, 3),
  ('44444444-4444-4444-4444-444444444444', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'THE202', 'Systematic Theology II', 'Continuation of theological study covering Christ, salvation, and eschatology.', 3, 8, ARRAY['THE201'], ARRAY['Understand Christology and soteriology', 'Explore various eschatological views', 'Integrate theology with ministry practice'], true, 4),
  ('55555555-5555-5555-5555-555555555555', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'MIN301', 'Pastoral Ministry', 'Practical training for pastoral leadership, preaching, and church administration.', 3, 8, ARRAY['THE201'], ARRAY['Develop preaching skills', 'Understand pastoral care principles', 'Learn church administration basics'], true, 5)
ON CONFLICT (code) DO NOTHING;
