import type { TwingBaseNode } from 'twing';

export const fragmentNodeType = 'intl_fragment';

export type TwingIntlFragmentNode = TwingBaseNode<
  typeof fragmentNodeType,
  { name: string; blockArgumentName?: string },
  { body: TwingBaseNode }
>;

export default function createFragmentNode(
  tag: string,
  name: string,
  blockArgumentName: string | undefined,
  body: TwingBaseNode,
  line: number,
  column: number,
): TwingIntlFragmentNode {
  return {
    type: fragmentNodeType,
    tag,
    attributes: { name, blockArgumentName },
    children: { body },
    line,
    column,
  };
}
