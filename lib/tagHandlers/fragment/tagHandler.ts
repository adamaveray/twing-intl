import type { TwingTagHandler, TwingTokenStream } from 'twing';

import type { Token } from '#/utils/parsing.ts';

import type { TwingIntlFragmentNode } from './node.ts';
import parseFragment from './parser.ts';

export interface FragmentTagHandler extends TwingTagHandler {
  initialize(
    parser: Parameters<TwingTagHandler['initialize']>[0],
    level: Parameters<TwingTagHandler['initialize']>[1],
  ): FragmentTokenParser;
}

export type FragmentTokenParser = (token: Token, stream: TwingTokenStream) => TwingIntlFragmentNode;

export default function createIntlFragmentTagHandler(tag: string): FragmentTagHandler {
  return {
    tag,
    initialize(parser, _): FragmentTokenParser {
      return (_2, stream) => parseFragment(parser, stream, this.tag);
    },
  };
}
