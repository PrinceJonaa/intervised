
import { supabase } from './client';

export interface TransparencyMetric {
    id: string;
    metric_type: 'revenue' | 'expenses' | 'donations' | 'carbon_offset' | 'server_costs';
    value: number;
    period: string; // YYYY-MM
    notes?: string;
    created_at: string;
}

export interface TransparencyMetricInsert {
    metric_type: string;
    value: number;
    period: string;
    notes?: string;
}

export interface AuditLog {
    id: string;
    admin_id: string;
    action: string;
    target_resource: string;
    target_id?: string;
    details?: any;
    created_at: string;
    // Joined fields
    admin_email?: string;
    admin_name?: string;
}

// --- Transparency Metrics ---

export async function getTransparencyMetrics() {
    const { data, error } = await supabase
        .from('transparency_metrics' as any)
        .select('*')
        .order('period', { ascending: false });

    if (error) throw error;
    return data as unknown as TransparencyMetric[];
}

export async function createTransparencyMetric(metric: TransparencyMetricInsert) {
    const { data, error } = await supabase
        .from('transparency_metrics' as any)
        .insert(metric)
        .select()
        .single();

    if (error) throw error;
    await logAdminAction('create_metric', 'transparency_metrics', (data as any).id, metric);
    return data as unknown as TransparencyMetric;
}

export async function deleteTransparencyMetric(id: string) {
    const { error } = await supabase
        .from('transparency_metrics' as any)
        .delete()
        .eq('id', id);

    if (error) throw error;
    await logAdminAction('delete_metric', 'transparency_metrics', id);
}

// --- Contact Messages ---

export interface ContactMessage {
    id: string;
    name: string;
    email: string;
    subject: string | null;
    message: string;
    status: 'new' | 'read' | 'replied' | 'archived';
    created_at: string;
    service_interest?: string;
    company?: string;
}

export async function getMessages() {
    const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as unknown as ContactMessage[];
}

export async function updateMessageStatus(id: string, status: string) {
    const { error } = await supabase
        .from('contact_messages')
        .update({ status } as any)
        .eq('id', id);

    if (error) throw error;
    await logAdminAction('update_message', 'contact_messages', id, { status });
}

export async function deleteMessage(id: string) {
    const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

    if (error) throw error;
    await logAdminAction('delete_message', 'contact_messages', id);
}

// --- Audit Logs ---

export async function getAuditLogs(limit = 50) {
    // We need to join with profiles to get admin names, but Supabase simple client might not do deep joins easily on 'admin_id' if relationship names aren't perfect.
    // Let's try a standard select with expansion.
    const { data, error } = await supabase
        .from('admin_audit_logs' as any)
        .select(`
            *,
            profiles:admin_id (
                email,
                full_name
            )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) throw error;

    // Flatten the result
    return data.map((log: any) => ({
        ...log,
        admin_email: log.profiles?.email,
        admin_name: log.profiles?.full_name
    })) as AuditLog[];
}

export async function logAdminAction(
    action: string,
    target_resource: string,
    target_id?: string,
    details?: any
) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return; // Should not happen in admin context

    const { error } = await supabase
        .from('admin_audit_logs' as any)
        .insert({
            admin_id: user.id,
            action,
            target_resource,
            target_id,
            details
        });

    if (error) console.error('Failed to log audit action:', error);
}
