import awsLambdaFastify from "@fastify/aws-lambda";
import { app } from "./app";
import { ChatMessage } from "./types/portfolio";
import { chatStream, GUARDRAIL_FALLBACK } from "./lib/bedrock";
import { trackUserInteraction } from "./services/portfolioService";

/**
 * Standard handler — used by API Gateway for all existing routes.
 * @fastify/aws-lambda buffers the full response, which is fine for non-streaming routes.
 */
export const handler = awsLambdaFastify(app, {
  callbackWaitsForEmptyEventLoop: false,
  serializeLambdaArguments: false,
});

/**
 * Streaming handler — used exclusively by the Lambda Function URL
 * (InvokeMode: RESPONSE_STREAM) for POST /portfolio/chat/stream.
 *
 * We bypass @fastify/aws-lambda here because it buffers the full response.
 * awslambda.streamifyResponse lets us write chunks to responseStream directly
 * as Bedrock produces them.
 */
export const streamHandler = (awslambda as any).streamifyResponse(
  async (event: any, responseStream: any) => {
    const CONVERSATION_LIMIT = 10;

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (event.requestContext?.http?.method === "OPTIONS") {
      responseStream.setContentType("application/json");
      responseStream.write(JSON.stringify({}));
      responseStream.end();
      return;
    }

    // ── Internal API Key validation ──────────────────────────────────────────
    const receivedKey = event.headers?.["x-internal-api-key"] || event.headers?.["X-Internal-Api-Key"];
    if (process.env.NODE_ENV === "production" && receivedKey !== process.env.INTERNAL_API_KEY) {
      responseStream.setContentType("application/json");
      responseStream.write(JSON.stringify({ error: "Unauthorized" }));
      responseStream.end();
      return;
    }

    // ── Parse body ───────────────────────────────────────────────────────────
    let messages: ChatMessage[] = [];
    try {
      const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      messages = (body?.messages ?? []).slice(-CONVERSATION_LIMIT);
    } catch {
      responseStream.setContentType("application/json");
      responseStream.write(JSON.stringify({ error: "Invalid request body" }));
      responseStream.end();
      return;
    }

    // ── Visitor tracking (fire-and-forget) ────────────────────────────────────
    const visitorId = event.headers?.["x-visitor-id"];
    if (typeof visitorId === "string" && visitorId.trim() !== "") {
      void trackUserInteraction(visitorId.trim());
    }

    // ── SSE streaming ─────────────────────────────────────────────────────────
    // Lambda Function URL streaming requires setContentType before first write.
    responseStream.setContentType("text/event-stream; charset=utf-8");

    const writeChunk = (data: object) => {
      responseStream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    try {
      const stream = chatStream(messages);

      for await (const chunk of stream) {
        if (chunk.type === "guardrail") {
          writeChunk({ type: "guardrail", fallback: GUARDRAIL_FALLBACK });
        } else {
          writeChunk(chunk);
        }
      }
    } catch (err) {
      writeChunk({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to process request",
      });
    } finally {
      responseStream.end();
    }
  }
);
