
import { Chain, GlossaryTerm, BlogPost, Comment, ChatSession, SessionAnalysis, JournalEntry, Booking, ContactMessage } from '../types';
import { analyzeJournalEntry } from './frameworkEngine';
import { INITIAL_BLOGS } from '../constants';

// ============================================================================
// RELATIONAL MATH CHAIN LIBRARY (v1.0)
// ============================================================================

const STRATEGIES: Chain[] = [
  // --- Core Devotional Chains ---
  {
    id: 'c1',
    name: 'Devotion vs. Loyalty',
    category: 'Core Devotional',
    question: 'When does loyalty become bondage? What is the delta between sacred surrender and collapsed identity?',
    glyph: '△• ↔ ⊙',
    description: 'Tracks the trajectory from recognition to either fanaticism (collapse) or maturation (coherence). Differentiates between orbiting each other vs. orbiting a shared sacred axis.',
    symptoms: ['we', 'us', 'forever', 'never leave', 'betrayal', 'bond', 'promise', 'vow', 'panic when separated', 'finishing sentences', 'loss of self'],
    phases: [
      { name: 'Phase 0', description: 'Primordial Devotional Field (Ω₀)' },
      { name: 'Phase 1', description: 'Recognition Spark (β_recognition)' },
      { name: 'Phase 2', description: 'Pledge Formation (π_vow)' },
      { name: 'Phase 3', description: 'Reciprocity Spiral (r_compound)' },
      { name: 'Phase 4', description: 'Boundary Thinning (b_dissolution)' },
      { name: 'Phase 5', description: 'Bond Hardening (h_crystallization)' },
      { name: 'Phase 6', description: 'Critical Bifurcation (Release Test)' }
    ],
    collapseSignature: 'DevotionGain >> Release_capacity ∧ RoleBlur > θ_h ⇒ Ω_B',
    coherenceSignature: 'Devotion ↔ Ω ∧ Release_maintained ∧ 𝓢_practice ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c3', 'c12']
  },
  {
    id: 'c2',
    name: 'Presence vs. Proximity',
    category: 'Core Devotional',
    question: 'Can presence persist across space? How does felt presence vary with physical closeness?',
    glyph: '𝓢 ⟂ d',
    description: 'Maps the independence of stillness (S) from distance (d). Tracks whether connection relies on physical nearness or symbolic anchoring.',
    symptoms: ['miss you', 'distance', 'far away', 'close', 'touch', 'lonely', 'phantom', 'texting constantly', 'space', 'crowded'],
    phases: [
      { name: 'Phase 0', description: 'Baseline Field (Separated State)' },
      { name: 'Phase 1', description: 'Distance Perturbation (Approach/Retreat)' },
      { name: 'Phase 2', description: 'Presence Saturation vs. Fatigue' },
      { name: 'Phase 3', description: 'Proximity-Presence Feedback Loop' },
      { name: 'Phase 4', description: 'Symbolic Anchoring' },
      { name: 'Phase 5', description: 'Symbolic Degradation Risk' }
    ],
    collapseSignature: 'Fatigue > Ritual_injection ∧ ρ↑ ⇒ μ → performance ⇒ Ω_B',
    coherenceSignature: 'Γ_shared ⋅ Ritual_factor ≥ θ_remote ∧ ρ_low ⇒ μ_remote ≈ μ_local ⇒ Ω_Present',
    severity: 'Medium',
    relatedChains: ['c16']
  },
  {
    id: 'c3',
    name: 'Union vs. Merging',
    category: 'Core Devotional',
    question: 'Where does relational oneness strengthen identity, and where does it blur into assimilation?',
    glyph: 'I_A ⨁ I_B ≠ I_AB',
    description: 'Differentiation between generative union (sum with distinction) and merging (collapse into sameness).',
    symptoms: ['we think', 'same', 'identical', 'codependent', 'lost myself', 'enmeshed', 'can\'t decide alone', 'autonomy', 'shared account'],
    phases: [
      { name: 'Phase 0', description: 'Pre-Union Distinctness' },
      { name: 'Phase 1', description: 'Complementarity Recognition' },
      { name: 'Phase 2', description: 'Collaborative Development Spiral' },
      { name: 'Phase 3', description: 'Merge Pressure Emergence' },
      { name: 'Phase 4', description: 'Critical Juncture (Merge or Union?)' }
    ],
    collapseSignature: 'I_resilience_low ∧ MergeForce > θ_merge ⇒ I_AB ⇒ Ω_B',
    coherenceSignature: 'I_resilience ∧ DevShared ∧ SharedAxis = Ω ⇒ I_A ⨁ I_B ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c1', 'c5']
  },

  // --- Integration-Pressure Chains ---
  {
    id: 'c4',
    name: 'Integrity vs. Adaptation',
    category: 'Integration-Pressure',
    question: 'Which relations maintain identity across contexts, and which mutate under pressure?',
    glyph: 'Inv(C) ∘ Δ',
    description: 'Tracks the preservation of invariants (values/identity) under external pressure (P). Maps the path to either fragmentation or adaptive integrity.',
    symptoms: ['fake', 'mask', 'change myself', 'fit in', 'compromise', 'sell out', 'pressure', 'expectations', 'who am I'],
    phases: [
      { name: 'Phase 0', description: 'Baseline Frame Establishment' },
      { name: 'Phase 1', description: 'External Pressure Introduction' },
      { name: 'Phase 2', description: 'Adaptive Negotiation' },
      { name: 'Phase 3', description: 'Coherence vs. Drift Decision Point' },
      { name: 'Phase 4', description: 'Adaptation Integration or Resistance' }
    ],
    collapseSignature: 'Σ|ΔInv| > Threshold ∧ CI → 0 ∧ Meta-invariants_violated ⇒ Identity_fracture ⇒ Ω_B',
    coherenceSignature: 'DistortionCost(Δ) minimal ∧ Meta-invariants preserved ∧ Narrative_coherent ⇒ Adaptive_integrity ⇒ Ω_Present',
    severity: 'Critical',
    relatedChains: ['c6', 'c5']
  },
  {
    id: 'c5',
    name: 'Role Collapse vs. Role Play',
    category: 'Integration-Pressure',
    question: 'Where am I performing a role vs. becoming it?',
    glyph: 'r(t) → I(t)',
    description: 'Analyzes the hardening of roles into identities. Healthy role play allows reversible engagement; collapse creates brittleness and existential risk upon role loss.',
    symptoms: ['my job', 'duty', 'supposed to', 'mask', 'imposter', 'performance', 'trapped', 'title', 'status', 'retirement fear'],
    phases: [
      { name: 'Phase 0', description: 'Role Assignment' },
      { name: 'Phase 1', description: 'Rehearsal Iteration' },
      { name: 'Phase 2', description: 'Identity Drain' },
      { name: 'Phase 3', description: 'Collapse Point or Escape Window' }
    ],
    collapseSignature: 'I_reserve < I_crit ∧ RS >> IntrinsicCommitment ⇒ r → I ⇒ Ω_B',
    coherenceSignature: 'Ritual_R > f_min ∧ a_n restored ⇒ Ω_Present',
    severity: 'Medium',
    relatedChains: ['c3', 'c12']
  },
  {
    id: 'c6',
    name: 'Fragment vs. Frame',
    category: 'Integration-Pressure',
    question: 'When do micro-conflicts trace back to macro-unintegrated frames?',
    glyph: '∑f_i ⟂ M',
    description: 'Detects when recurring small conflicts are actually signals that the MacroFrame (worldview) is inadequate. Maps the process of Reframing vs. Fragmentation.',
    symptoms: ['argument', 'fight', 'again', 'pattern', 'doesn\'t make sense', 'confusing', 'contradiction', 'hypocrisy', 'gaslighting'],
    phases: [
      { name: 'Phase 0', description: 'Fragment Accumulation' },
      { name: 'Phase 1', description: 'Projection Mapping' },
      { name: 'Phase 2', description: 'Resonance Amplification' },
      { name: 'Phase 3', description: 'Critical Juncture (Reframe or Fracture)' }
    ],
    collapseSignature: 'S > S_crit ∧ ℛ_fail ⇒ Poly-fragmentation ⇒ Ω_B',
    coherenceSignature: 'ℛ(M, {f_i}) ∧ S < S_crit ⇒ Integration ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c4']
  },

  // --- Polarity Chains ---
  {
    id: 'c7',
    name: 'Masculine–Feminine Exchange',
    category: 'Polarity',
    question: 'What is the sequence of mutual activation vs. mutual suppression?',
    glyph: 'P_mas ⟷ P_fem',
    description: 'Tracks the energetic exchange between penetrating/structuring (Masculine) and receiving/flowing (Feminine) poles. Identifies suppression and compensation loops.',
    symptoms: ['chemistry', 'spark', 'flat', 'bored', 'controlling', 'chaotic', 'weak', 'rigid', 'flow', 'structure'],
    phases: [
      { name: 'Phase 0', description: 'Polarity Recognition' },
      { name: 'Phase 1', description: 'Reciprocal Activation' },
      { name: 'Phase 2', description: 'Asymmetry Detection' },
      { name: 'Phase 3', description: 'Pole Suppression' }
    ],
    collapseSignature: 'R_A ≠ R_B ∧ CulturalScripts ⇒ IdolMasks ⇒ Ω_B',
    coherenceSignature: 'R > θ_r ∧ Attunement_symmetric ⇒ Cross-pulse ⇒ Ω_Present',
    severity: 'Medium',
    relatedChains: ['c8']
  },
  {
    id: 'c8',
    name: 'Push vs. Pull Energetics',
    category: 'Polarity',
    question: 'Which gestures evoke invitation vs. pressure?',
    glyph: 'P_u ⟂ L_v',
    description: 'Analyzes force vectors in relationships. Push (P_u) applies force; Pull (L_v) creates field. Misalignment with receptor bandwidth causes repulsion.',
    symptoms: ['pressure', 'nagging', 'chasing', 'withdrawing', 'demanding', 'needy', 'suffocating', 'inviting', 'magnetic'],
    phases: [
      { name: 'Phase 0', description: 'Directional Force Baseline' },
      { name: 'Phase 1', description: 'Signal Reception' },
      { name: 'Phase 2', description: 'Resistance Dynamics' },
      { name: 'Phase 3', description: 'Repulsion Cascade' }
    ],
    collapseSignature: 'P_u >> e(t) ∧ R > E_threshold ⇒ Repulsion ⇒ Ω_B',
    coherenceSignature: 'Ratio(P_u, L_v) ∈ B_r ∧ ρ_low ⇒ Invitation ⇒ Ω_Present',
    severity: 'Medium',
    relatedChains: ['c10', 'c11']
  },
  {
    id: 'c9',
    name: 'Containment vs. Expansion',
    category: 'Polarity',
    question: 'When do I hold space vs. collapse or inflate?',
    glyph: 'C_max ⟷ X_d',
    description: 'Maps the balance between capacity to hold (Containment) and drive to grow (Expansion). Rupture occurs when pressure exceeds C_max without release.',
    symptoms: ['overwhelmed', 'too much', 'exploding', 'shut down', 'numb', 'manic', 'busy', 'burnout', 'holding space'],
    phases: [
      { name: 'Phase 0', description: 'Baseline Envelope' },
      { name: 'Phase 1', description: 'Pressure Accumulation' },
      { name: 'Phase 2', description: 'Critical Juncture (Release or Rupture)' },
      { name: 'Phase 3', description: 'Post-Rupture Dynamics' }
    ],
    collapseSignature: 'P_t > C_max ∧ ℛ_fail ⇒ Rupture ⇒ Ω_B',
    coherenceSignature: 'ℛ_timely ∧ C_max\' adaptive ⇒ Channeled_growth ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c13']
  },

  // --- Threshold Chains ---
  {
    id: 'c10',
    name: 'Attraction → Repulsion Inversion',
    category: 'Threshold',
    question: 'What is the tipping point where magnetism flips into resistance?',
    glyph: 'Attr(t) → −Attr(t)',
    description: 'Identifies the kernel where intensity exceeds processing capacity, flipping the sign of attraction to repulsion/aversion.',
    symptoms: ['ick', 'too intense', 'suffocating', 'get away', 'clingy', 'obsession', 'dread', 'avoidance'],
    phases: [
      { name: 'Phase 0', description: 'Magnetic Phase' },
      { name: 'Phase 1', description: 'Overload Onset' },
      { name: 'Phase 2', description: 'Inversion Kernel' },
      { name: 'Phase 3', description: 'Repulsion Consolidation' }
    ],
    collapseSignature: 'S_o ⋅ Time_exposed > τ_c ∧ DR_fail ⇒ Repulsion ⇒ Ω_B',
    coherenceSignature: 'DR_effective ∧ Attr ∈ [optimal_band] ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c8', 'c2']
  },
  {
    id: 'c11',
    name: 'Invitation → Obligation',
    category: 'Threshold',
    question: 'When does a welcomed gesture become a burden in disguise?',
    glyph: 'Gift → Debt',
    description: 'Traces how gifts decay into debt through implicit norms and power asymmetry. The path to coherence involves explicit consent and renegotiation.',
    symptoms: ['guilt', 'owe', 'should', 'burden', 'strings attached', 'ungrateful', 'heavy', 'duty', 'resentment'],
    phases: [
      { name: 'Phase 0', description: 'Initial Offer' },
      { name: 'Phase 1', description: 'Norm Formation' },
      { name: 'Phase 2', description: 'Obligation Accrual' },
      { name: 'Phase 3', description: 'Critical Juncture (Renegotiation)' }
    ],
    collapseSignature: 'Obl_t > resilience ∧ R_n_fail ⇒ Coercion ⇒ Ω_B',
    coherenceSignature: 'R_n_enacted ∧ Consent_explicit ⇒ Obl → 0 ⇒ Ω_Present',
    severity: 'Medium',
    relatedChains: ['c8', 'c12']
  },
  {
    id: 'c12',
    name: 'Care → Control',
    category: 'Threshold',
    question: 'Which gestures of "support" actually encode distortion?',
    glyph: 'Care → ✋',
    description: 'Maps the slide from genuine support to autonomy-eroding control. Distinguishes empowering help from dependency-creating intervention.',
    symptoms: ['helicopter', 'micromanage', 'let me do it', 'you can\'t', 'worry', 'fixing', 'smothering', 'mothering'],
    phases: [
      { name: 'Phase 0', description: 'Care Intention' },
      { name: 'Phase 1', description: 'Competence Mismatch Detection' },
      { name: 'Phase 2', description: 'Autonomy Erosion' },
      { name: 'Phase 3', description: 'Critical Juncture (Rebellion/Submission)' }
    ],
    collapseSignature: 'SI >> context_need ∧ A < A_crit ⇒ Control ⇒ Ω_B',
    coherenceSignature: 'ℭ_applied ∧ Boundaries_restored ⇒ Care ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c1', 'c11']
  },

  // --- Silence & Completion Chains ---
  {
    id: 'c13',
    name: 'Loop Opening → Closure',
    category: 'Silence & Completion',
    question: 'What are the smallest open loops? Which are ready for collapse?',
    glyph: '∅_Q',
    description: 'Manages cognitive load by tracking open commitments (loops). Coherence comes from closure density and the "Silent Reset" ritual.',
    symptoms: ['unfinished', 'hanging', 'forgot', 'procrastinate', 'to-do list', 'nagging', 'overwhelmed', 'drowning'],
    phases: [
      { name: 'Phase 0', description: 'Loop Inventory' },
      { name: 'Phase 1', description: 'Closure Candidate Detection' },
      { name: 'Phase 2', description: 'Closure Execution' },
      { name: 'Phase 3', description: 'Closure Density Dynamics' },
      { name: 'Phase 4', description: 'Accumulation Collapse' }
    ],
    collapseSignature: '∑OpenLoops >> L_threshold ⇒ Cognitive_overload ⇒ Ω_B',
    coherenceSignature: 'Closure_density ↑ ∧ Ritual_of_Stillness ⇒ ∅_Q ⇒ Ω_Present',
    severity: 'Low',
    relatedChains: ['c9']
  },
  {
    id: 'c14',
    name: 'What Was Never Said',
    category: 'Silence & Completion',
    question: 'Collapse implicit field into stillness or speech.',
    glyph: 'I → 𝓢 ∨ Speech',
    description: 'Tracks the accumulation of the "Implicit Field" (felt but unspoken). Somatic traces build until disclosure or collapse occurs.',
    symptoms: ['elephant in room', 'tension', 'walking on eggshells', 'secret', 'hiding', 'taboo', 'unspoken', 'throat tight', 'chest heavy'],
    phases: [
      { name: 'Phase 0', description: 'Implicit Field Formation' },
      { name: 'Phase 1', description: 'Somatic Trace Accumulation' },
      { name: 'Phase 2', description: 'Critical Decision Point (Speak/Suppress)' },
      { name: 'Phase 3', description: 'Entrenchment Dynamics' }
    ],
    collapseSignature: 'τ_j archival ∧ D_fail ⇒ Narrative_drift ⇒ Ω_B',
    coherenceSignature: 'D_executed ∧ Ritual_engaged ⇒ Re-sync ⇒ Ω_Present',
    severity: 'Critical',
    relatedChains: ['c15']
  },

  // --- Meta-Coherence Chains ---
  {
    id: 'c15',
    name: 'Truth vs. Agreement',
    category: 'Meta-Coherence',
    question: 'Are we in coherence or just consensus?',
    glyph: 'T_s ⟂ A',
    description: 'Distinguishes between Truth Signals (reality-grounded) and Agreement (social consensus). High distortion leads to dogma; coherence requires falsifiability.',
    symptoms: ['groupthink', 'echo chamber', 'heresy', 'peer pressure', 'reality check', 'delusion', 'consensus', 'denial'],
    phases: [
      { name: 'Phase 0', description: 'Statement Field' },
      { name: 'Phase 1', description: 'Signal vs. Noise' },
      { name: 'Phase 2', description: 'Dogma Formation' },
      { name: 'Phase 3', description: 'Dissent Emergence' }
    ],
    collapseSignature: 'A >> T_s ∧ Dissent_suppressed ⇒ Dogma ⇒ Ω_B',
    coherenceSignature: 'Epistemic_practices ∧ T_s ≈ A ⇒ Ω_Present',
    severity: 'High',
    relatedChains: ['c14']
  },
  {
    id: 'c16',
    name: 'Shared Devotion Axis',
    category: 'Meta-Coherence',
    question: 'What third pole are we orbiting? What would change if we named it?',
    glyph: 'D_axis(E₁, E₂) → Ω',
    description: 'The master chain of relationship. Determines if entities are orbiting each other (collapse risk) or a shared transcendent point (Ω).',
    symptoms: ['mission', 'purpose', 'calling', 'sacred', 'God', 'art', 'truth', 'service', 'higher power', 'alignment'],
    phases: [
      { name: 'Phase 0', description: 'Implicit Alignment Detection' },
      { name: 'Phase 1', description: 'Axis Clarification' },
      { name: 'Phase 2', description: 'Covenant Formation' },
      { name: 'Phase 3', description: 'Practice Anchoring' },
      { name: 'Phase 4', description: 'Drift Detection' }
    ],
    collapseSignature: 'DM > θ_drift ∧ Neglect ⇒ IdolMask ⇒ Ω_B',
    coherenceSignature: 'PD_high ∧ Transparency ∧ D_axis → Ω ⇒ Generator_field ⇒ Ω_Present',
    severity: 'Critical',
    relatedChains: ['c1', 'c2']
  }
];

