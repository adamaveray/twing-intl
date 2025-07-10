import type { TwingBaseNode, TwingExpressionNode } from 'twing';

export const localeNodeType = 'intl_locale';

export type TwingIntlLocaleNode = TwingBaseNode<
  typeof localeNodeType,
  { id: TwingExpressionNode },
  { body: TwingBaseNode }
>;

export default function createLocaleNode(
  tag: string,
  id: TwingExpressionNode,
  body: TwingBaseNode,
  line: number,
  column: number,
): TwingIntlLocaleNode {
  return {
    type: localeNodeType,
    tag,
    attributes: { id },
    children: { body },
    line,
    column,
  };
}
