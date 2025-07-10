import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function dateFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatDate']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatDate(...normaliseTwingArguments(args));
}

export default function createDateFilter(name: string): TwingFilter {
  return createFilter(name, dateFilter, [{ name: 'options', defaultValue: new Map() }]);
}
