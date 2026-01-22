-- Create a function to update total credits completed
CREATE OR REPLACE FUNCTION update_enrollment_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Only run if status changed to 'completed' or 'passed'
    IF (NEW.status IN ('completed', 'passed') AND (OLD.status IS NULL OR OLD.status NOT IN ('completed', 'passed'))) THEN
        
        -- Update the parent enrollment
        UPDATE enrollments e
        SET credits_completed = (
            SELECT COALESCE(SUM(c.credits), 0)
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.enrollment_id = NEW.enrollment_id
            AND ce.status IN ('completed', 'passed')
        ),
        updated_at = NOW()
        WHERE e.id = NEW.enrollment_id;
        
    -- Or if status changed FROM 'completed' to something else (e.g. reverted)
    ELSIF (OLD.status IN ('completed', 'passed') AND NEW.status NOT IN ('completed', 'passed')) THEN
        
        UPDATE enrollments e
        SET credits_completed = (
            SELECT COALESCE(SUM(c.credits), 0)
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.enrollment_id = NEW.enrollment_id
            AND ce.status IN ('completed', 'passed')
        ),
        updated_at = NOW()
        WHERE e.id = NEW.enrollment_id;
        
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS trigger_update_enrollment_credits ON course_enrollments;

CREATE TRIGGER trigger_update_enrollment_credits
AFTER UPDATE ON course_enrollments
FOR EACH ROW
EXECUTE FUNCTION update_enrollment_credits();

-- Run a one-time update to fix existing records
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM enrollments LOOP
        UPDATE enrollments e
        SET credits_completed = (
            SELECT COALESCE(SUM(c.credits), 0)
            FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.enrollment_id = r.id
            AND ce.status IN ('completed', 'passed')
        )
        WHERE e.id = r.id;
    END LOOP;
END $$;
