import type { TwingExecutionContext } from 'twing';

import { withAddedContext } from '#/utils/executing.ts';

import type { TwingIntlFragmentNode } from './node.ts';

type Part = string | ((...args: unknown[]) => Promise<string | undefined>);

async function renderPart(executionContext: TwingExecutionContext, part: Part): Promise<string> {
  if (typeof part === 'function') {
    executionContext.outputBuffer.start();
    const result = (await part()) ?? '';
    part = result + executionContext.outputBuffer.getAndClean();
  }
  return part;
}

async function renderParts(executionContext: TwingExecutionContext, parts: Part[]): Promise<string> {
  let output = '';
  for (const part of parts) {
    output += await renderPart(executionContext, part);
  }
  return output;
}

export type DeferredFragmentNode = (parts?: Part[]) => Promise<string>;

export default function executeFragmentNode(
  node: TwingIntlFragmentNode,
  executionContext: TwingExecutionContext,
): DeferredFragmentNode {
  const { body: bodyNode } = node.children;
  const { blockArgumentName } = node.attributes;

  return async (parts = []) => {
    let updatedExecutionContext = executionContext;
    if (blockArgumentName != null) {
      updatedExecutionContext = withAddedContext(updatedExecutionContext, {
        [blockArgumentName]: await renderParts(updatedExecutionContext, parts),
      });
    }
    updatedExecutionContext.outputBuffer.start();
    await updatedExecutionContext.nodeExecutor(bodyNode, updatedExecutionContext);
    return updatedExecutionContext.outputBuffer.getAndClean();
  };
}
