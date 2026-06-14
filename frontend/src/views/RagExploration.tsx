import { useState } from 'react';

interface RagExplorationProps {
  onBack: () => void;
}

export default function RagExploration({ onBack }: RagExplorationProps) {
  const [activeTab, setActiveTab] = useState<'reflections' | 'playground' | 'code'>('reflections');
  const [activeCodeLang, setActiveCodeLang] = useState<'python' | 'typescript'>('python');

  // Playground state
  const [docText, setDocText] = useState(
    "Antigravity is a powerful agentic AI coding assistant designed by the Google DeepMind team. It is built to assist software engineers with complex code transformations, automated refactoring, and workspace documentation. Unlike simple autocomplete engines, Antigravity plans multi-file edits, runs builds, and verifies test suites autonomously within secure sandbox terminals. It uses advanced reasoning loops to identify optimization opportunities."
  );
  const [queryText, setQueryText] = useState("Who designed Antigravity and what can it do?");
  const [simStep, setSimStep] = useState<number>(0);
  
  // Simulated outputs
  const chunks = [
    { id: 1, text: "Antigravity is a powerful agentic AI coding assistant designed by the Google DeepMind team." },
    { id: 2, text: "It is built to assist software engineers with complex code transformations, automated refactoring, and workspace documentation." },
    { id: 3, text: "Unlike simple autocomplete engines, Antigravity plans multi-file edits, runs builds, and verifies test suites autonomously." },
    { id: 4, text: "It uses advanced reasoning loops to identify optimization opportunities." }
  ];
  
  const handleNextStep = () => {
    if (simStep < 4) {
      setSimStep(prev => prev + 1);
    }
  };

  const handleResetSim = () => {
    setSimStep(0);
  };

  // Code snippets
  const pythonCode = `import numpy as np
from google import genai
from google.genai import types

# Initialize client
client = genai.Client()

class VectorStore:
    def __init__(self):
        self.documents = []
        self.embeddings = []

    def add_document(self, text: str):
        # Generate text embedding using Gemini embedding model
        response = client.models.embed_content(
            model="text-embedding-004",
            contents=text
        )
        embedding = response.embeddings[0].values
        self.documents.append(text)
        self.embeddings.append(embedding)

    def query(self, query_text: str, top_k: int = 1) -> str:
        # Embed query text
        query_response = client.models.embed_content(
            model="text-embedding-004",
            contents=query_text
        )
        query_embedding = np.array(query_response.embeddings[0].values)
        
        # Calculate Cosine Similarity
        similarities = []
        for emb in self.embeddings:
            emb_vector = np.array(emb)
            dot_product = np.dot(query_embedding, emb_vector)
            norm_q = np.linalg.norm(query_embedding)
            norm_e = np.linalg.norm(emb_vector)
            similarity = dot_product / (norm_q * norm_e)
            similarities.append(similarity)
            
        # Retrieve best match
        best_match_idx = np.argmax(similarities)
        return self.documents[best_match_idx]

# Initialize and ingest data
store = VectorStore()
store.add_document("Antigravity is designed by Google DeepMind.")
store.add_document("It runs autonomous command lines and builds.")

# Retrieve and inject context
best_chunk = store.query("Who made Antigravity?")
prompt = f"""Use the context to answer the question.
Context: {best_chunk}
Question: Who made Antigravity?
Answer:"""

response = client.models.generate_content(
    model='gemini-2.5-flash',
    contents=prompt
)
print(response.text)
`;

  const tsCode = `import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Local mock structure for TypeScript semantic chunk retrieval
interface EmbeddedChunk {
  text: string;
  vector: number[];
}

class SemanticSearchEngine {
  private database: EmbeddedChunk[] = [];

  // Cosine similarity utility
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (normA * normB);
  }

  async indexChunk(text: string) {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: text
    });
    
    this.database.push({
      text,
      vector: response.embeddings[0].values
    });
  }

  async query(queryText: string): Promise<string> {
    const response = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: queryText
    });
    const queryVector = response.embeddings[0].values;

    let bestMatch = '';
    let highestScore = -1;

    for (const chunk of this.database) {
      const score = this.cosineSimilarity(queryVector, chunk.vector);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = chunk.text;
      }
    }

    return bestMatch;
  }
}
`;

  return (
    <div>
      <div className="back-btn" onClick={onBack}>
        <span>←</span> Back to Explorations
      </div>

      <header className="detail-header">
        <div className="detail-tags">
          <span className="detail-tag">Semantic Search</span>
          <span className="detail-tag">Knowledge Bases</span>
        </div>
        <h1 className="detail-title">Retrieval-Augmented Generation (RAG)</h1>
        <div className="detail-meta">
          <span>Published: June 15, 2026</span>
          <span>•</span>
          <span>Reading time: 8 min read</span>
          <span>•</span>
          <span>Status: Fully Explored</span>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="detail-tabs">
        <button
          className={`detail-tab-btn ${activeTab === 'reflections' ? 'active' : ''}`}
          onClick={() => setActiveTab('reflections')}
        >
          1. Overview & Reflections
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
          onClick={() => setActiveTab('playground')}
        >
          2. Pipeline Simulator
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          3. Architecture & Code
        </button>
      </nav>

      {/* Tab Panel Content */}
      <div className="tab-panel">
        
        {/* TAB 1: Overview & Reflections */}
        {activeTab === 'reflections' && (
          <article className="blog-content">
            <p className="blog-p">
              Large Language Models are static snapshots of the internet frozen at their time of training. If you ask an LLM about your private codebase, recent corporate policies, or personal project structures, it will fail or hallucinate. Retrieval-Augmented Generation (RAG) bridges this gap by querying local documents dynamically and injecting relevant sections into the model's context window.
            </p>

            <h2 className="blog-h2">The Three Core Phases of RAG</h2>
            <p className="blog-p">
              A high-performing RAG pipeline consists of three distinct phases: Ingestion, Retrieval, and Generation.
            </p>
            <ol className="blog-ol">
              <li className="blog-li">
                <strong>Ingestion (Chunk & Embed):</strong> Large PDF/TXT documents are sliced into smaller, overlapping paragraphs. These paragraphs are converted into floating-point vectors (embeddings) representing their semantic meaning, and stored in a vector index database.
              </li>
              <li className="blog-li">
                <strong>Retrieval (Semantic Search):</strong> When a user asks a question, the question itself is embedded. We perform a cosine-similarity mathematical search between the query vector and all document vectors to pull the top 3-5 most similar text chunks.
              </li>
              <li className="blog-li">
                <strong>Generation (Context Injection):</strong> The retrieved text chunks are pre-pended to the user's prompt as "Source Material." The LLM is instructed: <em>"Answer this question relying ONLY on the source material provided."</em>
              </li>
            </ol>

            <div className="blog-alert">
              <div className="blog-alert-title">💡 Technical Highlight</div>
              <div className="blog-alert-text">
                Traditional keyword searches (like SQL LIKE) fail when synonyms are used. Semantic embeddings use multi-dimensional space, meaning a search for "DeepMind's coding bot" matches "Antigravity agent" because the semantic concepts align, even if they share zero characters in common.
              </div>
            </div>

            <h2 className="blog-h2">Challenges & Reflections</h2>
            
            <h3 className="blog-h3">1. Chunking Heuristics</h3>
            <p className="blog-p">
              If chunk sizes are too small (e.g., single sentences), context is lost. If chunks are too large, irrelevant details dilute the vector representation and bloat token costs.
              <strong> Reflection:</strong> Recursive character splitting (using nested separators like paragraph, line breaks, and spaces) with a 15% overlap ensures transitions aren't lost, while maintaining strict character budgets.
            </p>

            <h3 className="blog-h3">2. Vector Search Noise</h3>
            <p className="blog-p">
              Vector search queries retrieve matching text even if the database has nothing useful, because cosine similarity will simply pull the "least unrelated" document. This leads to the model confidently talking about unrelated data. To counter this, implement metadata tag filters (e.g. document type, date) and set strict mathematical similarity score thresholds (e.g., minimum score of 0.65).
            </p>

            <h2 className="blog-h2">Real-World Use Cases</h2>
            <div className="use-case-grid">
              <div className="use-case-card">
                <h4 className="use-case-title">📂 Custom Documentation QA</h4>
                <p className="use-case-desc">
                  Index proprietary software manuals or corporate wiki pages to provide employees with answers that include direct links or quotes to sources.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">💻 Codebase Assistant</h4>
                <p className="use-case-desc">
                  Parse repository structure and individual files, enabling developers to query class relations, imports, or API definitions across directories.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">💼 Financial Document Analysis</h4>
                <p className="use-case-desc">
                  Ingest complex quarterly reports (10-K filings) and let financial analysts compare numbers across historical sheets without manual lookups.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">🩺 Medical Research Search</h4>
                <p className="use-case-desc">
                  Provide clinicians with immediate access to relevant research papers, matching treatments to patient symptoms semantic profiles.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* TAB 2: Pipeline Simulator */}
        {activeTab === 'playground' && (
          <div className="blog-content">
            <p className="blog-p" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              Step through a simulated visual RAG pipeline. Watch how raw knowledge is split, matched, and used to generate exact answers.
            </p>

            <div className="playground-layout">
              <div className="playground-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="playground-title">
                  <span>🚀</span> Pipeline Dashboard
                </div>

                <div className="sim-pipeline">
                  <div className={`sim-step ${simStep >= 1 ? 'completed' : ''} ${simStep === 0 ? 'active' : ''}`}>
                    <div className="sim-step-num">1</div>
                    <div className="sim-step-content">
                      <div className="sim-step-title">Ingest & Chunk Knowledge</div>
                      <div className="sim-step-desc">Split document into semantic parts.</div>
                    </div>
                  </div>

                  <div className={`sim-step ${simStep >= 2 ? 'completed' : ''} ${simStep === 1 ? 'active' : ''}`}>
                    <div className="sim-step-num">2</div>
                    <div className="sim-step-content">
                      <div className="sim-step-title">Generate Embeddings</div>
                      <div className="sim-step-desc">Convert chunks to vector lists.</div>
                    </div>
                  </div>

                  <div className={`sim-step ${simStep >= 3 ? 'completed' : ''} ${simStep === 2 ? 'active' : ''}`}>
                    <div className="sim-step-num">3</div>
                    <div className="sim-step-content">
                      <div className="sim-step-title">Submit Semantic Query</div>
                      <div className="sim-step-desc">Analyze query intent mathematically.</div>
                    </div>
                  </div>

                  <div className={`sim-step ${simStep >= 4 ? 'completed' : ''} ${simStep === 3 ? 'active' : ''}`}>
                    <div className="sim-step-num">4</div>
                    <div className="sim-step-content">
                      <div className="sim-step-title">Retrieve & Context Inject</div>
                      <div className="sim-step-desc">Pull matching text and query LLM.</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  {simStep < 4 ? (
                    <button className="playground-btn" style={{ margin: 0 }} onClick={handleNextStep}>
                      Next Pipeline Step →
                    </button>
                  ) : (
                    <button className="playground-btn" style={{ margin: 0, background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }} onClick={handleResetSim}>
                      Reset Pipeline 🔄
                    </button>
                  )}
                </div>
              </div>

              <div className="playground-card" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
                <div className="playground-title">
                  <span style={{ color: 'var(--accent-secondary)' }}>📺</span> Simulator Live State
                </div>

                {simStep === 0 && (
                  <div>
                    <label className="input-label" htmlFor="doc-ingest-area">Step 1: Document to Ingest</label>
                    <textarea
                      id="doc-ingest-area"
                      className="input-textarea"
                      style={{ height: '120px', fontSize: '0.85rem' }}
                      value={docText}
                      onChange={(e) => setDocText(e.target.value)}
                    />
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                      *This represent a document stored in the database.
                    </p>
                  </div>
                )}

                {simStep === 1 && (
                  <div>
                    <label className="input-label">Step 2: Semantic Chunks Created</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {chunks.map((chunk) => (
                        <div key={chunk.id} style={{ padding: '0.75rem', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                          <strong style={{ color: 'var(--accent-secondary)' }}>Chunk #{chunk.id}:</strong> "{chunk.text}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {simStep === 2 && (
                  <div>
                    <label className="input-label">Step 3: Text Embeddings (Vectors)</label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                      Vector embeddings mapped in multi-dimensional vector space:
                    </p>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: '6px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                      <div>Chunk #1: [ 0.082, -0.412, 0.911, ... +765 dimensions ]</div>
                      <div style={{ marginTop: '0.4rem' }}>Chunk #2: [ 0.119, -0.322, 0.702, ... +765 dimensions ]</div>
                      <div style={{ marginTop: '0.4rem' }}>Chunk #3: [ -0.012, 0.188, -0.541, ... +765 dimensions ]</div>
                      <div style={{ marginTop: '0.4rem' }}>Chunk #4: [ 0.228, -0.091, 0.312, ... +765 dimensions ]</div>
                    </div>
                  </div>
                )}

                {simStep === 3 && (
                  <div>
                    <label className="input-label" htmlFor="user-query-area">Step 4: User Search Query</label>
                    <input
                      id="user-query-area"
                      type="text"
                      className="search-input"
                      style={{ padding: '0.85rem 1rem', fontSize: '0.9rem', marginBottom: '1rem', borderRadius: '8px' }}
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                    />
                    <label className="input-label">Semantic Cosine Match Results</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '4px' }}>
                        <span>Chunk #1 (designed by DeepMind)</span>
                        <strong style={{ color: '#10b981' }}>Cosine Match: 0.88</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', opacity: 0.6, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <span>Chunk #2 (assist engineers)</span>
                        <span>Cosine Match: 0.62</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', opacity: 0.6, border: '1px solid var(--border-color)', borderRadius: '4px' }}>
                        <span>Chunk #3 (plans transformations)</span>
                        <span>Cosine Match: 0.51</span>
                      </div>
                    </div>
                  </div>
                )}

                {simStep === 4 && (
                  <div>
                    <label className="input-label">Step 5: Retrieved Answer Generated</label>
                    <div className="output-panel" style={{ color: '#a5b4fc', fontSize: '0.85rem', whiteSpace: 'normal', lineHeight: '1.5' }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        Answer:
                      </p>
                      <strong>Antigravity</strong> was designed by the <strong>Google DeepMind team</strong>. It is built to assist software engineers with complex code transformations, automated refactoring, and workspace documentation.
                      <p style={{ fontSize: '0.75rem', color: 'var(--accent-secondary)', marginTop: '0.85rem' }}>
                        Sources cited: [Chunk #1], [Chunk #2]
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Architecture & Code */}
        {activeTab === 'code' && (
          <div className="blog-content">
            <p className="blog-p" style={{ marginBottom: '2rem' }}>
              Review the architectural components of the retrieval system. Toggle between the backend indexing code (Python) and the frontend cosine engine.
            </p>

            <div className="code-viewer-container">
              <div className="code-viewer-header">
                <div className="code-tabs">
                  <button
                    className={`code-tab-btn ${activeCodeLang === 'python' ? 'active' : ''}`}
                    onClick={() => setActiveCodeLang('python')}
                  >
                    Python (Backend search)
                  </button>
                  <button
                    className={`code-tab-btn ${activeCodeLang === 'typescript' ? 'active' : ''}`}
                    onClick={() => setActiveCodeLang('typescript')}
                  >
                    TypeScript (Utility)
                  </button>
                </div>
                <div className="code-filepath">
                  {activeCodeLang === 'python' ? 'backend/vector_search.py' : 'frontend/src/utils/vector.ts'}
                </div>
              </div>

              <div className="code-block-wrapper">
                <pre style={{
                  padding: '1.5rem',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  color: '#e2e8f0',
                  background: '#0d1117'
                }}>
                  <code>
                    {activeCodeLang === 'python' ? pythonCode : tsCode}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
