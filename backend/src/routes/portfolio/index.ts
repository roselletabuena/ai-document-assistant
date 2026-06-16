import { FastifyPluginAsync } from "fastify";
import {
  askPortfolioQuestion,
  generateNextSuggestedPrompt,
  trackUserInteraction,
  getPortfolioStats,
} from "../../services/portfolioService";
import { buildSuggestedPrompt } from "../../prompts/portfolio.prompt";
import { ChatMessage } from "../../types/portfolio";

const CONVERSATION_LIMIT = 10;

interface chatBody {
  messages: ChatMessage[];
}

const schema = {
  body: {
    type: "object",
    required: ["messages"],
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          required: ["role", "content"],
          properties: {
            role: { type: "string", enum: ["user", "assistant"] },
            content: { type: "string", minLength: 1 },
          },
        },
      },
    },
  },
};

const portfolio: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: chatBody }>(
    "/chat",
    { schema },
    async (request, reply) => {
      const { messages } = request.body;

      // Track unique user interaction asynchronously if x-visitor-id header is present
      const visitorId = request.headers["x-visitor-id"];
      if (typeof visitorId === "string" && visitorId.trim() !== "") {
        void trackUserInteraction(visitorId.trim());
      }

      try {
        const truncatedMessages = messages.slice(-CONVERSATION_LIMIT);

        const result = await askPortfolioQuestion(truncatedMessages);
        return result;
      } catch (err) {
        request.log.error(err);
        return reply.code(500).send({
          error: "Failed to process portfolio question",
          details: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
  );

  fastify.get(
    "/stats",
    {},
    async (request, reply) => {
      const receivedKey =
        request.headers["x-internal-api-key"] ||
        request.headers["X-Internal-Api-Key"];

      // Verify internal API key in production environment for defense-in-depth
      if (process.env.NODE_ENV === "production" && receivedKey !== process.env.INTERNAL_API_KEY) {
        return reply.code(401).send({ error: "Unauthorized" });
      }

      try {
        const stats = await getPortfolioStats();
        return reply.send(stats);
      } catch (err) {
        request.log.error(err);
        return reply.code(500).send({
          error: "Failed to retrieve portfolio stats",
          details: err instanceof Error ? err.message : "Unknown error",
        });
      }
    },
  );

  fastify.post<{
    Body: { conversation: ChatMessage[]; lastMessage: string };
  }>("/suggested-prompts", {}, async (request, reply) => {
    const { conversation, lastMessage } = request.body;

    const prompt = buildSuggestedPrompt(conversation, lastMessage);
    if (prompt == null) return {};
    const raw = await generateNextSuggestedPrompt(prompt);

    let parsedOutput;

    try {
      parsedOutput = JSON.parse(raw);
    } catch (err) {
      return reply.code(500).send({
        error: "Invalid model response",
        raw,
      });
    }

    return reply.send(parsedOutput);
  });
};

export default portfolio;