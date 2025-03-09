import { createStorageComponent } from "@/helpers/plugin-create-storage-component";
import { EXTENSION_POINTS } from "../../constants/extension-points";
import { MailListAnalytics } from "./mail-list-analytics";
import { MailViewAnalytics } from "./mail-view-analytics";
import { SearchAnalytics } from "./search-analytics";
import { Plugin } from "../../types/plugin";
import { createElement } from "react";

export interface ResponseTimeData {
  messageId: string;
  responseTime: number;
  threadId: string;
  timestamp: string;
}

const pluginConfig = {
  metadata: {
    id: "email-analytics",
    name: "Email Analytics",
    description: "Add analytics features to your email client",
    version: "1.0.0",
    author: "Zero Email",
  },
};

const EmailAnalyticsPlugin: Plugin = {
  ...pluginConfig,
  uiExtensions: [
    {
      location: EXTENSION_POINTS.MAIL_LIST.LIST_ITEM,
      component: createElement(createStorageComponent(MailListAnalytics, pluginConfig)),
      priority: 100,
    },
    {
      location: EXTENSION_POINTS.MAIL_VIEW.TOOLBAR,
      component: createElement(createStorageComponent(MailViewAnalytics, pluginConfig)),
      priority: 50,
    },
    {
      location: EXTENSION_POINTS.SEARCH.ACTIONS,
      component: createElement(createStorageComponent(SearchAnalytics, pluginConfig)),
      priority: 50,
    },
  ],
};

export default EmailAnalyticsPlugin;
