import type { TwingContext, TwingExecutionContext } from 'twing';

type NormalisedMap<T extends Map<any, any>> =
  T extends Map<infer TKey, infer TValue>
    ? Record<TKey extends string | number | symbol ? TKey : never, TValue>
    : never;
type NormalisedArg<T> = T extends Map<any, any> ? NormalisedMap<T> : T extends null ? undefined : T;
type NormalisedArgs<T extends any[]> = { [K in keyof T]: NormalisedArg<T[K]> };

export function normaliseTwingArgument<T>(arg: T): NormalisedArg<T> {
  if (arg instanceof Map) {
    return Object.fromEntries(arg) as NormalisedArg<T>;
  }
  if (arg == null) {
    return undefined as NormalisedArg<T>;
  }
  return arg as NormalisedArg<T>;
}

export function normaliseTwingArguments<T extends any[]>(args: T): NormalisedArgs<T> {
  return args.map((arg) => normaliseTwingArgument(arg as T[keyof T])) as NormalisedArgs<T>;
}

export function withAddedContext<
  TExecutionContext extends TwingExecutionContext,
  TExtraContext extends Record<string, unknown>,
>(
  executionContext: TExecutionContext,
  extraContext: TExtraContext,
): Omit<TExecutionContext, 'context'> & {
  context: TExecutionContext['context'] &
    TwingContext<keyof TExtraContext & string, TExtraContext[keyof TExtraContext]>;
} {
  const context = executionContext.context.clone();
  for (const [key, value] of Object.entries(extraContext)) {
    context.set(key, value);
  }
  return {
    ...executionContext,
    context,
  };
}
