import { FastifyPluginAsync, FastifyRequest } from "fastify";
import { chat, chatStream, invokeSingleTurnPrompt, GUARDRAIL_FALLBACK } from "../../lib/bedrock";
import { buildSuggestedPrompt, validateAndCleanSuggestedPrompts } from "../../prompts/portfolio.prompt";
import { trackUserInteraction, getPortfolioStats } from "../../services/portfolioService";
import { ChatMessage } from "../../types/portfolio";

const CONVERSATION_LIMIT = 10;

interface ChatBody {
  messages: ChatMessage[];
}

const chatSchema = {
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

function trackVisitor(request: FastifyRequest): void {
  const visitorId = request.headers["x-visitor-id"];
  if (typeof visitorId === "string" && visitorId.trim() !== "") {
    void trackUserInteraction(visitorId.trim());
  }
}

const portfolio: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: ChatBody }>("/chat", { schema: chatSchema }, async (request, reply) => {
    trackVisitor(request);

    try {
      const truncatedMessages = request.body.messages.slice(-CONVERSATION_LIMIT);
      const result = await chat(truncatedMessages);

      let suggestedPrompts = undefined;
      if (result.answer && result.answer !== GUARDRAIL_FALLBACK) {
        try {
          const conversationWithResponse = [
            ...truncatedMessages,
            { role: "assistant" as const, content: result.answer },
          ];
          const prompt = buildSuggestedPrompt(conversationWithResponse, result.answer);
          if (prompt != null) {
            const raw = await invokeSingleTurnPrompt(prompt);
            const parsed = JSON.parse(raw);
            suggestedPrompts = validateAndCleanSuggestedPrompts(parsed, conversationWithResponse);
          }
        } catch (err) {
          request.log.error(err, "Failed to generate suggested prompts in static chat handler");
        }
      }

      return {
        ...result,
        suggestedPrompts,
      };
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({
        error: "Failed to process portfolio question",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  });

  /**
   * POST /portfolio/chat/stream
   *
   * Server-Sent Events endpoint. Streams tokens as they arrive from Bedrock.
   * Each frame is a JSON-encoded StreamChunk:
   *   { type: "token",    text: "..." }     — a text token
   *   { type: "guardrail" }                 — client should show the guardrail fallback
   *   { type: "done",    uiWidget?: {...} } — stream complete; optional widget payload
   *   { type: "error",   message: "..." }   — something went wrong
   *
   * GUARDRAIL_FALLBACK text: see lib/bedrock/chatOrchestrator.ts
   */
  fastify.post<{ Body: ChatBody }>("/chat/stream", { schema: chatSchema }, async (request, reply) => {
    trackVisitor(request);

    reply.raw.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    reply.raw.setHeader("Cache-Control", "no-cache");
    reply.raw.setHeader("Connection", "keep-alive");
    reply.raw.setHeader("X-Accel-Buffering", "no"); // prevent nginx buffering
    reply.raw.flushHeaders();

    const writeChunk = (data: object) => {
      reply.raw.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const truncatedMessages = request.body.messages.slice(-CONVERSATION_LIMIT);
      const stream = chatStream(truncatedMessages);

      let assistantAnswer = "";
      let lastDoneChunk: any = null;

      for await (const chunk of stream) {
        if (chunk.type === "guardrail") {
          writeChunk({ type: "guardrail", fallback: GUARDRAIL_FALLBACK });
        } else {
          if (chunk.type === "token") {
            assistantAnswer += chunk.text;
          } else if (chunk.type === "done") {
            lastDoneChunk = chunk;
            continue;
          }
          writeChunk(chunk);
        }
      }

      let suggestedPrompts = undefined;
      if (assistantAnswer && assistantAnswer !== GUARDRAIL_FALLBACK) {
        try {
          const conversationWithResponse = [
            ...truncatedMessages,
            { role: "assistant" as const, content: assistantAnswer },
          ];
          const prompt = buildSuggestedPrompt(conversationWithResponse, assistantAnswer);
          if (prompt != null) {
            const raw = await invokeSingleTurnPrompt(prompt);
            const parsed = JSON.parse(raw);
            suggestedPrompts = validateAndCleanSuggestedPrompts(parsed, conversationWithResponse);
          }
        } catch (err) {
          request.log.error(err, "Failed to generate suggested prompts in stream handler");
        }
      }

      writeChunk({
        type: "done",
        uiWidget: lastDoneChunk?.uiWidget,
        suggestedPrompts,
      });
    } catch (err) {
      request.log.error(err);
      writeChunk({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to process portfolio question",
      });
    } finally {
      reply.raw.end();
    }
  });

  fastify.get("/stats", {}, async (request, reply) => {
    const receivedKey =
      request.headers["x-internal-api-key"] || request.headers["X-Internal-Api-Key"];

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
  });

  fastify.post<{
    Body: { conversation: ChatMessage[]; lastMessage?: string; lastUserMessage?: string };
  }>("/suggested-prompts", {}, async (request, reply) => {
    const { conversation, lastMessage, lastUserMessage } = request.body;
    const finalLastMessage = lastMessage || lastUserMessage || "";

    const prompt = buildSuggestedPrompt(conversation, finalLastMessage);
    if (prompt == null) return {};

    const raw = await invokeSingleTurnPrompt(prompt);

    try {
      const parsed = JSON.parse(raw);
      const cleaned = validateAndCleanSuggestedPrompts(parsed, conversation);
      return reply.send(cleaned);
    } catch {
      return reply.code(500).send({ error: "Invalid model response", raw });
    }
  });
};

export default portfolio;
