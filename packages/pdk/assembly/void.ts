// @ts-ignore
@final
abstract class _void {}

/**
 * For when you need to represent nothing, but `void` doesn't cut it.
 *
 * This came to be so that `Result<T, E>` could contain empty values.
 *
 * Using a `Result<void, Error>` is a common use-case and at first everything looks good,
 * TypeScript is happy, but AssemblyScript will throw fits once you try to use it.
 */
export type Void = _void | null;

/**
 * Tests if the specified type is void or our fake Void. Compiles to a constant.
 */
// @ts-ignore
@inline
export function isVoidLike<T>(): bool {
  return isVoid<T>() || (isManaged<T>() && idof<nonnull<T>>() === idof<Void>());
}
