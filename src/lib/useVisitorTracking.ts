import { useEffect } from 'react';
import { supabase } from './supabase';

function getOrCreateVisitorId(): string {
  const key = 'vst_visitor_id';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function useVisitorTracking(page: string = '/') {
  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    supabase.from('visitor_stats').insert({
      visitor_id: visitorId,
      page,
      user_agent: navigator.userAgent,
    }).then(({ error }) => {
      if (error) console.error('Visitor tracking error:', error.message);
    });
  }, [page]);
}
