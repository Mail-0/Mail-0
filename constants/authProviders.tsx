import { GitHub, Google, Microsoft } from "@/components/icons/icons";
import { ReactNode } from "react";

export const authProviders = [
  {
    id: "google",
    name: "Google",
    icon: <Google />,
  },
  {
    id: "github",
    name: "GitHub",
    icon: <GitHub />,
  },
  {
    id: "microsoft",
    name: "Microsoft",
    icon: <Microsoft />,
  },
] as const;
