import type { IntlShape, MessageDescriptor } from '@formatjs/intl';

export type TwingIntlProvider<T extends IntlShape = IntlShape> = (locale: T['locale']) => T;

export type SafeMessageDescriptor = Omit<MessageDescriptor, 'id'> & { id: string };
