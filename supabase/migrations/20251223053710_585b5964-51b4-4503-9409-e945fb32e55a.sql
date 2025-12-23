-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'in_progress', 'closed');

-- Add status column to leads table
ALTER TABLE public.leads 
ADD COLUMN status lead_status NOT NULL DEFAULT 'new';

-- Add policy for admins to update leads
CREATE POLICY "Admins can update leads"
ON public.leads
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete leads
CREATE POLICY "Admins can delete leads"
ON public.leads
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));