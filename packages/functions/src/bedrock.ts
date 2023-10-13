import { ApiHandler, useHeader, Response } from "sst/node/api"
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"
import { Config } from "sst/node/config"

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION })

export function assertAuth() {
  const header = useHeader("authorization")
  if (header !== Config.API_KEY)
    throw new Response({ statusCode: 401, body: "Invalid API Key" })
}

export const summarize = ApiHandler(async (event) => {
  assertAuth()

  if (!event.body) return { statusCode: 400, body: "No body present" }

  const conversation = event.body
  const prompt = `Briefly summarize in 2-3 short sentences, the following dialog between my co-workers. Only provide the summary, no additional explanation. Dialog:\n${conversation}`

  const response = await bedrock.send(
    new InvokeModelCommand({
      modelId: "anthropic.claude-v2",
      contentType: "application/json",
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        temperature: 0,
        top_p: 0.999,
        top_k: 250,
        max_tokens_to_sample: 300,
        stop_sequences: ["\n\nHuman:"],
      }),
    }),
  )

  const body = Buffer.from(response.body).toString("utf8")
  return { statusCode: 200, body }
})
