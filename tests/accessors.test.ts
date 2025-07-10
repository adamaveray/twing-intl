import { describe, expect, test } from 'bun:test';

import { createIntl } from '@formatjs/intl';
import type { TwingEnvironmentOptions } from 'twing';

import { contextLocaleKey } from '#/functions/intl.ts';

import type { SingleTemplateTwingEnvironment } from './utils/twingEnvironment.ts';
import { createSingleTemplateTestEnvironment } from './utils/twingEnvironment.ts';

describe('accessor functions', () => {
  describe('intl', () => {
    const defaultIntl = createIntl({ locale: 'en-AU' });
    const globalIntl = createIntl({ locale: 'es-ES' });
    const templateContextIntl = createIntl({ locale: 'fr-FR' });
    const blockContextIntl = createIntl({ locale: 'ja-JP' });
    const specifiedIntl = createIntl({ locale: 'de-DE' });
    const intls = [defaultIntl, globalIntl, templateContextIntl, blockContextIntl, specifiedIntl];

    function createEnvironment(
      template: string,
      options: TwingEnvironmentOptions = {},
    ): SingleTemplateTwingEnvironment {
      return createSingleTemplateTestEnvironment(template, options, intls, defaultIntl.locale);
    }

    test('should load default intl', async () => {
      const environment = createEnvironment(`{{ intl().locale }}`);
      const result = await environment.render(environment.testTemplateName, {});
      expect(result).toBe(defaultIntl.locale);
    });

    test('should load global intl', async () => {
      const environment = createEnvironment(`{{ intl().locale }}`, {
        globals: { [contextLocaleKey]: globalIntl.locale },
      });
      const result = await environment.render(environment.testTemplateName, {});
      expect(result).toBe(globalIntl.locale);
    });

    test('should load template context intl', async () => {
      const environment = createEnvironment(`{{ intl().locale }}`, {
        globals: { [contextLocaleKey]: globalIntl.locale },
      });
      const result = await environment.render(environment.testTemplateName, {
        [contextLocaleKey]: templateContextIntl.locale,
      });
      expect(result).toBe(templateContextIntl.locale);
    });

    test('should load block context intl', async () => {
      const environment = createEnvironment(
        `{%- locale '${blockContextIntl.locale}' -%}
          {{ intl().locale }}
        {%- endlocale -%}`,
        { globals: { [contextLocaleKey]: globalIntl.locale } },
      );
      const result = await environment.render(environment.testTemplateName, {
        [contextLocaleKey]: templateContextIntl.locale,
      });
      expect(result).toBe(blockContextIntl.locale);
    });

    test('should load specified intl', async () => {
      const environment = createEnvironment(
        `{%- locale '${blockContextIntl.locale}' -%}
          {{ intl('${specifiedIntl.locale}').locale }}
        {%- endlocale -%}`,
        { globals: { [contextLocaleKey]: globalIntl.locale } },
      );
      const result = await environment.render(environment.testTemplateName, {
        [contextLocaleKey]: templateContextIntl.locale,
      });
      expect(result).toBe(specifiedIntl.locale);
    });
  });
});
