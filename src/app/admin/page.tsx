import { createSupabaseServerClient } from "@/lib/supabase-server";
import AdminAnalyticsDashboard, {
  type ContentCounts,
  type PageViewRecord,
} from "@/components/AdminAnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    pageviewsRes,
    projectsRes,
    postsRes,
    publishedPostsRes,
    techRes,
    certsRes,
    expRes,
    messagesRes,
    unreadMessagesRes,
  ] = await Promise.all([
    supabase
      .from("portfolio_pageviews")
      .select("path, referrer, device_type, visitor_hash, created_at")
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: true })
      .limit(10000),
    supabase.from("portfolio_projects").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_posts").select("*", { count: "exact", head: true }),
    supabase
      .from("portfolio_posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true),
    supabase.from("portfolio_tech").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_certificates").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_experiences").select("*", { count: "exact", head: true }),
    supabase.from("portfolio_messages").select("*", { count: "exact", head: true }),
    supabase
      .from("portfolio_messages")
      .select("*", { count: "exact", head: true })
      .eq("status", "unread"),
  ]);

  const analyticsTableMissing = Boolean(
    pageviewsRes.error &&
      (pageviewsRes.error.code === "42P01" ||
        pageviewsRes.error.code === "PGRST205" ||
        pageviewsRes.error.message.toLowerCase().includes("portfolio_pageviews"))
  );

  const pageviews: PageViewRecord[] = analyticsTableMissing
    ? []
    : (pageviewsRes.data as PageViewRecord[] | null) || [];

  const counts: ContentCounts = {
    projects: projectsRes.count || 0,
    posts: postsRes.count || 0,
    publishedPosts: publishedPostsRes.count || 0,
    tech: techRes.count || 0,
    certificates: certsRes.count || 0,
    experiences: expRes.count || 0,
    totalMessages: messagesRes.count || 0,
    unreadMessages: unreadMessagesRes.count || 0,
  };

  return (
    <AdminAnalyticsDashboard
      pageviews={pageviews}
      counts={counts}
      analyticsTableMissing={analyticsTableMissing}
    />
  );
}
