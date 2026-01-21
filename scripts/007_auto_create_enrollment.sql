-- Trigger to automatically create an enrollment when an application is accepted

CREATE OR REPLACE FUNCTION public.handle_application_acceptance()
RETURNS TRIGGER AS $$
DECLARE
    v_student_id UUID;
BEGIN
    -- Only proceed if the status changed to 'accepted'
    IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
        
        -- Attempt to find the student profile key off the applicant email
        -- This assumes the user has signed up with the same email address
        SELECT id INTO v_student_id 
        FROM public.profiles 
        WHERE email = NEW.applicant_email;
        
        -- If a profile exists and the application has a valid program_id
        IF v_student_id IS NOT NULL AND NEW.program_id IS NOT NULL THEN
            
            -- Insert or Update the enrollment
            -- We set status to 'active' which will cascade to the course enrollment trigger
            INSERT INTO public.enrollments (
                student_id, 
                program_id, 
                status, 
                enrollment_date
            )
            VALUES (
                v_student_id, 
                NEW.program_id, 
                'active', 
                CURRENT_DATE
            )
            ON CONFLICT (student_id, program_id) 
            DO UPDATE SET 
                status = 'active', 
                updated_at = NOW();
                
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_application_accepted ON public.applications;

-- Create the trigger
CREATE TRIGGER on_application_accepted
AFTER UPDATE ON public.applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_application_acceptance();
