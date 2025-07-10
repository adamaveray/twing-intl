import type { TwingParser, TwingTokenStream } from 'twing';

import { endTagName } from '#/utils/parsing.ts';

import type { TwingIntlLocaleNode } from './node.ts';
import createLocaleNode from './node.ts';

/**
 * Parses a locale tag.
 *
 * Allowed syntax:
 * - `{% locale 'id-name' %}...{% endlocale %}`
 * - `{% locale id_variable %}...{% endlocale %}`
 *
 * Invalid syntax:
 * - `{% locale %}...{% endlocale %}`
 * - `{% locale value second %}...{% endlocale %}`
 */
export default function parseLocale(parser: TwingParser, stream: TwingTokenStream, tag: string): TwingIntlLocaleNode {
  const tagEnd = endTagName(tag);

  const { line, column } = stream.current;

  const id = parser.parseExpression(stream);
  stream.expect('TAG_END');

  parser.pushLocalScope();
  const body = parser.subparse(stream, tag, (token) => token.test('NAME', tagEnd));
  parser.popLocalScope();

  stream.expect('NAME', tagEnd);
  stream.expect('TAG_END');

  return createLocaleNode(tag, id, body, line, column);
}
