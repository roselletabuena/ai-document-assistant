import { useState } from 'react';

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  status: string;
  isCompleted: boolean;
}


const PROJECTS_DATA: Project[] = [
  {
    id: 'aws-exploration',
    title: 'AWS Cloud Architecture & Portfolio',
    description: 'Showcasing a live cloud-native serverless architecture. Integrates Bedrock Agent Runtime, S3 vector search, DynamoDB telemetry, API Gateway, and Lambda.',
    tags: ['AWS', 'Serverless', 'SAM', 'Bedrock KB', 'DynamoDB', 'TypeScript'],
    date: 'June 18, 2026',
    status: 'Explored',
    isCompleted: true,
  },
  {
    id: 'structured-extraction',
    title: 'Structured Data Extraction',
    description: 'Deep dive into parsing unstructured text into reliable, validated JSON structures. Explores schema definitions, prompt routing, and validation recovery strategies.',
    tags: ['NLP', 'JSON Schema', 'Python', 'TypeScript', 'Gemini API'],
    date: 'June 14, 2026',
    status: 'Explored',
    isCompleted: true,
  },
  {
    id: 'rag-exploration',
    title: 'Retrieval-Augmented Generation (RAG)',
    description: 'Exploring semantic search pipelines, text chunking heuristics, overlap parameters, metadata filtering, and reducing LLM hallucinations with citation models.',
    tags: ['RAG', 'Vector DB', 'Semantic Search', 'Python', 'Embeddings'],
    date: 'June 15, 2026',
    status: 'Explored',
    isCompleted: true,
  },
  {
    id: 'agentic-workflows',
    title: 'Agentic Workflows & Tool Calling',
    description: 'Designing autonomous loops where LLMs invoke local APIs, verify schema responses, handle failure exceptions, and synthesize multi-turn goals.',
    tags: ['Agents', 'Tool Calling', 'Function Calling', 'ReAct', 'Python'],
    date: 'Planned',
    status: 'In Progress',
    isCompleted: false,
  }
];

const ALL_TAGS = ['All', 'NLP', 'RAG', 'JSON Schema', 'Vector DB', 'Python', 'TypeScript', 'Agents', 'AWS', 'Serverless'];

interface HomeProps {
  onSelectProject?: (id: string) => void;
}

export default function Home({ onSelectProject }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === 'All' ||
      project.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div>
      <section className="hero-section">
        <h1 className="hero-title">Explorations</h1>
        <p className="hero-subtitle">
          A collection of deep dives, code templates, and technical reflections on integrating Generative AI into web workflows.
        </p>

        {/* Centered Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search explorations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg
            className="search-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Tag pills */}
        <div className="tags-filter">
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              className={`tag-pill ${selectedTag === tag ? 'active' : ''}`}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* List of explorations (roselle-tabuena blog style) */}
      <div className="projects-list">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <div
              key={project.id}
              className="project-item"
              onClick={() => {
                if (project.isCompleted) {
                  onSelectProject?.(project.id);
                }
              }}
              style={{ cursor: project.isCompleted ? 'pointer' : 'default' }}
            >
              <div className="project-header-line">
                <h3 className="project-item-title">
                  {project.title}
                  <span className="project-item-status">
                    • {project.status}
                  </span>
                </h3>
                <span className="project-item-date">{project.date}</span>
              </div>
              <p className="project-item-desc">{project.description}</p>
              <div className="project-item-tags">
                {project.tags.map((tag) => (
                  <span key={tag} className="project-item-tag">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No explorations match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
