import { supabase } from './client';
import { ChatSession, ChatMessage } from '../../types';

// --- Chat Session Service ---

export async function getChatSessions(userId: string): Promise<ChatSession[]> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getChatSessionById(id: string): Promise<ChatSession | null> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

export async function saveChatSession(session: Partial<ChatSession> & { user_id: string }): Promise<ChatSession> {
  const { data, error } = await supabase
    .from('chat_sessions')
    .upsert([session], { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteChatSession(id: string): Promise<void> {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// --- Chat Message Service ---

export async function getChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function saveChatMessage(message: Partial<ChatMessage> & { session_id: string }): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteChatMessages(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('session_id', sessionId);
  if (error) throw error;
}
