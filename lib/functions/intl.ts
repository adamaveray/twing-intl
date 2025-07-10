import type { IntlShape } from '@formatjs/intl';
import type { TwingExecutionContext, TwingFunction } from 'twing';
import { createFunction } from 'twing';

import type { TwingIntlProvider } from '#/types.ts';

/** The name of the template context property storing the current default locale. */
export const contextLocaleKey = '__intl_locale__';

function getContextualLocale({ context, environment }: TwingExecutionContext): string | undefined {
  const contextLocale: unknown = context.get(contextLocaleKey);
  if (typeof contextLocale === 'string') {
    return contextLocale;
  }

  const globalLocale: unknown = environment.globals.get(contextLocaleKey);
  if (typeof globalLocale === 'string') {
    return globalLocale;
  }

  return undefined;
}

export default function createIntlFunction<T extends IntlShape>(
  name: string,
  provider: TwingIntlProvider<T>,
  defaultLocale: T['locale'],
): TwingFunction {
  return createFunction(
    name,
    // eslint-disable-next-line @typescript-eslint/require-await -- Required by Twing interface.
    async (executionContext, locale?: string | null) => {
      locale ??= getContextualLocale(executionContext);
      return provider(locale ?? defaultLocale);
    },
    [{ name: 'locale', defaultValue: null }],
  );
}
