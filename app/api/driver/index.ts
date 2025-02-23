import microsoftDriver from "./providers/microsoft";
import { MailManager, IConfig } from "./types";
import googleDriver from "./providers/google";

const SupportedProviders = {
  google: googleDriver,
  microsoft: microsoftDriver,
};

export const createDriver = async (
  provider: keyof typeof SupportedProviders | string,
  config: IConfig,
): Promise<MailManager> => {
  const factory = SupportedProviders[provider as keyof typeof SupportedProviders];

  if (!factory) throw new Error("Provider not supported");

  return factory(config);
};
