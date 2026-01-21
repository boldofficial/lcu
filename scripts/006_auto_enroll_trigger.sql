-- Trigger to automatically enroll students in courses when they enroll in a program

CREATE OR REPLACE FUNCTION public.handle_program_enrollment()
RETURNS TRIGGER AS $$
BEGIN
    -- Only proceed if the enrollment status is 'active'
    IF NEW.status = 'active' THEN
        -- Insert course enrollments for all active courses in the program
        INSERT INTO public.course_enrollments (enrollment_id, course_id, student_id, status)
        SELECT 
            NEW.id,
            c.id,
            NEW.student_id,
            'not_started'
        FROM public.courses c
        WHERE c.program_id = NEW.program_id
        AND c.is_active = true
        ON CONFLICT (enrollment_id, course_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_program_enrollment_change ON public.enrollments;

-- Create the trigger
CREATE TRIGGER on_program_enrollment_change
AFTER INSERT OR UPDATE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.handle_program_enrollment();
