
import { ServiceItem, TeamMember, BlogPost, Project, Testimonial, FAQItem } from './types';

export const SERVICES_DATA: ServiceItem[] = [
  // Creative
  { 
    id: 'vid', 
    category: 'Creative', 
    title: 'Videography', 
    description: 'Event or promotional video capture and editing.', 
    price: 300, 
    durationMinutes: 120,
    hourly: true,
    providers: ['Prince Jona'],
    options: [
      { id: 'drone', label: 'Drone Footage', price: 200 },
      { id: 'rush', label: '48hr Turnaround', price: 100 }
    ]
  },
  { 
    id: 'photo', 
    category: 'Creative', 
    title: 'Photography', 
    description: 'Portraits, product, or brand photography sessions.', 
    price: 200, 
    durationMinutes: 60,
    hourly: true,
    providers: ['Reina Hondo'],
    options: [
      { id: 'studio', label: 'Studio Rental', price: 75 },
      { id: 'looks', label: 'Extra Looks (Outfit)', price: 50 }
    ]
  },
  { 
    id: 'music', 
    category: 'Creative', 
    title: 'Music Production', 
    description: 'Original scoring, mixing, and recording.', 
    price: 400, 
    durationMinutes: 120,
    hourly: false,
    providers: ['Prince Jona', 'Reina Hondo'],
    options: [
      { id: 'mix', label: 'Mixing Only', price: -100 }, // Reduces base price
      { id: 'master', label: 'Mastering', price: 100 },
      { id: 'score', label: 'Cinematic Scoring', price: 200 }
    ]
  },
  
  // Tech
  { 
    id: 'ai', 
    category: 'Tech', 
    title: 'AI Bot Design', 
    description: 'Custom chatbot or automation bot setup.', 
    price: 10000, 
    durationMinutes: 60,
    hourly: false,
    providers: ['Prince Jona'],
    options: [
      { id: 'install', label: 'Website Integration', price: 1000 },
      { id: 'fine-tune', label: 'Custom LLM Fine-tuning', price: 2500 }
    ]
  },
  { 
    id: 'obs', 
    category: 'Tech', 
    title: 'OBS Setup', 
    description: 'Livestream configuration with custom scenes.', 
    price: 250, 
    durationMinutes: 60,
    hourly: false,
    providers: ['Prince Jona'],
    options: [
      { id: 'graphics', label: 'Custom Overlays', price: 100 },
      { id: 'remote', label: 'Remote Config', price: 0 }
    ]
  },
  { 
    id: 'auto', 
    category: 'Tech', 
    title: 'Automation Consulting', 
    description: 'Consultation for workflow automation.', 
    price: 150, 
    durationMinutes: 60,
    hourly: true,
    providers: ['Prince Jona']
  },

  // Content
  { 
    id: 'cap', 
    category: 'Content', 
    title: 'Caption Writing', 
    description: 'Captions for social video content.', 
    price: 75, 
    durationMinutes: 30,
    providers: ['Reina Hondo']
  },
  { 
    id: 'vcdf', 
    category: 'Content', 
    title: 'VCDF Packs', 
    description: 'Viral content distillation frameworks.', 
    price: 200, 
    durationMinutes: 60,
    providers: ['Prince Jona', 'Reina Hondo']
  },
  { 
    id: 'hash', 
    category: 'Content', 
    title: 'Hashtag Optimization', 
    description: 'Research and align optimal hashtags.', 
    price: 50, 
    durationMinutes: 30,
    providers: ['Reina Hondo']
  },

  // Growth
  { 
    id: 'ig', 
    category: 'Growth', 
    title: 'IG Growth Strategy', 
    description: 'Tactical growth map and engagement plan.', 
    price: 175, 
    durationMinutes: 60,
    providers: ['Prince Jona', 'Reina Hondo']
  },
  { 
    id: 'sched', 
    category: 'Growth', 
    title: 'Content Scheduling', 
    description: 'System setup for posting automation.', 
    price: 500, 
    durationMinutes: 60,
    hourly: false,
    providers: ['Prince Jona']
  },

  // Ministry
  { 
    id: 'live', 
    category: 'Ministry', 
    title: 'Church Livestream', 
    description: 'Full livestream solution for churches.', 
    price: 1000, 
    durationMinutes: 120,
    hourly: true,
    providers: ['Prince Jona'],
    options: [
      { id: 'audit', label: 'Existing Rig Audit', price: -100 },
      { id: 'train', label: 'Volunteer Training', price: 200 }
    ]
  },
  { 
    id: 'worship', 
    category: 'Ministry', 
    title: 'Worship Media', 
    description: 'Slides, lower thirds, visuals for services.', 
    price: 150, 
    durationMinutes: 60,
    providers: ['Reina Hondo']
  },
  { 
    id: 'kid', 
    category: 'Ministry', 
    title: 'Kids Ministry Kits', 
    description: 'Visual kits and tools for children\'s ministry.', 
    price: 100, 
    durationMinutes: 30,
    providers: ['Reina Hondo']
  },
];

