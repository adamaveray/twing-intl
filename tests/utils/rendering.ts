import type { IntlShape } from '@formatjs/intl';

import { createSingleTemplateTestEnvironment } from './twingEnvironment.ts';

function trimTrailingNullableArgs<T extends any[]>(args: T): void {
  while (args.length > 0 && args.at(-1) == null) {
    args.pop();
  }
}

export async function renderFilter(intl: IntlShape, filter: string, args: unknown[], value: unknown): Promise<string> {
  trimTrailingNullableArgs(args);
  const template = `{{ value | ${filter}(${args.map((arg) => JSON.stringify(arg)).join(', ')}) }}`;
  const environment = createSingleTemplateTestEnvironment(template, {}, [intl], intl.locale);
  return environment.render(environment.testTemplateName, { value });
}

export async function renderFunction(intl: IntlShape, fn: string, args: unknown[]): Promise<string> {
  trimTrailingNullableArgs(args);
  const template = `{{ ${fn}(${args.map((arg) => JSON.stringify(arg)).join(', ')}) }}`;
  const environment = createSingleTemplateTestEnvironment(template, {}, [intl], intl.locale);
  return environment.render(environment.testTemplateName, {});
}
