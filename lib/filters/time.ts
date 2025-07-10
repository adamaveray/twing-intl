import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function timeFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatTime']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatTime(...normaliseTwingArguments(args));
}

export default function createTimeFilter(name: string): TwingFilter {
  return createFilter(name, timeFilter, [{ name: 'options', defaultValue: new Map() }]);
}