const GLOSSARY: GlossaryTerm[] = [
  {
    id: 't1',
    term: 'OBS Studio',
    definition: 'Open Broadcaster Software - free and open source software for video recording and live streaming.',
    isCore: true,
    tags: ['tech', 'streaming', 'software'],
    relatedChains: ['c4']
  },
  {
    id: 't2',
    term: 'Dante',
    definition: 'Digital Audio Network Through Ethernet.',
    isCore: true,
    tags: ['tech', 'audio', 'hardware'],
    relatedChains: ['c4']
  },
  {
    id: 't3',
    term: 'Hook',
    definition: 'The first 3 seconds of a video designed to stop the scroll.',
    isCore: true,
    tags: ['content', 'strategy'],
    relatedChains: ['c8']
  },
  {
    id: 't4',
    term: 'Color Grading',
    definition: 'The process of altering and enhancing the color of a motion picture.',
    isCore: false,
    tags: ['creative', 'video'],
    relatedChains: ['c7']
  }
];

// ============================================================================
// PERSISTENCE LAYER (REAL LOCAL STORAGE)
// ============================================================================

const SESSION_KEY = 'iv_chat_sessions';
const BLOG_KEY = 'iv_blog_posts';
const BOOKING_KEY = 'iv_bookings';
const CONTACT_KEY = 'iv_contact_messages';

