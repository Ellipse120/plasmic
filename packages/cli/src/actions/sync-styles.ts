import { StyleTokensMap } from "../api";
import { logger } from "../deps";
import { PlasmicContext } from "../utils/config-utils";
import {
  fileExists,
  readFileContent,
  writeFileContent,
} from "../utils/file-utils";

export function upsertStyleTokens(
  context: PlasmicContext,
  newStyleMap: StyleTokensMap
) {
  const curStyleMap = readCurStyleMap(context);
  for (const prop of newStyleMap.props) {
    const index = curStyleMap.props.findIndex(
      (p) => p.meta.id === prop.meta.id
    );
    if (index >= 0) {
      curStyleMap.props[index] = prop;
    } else {
      curStyleMap.props.push(prop);
    }
  }
  curStyleMap.props.sort((prop1, prop2) =>
    prop1.name === prop2.name ? 0 : prop1.name < prop2.name ? -1 : 1
  );
  writeFileContent(
    context,
    context.config.tokens.tokensFilePath,

    JSON.stringify(curStyleMap, undefined, 2),

    { force: true }
  );
}

function readCurStyleMap(context: PlasmicContext): StyleTokensMap {
  const filePath = context.config.tokens.tokensFilePath;
  if (fileExists(context, filePath)) {
    try {
      return JSON.parse(
        readFileContent(context, context.config.tokens.tokensFilePath)
      );
    } catch (e) {
      logger.error(
        `Error countered reading ${context.config.tokens.tokensFilePath}: ${e}`
      );
      process.exit(1);
    }
  } else {
    const defaultMap = {
      props: [],
      global: {
        meta: {
          source: "plasmic.app",
        },
      },
    } as StyleTokensMap;
    writeFileContent(
      context,
      context.config.tokens.tokensFilePath,
      JSON.stringify(defaultMap, undefined, 2),
      { force: false }
    );
    return defaultMap;
  }
}
