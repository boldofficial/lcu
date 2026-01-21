export type UserRole = "admin" | "faculty" | "registrar" | "student"

export type DegreeType = "certificate" | "associate" | "bachelor" | "master" | "doctorate"

export type EnrollmentStatus = "pending" | "active" | "completed" | "withdrawn" | "suspended"

export type CourseStatus = "not_started" | "in_progress" | "completed" | "failed" | "withdrawn"

export type AssessmentType = "quiz" | "assignment" | "exam" | "discussion" | "project"

export type PaymentStatus = "pending" | "paid" | "overdue" | "cancelled"

export type PaymentPlanType = "full" | "installment"

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string
  date_of_birth: string | null
  role: UserRole
  avatar_url: string | null
  bio: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  name: string
  code: string
  description: string | null
  degree_type: DegreeType
  department: string
  total_credits: number
  duration_months: number
  tuition_amount: number
  application_fee: number
  cover_image: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Course {
  id: string
  program_id: string | null
  code: string
  name: string
  description: string | null
  credits: number
  duration_weeks: number
  instructor_id: string | null
  prerequisites: string[]
  learning_objectives: string[]
  is_active: boolean
  order_index: number
  created_at: string
  updated_at: string
  instructor?: Profile
  program?: Program
}

export interface Enrollment {
  id: string
  student_id: string
  program_id: string
  status: EnrollmentStatus
  enrollment_date: string
  expected_completion_date: string | null
  actual_completion_date: string | null
  gpa: number
  credits_completed: number
  created_at: string
  updated_at: string
  student?: Profile
  program?: Program
}

export interface CourseEnrollment {
  id: string
  enrollment_id: string
  course_id: string
  student_id: string
  status: CourseStatus
  start_date: string | null
  end_date: string | null
  grade: string | null
  grade_points: number | null
  progress_percentage: number
  created_at: string
  updated_at: string
  course?: Course
}

export interface Module {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content: string | null
  content_type: "text" | "video" | "audio" | "document" | "interactive"
  video_url: string | null
  duration_minutes: number | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface Assessment {
  id: string
  course_id: string
  module_id: string | null
  title: string
  description: string | null
  assessment_type: AssessmentType
  total_points: number
  passing_score: number
  time_limit_minutes: number | null
  attempts_allowed: number
  due_date: string | null
  is_published: boolean
  shuffle_questions: boolean
  show_correct_answers: boolean
  attachment_url: string | null
  submission_type: "file" | "text" | "both"
  created_at: string
  updated_at: string
  questions?: AssessmentQuestion[]
}

export interface AssessmentQuestion {
  id: string
  assessment_id: string
  question_text: string
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay" | "matching"
  options: Record<string, string> | null
  correct_answer: string | null
  points: number
  explanation: string | null
  order_index: number
  created_at: string
}

export type SubmissionStatus = "draft" | "submitted" | "graded" | "returned"

export interface AssessmentSubmission {
  id: string
  assessment_id: string
  student_id: string
  submission_type: "file" | "text"
  file_url: string | null
  content: string | null
  status: SubmissionStatus
  grade: number | null
  feedback: string | null
  submitted_at: string
  graded_at: string | null
  graded_by: string | null
  created_at: string
  updated_at: string
}

export interface PaymentPlan {
  id: string
  enrollment_id: string
  student_id: string
  total_amount: number
  amount_paid: number
  balance: number
  plan_type: PaymentPlanType
  installment_count: number
  status: "active" | "completed" | "defaulted" | "cancelled"
  created_at: string
  updated_at: string
  enrollment?: Enrollment
  payments?: Payment[]
}

export interface Payment {
  id: string
  payment_plan_id: string
  student_id: string
  amount: number
  due_date: string
  paid_date: string | null
  payment_method: string | null
  transaction_id: string | null
  status: PaymentStatus
  installment_number: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  author_id: string
  target_audience: "all" | "students" | "faculty" | "program"
  program_id: string | null
  is_published: boolean
  published_at: string | null
  expires_at: string | null
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string | null
  cover_image: string | null
  author_id: string | null
  published_at: string | null
  is_published: boolean
  created_at: string
  updated_at: string
  author?: Profile
}

// Application Portal Types
export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "enrolled"

export type DocumentType =
  | "transcript"
  | "government_id"
  | "essay"
  | "recommendation"
  | "photo"
  | "other"

export type RecommendationStatus = "pending" | "submitted" | "expired"

export interface Application {
  id: string
  applicant_email: string
  applicant_first_name: string
  applicant_last_name: string
  applicant_phone: string | null
  applicant_date_of_birth: string | null
  applicant_address: string | null
  applicant_city: string | null
  applicant_state: string | null
  applicant_zip_code: string | null
  applicant_country: string
  program_id: string | null
  status: ApplicationStatus
  current_step: number
  // Academic history
  previous_institution: string | null
  previous_degree: string | null
  graduation_year: number | null
  gpa: number | null
  // Essay
  personal_statement: string | null
  // Payment
  application_fee_paid: boolean
  payment_transaction_id: string | null
  // Timestamps
  submitted_at: string | null
  decision_at: string | null
  decision_notes: string | null
  reviewer_id: string | null
  created_at: string
  updated_at: string
  // Relations
  program?: Program
  documents?: ApplicationDocument[]
  recommendations?: Recommendation[]
}

export interface ApplicationDocument {
  id: string
  application_id: string
  document_type: DocumentType
  file_name: string
  file_url: string
  file_size: number
  mime_type: string
  uploaded_at: string
}

export interface Recommendation {
  id: string
  application_id: string
  recommender_email: string
  recommender_name: string
  recommender_title: string | null
  relationship: string
  token: string
  status: RecommendationStatus
  letter_content: string | null
  letter_url: string | null
  requested_at: string
  submitted_at: string | null
  expires_at: string
}

export interface ApplicationFormData {
  // Step 1: Program Selection
  program_id: string
  // Step 2: Personal Info
  first_name: string
  last_name: string
  email: string
  phone: string
  date_of_birth: string
  address: string
  city: string
  state: string
  zip_code: string
  country: string
  // Step 3: Academic History
  previous_institution: string
  previous_degree: string
  graduation_year: number
  gpa: number
  // Step 4: Essay
  personal_statement: string
}
