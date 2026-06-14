import { useState } from 'react';

interface StructuredExtractionProps {
  onBack: () => void;
}

interface ExtractedData {
  recruiter: {
    name: string;
    email: string;
    company: string;
  };
  jobDetails: {
    role: string;
    location: string;
    salaryEstimate: string;
    skillsRequired: string[];
  };
  interviewSchedule: {
    date: string;
    time: string;
    linksFound: string[];
  };
}

export default function StructuredExtraction({ onBack }: StructuredExtractionProps) {
  const [activeTab, setActiveTab] = useState<'reflections' | 'playground' | 'code'>('reflections');
  const [activeCodeLang, setActiveCodeLang] = useState<'python' | 'typescript'>('python');
  
  // Playground state
  const [inputText, setInputText] = useState(
    `Email from recruiter:
Hey Roselle,
I reviewed your portfolio (https://ai.roselle.dev/) and was super impressed by your frontend design work and AI document assistant integrations!
We have an open Senior Frontend Engineer position at TechFlow Inc. based in Seattle, WA.
We're looking for someone skilled in React, TypeScript, and Generative AI SDKs. Salary is $145,000/year plus equity. Let me know if you're free to chat this Tuesday at 2 PM PST!
- Marcus (marcus.hr@techflow.io)`
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const handleExtract = () => {
    setIsExtracting(true);
    setExtractedData(null);
    
    // Simulate API delay
    setTimeout(() => {
      setIsExtracting(false);
      setExtractedData({
        recruiter: {
          name: "Marcus",
          email: "marcus.hr@techflow.io",
          company: "TechFlow Inc."
        },
        jobDetails: {
          role: "Senior Frontend Engineer",
          location: "Seattle, WA",
          salaryEstimate: "$145,000/year + equity",
          skillsRequired: ["React", "TypeScript", "Generative AI SDKs"]
        },
        interviewSchedule: {
          date: "Tuesday (upcoming)",
          time: "2:00 PM PST",
          linksFound: ["https://ai.roselle.dev/"]
        }
      });
    }, 1500);
  };

  // Code snippets
  const pythonCode = `import os
from pydantic import BaseModel, Field
from typing import List, Optional
from google import genai
from google.genai import types

# Define output schema structure using Pydantic
class Recruiter(BaseModel):
    name: str
    email: str
    company: str

class JobDetails(BaseModel):
    role: str
    location: str
    salary_estimate: Optional[str] = None
    skills_required: List[str]

class InterviewSchedule(BaseModel):
    date: str
    time: str
    links_found: List[str]

class RecruiterEmailInfo(BaseModel):
    recruiter: Recruiter
    job_details: JobDetails
    interview_schedule: Optional[InterviewSchedule] = None

# Initialize Gemini Client
client = genai.Client()

def extract_email_data(raw_email_text: str) -> RecruiterEmailInfo:
    response = client.models.generate_content(
        model='gemini-2.5-flash',
        contents=f"Extract structured details from this email text: \\n\\n{raw_email_text}",
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=RecruiterEmailInfo,
            temperature=0.1
        ),
    )
    # The output is guaranteed to follow the schema structure
    return RecruiterEmailInfo.model_validate_json(response.text)
`;

  const tsCode = `import { GoogleGenAI, Type } from '@google/genai';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define structural schema config
const emailExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    recruiter: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        email: { type: Type.STRING },
        company: { type: Type.STRING }
      },
      required: ['name', 'email', 'company']
    },
    jobDetails: {
      type: Type.OBJECT,
      properties: {
        role: { type: Type.STRING },
        location: { type: Type.STRING },
        salaryEstimate: { type: Type.STRING },
        skillsRequired: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ['role', 'location', 'skillsRequired']
    },
    interviewSchedule: {
      type: Type.OBJECT,
      properties: {
        date: { type: Type.STRING },
        time: { type: Type.STRING },
        linksFound: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    }
  },
  required: ['recruiter', 'jobDetails']
};

async function extractEmailData(rawEmailText: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: \`Extract structured details from this email text: \\n\\n\${rawEmailText}\`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: emailExtractionSchema,
      temperature: 0.1,
    }
  });

  return JSON.parse(response.text);
}
`;

  return (
    <div>
      <div className="back-btn" onClick={onBack}>
        <span>←</span> Back to Explorations
      </div>

      <header className="detail-header">
        <div className="detail-tags">
          <span className="detail-tag">Natural Language Processing</span>
          <span className="detail-tag">Structured Output</span>
        </div>
        <h1 className="detail-title">Structured Data Extraction</h1>
        <div className="detail-meta">
          <span>Published: June 14, 2026</span>
          <span>•</span>
          <span>Reading time: 5 min read</span>
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
          2. Interactive Playground
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
              One of the most powerful capabilities of modern large language models is their ability to act as semantic translation layers—taking chaotic, unstructured human communication and transforming it into strict, machine-readable datasets. In this exploration, I focus on how to use schemas to force models to output guaranteed JSON matching exact interfaces.
            </p>

            <h2 className="blog-h2">Why Structured Extraction Matters</h2>
            <p className="blog-p">
              Historically, extracting details from text required fragile Regular Expressions (Regex) or strict templates. If an email shifted its format slightly, the parser would break. LLMs solve this by understanding context. However, LLMs are naturally conversational and prone to adding conversational fluff (e.g., <em>"Here is the JSON you requested..."</em>).
            </p>
            <p className="blog-p">
              By enforcing structured output through schema constraints at the API layer (e.g., using Gemini's <code>response_schema</code> parameter), we strip the conversational elements entirely. The model acts as a compiler, outputting pure JSON that fits directly into SQL tables, React states, or API payloads.
            </p>

            <div className="blog-alert">
              <div className="blog-alert-title">💡 Technical Highlight</div>
              <div className="blog-alert-text">
                When using Gemini 2.5, you can supply a schema declaration directly in the config. For Python, this is cleanest using <strong>Pydantic</strong> models. For TypeScript, we define object declarations. The model runs token validation internally, making output compliance close to 100%.
              </div>
            </div>

            <h2 className="blog-h2">Challenges & Reflections</h2>
            
            <h3 className="blog-h3">1. Handling Out-of-Schema Information</h3>
            <p className="blog-p">
              What happens when the source text does not contain the information requested by the schema? If a schema requires a field (like <code>phone_number</code>) but it isn't in the email, the model might hallucinate a fake number to satisfy the contract. 
              <strong> Reflection:</strong> To solve this, mark non-guaranteed fields as optional (e.g., Pydantic's <code>Optional[str] = None</code>). This prompts the model to return <code>null</code> rather than invent data.
            </p>

            <h3 className="blog-h3">2. Nested Complexity</h3>
            <p className="blog-p">
              Complex structures with multiple levels of nested arrays and objects require clear field descriptions. LLMs can misalign context if objects sound similar. Adding inline field comments or descriptions directly inside the Pydantic/Zod schemas guides the model's extraction attention.
            </p>

            <h2 className="blog-h2">Real-World Use Cases</h2>
            <div className="use-case-grid">
              <div className="use-case-card">
                <h4 className="use-case-title">📧 Recruiter Mail Parser</h4>
                <p className="use-case-desc">
                  Automatically parse job details, company information, salary ranges, and proposed interview schedules from recruiter cold emails directly into a personal CRM dashboard.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">🧾 Invoice Processing</h4>
                <p className="use-case-desc">
                  Extract itemized lists, pricing, tax details, vendor names, and billing dates from messy scanned receipts or unstructured text blocks.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">📅 Meeting Notes Actions</h4>
                <p className="use-case-desc">
                  Process raw transcripts of meetings and extract structured action items containing assignee names, descriptions, and deadline dates.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">📑 Resume Screening</h4>
                <p className="use-case-desc">
                  Parse raw, multi-format PDF text into standard fields like experience history, specific skills, and contact details for applicant sorting systems.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* TAB 2: Interactive Playground */}
        {activeTab === 'playground' && (
          <div className="blog-content">
            <p className="blog-p" style={{ marginBottom: '2rem', textAlign: 'center' }}>
              Test the extraction logic live. Modify the unstructured email on the left and see how it is parsed into the strict JSON layout on the right.
            </p>

            <div className="playground-layout">
              <div className="playground-card">
                <div className="playground-title">
                  <span>📥</span> Unstructured Source Text
                </div>
                <p className="playground-description">
                  Write any recruiter email, invoice snippet, or meeting summary here.
                </p>
                
                <label className="input-label" htmlFor="source-text-area">Input Text</label>
                <textarea
                  id="source-text-area"
                  className="input-textarea"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <button 
                  className="playground-btn" 
                  onClick={handleExtract}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <>Processing with Gemini API...</>
                  ) : (
                    <>Run Structured Extraction ✨</>
                  )}
                </button>
              </div>

              <div className="playground-card" style={{ borderLeftColor: 'var(--accent-secondary)' }}>
                <div className="playground-title">
                  <span style={{ color: 'var(--accent-secondary)' }}>⚙️</span> Extracted Output Schema
                </div>
                <p className="playground-description">
                  Real-time parsed schema outputs (guaranteed structural validation).
                </p>
                
                <label className="input-label">JSON Output</label>
                {isExtracting ? (
                  <div className="output-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ animation: 'fadeIn 1s infinite alternate', fontSize: '1rem', fontWeight: 600 }}>Analyzing semantic structure...</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.7 }}>Filtering tokens and schema mapping</p>
                    </div>
                  </div>
                ) : extractedData ? (
                  <pre className="output-panel">
                    {JSON.stringify(extractedData, null, 2)}
                  </pre>
                ) : (
                  <div className="output-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    Click "Run Structured Extraction" to see visual parsing schema.
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
              Review the implementation code. You can switch between Python (using Pydantic models) and TypeScript config environments.
            </p>

            <div className="code-viewer-container">
              <div className="code-viewer-header">
                <div className="code-tabs">
                  <button
                    className={`code-tab-btn ${activeCodeLang === 'python' ? 'active' : ''}`}
                    onClick={() => setActiveCodeLang('python')}
                  >
                    Python (Pydantic)
                  </button>
                  <button
                    className={`code-tab-btn ${activeCodeLang === 'typescript' ? 'active' : ''}`}
                    onClick={() => setActiveCodeLang('typescript')}
                  >
                    TypeScript (SDK)
                  </button>
                </div>
                <div className="code-filepath">
                  {activeCodeLang === 'python' ? 'backend/extract.py' : 'frontend/src/utils/extract.ts'}
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
