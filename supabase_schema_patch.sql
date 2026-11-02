-- Enable INSERT, UPDATE, DELETE access for authenticated/anon users for seeding purposes
-- Note: In a real production environment, you should only allow anon for read, and auth for write.
-- But since we are using the anon key to seed from the API route right now, we will allow it.

CREATE POLICY "Enable insert access for all users - portfolio_tech" ON public.portfolio_tech FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users - portfolio_projects" ON public.portfolio_projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable insert access for all users - portfolio_certificates" ON public.portfolio_certificates FOR INSERT WITH CHECK (true);

-- Allow delete for the seed script to reset data
CREATE POLICY "Enable delete access for all users - portfolio_tech" ON public.portfolio_tech FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users - portfolio_projects" ON public.portfolio_projects FOR DELETE USING (true);
CREATE POLICY "Enable delete access for all users - portfolio_certificates" ON public.portfolio_certificates FOR DELETE USING (true);
