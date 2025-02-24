import { atom, useAtom } from "jotai";

type Config = {
  maxResults: number;
  inboxLayout: "all" | "important" | "unread";
};

const configAtom = atom<Config>({
  maxResults: 30,
  inboxLayout: "important",
});

export function useSettings() {
  return useAtom(configAtom);
}
