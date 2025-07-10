import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArguments } from '#/utils/executing.ts';

async function displayNameFilter(
  executionContext: TwingExecutionContext,
  ...args: Parameters<IntlShape['formatDisplayName']>
): Promise<string | undefined> {
  const intl = await getIntl(executionContext);
  return intl.formatDisplayName(...normaliseTwingArguments(args));
}

export default function createDisplayNameFilter(name: string): TwingFilter {
  return createFilter(name, displayNameFilter, [{ name: 'options' }]);
}
