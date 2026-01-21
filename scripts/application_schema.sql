-- =============================================
-- Student Application Portal - Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_email TEXT NOT NULL,
  applicant_first_name TEXT NOT NULL,
  applicant_last_name TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_date_of_birth DATE,
  applicant_address TEXT,
  applicant_city TEXT,
  applicant_state TEXT,
  applicant_zip_code TEXT,
  applicant_country TEXT DEFAULT 'United States',
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'accepted', 'rejected', 'waitlisted', 'enrolled')),
  current_step INTEGER DEFAULT 1,
  -- Academic history
  previous_institution TEXT,
  previous_degree TEXT,
  graduation_year INTEGER,
  gpa NUMERIC(3,2),
  -- Essay
  personal_statement TEXT,
  -- Payment
  application_fee_paid BOOLEAN DEFAULT FALSE,
  payment_transaction_id TEXT,
  -- Decision
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  decision_notes TEXT,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Application Documents table
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('transcript', 'government_id', 'essay', 'recommendation', 'photo', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  recommender_email TEXT NOT NULL,
  recommender_name TEXT NOT NULL,
  recommender_title TEXT,
  relationship TEXT NOT NULL,
  token UUID UNIQUE DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'expired')),
  letter_content TEXT,
  letter_url TEXT,
  requested_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '30 days')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(applicant_email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_program ON applications(program_id);
CREATE INDEX IF NOT EXISTS idx_application_documents_app ON application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_app ON recommendations(application_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_token ON recommendations(token);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Applications policies
-- Anyone can create a draft application (no auth required for initial creation)
CREATE POLICY "Anyone can create applications" ON applications
  FOR INSERT WITH CHECK (true);

-- Applicants can view/update their own applications by email
CREATE POLICY "Applicants can view their applications" ON applications
  FOR SELECT USING (
    applicant_email = current_setting('request.jwt.claims', true)::json->>'email'
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'registrar')
    )
  );

CREATE POLICY "Applicants can update their draft applications" ON applications
  FOR UPDATE USING (
    (applicant_email = current_setting('request.jwt.claims', true)::json->>'email' AND status = 'draft')
    OR EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'registrar')
    )
  );

-- Admin/Registrar can manage all applications
CREATE POLICY "Admins can manage applications" ON applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'registrar')
    )
  );

-- Document policies
CREATE POLICY "Document access follows application access" ON application_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = application_documents.application_id
      AND (
        a.applicant_email = current_setting('request.jwt.claims', true)::json->>'email'
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'registrar')
        )
      )
    )
  );

-- Recommendation policies
CREATE POLICY "Recommendations access by token or application owner" ON recommendations
  FOR SELECT USING (
    token = current_setting('app.current_recommendation_token', true)::uuid
    OR EXISTS (
      SELECT 1 FROM applications a
      WHERE a.id = recommendations.application_id
      AND (
        a.applicant_email = current_setting('request.jwt.claims', true)::json->>'email'
        OR EXISTS (
          SELECT 1 FROM profiles 
          WHERE id = auth.uid() 
          AND role IN ('admin', 'registrar')
        )
      )
    )
  );

CREATE POLICY "Anyone can submit recommendations with valid token" ON recommendations
  FOR UPDATE USING (true)
  WITH CHECK (token IS NOT NULL);

-- Storage bucket for application documents
-- Run this separately if needed:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('applications', 'applications', false);
