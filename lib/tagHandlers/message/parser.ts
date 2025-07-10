import type { TwingExpressionNode, TwingParser, TwingTokenStream } from 'twing';

import { endTagName } from '#/utils/parsing.ts';
import type { FragmentTokenParser } from '#tagHandlers/fragment/tagHandler.ts';

import type { TwingIntlMessageNode } from './node.ts';
import createMessageNode from './node.ts';
import type { TwingIntlMessageDescriptorNode } from './nodeDescriptor.ts';
import createMessageDescriptorNode from './nodeDescriptor.ts';
import parseMessageBody from './parserBody.ts';

/**
 * Parses a message's opening tag. A message descriptor or ID is required. Optional values can be declared, as well as options for the formatter.
 *
 * Allowed syntax:
 * - `{% message { id: 'message-id' } %}`
 * - `{% message 'message-id' %}`
 * - `{% message { id: 'message-id' } { value_name: 'value-content' } %}`
 * - `{% message { id: 'message-id' } { value_name: 'value-content' } { ignoreTag: true } %}`
 *
 * Invalid syntax:
 * - `{% message %}`
 * - `{% message { id: 'message-id' } { value_name: 'value-content' } { ignoreTag: true } extra %}`
 */

function parseOpen(
  parser: TwingParser,
  stream: TwingTokenStream,
): {
  descriptor: TwingIntlMessageDescriptorNode;
  values?: TwingExpressionNode;
  options?: TwingExpressionNode;
} {
  const descriptor = createMessageDescriptorNode(parser.parseExpression(stream));

  let values: TwingExpressionNode | undefined;
  let options: TwingExpressionNode | undefined;

  // Check for values
  if (!stream.test('TAG_END')) {
    values = parser.parseExpression(stream);

    // Check for options
    if (!stream.test('TAG_END')) {
      options = parser.parseExpression(stream);
    }
  }

  stream.expect('TAG_END');

  return { descriptor, values, options };
}

function parseClose(_: TwingParser, stream: TwingTokenStream, tag: string): void {
  stream.expect('TAG_START');
  stream.expect('NAME', endTagName(tag));
  stream.expect('TAG_END');
}

export default function parseMessage(
  parser: TwingParser,
  stream: TwingTokenStream,
  tag: string,
  fragmentTag: string,
  fragmentTokenParser: FragmentTokenParser,
): TwingIntlMessageNode {
  const { line, column } = stream.current;
  const { descriptor: descriptorNode, values: valuesNode, options: optionsNode } = parseOpen(parser, stream);
  const fragmentNodes = parseMessageBody(parser, stream, fragmentTag, fragmentTokenParser);
  parseClose(parser, stream, tag);
  return createMessageNode(tag, descriptorNode, valuesNode, optionsNode, fragmentNodes, line, column);
}
