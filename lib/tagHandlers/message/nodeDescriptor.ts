import type { TwingBaseNode, TwingExpressionNode } from 'twing';

export const messageDescriptorNodeType = 'intl_message_descriptor';

export type TwingIntlMessageDescriptorNode = TwingBaseNode<
  typeof messageDescriptorNodeType,
  Record<never, never>,
  { expression: TwingExpressionNode }
>;

export default function createMessageDescriptorNode(expression: TwingExpressionNode): TwingIntlMessageDescriptorNode {
  const { line, column } = expression;
  return {
    tag: null,
    type: messageDescriptorNodeType,
    attributes: {},
    children: { expression },
    line,
    column,
  };
}
