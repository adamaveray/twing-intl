import type { TwingTokenStream } from 'twing';

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
