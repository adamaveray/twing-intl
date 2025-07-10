import type { TwingTagHandler } from 'twing';

import type { FragmentTagHandler } from '#tagHandlers/fragment/tagHandler.ts';

import parseMessage from './parser.ts';

export default function createIntlMessageTagHandler(
  tag: string,
  fragmentTagHandler: FragmentTagHandler,
): TwingTagHandler {
  return {
    tag,
    initialize(parser, level) {
      const fragmentTokenParser = fragmentTagHandler.initialize(parser, level);
      return (_, stream) => parseMessage(parser, stream, this.tag, fragmentTagHandler.tag, fragmentTokenParser);
    },
  };
}
