import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function relativeTimeFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatRelativeTime']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatRelativeTime(...normaliseTwingArguments(args));
}

export default function createRelativeTimeFilter(name: string): TwingFilter {
  return createFilter(name, relativeTimeFilter, [
    { name: 'unit', defaultValue: null },
    { name: 'options', defaultValue: new Map() },
  ]);
}
