import { RetrieveCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { bedrockAgentClient, KNOWLEDGE_BASE_ID } from "./client";

const RELEVANCE_SCORE_THRESHOLD = 0.4;
const NUMBER_OF_RESULTS = 5;

export async function retrieveKnowledgeBaseContext(query: string): Promise<string> {
  const response = await bedrockAgentClient.send(
    new RetrieveCommand({
      knowledgeBaseId: KNOWLEDGE_BASE_ID,
      retrievalQuery: { text: query },
      retrievalConfiguration: {
        vectorSearchConfiguration: { numberOfResults: NUMBER_OF_RESULTS },
      },
    })
  );

  return (response.retrievalResults ?? [])
    .filter((r) => (r.score ?? 0) > RELEVANCE_SCORE_THRESHOLD)
    .map((r) => r.content?.text ?? "")
    .filter(Boolean)
    .join("\n\n");
}
