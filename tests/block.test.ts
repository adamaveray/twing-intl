import { describe, expect, test } from 'bun:test';

import type { IntlShape } from '@formatjs/intl';
import { createIntl } from '@formatjs/intl';
import type { TwingEnvironmentOptions } from 'twing';

import type { SingleTemplateTwingEnvironment } from './utils/twingEnvironment.ts';
import { createSingleTemplateTestEnvironment } from './utils/twingEnvironment.ts';

describe('block', () => {
  function createEnvironment(
    intl: IntlShape,
    template: string,
    options: TwingEnvironmentOptions = {},
  ): SingleTemplateTwingEnvironment {
    return createSingleTemplateTestEnvironment(template, options, [intl], intl.locale);
  }

  test('should render empty message', async () => {
    const intl = createIntl({ locale: 'en-AU', messages: { 'test-message': 'Hello world.' } });
    const expected = 'Hello world.';

    const environment = createEnvironment(
      intl,
      `
      {%- message { id: 'test-message' } -%}
      {%- endmessage -%}
      `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should render simple values', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The tokens are "{token1}" and "{token2}".' },
    });
    const expected = 'The tokens are "test token one" and "test token two".';

    const environment = createEnvironment(
      intl,
      `
      {%- message { id: 'test-message' } -%}
        {%- fragment token1 -%}
          test token one
        {%- endfragment -%}
        {%- fragment token2 -%}
          test token two
        {%- endfragment -%}
      {%- endmessage -%}
      `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should render tags', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The value is <wrap>wrapped</wrap>.' },
    });
    const expected = 'The value is <strong>wrapped</strong>.';

    const environment = createEnvironment(
      intl,
      `
      {%- message { id: 'test-message' } -%}
        {%- fragment wrap(content) -%}
          <strong>{{ content }}</strong>
        {%- endfragment -%}
      {%- endmessage -%}
      `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should render nested tags', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The token is <wrap>"{token}"</wrap>.' },
    });
    const expected = 'The token is <strong>"test token"</strong>.';

    const environment = createEnvironment(
      intl,
      `
      {%- message { id: 'test-message' } -%}
        {%- fragment token -%}
          test token
        {%- endfragment -%}
        {%- fragment wrap(content) -%}
          <strong>{{ content }}</strong>
        {%- endfragment -%}
      {%- endmessage -%}
      `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should support Twing syntax within fragments', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The variable is <dynamic>"{variable}"</dynamic>.' },
    });
    const expected = 'The variable is <code>"variable value: test variable"</code>.';

    const environment = createEnvironment(
      intl,
      `
      {%- message { id: 'test-message' } -%}
        {%- fragment variable -%}
          variable value: {{ provided_variable }}
        {%- endfragment -%}
        {%- fragment dynamic(content) -%}
          <code>{{ content }}</code>
        {%- endfragment -%}
      {%- endmessage -%}
      `,
    );
    const result = await environment.render(environment.testTemplateName, { provided_variable: 'test variable' });
    expect(result).toBe(expected);
  });

  test('should support defining values in tag', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The values are "{preset_value}" and "{dynamic_value}".' },
    });
    const expected = 'The values are "a preset value" and "a dynamic value".';

    const environment = createEnvironment(
      intl,
      `
        {%- message { id: 'test-message' } { preset_value: 'a preset value' } -%}
          {%- fragment dynamic_value -%}
            a dynamic value
          {%- endfragment -%}
        {%- endmessage -%}
        `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should support defining options in tag', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The value is <original>{value}</original>.' },
    });
    const expected = 'The value is <original>a value</original>.';

    const environment = createEnvironment(
      intl,
      `
        {%- message { id: 'test-message' } {} { ignoreTag: true } -%}
          {%- fragment value -%}
            a value
          {%- endfragment -%}
        {%- endmessage -%}
        `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should allow matching fragment names', async () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The value is "{value}".' },
    });
    const expected = 'The value is "a value".';

    const environment = createEnvironment(
      intl,
      `
        {%- message { id: 'test-message' } -%}
          {%- fragment value -%}
            a value
          {%- endfragment value -%}
        {%- endmessage -%}
        `,
    );
    const result = await environment.render(environment.testTemplateName, {});
    expect(result).toBe(expected);
  });

  test('should enforce matching fragment names', () => {
    const intl = createIntl({
      locale: 'en-AU',
      messages: { 'test-message': 'The value is "{value}".' },
    });
    const environment = createEnvironment(
      intl,
      `
        {%- message { id: 'test-message' } -%}
          {%- fragment value -%}
            a value
          {%- endfragment other_value -%}
        {%- endmessage -%}
        `,
    );
    expect(async () => environment.render(environment.testTemplateName, {})).toThrowError();
  });
});
