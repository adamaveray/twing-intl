import type { TwingExpressionNode, TwingParser, TwingTokenStream } from 'twing';
import { createParsingError } from 'twing';

import { endTagName, testNextIsTag } from '#/utils/parsing.ts';
import type { TwingIntlFragmentNode } from '#tagHandlers/fragment/node.ts';
import type { FragmentTokenParser } from '#tagHandlers/fragment/tagHandler.ts';

import type { TwingIntlMessageNode } from './node.ts';
import createMessageNode from './node.ts';
import type { TwingIntlMessageDescriptorNode } from './nodeDescriptor.ts';
import createMessageDescriptorNode from './nodeDescriptor.ts';

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

function parseBody(
  _: TwingParser,
  stream: TwingTokenStream,
  fragmentTag: string,
  fragmentTokenParser: FragmentTokenParser,
): Record<string, TwingIntlFragmentNode> {
  stream.nextIf('WHITESPACE');

  const fragmentNodes: Record<string, TwingIntlFragmentNode> = {};
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
  const fragmentNodes = parseBody(parser, stream, fragmentTag, fragmentTokenParser);
  parseClose(parser, stream, tag);
  return createMessageNode(tag, descriptorNode, valuesNode, optionsNode, fragmentNodes, line, column);
}
