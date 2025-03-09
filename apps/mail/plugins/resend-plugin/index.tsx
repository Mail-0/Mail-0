import { createStorageComponent } from "@/helpers/plugin-create-storage-component";
import { EXTENSION_POINTS } from "@/constants/extension-points";
import { AudiencesList } from "./audience-list";
import { Plugin } from "../../types/plugin";
import { SendButton } from "./send-button";
import { createElement } from "react";

const pluginConfig = {
  metadata: {
    id: "resend",
    name: "Resend",
    description: "Send emails using Resend",
    version: "1.0.0",
    author: "Mail0",
  },
  options: {
    apiKey: {
      value: "",
      field: {
        type: "password",
        label: "Resend API Key",
        description: "Your Resend API key from the Resend dashboard",
        required: true,
        validation: {
          pattern: "^re_[a-zA-Z0-9_]{32,}$",
          message: "Please enter a valid Resend API key starting with 're_'",
        },
      },
    },
  },
} as const;

const ResendPlugin: Plugin = {
  ...pluginConfig,
  uiExtensions: [
    {
      location: EXTENSION_POINTS.COMPOSE.RECIPIENTS,
      component: createElement(createStorageComponent(AudiencesList, pluginConfig)),
    },
    {
      location: EXTENSION_POINTS.COMPOSE.SEND_BUTTON,
      component: createElement(createStorageComponent(SendButton, pluginConfig)),
    },
  ],
};

export default ResendPlugin;
