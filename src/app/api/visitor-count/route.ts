import { NextResponse } from 'next/server';
import { createSupabasePublicClient } from '@/lib/supabase-public';

export async function GET() {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from('page_views')
      .select('count')
      .eq('id', 1)
      .single();
    if (error || !data) {
      return NextResponse.json({ count: null });
    }
    return NextResponse.json({ count: data.count });
  } catch {
    return NextResponse.json({ count: null });
  }
}

export async function POST() {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.rpc('increment_page_views');
    if (error || data === null) {
      return NextResponse.json({ count: null });
    }
    return NextResponse.json({ count: data });
  } catch {
    return NextResponse.json({ count: null });
  }
}
