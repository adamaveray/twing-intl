import type { TwingExecutionContext } from 'twing';
import { createRuntimeError } from 'twing';

import { withAddedContext } from '#/utils/executing.ts';
import { contextLocaleKey } from '#functions/intl.ts';

import type { TwingIntlLocaleNode } from './node.ts';

export default async function executeLocaleNode(
  node: TwingIntlLocaleNode,
  executionContext: TwingExecutionContext,
): Promise<unknown> {
  const { id: idNode } = node.attributes;
  const { body: bodyNode } = node.children;

  const localeId: unknown = await executionContext.nodeExecutor(idNode, executionContext);
  if (typeof localeId !== 'string') {
    throw createRuntimeError('Locale IDs must be strings.', node, executionContext.template.source);
  }

  executionContext = withAddedContext(executionContext, { [contextLocaleKey]: localeId });
  return executionContext.nodeExecutor(bodyNode, executionContext) as Promise<unknown>;
}
