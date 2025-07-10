import type { TwingParser, TwingTokenStream } from 'twing';

import { endTagName } from '#/utils/parsing.ts';

import type { TwingIntlFragmentNode } from './node.ts';
import createFragmentNode from './node.ts';

/**
 * Parses a fragment's opening tag. A tag may provide a single block name. Empty arguments (`()`) are ignored.
 *
 * Allowed syntax:
 * - `{% fragment name() %}`
 * - `{% fragment name(block) %}`
 *
 * Invalid syntax:
 * - `{% fragment name additional %}`
 * - `{% fragment name(block1, block2) %}`
 * - `{% fragment name('value') %}`
 */
function parseOpen(
  _: TwingParser,
  stream: TwingTokenStream,
  tag: string,
): { name: string; blockArgumentName: string | undefined } {
  stream.expect('TAG_START');
  stream.expect('NAME', tag);

  // Fragment name
  const name = stream.expect('NAME', null, 'A fragment name must be set.').value as string;

  // Optional block name
  let blockArgumentName: string | undefined;
  if ((stream.nextIf('PUNCTUATION', '(') as unknown) != null) {
    if (!stream.test('PUNCTUATION', ')')) {
      blockArgumentName = stream.expect('NAME', null, 'A block argument name must be provided.').value as string;
    }
    stream.expect('PUNCTUATION', ')');
  }

  stream.expect('TAG_END');

  return { name, blockArgumentName };
}

function parseClose(_: TwingParser, stream: TwingTokenStream, tag: string, name: string): void {
  stream.expect('NAME', endTagName(tag));
  stream.nextIf('NAME', name);
  stream.expect('TAG_END');
}

export default function parseFragment(
  parser: TwingParser,
  stream: TwingTokenStream,
  tag: string,
): TwingIntlFragmentNode {
  const { line, column } = stream.current;

  const { name, blockArgumentName } = parseOpen(parser, stream, tag);

  parser.pushLocalScope();
  const tagEnd = endTagName(tag);
  const body = parser.subparse(stream, tag, (token) => token.test('NAME', tagEnd));
  parser.popLocalScope();

  parseClose(parser, stream, tag, name);

  return createFragmentNode(tag, name, blockArgumentName, body, line, column);
}
