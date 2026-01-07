
export enum Page {
  HOME = 'HOME',
  SERVICES = 'SERVICES',
  TEAM = 'TEAM',
  BLOG = 'BLOG',
  CONTACT = 'CONTACT',
  CHAT = 'CHAT'
}

export interface ServiceOption {
  id: string;
  label: string;
  price: number;
}

export interface ServiceItem {
  id: string;
  category: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  hourly?: boolean; // If true, price scales with duration
  providers?: string[]; // e.g., ['Prince Jona', 'Reina Hondo']
  options?: ServiceOption[]; // Add-ons like 'Mixing', 'Mastering'
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceTitle: string;
  provider: string;
  date: number; // day of month
  timestamp: number;
  options: string[];
  totalPrice: number;
  context: string;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  date: number;
  avatar?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole?: string; // New: For author bio
  date: string;
  timestamp: number;
  lastModified: number;
  category: string; // New: Primary category
  tags: string[];
  imageUrl: string;
  status: 'draft' | 'published';
  readTime: number;
  views: number;    // New: Analytics
  likes: number;    // New: Engagement
  comments: Comment[]; // New: Community
  // SEO Fields
  metaDescription: string;
  keywords: string[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  status?: 'Online' | 'In Deep Work' | 'Offline' | 'On Set'; // New: QOL Status
  links: {
    instagram?: string;
    email?: string;
    spotify?: string;
  };
}

export interface Project {
  id: string;
  title: string;
  client: string;
  category: string;
  description: string;
  outcome: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  quote: string;
  projectType: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface User {
  name: string;
  email: string;
  isAdmin: boolean;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  toolCalls?: { name: string; args: any }[];
  toolResults?: { name: string; result: any }[];
}

export interface SessionAnalysis {
  emotionalTone: string;
  distortionRisk: string;
  detectedChains: string[]; // IDs of detected strategies
  summary: string;
}

export interface ChatSession {
  id: string;
  title: string;
  lastModified: number;
  messages: ChatMessage[];
  analysis?: SessionAnalysis; // The "Memory" aspect of a session
}

export type AIProvider = 'google' | 'openai' | 'claude' | 'grok' | 'azure' | 'intervised';

export interface ChatSettings {
  temperature: number;
  systemTone: 'formal' | 'creative' | 'technical';
  enableHistory: boolean;
  systemPrompt?: string;
  provider: AIProvider;
  customApiKey?: string;
  modelOverride?: string;
  azureEndpoint?: string;
  azureDeployment?: string;
}

// --- Advanced AI / Framework Types ---

export interface ChainPhase {
  name: string;
  description: string;
}

export interface Chain {
  id: string;
  name: string;
  category: string; // 'Core Devotional', 'Polarity', etc.
  question: string; // The core tension/question
  glyph: string; // The symbolic representation (e.g., "△• ↔ ⊙")
  description: string;
  symptoms: string[]; // Markers for detection
  triggers?: string[];
  phases: ChainPhase[];
  collapseSignature: string; // Mathematical/Symbolic path to Ω_B
  coherenceSignature: string; // Mathematical/Symbolic path to Ω_Present
  severity?: 'Low' | 'Medium' | 'High' | 'Critical'; // Legacy support
  intervention?: string; // Legacy support
  relatedChains?: string[];
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  isCore: boolean;
  tags: string[];
  relatedChains?: string[];
  relatedTerms?: string[];
  relatedPhases?: string[];
}

export interface JournalEntry {
  date: number;
  entry: string;
  project?: string;
  visibility?: 'private' | 'team' | 'public';
  emotionalTone?: string;
  distortionRisk?: string;
  detectedChains?: string[];
  detectedTerms?: string[];
  phaseHints?: string[];
  insights?: string[];
  summary?: string;
  tags?: string[];
  actionItems?: string[];
}

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: string; // JSON schema string
  code: string; // Function body string
  enabled: boolean;
  alwaysOn?: boolean;
}

export interface ContactMessage {
  id: string;
  from: string;
  email: string;
  type: string;
  subject: string;
  message: string;
  timestamp: number;
  status: string;
}
