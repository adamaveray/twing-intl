import type { TwingTagHandler, TwingTokenParser } from 'twing';

import parseLocale from './parser.ts';

export default function createIntlLocaleTagHandler(tag: string): TwingTagHandler {
  return {
    tag,
    initialize(parser, _): TwingTokenParser {
      return (_2, stream) => parseLocale(parser, stream, this.tag);
    },
  };
}
