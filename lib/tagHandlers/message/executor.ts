import type {
  FormatXMLElementFn,
  IntlMessageFormat,
  MessageFormatPart,
  Options as MessageFormatOptions,
  PrimitiveType,
} from 'intl-messageformat';
import { PART_TYPE } from 'intl-messageformat';
import type { TwingExecutionContext } from 'twing';
import { createRuntimeError } from 'twing';

import { getIntl } from '#/context.ts';
import type { SafeMessageDescriptor } from '#/types.ts';
import { normaliseTwingArgument } from '#/utils/executing.ts';
import type { DeferredFragmentNode } from '#tagHandlers/fragment/executor.ts';

import type { TwingIntlMessageNode } from './node.ts';

type MessageValue<T> = T | PrimitiveType | FormatXMLElementFn<T>;

async function buildMessagePart<T>({ type, value }: MessageFormatPart<T>): Promise<string> {
  switch (type) {
    case PART_TYPE.literal: {
      return String(value);
    }

    case PART_TYPE.object: {
      if (typeof value === 'function') {
        value = await (value as DeferredFragmentNode)();
      } else if (value instanceof Promise) {
        value = await (value as Promise<string> | string);
      }
      return String(value);
    }
  }
}

async function buildMessage<T>(
  messageFormat: IntlMessageFormat,
  values: Record<string, MessageValue<T>>,
): Promise<string> {
  let output = '';
  for (const part of messageFormat.formatToParts<T>(values)) {
    output += await buildMessagePart<T>(part);
  }
  return output;
}

export default async function executeMessageNode<T>(
  node: TwingIntlMessageNode,
  executionContext: TwingExecutionContext,
): Promise<void> {
  const intl = await getIntl<T>(executionContext);
  const { nodeExecutor } = executionContext;

  const {
    fragments: fragmentNodes,
    children: { descriptor: descriptorNode, values: valuesNode, options: optionsNode },
  } = node;

  const descriptor = (await nodeExecutor(descriptorNode, executionContext)) as SafeMessageDescriptor;
  const message = intl.messages[descriptor.id];
  if (message == null) {
    throw createRuntimeError(`Undefined message "${descriptor.id}".`, descriptorNode, executionContext.template.source);
  }

  let values: Record<string, unknown> | undefined;
  if (valuesNode != null) {
    values = normaliseTwingArgument(await nodeExecutor(valuesNode, executionContext)) as Record<string, unknown>;
  }

  let options: MessageFormatOptions | undefined;
  if (optionsNode != null) {
    options = normaliseTwingArgument(await nodeExecutor(optionsNode, executionContext)) as MessageFormatOptions;
  }

  const fragments: Record<string, DeferredFragmentNode> = {};
  for (const [name, fragmentNode] of Object.entries(fragmentNodes)) {
    fragments[name] = (await nodeExecutor(fragmentNode, executionContext)) as DeferredFragmentNode;
  }

  const messageFormat = intl.formatters.getMessageFormat(message, undefined, undefined, options);
  const result = await buildMessage<T>(messageFormat, { ...values, ...fragments } as Record<string, MessageValue<T>>);

  executionContext.outputBuffer.echo(result);
}