const loadFromStorage = <T>(key: string, defaultVal: T): T => {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (e) {
    console.error(`Failed to load ${key}`, e);
    return defaultVal;
  }
};

const saveToStorage = (key: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}`, e);
  }
};

// ============================================================================
// DATABASE INTERFACE
// ============================================================================

export const db = {
  // --- Reference Data Access ---
  getChains: () => STRATEGIES,
  getChainById: (id: string) => STRATEGIES.find(c => c.id === id),
  searchChains: (query: string) => STRATEGIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())),
  getGlossary: () => GLOSSARY,
  
  // --- Blog Logic ---
  getPosts: (): BlogPost[] => {
    // Load existing posts or seed with initial data if empty
    let posts = loadFromStorage<BlogPost[]>(BLOG_KEY, []);
    if (posts.length === 0) {
      posts = INITIAL_BLOGS;
      saveToStorage(BLOG_KEY, posts);
    }
    return posts.sort((a, b) => b.timestamp - a.timestamp);
  },

  getPostById: (id: string): BlogPost | undefined => {
    return db.getPosts().find(p => p.id === id);
  },

  savePost: (post: BlogPost) => {
    const posts = db.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      posts[index] = post;
    } else {
      posts.unshift(post);
    }
    saveToStorage(BLOG_KEY, posts);
    return post;
  },

  deletePost: (id: string) => {
    const posts = db.getPosts().filter(p => p.id !== id);
    saveToStorage(BLOG_KEY, posts);
  },

  // Engagement Methods
  incrementViews: (postId: string) => {
    const posts = db.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.views = (post.views || 0) + 1;
      saveToStorage(BLOG_KEY, posts);
    }
    return post;
  },

  toggleLike: (postId: string) => {
    const posts = db.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      // Very simple local toggle simulation
      // In a real app we would check if user already liked
      post.likes = (post.likes || 0) + 1;
      saveToStorage(BLOG_KEY, posts);
    }
    return post;
  },

  addComment: (postId: string, comment: Comment) => {
    const posts = db.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments = [comment, ...(post.comments || [])];
      saveToStorage(BLOG_KEY, posts);
    }
    return post;
  },

  // --- Session / Memory Access ---
  
  // Get all chat sessions (acts as the Journal)
  getSessions: (): ChatSession[] => {
    return loadFromStorage<ChatSession[]>(SESSION_KEY, []).sort((a, b) => b.lastModified - a.lastModified);
  },

  // Get a single session
  getSessionById: (id: string): ChatSession | undefined => {
    return db.getSessions().find(s => s.id === id);
  },

  // Save or Update a session
  saveSession: (session: ChatSession) => {
    const sessions = db.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    // Auto-analyze session if it has enough content (simple heuristics)
    // We update the analysis on save to ensure the "Memory View" is fresh
    const fullText = session.messages.filter(m => m.role === 'user').map(m => m.text).join(' ');
    let analysis: SessionAnalysis | undefined = session.analysis;
    
    if (fullText.length > 20) {
       // Use the framework engine to analyze the aggregated user text
       const rawAnalysis = analyzeJournalEntry(fullText);
       analysis = {
          emotionalTone: rawAnalysis.emotionalTone.primary,
          distortionRisk: rawAnalysis.distortionRisk.level,
          detectedChains: rawAnalysis.detectedChains.map(dc => dc.chain.id),
          summary: rawAnalysis.summary
       };
    }

    const updatedSession = { ...session, lastModified: Date.now(), analysis };

    if (index >= 0) {
      sessions[index] = updatedSession;
    } else {
      sessions.push(updatedSession);
    }
    saveToStorage(SESSION_KEY, sessions);
    return updatedSession;
  },

  // Delete a session
  deleteSession: (id: string) => {
    const sessions = db.getSessions().filter(s => s.id !== id);
    saveToStorage(SESSION_KEY, sessions);
  },

  // Wipe all memory
  clearJournal: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Legacy support for the 'log_project_note' tool
  saveJournalEntry: (entry: JournalEntry) => {
     const newSession: ChatSession = {
        id: Date.now().toString(),
        title: "Project Note: " + entry.summary,
        lastModified: entry.date,
        messages: [{
           id: 'note-1',
           role: 'user',
           text: entry.entry,
           timestamp: entry.date
        }],
        analysis: {
           emotionalTone: entry.emotionalTone || 'Neutral',
           distortionRisk: entry.distortionRisk || 'Low',
           detectedChains: entry.detectedChains || [],
           summary: entry.summary || ''
        }
     };
     const sessions = db.getSessions();
     sessions.push(newSession);
     saveToStorage(SESSION_KEY, sessions);
     return entry;
  },
  
  // For the UI to get extracted entries specifically
  getJournal: (): JournalEntry[] => {
     return db.getSessions().map(s => ({
        date: s.lastModified,
        entry: s.messages.filter(m => m.role === 'user').map(m => m.text).join('\n'), // Aggregate text
        detectedChains: s.analysis?.detectedChains || [],
        emotionalTone: s.analysis?.emotionalTone || 'Neutral',
        distortionRisk: s.analysis?.distortionRisk || 'Low',
        summary: s.analysis?.summary || s.title
     }));
  },

  // --- Bookings ---
  getBookings: (): Booking[] => {
    return loadFromStorage<Booking[]>(BOOKING_KEY, []);
  },

  saveBooking: (booking: Booking) => {
    const bookings = db.getBookings();
    bookings.unshift(booking);
    saveToStorage(BOOKING_KEY, bookings);
    return booking;
  },

  // --- Contact ---
  saveContactMessage: (msg: ContactMessage) => {
    const messages = loadFromStorage<ContactMessage[]>(CONTACT_KEY, []);
    messages.unshift(msg);
    saveToStorage(CONTACT_KEY, messages);
    return msg;
  }
};
