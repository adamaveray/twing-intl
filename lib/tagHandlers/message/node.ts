import type { TwingBaseNode, TwingExpressionNode } from 'twing';

import type { TwingIntlFragmentNode } from '../fragment/node.ts';

import type { TwingIntlMessageDescriptorNode } from './nodeDescriptor.ts';

export const messageNodeType = 'intl_message';

export interface TwingIntlMessageNode
  extends TwingBaseNode<
    typeof messageNodeType,
    Record<never, never>,
    {
      descriptor: TwingIntlMessageDescriptorNode;
      values?: TwingExpressionNode;
      options?: TwingExpressionNode;
    }
  > {
  fragments: Record<string, TwingIntlFragmentNode>;
}

export default function createMessageNode(
  tag: string,
  descriptorNode: TwingIntlMessageDescriptorNode,
  valuesNode: TwingExpressionNode | undefined,
  optionsNode: TwingExpressionNode | undefined,
  fragmentNodes: Record<string, TwingIntlFragmentNode>,
  line: number,
  column: number,
): TwingIntlMessageNode {
  return {
    type: messageNodeType,
    tag,
    attributes: {},
    children: {
      descriptor: descriptorNode,
      ...(valuesNode == null ? {} : { values: valuesNode }),
      ...(optionsNode == null ? {} : { options: optionsNode }),
    },
    fragments: fragmentNodes,
    line,
    column,
  };
}
