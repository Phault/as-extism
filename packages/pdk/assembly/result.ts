import { Variant } from "as-variant/assembly";

// @ts-ignore
@inline
export function ok<T, E>(value: T): Result<T, E> {
  return Result.ok<T, E>(value);
}

// @ts-ignore
@inline
export function err<T, E>(value: E): Result<T, E> {
  return Result.err<T, E>(value);
}

/**
 * Result<T, E> is the type used for returning and propagating errors.
 *
 * It is heavily inspired by Rust's API.
 *
 * To represent an empty result or error, please use our `Void` type rather than `void`.
 */
export class Result<T, E> {
  private data: Variant;

  private constructor(data: Variant) {
    this.data = data;
  }


  @inline
  public static ok<T, E>(data: T): Result<T, E> {
    assertNotVoid<T>();
    assertNotVoid<E>();
    return new Result<T, E>(Variant.from(new Ok<T>(data)));
  }


  @inline
  public static err<T, E>(data: E): Result<T, E> {
    assertNotVoid<T>();
    assertNotVoid<E>();
    return new Result<T, E>(Variant.from(new Err<E>(data)));
  }

  // TODO: uncertain about this name, it could also be understood as procuding Result<T[], E[]>
  public static fromArray<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const items = new Array<T>(results.length);

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (!result) continue;

      if (result.isErr) {
        return err<T[], E>(result.unwrapErr());
      }

      items[i] = result.unwrap();
    }

    return ok<T[], E>(items);
  }


  @inline
  get isOk(): bool {
    return this.data.is<Ok<T>>();
  }


  @inline
  get isErr(): bool {
    return this.data.is<Err<E>>();
  }


  @inline
  public unwrap(): T {
    return this.data.get<Ok<T>>().value;
  }


  @inline
  public unwrapErr(): E {
    return this.data.get<Err<E>>().value;
  }


  @inline
  public expect(message: string): T {
    if (!this.isErr) {
      return this.unwrap();
    }

    if (isString<E>()) {
      throw new Error(`${message}; ${this.unwrapErr() as string}`);
    } else if (isReference<E>()) {
      const maybeError = this.unwrapErr() as Error;
      throw new Error(
        maybeError ? `${message}; ${maybeError.message}` : message,
      );
    } else {
      throw new Error(message);
    }
  }


  @inline
  public expectErr(message: string): E {
    if (this.isErr) throw new Error(message);
    return this.unwrapErr();
  }

  public andThen<U>(mapper: (data: T) => Result<U, E>): Result<U, E> {
    assertNotVoid<U>();

    return this.isOk
      ? mapper(this.data.getUnchecked<Ok<T>>().value)
      : changetype<Result<U, E>>(this);
  }

  public orElse<F>(mapper: (data: E) => Result<T, F>): Result<T, F> {
    assertNotVoid<F>();

    return this.isOk
      ? changetype<Result<T, F>>(this)
      : mapper(this.data.getUnchecked<Err<E>>().value);
  }


  @inline
  public map<U>(mapper: (data: T) => U): Result<U, E> {
    assertNotVoid<U>();

    // inlined manually due to lack of closure support :(
    return this.isOk
      ? ok<U, E>(mapper(this.data.getUnchecked<Ok<T>>().value))
      : changetype<Result<U, E>>(this);
  }


  @inline
  public mapErr<F>(mapper: (data: E) => F): Result<T, F> {
    assertNotVoid<F>();

    // inlined manually due to lack of closure support :(
    return this.isOk
      ? changetype<Result<T, F>>(this)
      : err<T, F>(mapper(this.data.getUnchecked<Err<E>>().value));
  }

  public inspect(fn: (data: T) => void): this {
    if (this.isOk) {
      fn(this.data.getUnchecked<Ok<T>>().value);
    }
    return this;
  }

  public inspectErr(fn: (data: E) => void): this {
    if (this.isErr) {
      fn(this.data.getUnchecked<Err<E>>().value);
    }
    return this;
  }

  public select<Return = void>(
    ifOk: (data: T) => Return,
    ifErr: (data: E) => Return,
  ): Return {
    return this.isOk
      ? ifOk(this.data.getUnchecked<Ok<T>>().value)
      : ifErr(this.data.getUnchecked<Err<E>>().value);
  }
}

class Ok<T> {
  constructor(public readonly value: T) {}
}

class Err<E> {
  constructor(public readonly value: E) {}
}

// @ts-ignore
@inline
function assertNotVoid<T>(): void {
  assert(!isVoid<T>(), "using void with Result<T, E> is not supported");
}
