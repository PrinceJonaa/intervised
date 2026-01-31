
import { db } from './mockDb';
import { analyzeJournalEntry, detectChainsWithDetails, matchChains } from './frameworkEngine';
import { FunctionDeclaration, Type } from '@google/genai';
import { ToolDefinition, TeamMember } from '../types';
import { TEAM_DATA } from '../constants';
import { toolImplementations } from './toolImplementations';

// ==========================================================================================
// UTILITIES
// ==========================================================================================

/**
 * Calculates the Levenshtein distance between two strings.
 * Used by tools for fuzzy matching and similarity scoring.
 */
export const levenshteinDistance = (a: string, b: string): number => {
  if (a.length < b.length) {
    return levenshteinDistance(b, a);
  }

  const bLength = b.length;
  let prevRow = Array.from({ length: bLength + 1 }, (_, i) => i);
  let currentRow = new Array(bLength + 1).fill(0);

  for (let i = 1; i <= a.length; i++) {
    currentRow[0] = i;
    for (let j = 1; j <= bLength; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currentRow[j] = Math.min(
        prevRow[j] + 1,
        currentRow[j - 1] + 1,
        prevRow[j - 1] + cost
      );
    }

    const temp = prevRow;
    prevRow = currentRow;
    currentRow = temp;
  }

  return prevRow[bLength];
};

// ==========================================================================================
// SCHEMA DECLARATIONS (Tool definitions for LLM)
// ==========================================================================================

export const staticToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'diagnose_strategic_gap',
    description:
      'Analyzes symptoms or pain points to identify strategic gaps and recommend interventions. Goes beyond surface-level matching to provide prioritized diagnostic insights.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        symptoms: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Specific pain points: e.g., ["low engagement", "inconsistent branding", "poor conversion"]'
        },
        context: {
          type: Type.STRING,
          description: 'Optional background context about the situation'
        },
        severity: {
          type: Type.STRING,
          enum: ['low', 'medium', 'high'],
          description: 'How urgent is this gap?'
        }
      },
      required: ['symptoms']
    }
  },
  {
    name: 'generate_content_blueprint',
    description:
      'Creates a detailed content structure and framework based on format, topic, and audience. Provides actionable guidance for content creators.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        format: {
          type: Type.STRING,
          enum: ['short_form_video', 'blog_post', 'email_sequence', 'social_carousel'],
          description: 'Type of content to generate'
        },
        topic: {
          type: Type.STRING,
          description: 'Main subject of the content'
        },
        audience: {
          type: Type.STRING,
          description: 'Who this content is for'
        },
        tone: {
          type: Type.STRING,
          enum: ['professional', 'casual', 'educational', 'urgent'],
          description: 'Desired tone'
        },
        length: {
          type: Type.STRING,
          enum: ['quick', 'standard', 'deep'],
          description: 'Depth level'
        }
      },
      required: ['format', 'topic', 'audience']
    }
  },
  {
    name: 'recommend_tech_stack',
    description:
      'Recommends specific hardware/software combinations based on use case, budget, and team priorities. Includes cost estimates and rationale.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        use_case: {
          type: Type.STRING,
          description: 'e.g., "livestream_production", "content_creation_ai", "backend_ai_integration"'
        },
        team_size: {
          type: Type.INTEGER,
          description: 'Number of people setting this up'
        },
        budget: {
          type: Type.STRING,
          enum: ['bootstrap', 'funded_startup', 'enterprise'],
          description: 'Budget tier'
        },
        priority: {
          type: Type.STRING,
          enum: ['speed_to_market', 'scalability', 'cost', 'flexibility'],
          description: 'What matters most?'
        }
      },
      required: ['use_case']
    }
  },
  {
    name: 'explore_knowledge_base',
    description:
      'Searches the knowledge base for connections between concepts, strategies, and technical terms. Reveals relationships and implementation pathways.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'What to search for'
        },
        depth: {
          type: Type.STRING,
          enum: ['shallow', 'deep'],
          description: 'Shallow = direct matches, Deep = cross-connections'
        },
        include_examples: {
          type: Type.BOOLEAN,
          description: 'Include usage examples?'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'log_project_insight',
    description:
      'Records project notes with automatic pattern detection, tone analysis, and distortion risk assessment. Creates searchable, categorized insights.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        note: {
          type: Type.STRING,
          description: 'Your insight, observation, or project note'
        },
        project_name: {
          type: Type.STRING,
          description: 'Optional: which project does this relate to?'
        },
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Optional categorization tags'
        },
        visibility: {
          type: Type.STRING,
          enum: ['private', 'team', 'public'],
          description: 'Who should see this?'
        }
      },
      required: ['note']
    }
  },
  {
    name: 'estimate_project_scope',
    description:
      'Provides cost and timeline estimates for service packages. Accounts for complexity and rush scheduling.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        service_types: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Services needed: e.g., ["video_production", "ai_chatbot", "social_strategy"]'
        },
        complexity: {
          type: Type.STRING,
          enum: ['simple', 'moderate', 'complex'],
          description: 'Project complexity'
        },
        rush: {
          type: Type.BOOLEAN,
          description: 'Rush delivery needed?'
        }
      },
      required: ['service_types']
    }
  },
  {
    name: 'search_content_archive',
    description: 'Searches the content library with filters for type, sentiment, and sorting options. Helps users find relevant resources.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: 'What to search for'
        },
        content_type: {
          type: Type.STRING,
          enum: ['blog', 'case_study', 'video', 'whitepaper', 'all'],
          description: 'Filter by content type'
        },
        sentiment: {
          type: Type.STRING,
          enum: ['positive', 'neutral', 'cautionary', 'all'],
          description: 'Filter by tone/sentiment'
        },
        sort_by: {
          type: Type.STRING,
          enum: ['relevance', 'recency', 'engagement'],
          description: 'Sort results by'
        }
      },
      required: ['query']
    }
  },
  {
    name: 'get_team_contact',
    description: 'Retrieves contact information for team members. Returns email, socials, and role.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: {
          type: Type.STRING,
          description: 'Team member name (first or last name works)'
        },
        field: {
          type: Type.STRING,
          enum: ['email', 'socials', 'all'],
          description: 'What information to return?'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'initiate_contact_workflow',
    description: 'Creates a contact message that gets queued for team response. Used for bookings, inquiries, or collaboration requests.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        from_name: {
          type: Type.STRING,
          description: 'Your name'
        },
        from_email: {
          type: Type.STRING,
          description: 'Your email address'
        },
        subject: {
          type: Type.STRING,
          description: 'Subject line'
        },
        message: {
          type: Type.STRING,
          description: 'Message body'
        },
        request_type: {
          type: Type.STRING,
          enum: ['general', 'booking', 'collaboration', 'support'],
          description: 'Type of request'
        }
      },
      required: ['from_name', 'from_email', 'subject', 'message']
    }
  }
];

export function getInitialTools(): ToolDefinition[] {
  return staticToolDeclarations.map((decl) => {
    const fn = (toolImplementations as any)[decl.name];
    let code = '';

    if (fn) {
      const fnStr = fn.toString();
      const bodyStart = fnStr.indexOf('{');
      const bodyEnd = fnStr.lastIndexOf('}');
      if (bodyStart !== -1 && bodyEnd !== -1) {
        code = fnStr.substring(bodyStart + 1, bodyEnd).trim();
      }
    }

    return {
      name: decl.name,
      description: decl.description || '',
      parameters: JSON.stringify(decl.parameters, null, 2),
      code: code,
      enabled: true,
      alwaysOn: false,
      isCustom: false
    };
  });
}
