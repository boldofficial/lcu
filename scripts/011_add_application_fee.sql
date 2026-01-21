-- Add application_fee to programs table
ALTER TABLE programs 
ADD COLUMN application_fee DECIMAL(10, 2) DEFAULT 50.00;

-- Update existing records if needed (default handles it)
