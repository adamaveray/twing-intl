import type { IntlShape } from '@formatjs/intl';
import type { TwingEnvironment, TwingExtension, TwingNodeExecutor } from 'twing';

import { createIntlProvider } from '#/intlProviders.ts';
import nodeExecutor from '#/nodeExecutor.ts';
import type { TwingIntlProvider } from '#/types.ts';
import { hackilyWrapEnvironmentNodeExecutor } from '#/utils/patching.ts';
import createDateFilter from '#filters/date.ts';
import createDateTimeRangeFilter from '#filters/dateTimeRange.ts';
import createDisplayNameFilter from '#filters/displayName.ts';
import createListFilter from '#filters/list.ts';
import createMessageFilter from '#filters/message.ts';
import createNumberFilter from '#filters/number.ts';
import createPluralFilter from '#filters/plural.ts';
import createRelativeTimeFilter from '#filters/relativeTime.ts';
import createTimeFilter from '#filters/time.ts';
import createIntlFunction from '#functions/intl.ts';
import createMessageFunction from '#functions/message.ts';
import createFragmentTagHandler from '#tagHandlers/fragment/tagHandler.ts';
import createLocaleTagHandler from '#tagHandlers/locale/tagHandler.ts';
import createMessageTagHandler from '#tagHandlers/message/tagHandler.ts';

export interface TwingIntlOptions {
  messageFunctionName: string;
}

const defaultOptions: TwingIntlOptions = {
  messageFunctionName: '_',
};

type RawIntlProvider<T extends IntlShape> = TwingIntlProvider<T> | Parameters<typeof createIntlProvider<T>>[0];
export default class TwingIntlExtension<T extends IntlShape = IntlShape> implements TwingExtension {
  private readonly intlProvider: TwingIntlProvider<T>;

  public readonly functions;
  public readonly filters = [
    createDateFilter('intl_date'),
    createDateTimeRangeFilter('intl_date_time_range'),
    createDisplayNameFilter('intl_display_name'),
    createListFilter('intl_list'),
    createMessageFilter('intl_message'),
    createNumberFilter('intl_number'),
    createPluralFilter('intl_plural'),
    createRelativeTimeFilter('intl_relative_time'),
    createTimeFilter('intl_time'),
  ];
  public readonly tagHandlers;

  public readonly nodeVisitors = [];
  public readonly operators = [];
  public readonly tests = [];

  constructor(intls: RawIntlProvider<T>, defaultLocale: T['locale'], options?: Partial<TwingIntlOptions>) {
    const { messageFunctionName }: TwingIntlOptions = { ...defaultOptions, ...options };

    this.intlProvider = typeof intls === 'function' ? intls : createIntlProvider(intls);

    this.functions = [
      createMessageFunction(messageFunctionName),
      createIntlFunction('intl', this.intlProvider, defaultLocale),
    ];

    const fragmentTagHandler = createFragmentTagHandler('fragment');
    const messageTagHandler = createMessageTagHandler('message', fragmentTagHandler);
    this.tagHandlers = [fragmentTagHandler, messageTagHandler, createLocaleTagHandler('locale')];
  }

  public wrapNodeExecutor(baseNodeExecutor: TwingNodeExecutor): TwingNodeExecutor {
    return async (node, executionContext): Promise<unknown> => nodeExecutor(node, executionContext, baseNodeExecutor);
  }

  public applyToEnvironment(environment: TwingEnvironment): void {
    environment.addExtension(this);
    hackilyWrapEnvironmentNodeExecutor(environment, (baseNodeExecutor) => this.wrapNodeExecutor(baseNodeExecutor));
  }
}
