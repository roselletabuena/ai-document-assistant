"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";

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
    id: "aws-exploration",
    title: "AWS Cloud Architecture & Portfolio",
    description: "Showcasing a live cloud-native serverless architecture. Integrates Bedrock Agent Runtime, S3 vector search, DynamoDB telemetry, API Gateway, and Lambda.",
    tags: ["AWS", "Serverless", "SAM", "Bedrock KB", "DynamoDB", "TypeScript"],
    date: "June 18, 2026",
    status: "Explored",
    isCompleted: true,
  },
  {
    id: "structured-extraction",
    title: "Structured Data Extraction",
    description: "Deep dive into parsing unstructured text into reliable, validated JSON structures. Explores schema definitions, prompt routing, and validation recovery strategies.",
    tags: ["NLP", "JSON Schema", "Python", "TypeScript", "Gemini API"],
    date: "June 14, 2026",
    status: "Explored",
    isCompleted: true,
  },
  {
    id: "rag-exploration",
    title: "Retrieval-Augmented Generation (RAG)",
    description: "Exploring semantic search pipelines, text chunking heuristics, overlap parameters, metadata filtering, and reducing LLM hallucinations with citation models.",
    tags: ["RAG", "Vector DB", "Semantic Search", "Python", "Embeddings"],
    date: "June 15, 2026",
    status: "Explored",
    isCompleted: true,
  },
  {
    id: "agentic-workflows",
    title: "Agentic Workflows & Tool Calling",
    description: "Designing autonomous loops where LLMs invoke local APIs, verify schema responses, handle failure exceptions, and synthesize multi-turn goals.",
    tags: ["Agents", "Tool Calling", "Function Calling", "ReAct", "Python"],
    date: "Planned",
    status: "In Progress",
    isCompleted: false,
  },
];

const ALL_TAGS = ["All", "NLP", "RAG", "Vector DB", "Agents", "AWS"];

export default function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const filteredDocs = PROJECTS_DATA.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag = selectedTag === "All" || project.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col gap-6 w-full mt-4">
      {/* Search Input Container */}
      <div className="relative w-full">
        <Input
          type="text"
          placeholder="Search explorations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-4 rounded-full bg-bg-secondary border border-border-color text-text-primary placeholder:text-text-muted focus:bg-bg-primary focus:border-text-secondary outline-none transition-all shadow-none"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-text-muted pointer-events-none" />
      </div>

      {/* Filter Tags */}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-[0.75rem] font-medium border transition-all cursor-pointer ${
              selectedTag === tag
                ? "bg-text-primary text-bg-primary border-text-primary"
                : "bg-bg-secondary text-text-secondary border-border-color hover:bg-bg-tertiary"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* List of explorations (roselle-tabuena blog list style) */}
      <div className="flex flex-col gap-1 w-full -mx-3">
        {filteredDocs.length > 0 ? (
          filteredDocs.map((project) => (
            <div
              key={project.id}
              className={`p-3.5 rounded-lg flex flex-col gap-1.5 transition-colors duration-150 group ${
                project.isCompleted ? "hover:bg-bg-tertiary cursor-pointer" : "cursor-default"
              }`}
            >
              <div className="flex justify-between items-baseline gap-4">
                <h3 className="text-[0.95rem] font-medium text-text-primary flex items-center gap-2">
                  <FileText className="w-4 h-4 text-text-secondary group-hover:text-text-primary transition-colors" />
                  {project.title}
                  <span className="text-[0.65rem] font-semibold tracking-wider uppercase text-text-muted">
                    • {project.status}
                  </span>
                </h3>
                <span className="text-[0.75rem] text-text-muted whitespace-nowrap">{project.date}</span>
              </div>

              <p className="text-[0.9rem] text-text-secondary leading-relaxed">{project.description}</p>

              <div className="flex flex-wrap gap-2 mt-1">
                {project.tags.map((tag) => (
                  <span key={tag} className="text-[0.7rem] text-text-muted">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-text-muted text-[0.9rem]">
            No explorations match your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