export const PAST_PROJECTS: Project[] = [
  {
    id: 'p1',
    title: 'Housing Solutions NY Performance',
    client: 'Housing Solutions NY',
    category: 'Creative',
    description: 'Live violin performance and atmospheric sound design for annual gala (Reina, Nov 2025).',
    outcome: 'Created emotional resonance for fundraising appeal.'
  },
  {
    id: 'p2',
    title: '"Jesus" Single Release',
    client: 'Feat. Prince Jona',
    category: 'Creative',
    description: 'Production, mixing, and mastering for single release on Apple Music (2025).',
    outcome: 'Achieved professional sonic clarity and playlist placement.'
  },
  {
    id: 'p3',
    title: 'Grace Community Livestream',
    client: 'Grace Community Church',
    category: 'Ministry',
    description: 'Full livestream infrastructure setup and automation configuration (Jonathan, 2025).',
    outcome: 'Saved 10 hours a week answering repeated questions.'
  },
  {
    id: 'p4',
    title: 'Lumina Artist Suite',
    client: 'Lumina',
    category: 'Creative',
    description: 'Music production and social media content suite.',
    outcome: 'Cohesive visual and sonic brand identity across platforms.'
  }
];

export const CLIENT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    clientName: 'Pastor Sarah',
    role: 'Church Leader',
    quote: "Reina's violin brought our worship service to life. Her presence is as powerful as her playing.",
    projectType: 'Ministry Creative'
  },
  {
    id: 't2',
    clientName: 'Marcus T.',
    role: 'Small Business Owner',
    quote: "Jonathan set up our AI chatbot and it's already saved us 10 hours a week answering the same questions.",
    projectType: 'Tech Automation'
  }
];

export const FAQ_DATA: FAQItem[] = [
  {
    question: "Do you work with clients outside NYC?",
    answer: "Yes—remote projects welcome, especially for AI/automation and music production. In-person services (photography, events) are NYC-based."
  },
  {
    question: "What's your turnaround time?",
    answer: "Depends on scope. Simple edits: 3-5 days. Music production: 2-3 weeks. Full ministry suites: 4-8 weeks. Rush available for additional fee."
  },
  {
    question: "Can we do payment plans?",
    answer: "Yes—especially for churches and nonprofits. Typically 50% deposit, 50% on delivery. Monthly retainers available."
  },
  {
    question: "What if we're not sure what we need?",
    answer: "That's normal. Book a free discovery call—we'll help you clarify the actual problem before recommending solutions."
  }
];

