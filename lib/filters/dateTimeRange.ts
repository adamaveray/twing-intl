import type { FormatDateTimeRangeOptions } from '@formatjs/intl/src/types';
import type { TwingExecutionContext, TwingFilter } from 'twing';
import { createFilter } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArgument } from '#/utils/executing.ts';

type DateFrom = Parameters<Intl.DateTimeFormat['formatRange']>[0] | string;
type DateTo = Parameters<Intl.DateTimeFormat['formatRange']>[1] | string;

export type DateTimeRange =
  | [from: DateFrom, to: DateTo]
  | { from: DateFrom; to: DateTo }
  | Map<'from' | 'to', DateFrom | DateTo>;

const parseRange = (range: DateTimeRange): [DateFrom, DateTo] => {
  if (Array.isArray(range)) {
    return range;
  }
  const { from, to } = normaliseTwingArgument(range);
  return [from, to];
};

async function dateTimeRangeFilter(
  executionContext: TwingExecutionContext,
  range: DateTimeRange,
  opts?: FormatDateTimeRangeOptions,
): Promise<string> {
  const intl = await getIntl(executionContext);
  const [from, to] = parseRange(range);
  return intl.formatDateTimeRange(from, to, normaliseTwingArgument(opts));
}

export default function createDateTimeRangeFilter(name: string): TwingFilter {
  return createFilter(name, dateTimeRangeFilter, [{ name: 'options', defaultValue: new Map() }]);
}
