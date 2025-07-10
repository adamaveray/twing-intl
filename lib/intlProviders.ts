import type { IntlShape } from '@formatjs/intl';

import { mapValues } from '#/utils/values.ts';

import type { TwingIntlProvider } from './types';

export function createIntlProvider<T extends IntlShape>(intls: T[] | Record<T['locale'], T>): TwingIntlProvider<T> {
  const intlsMap = Array.isArray(intls) ? (mapValues(intls, 'locale') as Record<T['locale'], T>) : intls;

  return function intlProvider(locale: T['locale']): T {
    const intl = intlsMap[locale] as T | undefined;
    if (intl == null) {
      throw new Error(`Undefined locale "${locale}".`);
    }
    return intl;
  };
}
