import type { Project } from '@/db/schema';
export const sampleProjects: Project[] = [
  {
    slug: 'atlas',
    title: 'Atlas',
    category: 'LLM systems',
    description:
      'A knowledge companion that knows where its answers come from.',
    overview:
      'An illustrative retrieval-augmented generation system for navigating complex document collections. The design pairs hybrid retrieval with source-level citations and a deliberate refusal path when evidence is insufficient.',
    stack: ['Python', 'LangChain', 'PostgreSQL', 'FastAPI'],
    outcomes: [
      'Source-grounded answers with traceable citations',
      'Hybrid retrieval and cross-encoder reranking',
      'Evaluation fixtures for answer quality and abstention',
    ],
    githubUrl: null,
    demoUrl: null,
    position: 0,
    published: true,
    sample: true,
  },
  {
    slug: 'signal',
    title: 'Signal',
    category: 'Evaluation',
    description: 'Making model quality visible, measurable, and repeatable.',
    overview:
      'An illustrative evaluation workbench for comparing language model behavior. Versioned datasets, rubric-based scoring, and regression checks help turn subjective impressions into engineering decisions.',
    stack: ['Python', 'Next.js', 'OpenAI API', 'PostgreSQL'],
    outcomes: [
      'Versioned evaluation datasets',
      'Side-by-side model comparisons',
      'Regression checks before release',
    ],
    githubUrl: null,
    demoUrl: null,
    position: 1,
    published: true,
    sample: true,
  },
  {
    slug: 'relay',
    title: 'Relay',
    category: 'Agents',
    description:
      'Purpose-built agents. Thoughtful orchestration. Humans in control.',
    overview:
      'An illustrative agent workflow that breaks research tasks into bounded steps. Tool permissions, checkpoints, and explicit human approval keep the system understandable and recoverable.',
    stack: ['LangGraph', 'Python', 'Redis', 'Docker'],
    outcomes: [
      'Bounded tool use with approval checkpoints',
      'Durable workflows with resumable state',
      'Structured execution traces for debugging',
    ],
    githubUrl: null,
    demoUrl: null,
    position: 2,
    published: true,
    sample: true,
  },
  {
    slug: 'fieldnotes',
    title: 'Fieldnotes',
    category: 'ML engineering',
    description: 'From raw text to the patterns worth paying attention to.',
    overview:
      'An illustrative semantic analysis pipeline for finding themes in unstructured feedback. Embeddings and clustering support discovery while a review interface keeps interpretation with people.',
    stack: ['PyTorch', 'scikit-learn', 'Sentence Transformers', 'FastAPI'],
    outcomes: [
      'Reproducible embedding and clustering pipeline',
      'Human review of emerging themes',
      'Dataset versioning and drift monitoring',
    ],
    githubUrl: null,
    demoUrl: null,
    position: 3,
    published: true,
    sample: true,
  },
];
