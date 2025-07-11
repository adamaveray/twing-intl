import { expect, test } from 'bun:test';

import { createIntl } from '@formatjs/intl';
import { createArrayLoader, createEnvironment } from 'twing';

import TwingIntlExtension from '#/TwingIntlExtension.ts';

test('renders a complete template', async () => {
  const template = `
  message 1:
  {{ _('message-1') }}
  message 2:
  {{ _('message-2', { value: 'the string value' }) }}
  message 3:
  {% message 'message-3' %} {% endmessage %}

  message 4:
  {% message 'message-4' { value: 'the string value' } -%}
  {% endmessage %}

  message 5:
  {% message 'message-5' %}
    {%- fragment value -%}
      the fragment value
    {%- endfragment -%}
  {% endmessage %}

  message 6:
  {% message 'message-6' -%}
    {%- fragment tag(content) -%}
      <strong>{{ content }}</strong>
    {%- endfragment -%}
  {% endmessage %}

  message 1 alternate:
  {% locale 'en-GB' -%}
    {{ _('message-1') }}
  {%- endlocale %}

  message 2 alternate:
  {% locale 'en-GB' -%}
    {% message 'message-2' { value: 'the alternate value' } -%}
    {% endmessage %}
  {%- endlocale %}
  `.trim();
  const expected = `
  message 1:
  Message one string
  message 2:
  Message two: the string value
  message 3:
  Message three string
  message 4:
  Message four: the string value
  message 5:
  Message five: the fragment value
  message 6:
  Message six: <strong>tag content</strong>
  message 1 alternate:
  Alternate message one
  message 2 alternate:
  Alternate message two: the alternate value
  `.trim();

  const intlPrimary = createIntl({
    locale: 'en-AU',
    messages: {
      'message-1': 'Message one string',
      'message-2': 'Message two: {value}',
      'message-3': 'Message three string',
      'message-4': 'Message four: {value}',
      'message-5': 'Message five: {value}',
      'message-6': 'Message six: <tag>tag content</tag>',
    },
  });
  const intlSecondary = createIntl({
    locale: 'en-GB',
    messages: {
      'message-1': 'Alternate message one',
      'message-2': 'Alternate message two: {value}',
    },
  });

  const environment = createEnvironment(createArrayLoader({ 'index.twig': template }), {
    parserOptions: {
      strict: true,
      level: 3,
    },
  });

  const extension = new TwingIntlExtension([intlPrimary, intlSecondary], intlPrimary.locale);
  extension.applyToEnvironment(environment);

  const result = await environment.render('index.twig', {});
  expect(result).toBe(expected);
});
