import type { TwingParser, TwingTokenStream } from 'twing';
import { createParsingError } from 'twing';

import { testNextIsTag } from '#/utils/parsing.ts';
import type { TwingIntlFragmentNode } from '#tagHandlers/fragment/node.ts';
import type { FragmentTokenParser } from '#tagHandlers/fragment/tagHandler.ts';

type FragmentNodes = Record<string, TwingIntlFragmentNode>;

export default function parseMessageBody(
  _: TwingParser,
  stream: TwingTokenStream,
  fragmentTag: string,
  fragmentTokenParser: FragmentTokenParser,
): FragmentNodes {
  stream.nextIf('WHITESPACE');

  const fragmentNodes: FragmentNodes = {};
  while (testNextIsTag(stream, fragmentTag)) {
    const { line, column } = stream.current;
    const fragment = fragmentTokenParser(stream.current, stream);
    const { name } = fragment.attributes;
    if (name in fragmentNodes) {
      throw createParsingError(`Duplicate fragment "${name}".`, { line, column }, stream.source);
    }
    fragmentNodes[name] = fragment;

    stream.nextIf('WHITESPACE');
  }

  return fragmentNodes;
}
