import type { MessageDescriptor } from '@formatjs/intl';
import type { PrimitiveType } from 'intl-messageformat';
import type { Options as IntlMessageFormatOptions } from 'intl-messageformat/src/core';
import type { TwingExecutionContext, TwingFunction } from 'twing';
import { createFunction } from 'twing';

import { getIntl } from '#/context.ts';
import { normaliseTwingArgument } from '#/utils/executing.ts';

async function messageFunction<T>(
  executionContext: TwingExecutionContext,
  idOrDescriptor: unknown,
  values: Map<string, PrimitiveType | T>,
  options: Map<keyof IntlMessageFormatOptions, unknown>,
  locale?: string | null,
): Promise<T | string | (T | string)[]> {
  let descriptor: MessageDescriptor;
  if (idOrDescriptor instanceof Map) {
    descriptor = normaliseTwingArgument(idOrDescriptor) as MessageDescriptor;
  } else if (typeof idOrDescriptor === 'string') {
    descriptor = { id: idOrDescriptor };
  } else {
    throw new TypeError('A message descriptor object or message ID string must be provided.');
  }

  const intl = await getIntl<T>(executionContext, locale ?? undefined);
  return intl.formatMessage(
    descriptor,
    normaliseTwingArgument(values),
    normaliseTwingArgument(options) as IntlMessageFormatOptions,
  );
}

export default function createMessageFunction(name: string): TwingFunction {
  return createFunction(name, messageFunction, [
    { name: 'id_or_descriptor' },
    { name: 'values', defaultValue: new Map() },
    { name: 'options', defaultValue: new Map() },
    { name: 'locale', defaultValue: null },
  ]);
}
