import type { UIAdapterModule } from "../types";
import { parseHermesStdoutLine } from "hermes-ai-ceo-adapter/ui";
import { HermesLocalConfigFields } from "./config-fields";
import { buildHermesConfig } from "hermes-ai-ceo-adapter/ui";

export const hermesLocalUIAdapter: UIAdapterModule = {
  type: "hermes_local",
  label: "Hermes Agent",
  parseStdoutLine: parseHermesStdoutLine,
  ConfigFields: HermesLocalConfigFields,
  buildAdapterConfig: buildHermesConfig,
};
