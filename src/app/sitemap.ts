import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const SITE_URL = 'https://panjiwiguna.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient();

  // Fetch all published posts
  const { data: posts } = await supabase
    .from('portfolio_posts')
    .select('slug, updated_at')
    .eq('is_published', true);

  // Fetch all detail projects
  const { data: projects } = await supabase
    .from('portfolio_projects')
    .select('slug, created_at')
    .eq('type', 'detail')
    .not('slug', 'is', null);

  // Fetch all group certificates
  const { data: certGroups } = await supabase
    .from('portfolio_certificates')
    .select('slug, created_at')
    .eq('type', 'group')
    .not('slug', 'is', null);

  const blogEntries: MetadataRoute.Sitemap = (posts || []).map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || new Date()),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const projectEntries: MetadataRoute.Sitemap = (projects || []).map((project) => ({
    url: `${SITE_URL}/projects/${project.slug}`,
    lastModified: new Date(project.created_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const certEntries: MetadataRoute.Sitemap = (certGroups || []).map((cert) => ({
    url: `${SITE_URL}/certificates/${cert.slug}`,
    lastModified: new Date(cert.created_at || new Date()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/cv`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...blogEntries,
    ...projectEntries,
    ...certEntries,
  ];
}
