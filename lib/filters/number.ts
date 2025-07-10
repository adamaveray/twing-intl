import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function numberFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatNumber']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatNumber(...normaliseTwingArguments(args));
}

export default function createNumberFilter(name: string): TwingFilter {
  return createFilter(name, numberFilter, [{ name: 'options', defaultValue: new Map() }]);
}
