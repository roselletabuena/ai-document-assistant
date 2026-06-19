import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";

export const REGION = process.env.AWS_REGION ?? "us-east-1";
export const MODEL_ID = "us.anthropic.claude-haiku-4-5-20251001-v1:0";
export const FAST_MODEL_ID = "us.amazon.nova-micro-v1:0";
export const GUARDRAIL_ID = process.env.BEDROCK_GUARDRAIL_ID;
export const GUARDRAIL_VERSION = "DRAFT";
export const KNOWLEDGE_BASE_ID = process.env.KNOWLEDGE_BASE_ID;

export const bedrockClient = new BedrockRuntimeClient({ region: REGION });
export const bedrockAgentClient = new BedrockAgentRuntimeClient({ region: REGION });
