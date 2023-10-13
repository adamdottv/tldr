import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts"

/**
 * Functions are reusable building blocks of automation that accept
 * inputs, perform calculations, and provide outputs. Functions can
 * be used independently or as steps in workflows.
 * https://api.slack.com/automation/functions/custom
 */
export const FunctionDefinition = DefineFunction({
  callback_id: "sample_function",
  title: "Sample function",
  description: "A sample function",
  source_file: "functions/function.ts",
  input_parameters: {
    properties: {
      channel: {
        type: Schema.slack.types.channel_id,
        description: "The channel to summarize.",
      },
      user: {
        type: Schema.slack.types.user_id,
        description: "The user invoking the workflow.",
      },
    },
    required: ["channel", "user"],
  },
  output_parameters: {
    properties: {
      summary: {
        type: Schema.types.string,
        description: "Summarized message to send to user.",
      },
    },
    required: ["summary"],
  },
})

/**
 * SlackFunction takes in two arguments: the CustomFunction
 * definition (see above), as well as a function that contains
 * handler logic that's run when the function is executed.
 * https://api.slack.com/automation/functions/custom
 */
export default SlackFunction(
  FunctionDefinition,
  async ({ inputs, client, env }) => {
    const apiKey = env["API_KEY"]

    // Get messages in channel from today
    const history = await client.conversations.history({
      channel: inputs.channel,
      oldest: Math.floor(Date.now() / 1000) - 86400,
    })

    const users: Record<string, string> = {}
    const getTextWithUsername = async (message: {
      text: string
      user: string
    }) => {
      let user = users[message.user]
      if (!user) {
        const response = await client.users.info({ user: message.user })
        user = response.user?.name
        users[message.user] = user
      }

      return `${user ?? "unknown"}: ${message.text}`
    }

    const messages: string[] = []

    for (const message of history.messages) {
      messages.push(await getTextWithUsername(message))

      // If the message is part of a thread, grab the replies
      if (message.thread_ts) {
        const replies = await client.conversations.replies({
          channel: inputs.channel,
          ts: message.thread_ts,
        })

        for (const reply of replies.messages) {
          messages.push(await getTextWithUsername(reply))
        }
      }
    }

    // Call our SST API that uses AWS Bedrock to summarize
    const response = await fetch("https://tldr.adam.dev/summarize", {
      method: "post",
      body: messages.join("\n\n"),
      headers: {
        Accept: "application/json",
        "Content-Type": "text/plain",
        Authorization: apiKey,
      },
    })

    const body = await response.json()
    const summary = body.completion

    return { outputs: { summary } }
  },
)
