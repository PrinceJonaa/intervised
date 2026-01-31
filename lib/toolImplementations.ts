import { db } from './mockDb';
import { analyzeJournalEntry, matchChains } from './frameworkEngine';
import { TEAM_DATA } from '../constants';

export const toolImplementations = {
  /**
   * DIAGNOSTIC TOOLS - Moves beyond simple matching to actual insight extraction
   */
  diagnose_strategic_gap: (args: {
    symptoms: string[];
    context?: string;
    severity?: 'low' | 'medium' | 'high';
  }) => {
    const { symptoms, context = '', severity = 'medium' } = args;

    if (symptoms.length === 0) {
      return JSON.stringify({
        error: 'At least one symptom required',
        guidance: 'Describe specific pain points: e.g., ["low engagement", "inconsistent messaging"]'
      });
    }

    try {
      const matches = matchChains(symptoms);
      const topMatches = matches.slice(0, 3);

      return JSON.stringify({
        analysis: {
          symptom_count: symptoms.length,
          identified_patterns: symptoms,
          severity_level: severity,
          contextual_factors: context || 'Not provided'
        },
        diagnostics: topMatches.map((match, idx) => ({
          rank: idx + 1,
          pattern: match.chain.name,
          confidence: Math.round(match.confidence * 100),
          category: match.chain.category,
          root_cause: match.chain.description,
          intervention: match.chain.intervention,
          priority: idx === 0 ? 'immediate' : idx === 1 ? 'high' : 'medium'
        })),
        recommended_next_step: topMatches[0]
          ? `Focus on: ${topMatches[0].chain.intervention}`
          : 'Schedule strategic discovery session',
        confidence_overall: Math.round((topMatches[0]?.confidence || 0) * 100)
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Diagnostic analysis failed',
        fallback: 'Recommend scheduling a discovery call to deeply analyze the gaps'
      });
    }
  },

  /**
   * CONTENT GENERATION - More sophisticated framework, better structure
   */
  generate_content_blueprint: (args: {
    format: 'short_form_video' | 'blog_post' | 'email_sequence' | 'social_carousel';
    topic: string;
    audience: string;
    tone?: 'professional' | 'casual' | 'educational' | 'urgent';
    length?: 'quick' | 'standard' | 'deep';
  }) => {
    const { format, topic, audience, tone = 'professional', length = 'standard' } = args;

    const frameworks: Record<string, any> = {
      short_form_video: {
        structure: [
          { timestamp: '0-2s', element: 'Hook', guidance: 'Stop the scroll with a contrarian statement or visceral question' },
          { timestamp: '2-8s', element: 'Pattern Recognition', guidance: 'Show relatable problem or missed opportunity' },
          { timestamp: '8-25s', element: 'Insight Delivery', guidance: 'Single powerful idea or framework shift' },
          { timestamp: '25-30s', element: 'Call to Action', guidance: 'Clear next step—save, share, or follow' }
        ],
        platforms: ['TikTok', 'Instagram Reels', 'YouTube Shorts'],
        typical_length: '15-30 seconds'
      },
      blog_post: {
        structure: [
          { section: 'Opening Hook', wordcount: '50-100', purpose: 'Establish stakes' },
          { section: 'Problem Definition', wordcount: '200-300', purpose: 'Show you understand their pain' },
          { section: 'Root Cause Analysis', wordcount: '300-500', purpose: 'Connect dots, build credibility' },
          { section: 'Framework/Solution', wordcount: '400-600', purpose: 'Deliver primary value' },
          { section: 'Implementation Guide', wordcount: '200-400', purpose: 'Make it actionable' },
          { section: 'Conclusion & CTA', wordcount: '100-150', purpose: 'Tie back to stakes, drive next step' }
        ],
        seo_focus: `Optimize for: "${topic} for ${audience}"`,
        typical_length: '1200-2000 words'
      },
      email_sequence: {
        structure: [
          { email: 1, timing: 'Immediate', subject_hook: 'Question or Offer', goal: 'Open and curiosity' },
          { email: 2, timing: '+2 days', subject_hook: 'Social Proof / Authority', goal: 'Build credibility' },
          { email: 3, timing: '+5 days', subject_hook: 'Objection Handler', goal: 'Address concerns' },
          { email: 4, timing: '+7 days', subject_hook: 'Final CTA (scarcity)', goal: 'Drive action' }
        ],
        tone_note: `Use ${tone} tone throughout`,
        typical_opens: '35-55%'
      },
      social_carousel: {
        structure: [
          { slide: 1, element: 'Big Idea', guidance: 'One central thesis' },
          { slide: '2-N-1', element: 'Breakdown', guidance: 'Each slide = one sub-point with proof' },
          { slide: 'N', element: 'CTA', guidance: 'Comment, DM, or follow' }
        ],
        slide_count: length === 'quick' ? '3-5' : length === 'standard' ? '5-8' : '8-12',
        format_tip: 'Use bold text, emojis for visual breaks'
      }
    };

    const template = frameworks[format];
    if (!template) {
      return JSON.stringify({
        error: `Format '${format}' not recognized`,
        valid_formats: Object.keys(frameworks)
      });
    }

    return JSON.stringify({
      format,
      topic,
      target_audience: audience,
      tone,
      depth: length,
      blueprint: template,
      generation_tips: [
        'Start by writing for one specific person (your ideal audience member)',
        'Lead with the most unexpected insight, not the most obvious one',
        'Every section should answer: "Why should they care?"',
        'End with a micro-commitment, not a major ask'
      ]
    });
  },

  /**
   * TECH STACK - Real decisions, not just lists
   */
  recommend_tech_stack: (args: {
    use_case: string;
    team_size?: number;
    budget?: 'bootstrap' | 'funded_startup' | 'enterprise';
    existing_tools?: string[];
    priority?: 'speed_to_market' | 'scalability' | 'cost' | 'flexibility';
  }) => {
    const { use_case, budget = 'funded_startup', priority = 'speed_to_market', team_size = 1 } = args;
    const useCaseLower = use_case.toLowerCase();

    const stacks: Record<string, any> = {
      livestream_production: {
        capture: {
          bootstrap: ['OBS Studio (free)', 'Streamyard ($25/mo)'],
          funded_startup: ['OBS Studio + custom plugins', 'vMix ($60 one-time)'],
          enterprise: ['ProPresenter ($300/yr)', 'Sony ELC-M1 camera + Blackmagic ATEM Mini']
        },
        encoding: {
          bootstrap: ['OBS (built-in)'],
          funded_startup: ['Wirecast', 'vMix native encoding'],
          enterprise: ['Larix Broadcaster (iOS)', 'Haivision Makito encoder']
        },
        streaming: {
          bootstrap: ['YouTube Live', 'OBS + RTMP server'],
          funded_startup: ['YouTube', 'Restream.io ($19-99/mo)', 'StreamYard'],
          enterprise: ['Wowza Streaming Engine', 'AWS MediaLive', 'Cloudflare Stream']
        },
        cdn: {
          bootstrap: ['YouTube CDN (free)', 'Facebook Live'],
          funded_startup: ['Cloudflare Stream ($200/mo)', 'AWS'],
          enterprise: ['Akamai', 'Limelight', 'AWS CloudFront']
        }
      },
      content_creation_ai: {
        video_gen: {
          bootstrap: ['RunwayML free tier', 'Pika AI'],
          funded_startup: ['Synthesia ($25/mo)', 'D-ID ($100/mo)'],
          enterprise: ['Synthesia + API', 'Adobe Firefly integration']
        },
        voice_gen: {
          bootstrap: ['11Labs free tier', 'Google TTS'],
          funded_startup: ['11Labs ($23/mo)', 'ElevenLabs Pro'],
          enterprise: ['PlayHT API', 'Azure Text-to-Speech']
        },
        image_gen: {
          bootstrap: ['Midjourney free trial', 'Stable Diffusion (local)'],
          funded_startup: ['Midjourney ($10-120/mo)', 'Leonardo AI'],
          enterprise: ['Adobe Firefly (enterprise)', 'Stability API']
        }
      },
      backend_ai_integration: {
        model_routing: {
          bootstrap: ['Single provider (OpenAI or Claude)'],
          funded_startup: ['Multi-provider abstraction (Anthropic + OpenAI)', 'LiteLLM'],
          enterprise: ['vLLM', 'Ray Serve', 'custom load balancer']
        },
        orchestration: {
          bootstrap: ['Simple Node.js + axios'],
          funded_startup: ['LangChain', 'LlamaIndex'],
          enterprise: ['LangGraph', 'Temporal workflows']
        },
        observability: {
          bootstrap: ['Console logging + Sentry'],
          funded_startup: ['LangSmith', 'Braintrust'],
          enterprise: ['Datadog + custom dashboards', 'Weights & Biases']
        }
      }
    };

    const categoryMatch = Object.keys(stacks).find(key => useCaseLower.includes(key.replace(/_/g, ' ')));

    if (!categoryMatch) {
      return JSON.stringify({
        error: `Use case '${use_case}' not in template database`,
        guidance: 'Describe your use case more specifically',
        examples: Object.keys(stacks)
      });
    }

    const stack = stacks[categoryMatch];

    return JSON.stringify({
      use_case,
      budget_tier: budget,
      team_size,
      optimization_priority: priority,
      recommendations: Object.entries(stack).map(([category, options]: [string, any]) => ({
        category,
        selected_option: options[budget],
        alternatives: Object.entries(options)
          .filter(([tier]) => tier !== budget)
          .map(([tier, tools]) => ({ tier, tools })),
        rationale: priority === 'cost' ? 'Cheapest viable option' : 'Best speed-to-market'
      })),
      total_monthly_est: budget === 'bootstrap' ? '$0-50' : budget === 'funded_startup' ? '$150-500' : 'Enterprise pricing',
      setup_time: team_size === 1 ? '2-4 weeks' : '1-2 weeks (parallelizable)'
    });
  },

  /**
   * KNOWLEDGE GRAPH EXPLORATION - More than search
   */
  explore_knowledge_base: (args: {
    query: string;
    depth?: 'shallow' | 'deep';
    include_examples?: boolean;
  }) => {
    const { query, depth = 'shallow', include_examples = true } = args;
    const queryLower = query.toLowerCase();

    try {
      const chains = db.getChains();
      const glossary = db.getGlossary();

      const relatedStrategies = chains.filter(c =>
        c.name.toLowerCase().includes(queryLower) ||
        c.category?.toLowerCase().includes(queryLower) ||
        c.description?.toLowerCase().includes(queryLower)
      );

      const relatedTerms = glossary.filter(t =>
        t.term.toLowerCase().includes(queryLower) ||
        t.definition?.toLowerCase().includes(queryLower) ||
        t.tags.some(tag => tag.toLowerCase().includes(queryLower))
      );

      return JSON.stringify({
        query,
        search_depth: depth,
        results: {
          strategies_found: relatedStrategies.length,
          strategies: relatedStrategies.map(s => ({
            name: s.name,
            category: s.category,
            description: s.description,
            intervention: s.intervention,
            confidence: 'high'
          })),
          terms_found: relatedTerms.length,
          terms: relatedTerms.map(t => ({
            term: t.term,
            definition: t.definition,
            context_tags: t.tags
          }))
        },
        connections: depth === 'deep' ? {
          cross_strategy_insights: 'Available in deep dive',
          implementation_roadmap: 'Can be generated on request'
        } : null,
        next_actions: [
          relatedStrategies[0] ? `Deep dive into: ${relatedStrategies[0].name}` : '',
          include_examples ? 'Request implementation examples' : ''
        ].filter(Boolean)
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Knowledge base exploration failed',
        fallback_message: 'Query the team directly for insights'
      });
    }
  },

  /**
   * PROJECT TRACKING - Actually useful for team coordination
   */
  log_project_insight: (args: {
    note: string;
    project_name?: string;
    tags?: string[];
    visibility?: 'private' | 'team' | 'public';
  }) => {
    const { note, project_name, tags = [], visibility = 'team' } = args;

    try {
      const analysis = analyzeJournalEntry(note);

      db.saveJournalEntry({
        date: Date.now(),
        entry: note,
        project: project_name,
        tags,
        visibility,
        detectedChains: analysis.detectedChains.map(c => c.chain.id),
        detectedTerms: analysis.detectedTerms.map(t => t.id),
        emotionalTone: analysis.emotionalTone.primary,
        distortionRisk: analysis.distortionRisk.level,
        insights: analysis.insights,
        actionItems: []
      });

      return JSON.stringify({
        status: 'logged',
        project: project_name || 'Unlabeled',
        visibility,
        analysis: {
          tone: analysis.emotionalTone.primary,
          risk_level: analysis.distortionRisk.level,
          detected_patterns: analysis.detectedChains.map(c => c.chain.name),
          action_items: [],
          key_insights: analysis.insights
        },
        next_step: `Visibility set to ${visibility} — team can reference this insight`
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Failed to log insight',
        fallback: 'Note saved without analysis'
      });
    }
  },

  /**
   * ESTIMATION - Closer to reality
   */
  estimate_project_scope: (args: {
    service_types: string[];
    complexity?: 'simple' | 'moderate' | 'complex';
    rush?: boolean;
  }) => {
    const { service_types, complexity = 'moderate', rush = false } = args;

    const serviceCosts: Record<string, { hours: number; base_cost: number }> = {
      video_production: { hours: 16, base_cost: 1200 },
      photography_shoot: { hours: 8, base_cost: 600 },
      ai_chatbot: { hours: 20, base_cost: 1500 },
      livestream_setup: { hours: 12, base_cost: 900 },
      content_calendar_month: { hours: 10, base_cost: 800 },
      social_strategy: { hours: 12, base_cost: 1000 },
      graphic_design_package: { hours: 8, base_cost: 600 },
      website_copy: { hours: 6, base_cost: 500 }
    };

    let totalCost = 0;
    let totalHours = 0;
    const matched = [];

    service_types.forEach(st => {
      const normalized = st.toLowerCase();
      const match = Object.entries(serviceCosts).find(([key]) =>
        normalized.includes(key.replace(/_/g, ' '))
      );
      if (match) {
        const [key, { hours, base_cost }] = match;
        totalHours += hours;
        totalCost += base_cost;
        matched.push(key);
      }
    });

    const complexityMultiplier = complexity === 'simple' ? 0.75 : complexity === 'complex' ? 1.5 : 1;
    const rushMultiplier = rush ? 1.4 : 1;
    const finalCost = Math.round(totalCost * complexityMultiplier * rushMultiplier);

    return JSON.stringify({
      services_requested: service_types,
      matched_services: matched,
      complexity_tier: complexity,
      rush_production: rush,
      estimate: {
        base_cost: totalCost,
        estimated_hours: totalHours,
        complexity_adjustment: `${Math.round((complexityMultiplier - 1) * 100)}%`,
        rush_adjustment: rush ? '+40%' : 'none',
        final_estimate_range: `$${Math.round(finalCost * 0.95)} - $${Math.round(finalCost * 1.05)}`,
        timeline: rush ? '1-2 weeks' : '3-4 weeks'
      },
      breakdown: matched.map(service => {
        const { base_cost, hours } = serviceCosts[service];
        return {
          service,
          hours,
          base_cost,
          adjusted: Math.round(base_cost * complexityMultiplier * rushMultiplier)
        };
      }),
      disclaimer: 'Final quote provided after discovery call'
    });
  },

  /**
   * CONTENT SEARCH - With sentiment and relevance ranking
   */
  search_content_archive: (args: {
    query: string;
    content_type?: 'blog' | 'case_study' | 'video' | 'whitepaper' | 'all';
    sentiment?: 'positive' | 'neutral' | 'cautionary' | 'all';
    sort_by?: 'relevance' | 'recency' | 'engagement';
  }) => {
    const { query, content_type = 'all', sentiment = 'all', sort_by = 'relevance' } = args;
    const queryLower = query.toLowerCase();

    try {
      let allContent = db.getPosts();

      // Use cached normalized content if available to avoid repeated toLowerCase calls
      // Attach cache to db object to persist across tool executions
      const dbWithCache = db as any;
      // Compute a signature for cache invalidation based on content length and last modified times.
      // This detects updates, additions, and deletions more reliably than just checking the first post.
      const signature = allContent.length + '-' + allContent.reduce((sum, p) => sum + (p.lastModified || p.timestamp || 0), 0);

      if (!dbWithCache._searchCache || dbWithCache._searchCache.signature !== signature) {
        dbWithCache._searchCache = {
          signature,
          items: allContent.map((p: any) => ({
            original: p,
            titleLower: p.title.toLowerCase(),
            contentLower: p.content.toLowerCase(),
            tagsLower: p.tags.map((t: string) => t.toLowerCase())
          }))
        };
      }

      // Filter by query using cache
      let matches = dbWithCache._searchCache.items
        .filter((item: any) =>
          item.titleLower.includes(queryLower) ||
          item.contentLower.includes(queryLower) ||
          item.tagsLower.some((t: string) => t.includes(queryLower))
        )
        .map((item: any) => item.original);

      // Filter by category (using category as content_type proxy)
      if (content_type !== 'all') {
        matches = matches.filter(p => p.category.toLowerCase() === content_type.toLowerCase());
      }

      // Filter by sentiment
      if (sentiment !== 'all') {
        const sentimentMap: Record<string, string[]> = {
          positive: ['hope', 'sacred', 'good', 'light', 'truth', 'stewardship', 'growth'],
          cautionary: ['risk', 'burnout', 'failure', 'wrong', 'trap', 'distortion'],
          neutral: ['framework', 'process', 'system', 'method', 'definition']
        };

        matches = matches.filter(p => {
          const keywords = sentimentMap[sentiment] || [];
          return keywords.some(k => p.content.toLowerCase().includes(k));
        });
      }

      // Sort
      if (sort_by === 'recency') matches.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      if (sort_by === 'engagement') matches.sort((a, b) => (b.views || 0) - (a.views || 0));

      return JSON.stringify({
        query,
        filters: { content_type, sentiment, sort_by },
        total_matches: matches.length,
        results: matches.slice(0, 5).map(p => ({
          title: p.title,
          category: p.category,
          excerpt: p.excerpt,
          tags: p.tags,
          link: `/content/${p.slug}`,
          engagement: { views: p.views || 0 }
        })),
        recommendation: matches.length === 0 ? 'Try broader search terms' : `Found ${matches.length} relevant pieces`
      });
    } catch (error) {
      return JSON.stringify({
        error: 'Content search failed',
        fallback: 'Contact team for content recommendations'
      });
    }
  },

  /**
   * TEAM COORDINATION
   */
  get_team_contact: (args: { name: string; field?: 'email' | 'socials' | 'all' }) => {
    const { name, field = 'all' } = args;
    const nameLower = name.toLowerCase();

    const member = TEAM_DATA.find(t => t.name.toLowerCase().includes(nameLower));

    if (!member) {
      return JSON.stringify({
        error: `Team member '${name}' not found`,
        guidance: 'Valid team members: ' + TEAM_DATA.map(t => t.name).join(', ')
      });
    }

    const response: any = {
      name: member.name,
      role: member.role
    };

    if (field === 'email' || field === 'all') response.email = member.links.email;
    if (field === 'socials' || field === 'all') response.socials = member.links;

    return JSON.stringify(response);
  },

  /**
   * OUTBOUND COORDINATION
   */
  initiate_contact_workflow: (args: {
    from_name: string;
    from_email: string;
    subject: string;
    message: string;
    request_type?: 'general' | 'booking' | 'collaboration' | 'support';
  }) => {
    const { from_name, from_email, subject, message, request_type = 'general' } = args;

    if (!from_email.includes('@')) {
      return JSON.stringify({
        error: 'Invalid email address',
        guidance: 'Provide a valid email address'
      });
    }

    db.saveContactMessage({
      id: `MSG-${Date.now()}`,
      from: from_name,
      email: from_email,
      type: request_type,
      subject,
      message,
      timestamp: Date.now(),
      status: 'pending_review'
    });

    return JSON.stringify({
      status: 'initiated',
      confirmation: `Message from ${from_name} received and queued`,
      request_type,
      next_step: 'Team will respond within 24-48 hours',
      reference_id: `MSG-${Date.now()}`
    });
  }
};
