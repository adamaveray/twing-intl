import type { TwingExecutionContext } from 'twing';
import { createRuntimeError } from 'twing';

import type { SafeMessageDescriptor } from '#/types.ts';
import { normaliseTwingArgument } from '#/utils/executing.ts';

import type { TwingIntlMessageDescriptorNode } from './nodeDescriptor.ts';

function isMessageDescriptor(value: unknown): value is SafeMessageDescriptor {
  if (value == null || typeof value !== 'object') {
    // Invalid type
    return false;
  }
  if (!('id' in value) || typeof value.id !== 'string') {
    // Missing or invalid ID
    return false;
  }
  if ('description' in value && typeof value.description !== 'string' && typeof value.description !== 'object') {
    // Invalid description type
    return false;
  }
  if ('defaultMessage' in value && typeof value.defaultMessage !== 'string' && !Array.isArray(value.defaultMessage)) {
    // Invalid default message type
    return false;
  }
  return true;
}

export default async function executeMessageDescriptorNode(
  node: TwingIntlMessageDescriptorNode,
  executionContext: TwingExecutionContext,
): Promise<SafeMessageDescriptor> {
  const rawValue = (await executionContext.nodeExecutor(node.children.expression, executionContext)) as unknown;
  if (typeof rawValue === 'string') {
    return { id: rawValue };
  }
  const value = rawValue instanceof Map ? (normaliseTwingArgument(rawValue) as object) : (rawValue as object);
  if (isMessageDescriptor(value)) {
    return value;
  }
  throw createRuntimeError('Invalid message descriptor.', node, executionContext.template.source);
}
