import { supabase } from './supabase';
import type { JournalEntry, JournalEntryInsert } from './types';

export async function fetchEntries(): Promise<JournalEntry[]> {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createEntry(entry: JournalEntryInsert): Promise<JournalEntry> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('journal_entries')
    .insert({ ...entry, user_id: user.id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntry(id: string, entry: Partial<JournalEntryInsert>): Promise<JournalEntry> {
  const { data, error } = await supabase
    .from('journal_entries')
    .update({ ...entry, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEntry(id: string): Promise<void> {
  const { error } = await supabase.from('journal_entries').delete().eq('id', id);
  if (error) throw error;
}