export const TEAM_DATA: TeamMember[] = [
  {
    name: "Prince Jona",
    role: "Co-Founder & Tech Visionary",
    bio: "Artist, technologist, and seeker of truth. Jona exists at the threshold between aesthetics and systems — fluent in both AI frameworks and sonic storytelling. From music production to automation architecture, he builds bridges that make technology feel human and sacred.",
    image: "https://picsum.photos/400/500?grayscale&random=1",
    status: 'In Deep Work',
    links: { instagram: "https://instagram.com/princejona", email: "jona@intervised.com" }
  },
  {
    name: "Reina Hondo",
    role: "Co-Founder & Creative Catalyst",
    bio: "Multi-instrumentalist, storyteller, and spiritual curator from Queens. Classically trained, Reina bridges elevated artistry with street-level authenticity. She weaves worship, narrative, and sonic identity into cohesive brand experiences.",
    image: "https://picsum.photos/400/500?grayscale&random=2",
    status: 'On Set',
    links: { instagram: "https://instagram.com/reinahondo", spotify: "https://open.spotify.com/artist/reina", email: "reina@intervised.com" }
  }
];

export const INITIAL_BLOGS: BlogPost[] = [
  {
    id: '1',
    slug: 'the-theology-of-automation',
    title: 'The Theology of Automation',
    excerpt: 'Can code be sacred? Exploring the spiritual implications of letting machines handle the mundane.',
    content: 'In the beginning was the Word, and increasingly, the Prompt. As we automate our workflows, are we losing touch with the process, or freeing ourselves for higher forms of creation? Automation is not about replacement; it is about stewardship of time.\n\n## The Stewardship of Attention\n\nWhen we delegate the repetitive to the machine, we reclaim the unique faculty of the human spirit: to breathe life into the void. The algorithm can predict, but only the soul can purpose.\n\n### Why it Matters for Ministry\n\nToo many creative leaders burn out doing admin work that a script could handle. This isn\'t just inefficiency; it is distraction from the calling. By building robust systems, we build a container where the spirit can move freely without technical friction.',
    author: 'Prince Jona',
    authorRole: 'Technologist',
    date: 'Oct 24, 2025',
    timestamp: 1761264000000,
    lastModified: 1761264000000,
    category: 'Ministry',
    tags: ['Tech', 'AI', 'Workflow'],
    imageUrl: 'https://picsum.photos/800/400?grayscale&random=3',
    status: 'published',
    readTime: 3,
    metaDescription: 'An exploration of how automation and artificial intelligence can serve spiritual purposes in ministry and creativity.',
    keywords: ['automation', 'theology', 'AI', 'ministry tech', 'spiritual technology'],
    views: 1240,
    likes: 45,
    comments: [
      {
         id: 'c1',
         author: 'Sarah Miller',
         content: 'This perspective on stewardship completely changed how I view our church database. Thank you.',
         date: 1761350400000,
         avatar: 'https://ui-avatars.com/api/?name=Sarah+Miller&background=random'
      }
    ]
  },
  {
    id: '2',
    slug: 'sonic-architecture-for-worship',
    title: 'Sonic Architecture for Worship',
    excerpt: 'Designing soundscapes that facilitate presence rather than performance.',
    content: '# The Atmosphere of Presence\n\nWorship is not a genre; it is an orientation. When we design sound for sacred spaces, we are architects of atmosphere. The goal is transparency—where the tech disappears and only the encounter remains.\n\n## Floor vs. Ceiling\n\nToo often, we confuse volume for power and complexity for depth. True sonic architecture builds a floor for the congregation to stand on, not a ceiling they have to break through.\n\n### Practical Application\n\nStart with the padding. The ambient layer should be continuous, serving as the glue between songs. It removes the awkward silence that makes people self-conscious.',
    author: 'Reina Hondo',
    authorRole: 'Creative Director',
    date: 'Nov 02, 2025',
    timestamp: 1762041600000,
    lastModified: 1762041600000,
    category: 'Creative',
    tags: ['Music', 'Worship', 'Audio'],
    imageUrl: 'https://picsum.photos/800/400?grayscale&random=4',
    status: 'published',
    readTime: 4,
    metaDescription: 'A guide to designing soundscapes for worship services that prioritize presence and atmosphere over performance.',
    keywords: ['worship music', 'sound design', 'church audio', 'sonic architecture'],
    views: 890,
    likes: 62,
    comments: []
  }
];
