import { useState, useEffect, useRef } from 'react';

interface AwsExplorationProps {
  onBack: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatResult {
  answer: string;
  uiWidget?: {
    type: 'calendar';
    url: string;
  };
}

export default function AwsExploration({ onBack }: AwsExplorationProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'playground' | 'code'>('overview');
  const [activeCodeSection, setActiveCodeSection] = useState<'sam' | 'iam'>('sam');
  
  // Playground state
  const [visitorId, setVisitorId] = useState<string>('');
  const [stats, setStats] = useState<{ uniqueUsersCount: number | string }>({ uniqueUsersCount: '...' });
  const [isStatsLive, setIsStatsLive] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hi there! 🐾 I am Roselle\'s AI assistant. Ask me anything about her skills, AWS certifications, or this project\'s cloud architecture!' }
  ]);
  const [userInput, setUserInput] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [chatMode, setChatMode] = useState<'live' | 'demo'>('live');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'What is Roselle\'s experience with AWS?',
    'Explain the Bedrock integration in this app',
    'How do I schedule a chat with Roselle?'
  ]);
  const [calendarWidget, setCalendarWidget] = useState<string | null>(null);

  // Architecture Diagram Interactive Hover State
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Retrieve or generate visitor ID
  useEffect(() => {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
      id = 'visitor_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('visitor_id', id);
    }
    setVisitorId(id);
  }, []);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/portfolio/stats`, {
          headers: {
            'x-internal-api-key': 'dev-key-placeholder',
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats({ uniqueUsersCount: data.uniqueUsersCount });
          setIsStatsLive(true);
        } else {
          throw new Error('Failed to fetch stats');
        }
      } catch (err) {
        console.warn('Backend /portfolio/stats offline. Falling back to local simulated statistics.', err);
        // Fallback simulated count based on a deterministic hash of the visitor ID
        const randomCount = Math.floor(Math.random() * 20) + 124;
        setStats({ uniqueUsersCount: `${randomCount} (Simulated)` });
        setIsStatsLive(false);
      }
    };

    if (activeTab === 'playground') {
      fetchStats();
    }
  }, [activeTab, API_URL]);

  // Mock response mapping for local offline development
  const getMockResponse = (input: string): ChatResult => {
    const query = input.toLowerCase();
    
    if (query.includes('calendar') || query.includes('schedule') || query.includes('book') || query.includes('meeting') || query.includes('call')) {
      return {
        answer: "I've loaded Roselle's calendar widget below for you to book a convenient time to chat! Let me know if you need anything else.",
        uiWidget: {
          type: "calendar",
          url: "https://cal.com/roselle-tabuena/30min"
        }
      };
    }
    if (query.includes('experience') || query.includes('work') || query.includes('skills')) {
      return {
        answer: "Roselle is a Senior Full Stack Engineer and Cloud Architect specialized in AWS Serverless, React, TypeScript, Node.js, Fastify, and Python. She designs secure cloud pipelines and custom Gen-AI applications integrating LLMs into robust production workflows."
      };
    }
    if (query.includes('bedrock') || query.includes('knowledge base') || query.includes('rag')) {
      return {
        answer: "This application integrates AWS Bedrock Runtime, specifically deploying Claude and Nova models. It uses Bedrock Knowledge Bases backed by S3 Vector indexes to retrieve semantic context from uploaded documentation. S3 buckets host the files, and a Lambda function queries the index before generating the LLM's response."
      };
    }
    if (query.includes('dynamodb') || query.includes('telemetry') || query.includes('database')) {
      return {
        answer: "The backend uses Amazon DynamoDB to track unique visitor logs, count conversation session frequencies, and manage user interactions. It scales dynamically on demand with pay-per-request billing."
      };
    }
    if (query.includes('lambda') || query.includes('serverless') || query.includes('fastify')) {
      return {
        answer: "The compute layer is built on AWS Lambda functions managed with AWS SAM. We pack a TypeScript Fastify API inside Lambda, routing REST traffic dynamically. This setup provides automatic scaling, low latency, and zero server maintenance cost."
      };
    }

    return {
      answer: "That is a great question! In a live environment, this query triggers a semantic vector search inside my Bedrock Knowledge Base and queries Claude with guardrail protection. If you run this in local offline mode, I can tell you that Roselle is highly proficient in TypeScript, React, AWS Lambda, API Gateway, and Bedrock orchestrations!"
    };
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending) return;

    const newMessages = [...chatMessages, { role: 'user' as const, content: text }];
    setChatMessages(newMessages);
    setUserInput('');
    setIsSending(true);
    setCalendarWidget(null); // Clear previous calendar load

    try {
      // Send message to Fastify backend `/portfolio/chat`
      const res = await fetch(`${API_URL}/portfolio/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-visitor-id': visitorId
        },
        body: JSON.stringify({ messages: newMessages })
      });

      if (res.ok) {
        const data: ChatResult = await res.json();
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        setChatMode('live');
        if (data.uiWidget?.type === 'calendar') {
          setCalendarWidget(data.uiWidget.url);
        }

        // Fetch new suggested prompts
        try {
          const sugRes = await fetch(`${API_URL}/portfolio/suggested-prompts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: newMessages, lastMessage: text })
          });
          if (sugRes.ok) {
            const sugData = await sugRes.json();
            if (Array.isArray(sugData)) {
              setSuggestedPrompts(sugData);
            }
          }
        } catch {
          // Ignore suggestion failures, keep default suggestions or rotate them
        }

      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      console.warn('Bedrock API unreachable. Switching chatbot to local demo backup.', err);
      setChatMode('demo');
      
      // Get response from local mock
      setTimeout(() => {
        const mockResult = getMockResponse(text);
        setChatMessages(prev => [...prev, { role: 'assistant', content: mockResult.answer }]);
        if (mockResult.uiWidget?.type === 'calendar') {
          setCalendarWidget(mockResult.uiWidget.url);
        }

        // Generate mock suggestions based on keywords
        const randomSuggestions = [
          'Explain the Bedrock integration in this app',
          'What is Roselle\'s experience with AWS?',
          'How does DynamoDB track page telemetry?',
          'Tell me about AWS Lambda scaling',
          'How do I schedule a chat with Roselle?'
        ].filter(s => !s.toLowerCase().includes(text.toLowerCase())).slice(0, 3);
        setSuggestedPrompts(randomSuggestions);
      }, 800);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(userInput);
    }
  };

  // SAM template YAML code snippet
  const samCode = `AWSTemplateFormatVersion: "2010-09-09"
Transform: AWS::Serverless-2016-10-31
Description: AI Portfolio Serverless Infrastructure

Resources:
  # DynamoDB table to log visitor telemetry
  PortfolioUsersTable:
    Type: AWS::DynamoDB::Table
    Properties:
      TableName: PortfolioUsers-dev
      BillingMode: PAY_PER_REQUEST
      AttributeDefinitions:
        - AttributeName: userId
          AttributeType: S
      KeySchema:
        - AttributeName: userId
          KeyType: HASH
      SSESpecification:
        SSEEnabled: true

  # Amazon Bedrock Knowledge Base backed by S3 Vector index
  PortfolioKnowledgeBase:
    Type: AWS::Bedrock::KnowledgeBase
    Properties:
      Name: portfolio-kb-dev
      Description: "Knowledge base for Roselle's portfolio documents"
      RoleArn: !GetAtt KnowledgeBaseRole.Arn
      KnowledgeBaseConfiguration:
        Type: VECTOR
        VectorKnowledgeBaseConfiguration:
          EmbeddingModelArn: "arn:aws:bedrock:us-east-1::foundation-model/amazon.titan-embed-text-v2:0"
      StorageConfiguration:
        Type: S3_VECTORS
        S3VectorsConfiguration:
          IndexArn: !GetAtt PortfolioVectorIndex.IndexArn

  # API Gateway running Fastify on AWS Lambda
  DocumentsFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-ai-stack-api-dev
      Handler: lambda.handler
      Runtime: nodejs22.x
      CodeUri: ../backend/dist/
      MemorySize: 512
      Timeout: 30
      Environment:
        Variables:
          PORTFOLIO_USERS_TABLE: !Ref PortfolioUsersTable
          KNOWLEDGE_BASE_ID: !Ref PortfolioKnowledgeBase
`;

  // IAM Policy snippet
  const iamCode = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:GetItem",
        "dynamodb:PutItem",
        "dynamodb:UpdateItem",
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:us-east-1:123456789012:table/PortfolioUsers-*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:Retrieve",
        "bedrock:InvokeModel",
        "bedrock:ApplyGuardrail"
      ],
      "Resource": [
        "arn:aws:bedrock:us-east-1::foundation-model/*",
        "arn:aws:bedrock:us-east-1:123456789012:knowledge-base/*",
        "arn:aws:bedrock:us-east-1:123456789012:guardrail/*"
      ]
    }
  ]
}`;

  return (
    <div>
      <div className="back-btn" onClick={onBack}>
        <span>←</span> Back to Explorations
      </div>

      <header className="detail-header">
        <div className="detail-tags">
          <span className="detail-tag">Cloud Engineering</span>
          <span className="detail-tag">AWS Serverless</span>
          <span className="detail-tag">AI Infrastructure</span>
        </div>
        <h1 className="detail-title">AWS Cloud Architecture & Portfolio</h1>
        <div className="detail-meta">
          <span>Published: June 18, 2026</span>
          <span>•</span>
          <span>Reading time: 6 min read</span>
          <span>•</span>
          <span>Status: Active Exploration</span>
        </div>
      </header>

      {/* Tabs Menu */}
      <nav className="detail-tabs">
        <button
          className={`detail-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          1. Architecture Overview
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'playground' ? 'active' : ''}`}
          onClick={() => setActiveTab('playground')}
        >
          2. Live AWS Playground
        </button>
        <button
          className={`detail-tab-btn ${activeTab === 'code' ? 'active' : ''}`}
          onClick={() => setActiveTab('code')}
        >
          3. Infrastructure Code
        </button>
      </nav>

      {/* Tab Panel Content */}
      <div className="tab-panel">
        
        {/* TAB 1: Architecture Overview */}
        {activeTab === 'overview' && (
          <article className="blog-content">
            <p className="blog-p">
              This application is built as a cloud-native, serverless deployment on AWS. Rather than utilizing a traditional monolithic server, the backend is a Fastify routing engine compiled in TypeScript and deployed inside <strong>AWS Lambda</strong>, serving requests routed from <strong>Amazon API Gateway</strong>.
            </p>

            <h2 className="blog-h2">Interactive Cloud Topology</h2>
            <p className="blog-p" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Hover over each node in the diagram below to explore the data paths and security mechanisms.
            </p>

            {/* Interactive SVG / CSS Architecture Diagram */}
            <div style={{
              margin: '2rem 0',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
              {/* Row 1: Users & Entry Point */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Client Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('client')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: hoveredComponent === 'client' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'client' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    maxWidth: '130px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'client' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  💻 Client<br/>(React / Vite)
                </div>

                {/* Arrow */}
                <div style={{ flex: '1', height: '1px', borderTop: '1px dashed var(--border-color)', margin: '0 1rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', right: '0', top: '-6px', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid var(--border-color)' }}></span>
                </div>

                {/* API Gateway Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('apigw')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: hoveredComponent === 'apigw' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'apigw' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    maxWidth: '130px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'apigw' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  🚪 API Gateway<br/>(REST Endpoints)
                </div>

                {/* Arrow */}
                <div style={{ flex: '1', height: '1px', borderTop: '1px dashed var(--border-color)', margin: '0 1rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', right: '0', top: '-6px', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '7px solid var(--border-color)' }}></span>
                </div>

                {/* AWS Lambda Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('lambda')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem 1.25rem',
                    backgroundColor: hoveredComponent === 'lambda' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'lambda' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    maxWidth: '130px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'lambda' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  ⚡ AWS Lambda<br/>(Fastify API)
                </div>
              </div>

              {/* Down Arrows linking to Storage & AI */}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 50px' }}>
                {/* Space left */}
                <div style={{ width: '130px' }}></div>
                {/* Arrow center down */}
                <div style={{ height: '30px', width: '1px', borderLeft: '1px dashed var(--border-color)', position: 'relative' }}>
                  <span style={{ position: 'absolute', bottom: '0', left: '-5px', borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '7px solid var(--border-color)' }}></span>
                </div>
                {/* Space right */}
                <div style={{ width: '130px' }}></div>
              </div>

              {/* Row 2: Databases and AI Core */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                {/* DynamoDB Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('dynamodb')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: hoveredComponent === 'dynamodb' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'dynamodb' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'dynamodb' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  💾 DynamoDB<br/>(Telemetry logs)
                </div>

                {/* S3 Storage Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('s3')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: hoveredComponent === 's3' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 's3' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 's3' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  📁 Amazon S3<br/>(Uploaded PDFs)
                </div>

                {/* Bedrock KB Box */}
                <div 
                  onMouseEnter={() => setHoveredComponent('bedrock-kb')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: hoveredComponent === 'bedrock-kb' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'bedrock-kb' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'bedrock-kb' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  🧠 Bedrock KB<br/>(Vector Retrieval)
                </div>

                {/* Bedrock Models */}
                <div 
                  onMouseEnter={() => setHoveredComponent('bedrock-models')}
                  onMouseLeave={() => setHoveredComponent(null)}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: hoveredComponent === 'bedrock-models' ? 'var(--text-primary)' : 'var(--bg-primary)',
                    color: hoveredComponent === 'bedrock-models' ? 'var(--bg-primary)' : 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    flex: '1',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'default',
                    transition: 'all 0.2s ease',
                    boxShadow: hoveredComponent === 'bedrock-models' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  🤖 Bedrock LLM<br/>(Claude & Nova)
                </div>
              </div>

              {/* Dynamic Legend / Text Box */}
              <div style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-primary)',
                borderLeft: '3px solid var(--text-primary)',
                borderRadius: '4px',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {!hoveredComponent && (
                  <span>Hover over any component of the cloud stack above to inspect its details!</span>
                )}
                {hoveredComponent === 'client' && (
                  <span><strong>Client Application:</strong> Built with React & TypeScript under Vite. Hosted statically, it communicates with AWS endpoints via secured CORS headers.</span>
                )}
                {hoveredComponent === 'apigw' && (
                  <span><strong>Amazon API Gateway:</strong> Acts as the single entrance door. Renders REST endpoint paths (`/portfolio/chat`) and verifies token authorization before executing triggers.</span>
                )}
                {hoveredComponent === 'lambda' && (
                  <span><strong>AWS Lambda:</strong> Serverless compute handler executing Fastify. Instantiates dynamically, routes endpoint operations, and manages credentials securely using IAM profiles.</span>
                )}
                {hoveredComponent === 'dynamodb' && (
                  <span><strong>Amazon DynamoDB:</strong> Scalable NoSQL storage tracking portfolio visitor interaction patterns (`PortfolioUsersTable`) to calculate unique user logs under pay-per-use cost models.</span>
                )}
                {hoveredComponent === 's3' && (
                  <span><strong>Amazon S3 Bucket:</strong> Object storage containing uploaded document manuals and resumes (`DocumentsBucket`). Houses content ingested by vector crawlers.</span>
                )}
                {hoveredComponent === 'bedrock-kb' && (
                  <span><strong>Bedrock Knowledge Base:</strong> Manages the RAG ingestion loop. Converts PDFs into Titan vector embeddings and queries the index during user prompt chats.</span>
                )}
                {hoveredComponent === 'bedrock-models' && (
                  <span><strong>Amazon Bedrock Models:</strong> Dynamically invokes Anthropic Claude 3.5 Haiku and Amazon Nova Micro, backed by safety guardrails to enforce context alignment.</span>
                )}
              </div>
            </div>

            <h2 className="blog-h2">Serverless Infrastructure Benefits</h2>
            <p className="blog-p">
              Building on AWS Serverless resources ensures high availability, automatic scaling, and optimal cost structures.
            </p>
            <div className="use-case-grid">
              <div className="use-case-card">
                <h4 className="use-case-title">💸 Pay-Per-Request Efficiency</h4>
                <p className="use-case-desc">
                  With Lambda, DynamoDB, API Gateway, and Bedrock Knowledge Bases billed on request, running this showcase incurs close to zero idle costs.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">🔒 Multi-Layer Security & Guardrails</h4>
                <p className="use-case-desc">
                  Strict IAM permission contracts restrict resource capabilities. Amazon Bedrock Guardrails enforce topic policies to block unsafe prompts or leaks.
                </p>
              </div>
              <div className="use-case-card">
                <h4 className="use-case-title">📈 Infinite Scaling</h4>
                <p className="use-case-desc">
                  If 100 recruiters load this page simultaneously, AWS Lambda spins up isolated compute containers concurrently without server lockouts.
                </p>
              </div>
            </div>
          </article>
        )}

        {/* TAB 2: Live AWS Playground */}
        {activeTab === 'playground' && (
          <div className="blog-content">
            {/* Stats Card */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div>
                <span className="input-label" style={{ margin: 0, fontSize: '0.65rem' }}>DynamoDB Live Telemetry</span>
                <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  🧑‍💻 Unique Portfolio Visitors: <span style={{ color: '#10b981' }}>{stats.uniqueUsersCount}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.7rem',
                  fontWeight: 650,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '999px',
                  backgroundColor: isStatsLive ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  color: isStatsLive ? '#10b981' : '#f59e0b',
                  border: isStatsLive ? '1px solid #10b981' : '1px solid #f59e0b'
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: isStatsLive ? '#10b981' : '#f59e0b',
                    display: 'inline-block'
                  }}></span>
                  {isStatsLive ? 'LIVE CLOUD' : 'DEMO MODE'}
                </span>
              </div>
            </div>

            {/* Chat Layout */}
            <div className="playground-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '400px' }}>
              <div className="playground-title" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', margin: 0 }}>
                <span>🤖</span> Bedrock Portfolio Assistant
                <span style={{
                  marginLeft: 'auto',
                  fontSize: '0.7rem',
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase'
                }}>
                  Model: Claude 3.5 Haiku
                </span>
              </div>

              {/* Chat Window */}
              <div style={{
                flex: '1',
                maxHeight: '350px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                padding: '0.5rem 0'
              }}>
                {chatMessages.map((msg, i) => (
                  <div 
                    key={i} 
                    style={{
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                      maxWidth: '85%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      lineHeight: '1.5',
                      backgroundColor: msg.role === 'user' ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                      color: msg.role === 'user' ? 'var(--bg-primary)' : 'var(--text-primary)',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--border-color)',
                      borderTopRightRadius: msg.role === 'user' ? '2px' : '12px',
                      borderTopLeftRadius: msg.role === 'user' ? '12px' : '2px',
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
                
                {isSending && (
                  <div style={{
                    alignSelf: 'flex-start',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '12px',
                    borderTopLeftRadius: '2px',
                    fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    animation: 'fadeIn 1s infinite alternate'
                  }}>
                    Thinking... 💭
                  </div>
                )}

                {/* Calendar Widget Render */}
                {calendarWidget && (
                  <div style={{
                    alignSelf: 'flex-start',
                    width: '100%',
                    maxWidth: '450px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    marginTop: '0.5rem',
                    backgroundColor: 'var(--bg-primary)'
                  }}>
                    <div style={{
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderBottom: '1px solid var(--border-color)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}>
                      <span>📅</span> Booking Assistant (Cal.com integration)
                    </div>
                    <div style={{ padding: '1rem', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        Schedule a quick chat or interview directly with Roselle Tabuena:
                      </p>
                      <a 
                        href={calendarWidget}
                        target="_blank"
                        rel="noreferrer"
                        className="playground-btn"
                        style={{ display: 'inline-flex', width: 'auto', margin: '0 auto', padding: '0.5rem 1.25rem' }}
                      >
                        Open Cal.com Scheduler ↗
                      </a>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Suggestions */}
              {suggestedPrompts.length > 0 && !isSending && (
                <div style={{
                  display: 'flex',
                  gap: '0.4rem',
                  flexWrap: 'wrap',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  {suggestedPrompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(prompt)}
                      className="tag-pill"
                      style={{
                        padding: '0.2rem 0.5rem',
                        fontSize: '0.7rem',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat Input */}
              <div style={{ display: 'flex', gap: '0.5rem', position: 'relative' }}>
                <input
                  type="text"
                  className="search-input"
                  style={{
                    margin: 0,
                    borderRadius: '8px',
                    paddingRight: '3rem',
                    fontSize: '0.85rem'
                  }}
                  placeholder={chatMode === 'live' ? "Chat with Bedrock assistant..." : "Offline mode. Type message..."}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isSending}
                />
                <button
                  onClick={() => handleSendMessage(userInput)}
                  disabled={isSending || !userInput.trim()}
                  style={{
                    position: 'absolute',
                    right: '0.4rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: userInput.trim() && !isSending ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                    color: userInput.trim() && !isSending ? 'var(--bg-primary)' : 'var(--text-muted)',
                    cursor: userInput.trim() && !isSending ? 'pointer' : 'default',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    transition: 'all 0.1s ease'
                  }}
                >
                  ➔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Infrastructure Code */}
        {activeTab === 'code' && (
          <div className="blog-content">
            <p className="blog-p" style={{ marginBottom: '1.5rem' }}>
              Review the Infrastructure-as-Code setups defining the serverless stack configuration.
            </p>

            <div className="code-viewer-container">
              <div className="code-viewer-header">
                <div className="code-tabs">
                  <button
                    className={`code-tab-btn ${activeCodeSection === 'sam' ? 'active' : ''}`}
                    onClick={() => setActiveCodeSection('sam')}
                  >
                    AWS SAM (template.yaml)
                  </button>
                  <button
                    className={`code-tab-btn ${activeCodeSection === 'iam' ? 'active' : ''}`}
                    onClick={() => setActiveCodeSection('iam')}
                  >
                    IAM Access Policies (JSON)
                  </button>
                </div>
                <div className="code-filepath">
                  {activeCodeSection === 'sam' ? 'infrastructure/template.yaml' : 'infrastructure/iam-policy.json'}
                </div>
              </div>

              <div className="code-block-wrapper">
                <pre style={{
                  padding: '1.25rem',
                  overflowX: 'auto',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  color: '#e2e8f0',
                  background: '#0d1117'
                }}>
                  <code>
                    {activeCodeSection === 'sam' ? samCode : iamCode}
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
