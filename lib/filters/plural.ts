import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function pluralFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatPlural']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatPlural(...normaliseTwingArguments(args));
}

export default function createPluralFilter(name: string): TwingFilter {
  return createFilter(name, pluralFilter, [{ name: 'options', defaultValue: new Map() }]);
}
