import type { TwingBaseNode, TwingExecutionContext, TwingNodeExecutor } from 'twing';

import executeFragmentNode from '#tagHandlers/fragment/executor.ts';
import type { TwingIntlFragmentNode } from '#tagHandlers/fragment/node.ts';
import { fragmentNodeType } from '#tagHandlers/fragment/node.ts';
import executeLocaleNode from '#tagHandlers/locale/executor';
import type { TwingIntlLocaleNode } from '#tagHandlers/locale/node.ts';
import { localeNodeType } from '#tagHandlers/locale/node.ts';
import executeMessageNode from '#tagHandlers/message/executor.ts';
import executeMessageDescriptorNode from '#tagHandlers/message/executorDescriptor.ts';
import type { TwingIntlMessageNode } from '#tagHandlers/message/node.ts';
import { messageNodeType } from '#tagHandlers/message/node.ts';
import type { TwingIntlMessageDescriptorNode } from '#tagHandlers/message/nodeDescriptor.ts';
import { messageDescriptorNodeType } from '#tagHandlers/message/nodeDescriptor.ts';

export default async function nodeExecutor(
  node: TwingBaseNode,
  executionContext: TwingExecutionContext,
  fallbackNodeExecutor: TwingNodeExecutor,
): Promise<unknown> {
  switch (node.type) {
    case messageNodeType: {
      return executeMessageNode(node as TwingIntlMessageNode, executionContext);
    }
    case messageDescriptorNodeType: {
      return executeMessageDescriptorNode(node as TwingIntlMessageDescriptorNode, executionContext);
    }
    case fragmentNodeType: {
      return executeFragmentNode(node as TwingIntlFragmentNode, executionContext);
    }
    case localeNodeType: {
      return executeLocaleNode(node as TwingIntlLocaleNode, executionContext);
    }
    default: {
      return fallbackNodeExecutor(node, executionContext);
    }
  }
}
