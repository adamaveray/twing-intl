import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function listFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatList']>
): Promise<string> {
  const intl = await getIntl(executionContext);
  return intl.formatList(...normaliseTwingArguments(args));
}

export default function createListFilter(name: string): TwingFilter {
  return createFilter(name, listFilter, [{ name: 'options' }]);
}
