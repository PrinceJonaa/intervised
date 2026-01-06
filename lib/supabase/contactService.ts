/**
 * Contact Service - Submit and manage contact messages
 * 
 * Saves messages to Supabase and triggers webhook for email notifications
 */
import { supabase } from './client';
import type { Database } from './database.types';

// Type aliases
type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
type ContactMessageInsert = Database['public']['Tables']['contact_messages']['Insert'];
type ContactStatus = Database['public']['Enums']['contact_status'];
type BudgetTier = Database['public']['Enums']['budget_tier'];
type TimelineType = Database['public']['Enums']['timeline_type'];

export type { ContactMessage, ContactMessageInsert, ContactStatus, BudgetTier, TimelineType };

// Webhook URL for email notifications (configure in Supabase or external service)
const WEBHOOK_URL = import.meta.env.VITE_PUBLIC_CONTACT_WEBHOOK_URL;

/**
 * Submit a new contact message
 */
export async function submitContactMessage(message: {
  name: string;
  email: string;
  message: string;
  company?: string;
  category?: string;
  budget?: string;
  timeline?: string;
  phone?: string;
}): Promise<ContactMessage> {
  // Map frontend values to database enums
  const budgetMap: Record<string, BudgetTier> = {
    'Seed': 'Seed',
    'Growth': 'Growth',
    'Scale': 'Scale',
    'Enterprise': 'Enterprise',
  };

  const timelineMap: Record<string, TimelineType> = {
    'Flexible': 'Flexible',
    'Flexible Timeline': 'Flexible',
    'ASAP': 'ASAP',
    'ASAP (Rush)': 'ASAP',
    'Within 1 Month': '1 Month',
    '1-2 Weeks': '1-2 Weeks',
    '2-3 Months': '2-3 Months',
    'Q3/Q4 Planning': '3+ Months',
    '3+ Months': '3+ Months',
  };

  const insertData: ContactMessageInsert = {
    name: message.name,
    email: message.email,
    message: message.message,
    company: message.company || null,
    service_interest: message.category || null,
    budget: budgetMap[message.budget || ''] || null,
    timeline: timelineMap[message.timeline || ''] || null,
    phone: message.phone || null,
    source: 'website',
    status: 'new',
  };

  const { data, error } = await supabase
    .from('contact_messages')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to submit contact message:', error);
    throw new Error('Failed to submit message. Please try again.');
  }

  // Trigger webhook for email notification (non-blocking)
  if (WEBHOOK_URL) {
    triggerWebhook(data).catch(err => {
      console.warn('Webhook notification failed:', err);
    });
  }

  return data;
}

/**
 * Trigger webhook for email notifications
 */
async function triggerWebhook(message: ContactMessage): Promise<void> {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'contact_form_submission',
        data: {
          id: message.id,
          name: message.name,
          email: message.email,
          company: message.company,
          category: message.service_interest,
          budget: message.budget,
          timeline: message.timeline,
          message: message.message,
          submitted_at: message.created_at,
        },
      }),
    });
  } catch (error) {
    // Log but don't throw - email failure shouldn't break form submission
    console.error('Webhook trigger failed:', error);
  }
}

// ============================================
// ADMIN FUNCTIONS (requires authentication)
// ============================================

/**
 * Get all contact messages (admin only)
 */
export async function getContactMessages(options?: {
  status?: ContactStatus;
  limit?: number;
  offset?: number;
}): Promise<ContactMessage[]> {
  let query = supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
}

/**
 * Update message status (admin only)
 */
export async function updateMessageStatus(
  id: string,
  status: ContactStatus
): Promise<ContactMessage> {
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete a contact message (admin only)
 */
export async function deleteContactMessage(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Get unread message count (admin only)
 */
export async function getUnreadCount(): Promise<number> {
  const { count, error } = await supabase
    .from('contact_messages')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new');

  if (error) throw error;
  return count || 0;
}

// Export as namespace for cleaner imports
export const contactService = {
  submitContactMessage,
  getContactMessages,
  updateMessageStatus,
  deleteContactMessage,
  getUnreadCount,
};
