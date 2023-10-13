import { DefineWorkflow, Schema } from "deno-slack-sdk/mod.ts"
import { FunctionDefinition } from "../functions/function.ts"

/**
 * A workflow is a set of steps that are executed in order.
 * Each step in a workflow is a function.
 * https://api.slack.com/automation/workflows
 */
const Workflow = DefineWorkflow({
  callback_id: "summarize_workflow",
  title: "Summarize workflow",
  description: "A workflow that summarizes a channel.",
  input_parameters: {
    properties: {
      channel: { type: Schema.slack.types.channel_id },
      user: { type: Schema.slack.types.user_id },
    },
    required: ["user", "channel"],
  },
})

/**
 * Custom functions are reusable building blocks
 * of automation deployed to Slack infrastructure. They
 * accept inputs, perform calculations, and provide
 * outputs, just like typical programmatic functions.
 * https://api.slack.com/automation/functions/custom
 */
const functionStep = Workflow.addStep(FunctionDefinition, {
  user: Workflow.inputs.user,
  channel: Workflow.inputs.channel,
})

/**
 * SendMessage is a Slack function. These are
 * Slack-native actions, like creating a channel or sending
 * a message and can be used alongside custom functions in a workflow.
 * https://api.slack.com/automation/functions
 */
Workflow.addStep(Schema.slack.functions.SendMessage, {
  channel_id: Workflow.inputs.channel,
  message: functionStep.outputs.summary,
})

export default Workflow
