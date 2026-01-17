import { supabase } from './client';

export interface GuestAuthorApplication {
    id: string;
    user_id: string;
    status: 'pending' | 'approved' | 'rejected';
    bio: string;
    portfolio_url: string;
    created_at: string;
    profiles?: {
        display_name: string;
        email: string;
    };
}

export const guestAuthorService = {
    /**
     * Submit a new guest author application
     */
    async applyAsGuestAuthor(bio: string, portfolioUrl: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('guest_authors')
            .insert({
                user_id: user.id,
                bio,
                portfolio_url: portfolioUrl,
                status: 'pending'
            });

        if (error) throw error;
    },

    /**
     * Get all pending applications (Admin only)
     */
    async getApplications(): Promise<GuestAuthorApplication[]> {
        const { data, error } = await supabase
            .from('guest_authors')
            .select(`
        *,
        profiles:user_id (display_name, email)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Approve an application
     */
    async approveApplication(id: string) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { error } = await supabase
            .from('guest_authors')
            .update({
                status: 'approved',
                approved_by: user.id,
                approved_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;

        // Also update the user's profile to mark them as a guest author
        // First get the user_id from the application
        const { data: app } = await supabase
            .from('guest_authors')
            .select('user_id')
            .eq('id', id)
            .single();

        if (app) {
            await supabase
                .from('profiles')
                .update({ is_guest_author: true })
                .eq('id', app.user_id);
        }
    },

    /**
     * Reject an application
     */
    async rejectApplication(id: string) {
        const { error } = await supabase
            .from('guest_authors')
            .update({ status: 'rejected' })
            .eq('id', id);

        if (error) throw error;
    }
};
