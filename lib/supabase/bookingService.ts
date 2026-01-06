/**
 * Booking Service - Submit and manage service bookings
 * 
 * Saves bookings to Supabase and optionally triggers confirmation email via webhook
 */
import { supabase } from './client';
import type { Database } from './database.types';

// Type aliases
type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingStatus = Database['public']['Enums']['booking_status'];

export type { Booking, BookingInsert, BookingStatus };

// Webhook URL for confirmation emails (configure in Supabase or external service)
const CONFIRMATION_WEBHOOK_URL = import.meta.env.VITE_PUBLIC_BOOKING_WEBHOOK_URL;

export interface BookingData {
  // Service info
  serviceId: string;
  serviceTitle: string;
  
  // Configuration
  provider?: string;
  durationMinutes: number;
  selectedOptions: string[];
  projectContext?: string;
  
  // Scheduling
  selectedDate: number; // Day of month
  selectedMonth?: number; // 0-11
  selectedYear?: number;
  
  // Pricing
  totalPrice: number;
  
  // User info (optional - for guest bookings)
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
}

/**
 * Submit a new booking
 */
export async function submitBooking(data: BookingData): Promise<Booking & { reference_number?: string }> {
  // Construct booking date from day (default to current month/year if not specified)
  const now = new Date();
  const month = data.selectedMonth ?? now.getMonth();
  const year = data.selectedYear ?? now.getFullYear();
  const bookingDate = new Date(year, month, data.selectedDate);
  
  // Generate reference number (we'll add this to notes since the table doesn't have a dedicated column)
  const referenceNumber = `IV-${Date.now().toString().slice(-6)}`;

  // Map to actual database column names
  const insertData: BookingInsert = {
    service_name: data.serviceTitle,
    provider: data.provider || 'Any',
    selected_options: data.selectedOptions,
    total_price: data.totalPrice,
    scheduled_date: bookingDate.toISOString().split('T')[0], // YYYY-MM-DD format
    project_description: data.projectContext || null,
    status: 'pending',
    customer_name: data.guestName || 'Guest Booking',
    customer_email: data.guestEmail || 'pending@intervised.com',
    customer_phone: data.guestPhone || null,
    notes: `Reference: ${referenceNumber} | Duration: ${data.durationMinutes}min`,
  };

  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Failed to submit booking:', error);
    throw new Error('Failed to submit booking. Please try again.');
  }

  // Add reference number to returned booking object
  const bookingWithRef = { ...booking, reference_number: referenceNumber };

  // Trigger confirmation email webhook (non-blocking)
  if (CONFIRMATION_WEBHOOK_URL && data.guestEmail) {
    triggerConfirmationEmail(bookingWithRef, data.guestEmail).catch(err => {
      console.warn('Confirmation email webhook failed:', err);
    });
  }

  return bookingWithRef;
}

/**
 * Trigger webhook for confirmation email
 */
async function triggerConfirmationEmail(booking: Booking & { reference_number?: string }, email: string): Promise<void> {
  if (!CONFIRMATION_WEBHOOK_URL) return;

  try {
    await fetch(CONFIRMATION_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'booking_confirmation',
        data: {
          id: booking.id,
          reference: booking.reference_number,
          email: email,
          service: booking.service_name,
          provider: booking.provider,
          date: booking.scheduled_date,
          options: booking.selected_options,
          total: booking.total_price,
          context: booking.project_description,
          created_at: booking.created_at,
        },
      }),
    });
  } catch (error) {
    console.error('Confirmation email webhook failed:', error);
  }
}

// ============================================
// ADMIN FUNCTIONS (requires authentication)
// ============================================

/**
 * Get all bookings (admin only)
 */
export async function getBookings(options?: {
  status?: BookingStatus;
  limit?: number;
  offset?: number;
  fromDate?: string;
  toDate?: string;
}): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select('*')
    .order('scheduled_date', { ascending: true });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  if (options?.fromDate) {
    query = query.gte('scheduled_date', options.fromDate);
  }

  if (options?.toDate) {
    query = query.lte('scheduled_date', options.toDate);
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
 * Get booking by ID
 */
export async function getBookingById(id: string): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

/**
 * Update booking status (admin only)
 */
export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Cancel a booking
 */
export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'cancelled');
}

/**
 * Delete a booking (admin only)
 */
export async function deleteBooking(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) throw error;
  return true;
}

/**
 * Get pending booking count (admin only)
 */
export async function getPendingBookingsCount(): Promise<number> {
  const { count, error } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  if (error) throw error;
  return count || 0;
}

/**
 * Subscribe to real-time booking updates
 */
export function subscribeToBookings(
  callback: (booking: Booking, eventType: 'INSERT' | 'UPDATE' | 'DELETE') => void
) {
  const subscription = supabase
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      (payload) => {
        callback(payload.new as Booking, payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE');
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    subscription.unsubscribe();
  };
}

// Export as namespace for cleaner imports
export const bookingService = {
  submitBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  getPendingBookingsCount,
  subscribeToBookings,
};
