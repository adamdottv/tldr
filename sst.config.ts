import { SSTConfig } from "sst"
import { Api, Config } from "sst/constructs"

export default {
  config(_input) {
    return {
      name: "4d1a",
      region: "us-west-2",
    }
  },
  stacks(app) {
    app.stack(({ stack }) => {
      const api = new Api(stack, "api", {
        defaults: {
          function: {
            bind: [new Config.Secret(stack, "API_KEY")],
            permissions: ["bedrock"],
            timeout: "30 seconds",
          },
        },
        routes: {
          "POST /summarize": "packages/functions/src/bedrock.summarize",
        },
        customDomain: {
          domainName:
            stack.stage === "production"
              ? "tldr.adam.dev"
              : `${stack.stage}.tldr.adam.dev`,
          hostedZone: "tldr.adam.dev",
        },
      })

      stack.addOutputs({ ApiEndpoint: api.url })
    })
  },
} satisfies SSTConfig
