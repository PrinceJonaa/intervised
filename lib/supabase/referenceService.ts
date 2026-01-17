import { supabase } from './client';

// --- Services Service ---

export interface Service {
  id: string;
  category: string;
  name: string;
  description?: string;
  base_price: number;
  price_display?: string;
  duration?: number;
  is_scalable?: boolean;
  providers?: string[];
  options?: any[]; // JSONB column for add-ons
  is_active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getServices(category?: string): Promise<Service[]> {
  let query = supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getServiceById(id: string): Promise<Service | null> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

// --- Projects Service ---

export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  description?: string;
  results?: string;
  image?: string;
  url?: string;
  outcome?: string; // Short result description
  is_featured?: boolean;
  service_ids?: string[]; // Cross-reference to Services
  sort_order?: number;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export async function createProject(project: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert([project as any])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

export async function getProjects(featured?: boolean): Promise<Project[]> {
  let query = supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });

  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

// --- Testimonials Service ---

export interface Testimonial {
  id: string;
  client_name: string;
  client_role?: string;
  client_company?: string;
  client_image?: string;
  quote: string;
  project_type?: string;
  rating?: number;
  is_featured?: boolean;
  sort_order?: number;
  created_at?: string;
}

export async function getTestimonials(featured?: boolean): Promise<Testimonial[]> {
  let query = supabase
    .from('testimonials')
    .select('*')
    .order('sort_order', { ascending: true });

  if (featured !== undefined) {
    query = query.eq('is_featured', featured);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getTestimonialById(id: string): Promise<Testimonial | null> {
  const { data, error } = await supabase
    .from('testimonials')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

// --- FAQ Service ---

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getFAQItems(category?: string): Promise<FAQItem[]> {
  let query = supabase
    .from('faq_items')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getFAQItemById(id: string): Promise<FAQItem | null> {
  const { data, error } = await supabase
    .from('faq_items')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

// --- Services Service ---

// ... (existing code)

export async function updateService(id: string, updates: Partial<Service>): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// --- Team Service ---

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image?: string;
  status?: 'Online' | 'In Deep Work' | 'Offline' | 'On Set' | string;
  instagram?: string;
  email?: string;
  spotify?: string;
  linkedin?: string;
  github?: string;
  website?: string;
  soundcloud?: string;
  twitter?: string; // Legacy
  sort_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTeamMemberById(id: string): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data || null;
}

export async function createTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .insert([member as any])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTeamMember(id: string, updates: Partial<TeamMember>): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
