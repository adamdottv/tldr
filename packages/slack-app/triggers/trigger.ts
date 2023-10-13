import { Trigger } from "deno-slack-sdk/types.ts"
import { TriggerTypes, TriggerContextData } from "deno-slack-api/mod.ts"
import Workflow from "../workflows/workflow.ts"
/**
 * Triggers determine when workflows are executed. A trigger
 * file describes a scenario in which a workflow should be run,
 * such as a user pressing a button or when a specific event occurs.
 * https://api.slack.com/automation/triggers
 */
const trigger: Trigger<typeof Workflow.definition> = {
  type: TriggerTypes.Shortcut,
  name: "tldr-trigger",
  description: "Trigger TLDR summary",
  workflow: `#/workflows/${Workflow.definition.callback_id}`,
  inputs: {
    channel: { value: TriggerContextData.Shortcut.channel_id },
    user: { value: TriggerContextData.Shortcut.user_id },
  },
  shortcut: {
    button_text: "Summarize this!",
  },
}

export default trigger
