import type { TwingTokenParser, TwingTokenStream } from 'twing';

export type Token = Parameters<TwingTokenParser>[0]; // Would require adding an explicit dependency on 'twig-lexer' if imported directly

export function endTagName(tag: string): string {
  return `end${tag}`;
}

export function testNextIsTag(stream: TwingTokenStream, value?: string): boolean {
  if (!stream.test('TAG_START')) {
    return false;
  }

  const peeked = stream.look(1);
  if (peeked.type !== 'NAME' || (value != null && peeked.value !== value)) {
    return false;
  }

  return true;
}

const whitespace = /^ +$/u;

function isWhitespaceToken(token: Token | null): boolean {
  if (token == null) {
    return false;
  }
  return token.test('WHITESPACE') || (token.test('TEXT') && whitespace.test(token.value as string));
}

function skipWhile<T extends TwingTokenStream>(stream: T, shouldSkip: (token: Token | null) => boolean): void {
  while (shouldSkip(stream.current as Token | null)) {
    stream.next();
  }
}

export function skipWhitespace(stream: TwingTokenStream): void {
  skipWhile(stream, (token) => isWhitespaceToken(token));
}
