import { Manifest } from "deno-slack-sdk/mod.ts"
import Workflow from "./workflows/workflow.ts"

/**
 * The app manifest contains the app's configuration. This
 * file defines attributes like app name and description.
 * https://api.slack.com/automation/manifest
 */
export default Manifest({
  name: "tldr",
  description: "Because who has time to read their colleague's messages?!",
  icon: "assets/tldr.png",
  workflows: [Workflow],
  outgoingDomains: ["tldr.adam.dev"],
  botScopes: [
    "commands",
    "chat:write",
    "chat:write.public",
    "app_mentions:read",
    "channels:history",
    "groups:history",
    "mpim:history",
    "im:history",
    "users:read",
  ],
})
