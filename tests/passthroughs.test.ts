import { describe, expect, spyOn, test } from 'bun:test';

import type { MessageDescriptor } from '@formatjs/intl';
import { createIntl } from '@formatjs/intl';

import type { DateTimeRange } from '#/filters/dateTimeRange.ts';

import { renderFilter, renderFunction } from './utils/rendering.ts';
import { createSingleTemplateTestEnvironment } from './utils/twingEnvironment.ts';

const locale = 'en-AU';
const date = (value: string): Date => new Date(`${value}Z`);

describe('passthrough filters', () => {
  const testDate = date('2000-01-01T00:00:00');

  describe('date', () => {
    test.each<[label: string, value: Date, filterArg: object | null]>([
      ['default format', testDate, null],
      ['custom format', testDate, { year: '2-digit', month: 'long', day: 'numeric' }],
    ])('should format dates (%s)', async (_, value, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatDate');
      const result: unknown = await renderFilter(intl, 'intl_date', [filterArg], value);
      expect(spy).toHaveBeenCalledWith(value, filterArg ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('date-time ranges', () => {
    test.each<[label: string, value: DateTimeRange, filterArg: object | null]>([
      ['array structure', [testDate, date('2000-02-03T01:02:03')], null],
      ['object structure', { from: testDate, to: date('2000-02-03T01:02:03') }, null],
      ['custom format', [testDate, date('2000-02-03T01:02:03')], { year: 'numeric', month: 'long', day: 'numeric' }],
    ] as const)('should format date-time ranges (%s)', async (_, value, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatDateTimeRange');
      const result: unknown = await renderFilter(intl, 'intl_date_time_range', [filterArg], value);

      // Values should be passed separately
      let from: Date;
      let to: Date;
      if (Array.isArray(value)) {
        [from, to] = value as [Date, Date];
      } else if (value instanceof Map) {
        from = value.get('from') as Date;
        to = value.get('to') as Date;
      } else {
        from = value.from as Date;
        to = value.to as Date;
      }
      expect(spy).toHaveBeenCalledWith(from, to, filterArg ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('display names', () => {
    test.each<[label: string, value: string, filterArg: object]>([['with type', 'UN', { type: 'region' }]])(
      'should format display names (%s)',
      async (_, value, filterArg) => {
        const intl = createIntl({ locale });
        const spy = spyOn(intl, 'formatDisplayName');
        const result: unknown = await renderFilter(intl, 'intl_display_name', [filterArg], value);
        expect(spy).toHaveBeenCalledWith(value, filterArg);
        expect(spy).toHaveReturnedValue(result);
      },
    );
  });

  describe('lists', () => {
    test.each<[label: string, values: string[], filterArg: object]>([
      ['with type', ['one', 'two', 'three'], { type: 'disjunction' }],
    ])('should format lists (%s)', async (_, values, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatList');
      const result: unknown = await renderFilter(intl, 'intl_list', [filterArg], values);
      expect(spy).toHaveBeenCalledWith(values, filterArg);
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('messages', () => {
    test.each<
      [label: string, value: MessageDescriptor, filterArgValues: object | null, filterArgOptions: object | null]
    >([
      ['no values', { id: 'message-id' }, null, null],
      ['with values', { id: 'message-id' }, { text: 'Hello World' }, null],
      ['with values & options', { id: 'message-id' }, { text: 'Hello World' }, { ignoreTag: true }],
    ])('should format messages (%s)', async (_, value, filterArgValues, filterArgOptions) => {
      const intl = createIntl({ locale, messages: { 'message-id': 'Example message.' } });
      const spy = spyOn(intl, 'formatMessage');
      const result: unknown = await renderFilter(intl, 'intl_message', [filterArgValues, filterArgOptions], value);
      expect(spy).toHaveBeenCalledWith(value, filterArgValues ?? {}, filterArgOptions ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('numbers', () => {
    test.each<[label: string, values: number, filterArg: object | null]>([
      ['default type', 123, null],
      ['custom type', 123, { type: 'disjunction' }],
    ])('should format numbers (%s)', async (_, values, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatNumber');
      const result: unknown = await renderFilter(intl, 'intl_number', [filterArg], values);
      expect(spy).toHaveBeenCalledWith(values, filterArg ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('plurals', () => {
    test.each<[label: string, value: number, filterArg: object | null]>([
      ['default style', 1, null],
      ['custom style', 1, { style: 'ordinal' }],
    ])('should format plurals (%s)', async (_, values, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatPlural');
      const result: unknown = await renderFilter(intl, 'intl_plural', [filterArg], values);
      expect(spy).toHaveBeenCalledWith(values, filterArg ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('relative times', () => {
    test.each<[label: string, value: number, filterArgUnit: string | null, filterArgStyle: object | null]>([
      ['default unit & style', 1, null, null],
      ['custom unit', 1, 'hour', null],
      ['custom style', 1, null, { style: 'narrow' }],
      ['custom unit & style', 1, 'hour', { style: 'narrow' }],
    ])('should format relative times (%s)', async (_, values, filterArgUnit, filterArgStyle) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatRelativeTime');
      const result: unknown = await renderFilter(intl, 'intl_relative_time', [filterArgUnit, filterArgStyle], values);
      expect(spy).toHaveBeenCalledWith(values, filterArgUnit ?? undefined, filterArgStyle ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });

  describe('times', () => {
    test.each<[label: string, value: Date, filterArg: object | null]>([
      ['default format', testDate, null],
      ['custom format', testDate, { hour: 'numeric', minute: 'numeric', second: 'numeric' }],
    ])('should format times (%s)', async (_, value, filterArg) => {
      const intl = createIntl({ locale });
      const spy = spyOn(intl, 'formatTime');
      const result: unknown = await renderFilter(intl, 'intl_time', [filterArg], value);
      expect(spy).toHaveBeenCalledWith(value, filterArg ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });
});

describe('passthrough functions', () => {
  describe('message formatter', () => {
    // By descriptor
    test.each<
      [
        label: string,
        expectedDescriptor: MessageDescriptor,
        messageId: MessageDescriptor['id'],
        filterArgValues: object | null,
        filterArgOptions: object | null,
      ]
    >([
      ['without values', { id: 'message-id' }, 'message-id', null, null],
      ['with values', { id: 'message-id' }, 'message-id', { text: 'Hello World' }, null],
      ['with values & options', { id: 'message-id' }, 'message-id', { text: 'Hello World' }, { ignoreTag: true }],
    ])('should format messages by ID (%s)', async (_, expectedDescriptor, messageId, argValues, argOptions) => {
      const intl = createIntl({ locale, messages: { 'message-id': 'Example message.' } });
      const spy = spyOn(intl, 'formatMessage');
      const result: unknown = await renderFunction(intl, '_', [messageId, argValues, argOptions]);
      expect(spy).toHaveBeenCalledWith(expectedDescriptor, argValues ?? {}, argOptions ?? {});
      expect(spy).toHaveReturnedValue(result);
    });

    // By ID
    test.each<
      [label: string, descriptor: MessageDescriptor, filterArgValues: object | null, filterArgOptions: object | null]
    >([
      ['without values', { id: 'message-id', description: 'A test message.' }, null, null],
      ['with values', { id: 'message-id', description: 'A test message.' }, { text: 'Hello World' }, null],
      [
        'with values & options',
        { id: 'message-id', description: 'A test message.' },
        { text: 'Hello World' },
        { ignoreTag: true },
      ],
    ])('should format messages by descriptor (%s)', async (_, descriptor, argValues, argOptions) => {
      const intl = createIntl({ locale, messages: { 'message-id': 'Example message.' } });
      const spy = spyOn(intl, 'formatMessage');
      const result: unknown = await renderFunction(intl, '_', [descriptor, argValues, argOptions]);
      expect(spy).toHaveBeenCalledWith(descriptor, argValues ?? {}, argOptions ?? {});
      expect(spy).toHaveReturnedValue(result);
    });
  });
  describe('message formatter 2', () => {
    // Custom locale
    test('should use specified locale', async () => {
      const intlDefault = createIntl({ locale: 'en-AU', messages: { 'message-id': 'Hello world.' } });
      const intlCustom = createIntl({ locale: 'es-ES', messages: { 'message-id': 'Hola mundo.' } });

      const spyDefault = spyOn(intlDefault, 'formatMessage');
      const spyCustom = spyOn(intlCustom, 'formatMessage');

      const template = `{{ _('message-id', locale = 'es-ES') }}`;
      const environment = createSingleTemplateTestEnvironment(
        template,
        {},
        [intlDefault, intlCustom],
        intlDefault.locale,
      );
      const result = await environment.render(environment.testTemplateName, {});
      expect(result).toBe('Hola mundo.');

      expect(spyDefault).not.toHaveBeenCalled();
      expect(spyCustom).toHaveBeenCalledWith({ id: 'message-id' }, {}, {});
      expect(spyCustom).toHaveReturnedValue(result);
    });
  });
});
