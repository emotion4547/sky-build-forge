-- Add policy for admins to view subscribers
CREATE POLICY "Admins can view subscribers"
ON public.subscribers
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to delete subscribers
CREATE POLICY "Admins can delete subscribers"
ON public.subscribers
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add policy for admins to update subscribers
CREATE POLICY "Admins can update subscribers"
ON public.subscribers
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));