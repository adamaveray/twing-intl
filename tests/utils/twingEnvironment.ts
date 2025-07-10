import type { IntlShape } from '@formatjs/intl';
import type { TwingEnvironment, TwingEnvironmentOptions, TwingExtension } from 'twing';
import { createArrayLoader, createEnvironment } from 'twing';

import TwingIntlExtension from '#/TwingIntlExtension.ts';

function createTestEnvironment(
  templates: Record<string, string>,
  extension: TwingExtension & { applyToEnvironment?: (environment: TwingEnvironment) => void },
  options: Omit<TwingEnvironmentOptions, 'cache'> = {},
): TwingEnvironment {
  const environment = createEnvironment(createArrayLoader(templates), {
    cache: undefined,
    parserOptions: {
      level: 3,
      strict: true,
      ...options.parserOptions,
    },
    ...options,
  });
  if (extension.applyToEnvironment == null) {
    environment.addExtension(extension);
  } else {
    extension.applyToEnvironment(environment);
  }

  return environment;
}

export interface SingleTemplateTwingEnvironment extends TwingEnvironment {
  testTemplateName: string;
}
export function createSingleTemplateTestEnvironment(
  template: string,
  options: Omit<TwingEnvironmentOptions, 'cache' | 'parserOptions'>,
  intls: IntlShape[],
  defaultLocale: IntlShape['locale'],
): SingleTemplateTwingEnvironment {
  const extension = new TwingIntlExtension(intls, defaultLocale);
  const environment = createTestEnvironment(
    { [createSingleTemplateTestEnvironment.templateName]: template },
    extension,
    options,
  ) as SingleTemplateTwingEnvironment;
  environment.testTemplateName = createSingleTemplateTestEnvironment.templateName;
  return environment;
}
createSingleTemplateTestEnvironment.templateName = 'test.twing';
