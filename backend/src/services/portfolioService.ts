import { chat, invokeSingleTurnPrompt } from "../lib/bedrock";
import { ChatMessage } from "../types/portfolio";
import { UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient, PORTFOLIO_USERS_TABLE } from "../lib/dynamodb";

export async function askPortfolioQuestion(messages: ChatMessage[]) {
  return await chat(messages);
}

export async function generateNextSuggestedPrompt(prompt: string) {
  return await invokeSingleTurnPrompt(prompt);
}

export async function trackUserInteraction(userId: string): Promise<void> {
  const now = Date.now();
  try {
    await ddbDocClient.send(
      new UpdateCommand({
        TableName: PORTFOLIO_USERS_TABLE,
        Key: { userId },
        UpdateExpression:
          "SET lastSeen = :now, firstSeen = if_not_exists(firstSeen, :now) ADD sessionCount :one",
        ExpressionAttributeValues: {
          ":now": now,
          ":one": 1,
        },
      })
    );
  } catch (err) {
    console.error("Failed to track portfolio user interaction in DynamoDB:", err);
  }
}

export async function getPortfolioStats(): Promise<{ uniqueUsersCount: number }> {
  try {
    let count = 0;
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;

    do {
      const response: any = await ddbDocClient.send(
        new ScanCommand({
          TableName: PORTFOLIO_USERS_TABLE,
          ProjectionExpression: "userId",
          ExclusiveStartKey: lastEvaluatedKey,
        })
      );
      count += response.Items?.length || 0;
      lastEvaluatedKey = response.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    return { uniqueUsersCount: count };
  } catch (err) {
    console.error("Failed to get portfolio stats from DynamoDB:", err);
    throw err;
  }
}

