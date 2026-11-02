-- Table: portfolio_tech
CREATE TABLE IF NOT EXISTS public.portfolio_tech (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon_name TEXT NOT NULL,
    category TEXT NOT NULL,
    color_class TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: portfolio_projects
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    tech_array TEXT[] NOT NULL,
    link TEXT,
    image_url TEXT,
    icon_name TEXT NOT NULL,
    col_span TEXT,
    gradient_class TEXT,
    hover_border_class TEXT,
    is_featured BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table: portfolio_certificates
CREATE TABLE IF NOT EXISTS public.portfolio_certificates (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    issuer TEXT NOT NULL,
    year TEXT NOT NULL,
    link TEXT NOT NULL,
    color_class TEXT,
    border_class TEXT,
    glow_class TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.portfolio_tech ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_certificates ENABLE ROW LEVEL SECURITY;

-- Create basic Public Read policies
CREATE POLICY "Enable read access for all users - portfolio_tech" ON public.portfolio_tech FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users - portfolio_projects" ON public.portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users - portfolio_certificates" ON public.portfolio_certificates FOR SELECT USING (true);
