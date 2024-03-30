import { Host } from "./host";
import { fromArrayBuffer, toArrayBuffer } from "./array-buffer";
import { Result, ok } from "./result";
import { Void, isVoidLike } from "./void";
import { FnError } from "./errors";

function handleReturn<Out>(out: Result<Out, FnError>): i32 {
  return out
    .andThen<Void>((out) => {
      if (isVoidLike<Out>()) return ok<Void, FnError>(null);
      else return storeTypedOutput<Out>(out);
    })
    .inspectErr((err) =>
      storeTypedError<FnError>(err).expect("Failed to store typed error"),
    )
    .select<i32>(
      () => 0,
      (err) => err.returnCode,
    );
}

export function pluginFunctionAdapter<Out, Err extends FnError>(
  inner: () => Result<Out, Err>,
): i32 {
  const output = inner();
  return handleReturn<Out>(output);
}

export function pluginFunctionWithInputAdapter<In, Out, Err extends FnError>(
  inner: (input: In) => Result<Out, Err>,
): i32 {
  const output = loadTypedInput<In>().andThen<Out>(inner);
  return handleReturn<Out>(output);
}

// @ts-ignore
@inline
export function loadTypedInput<T>(): Result<T, FnError> {
  return fromArrayBuffer<T>(Host.input().buffer);
}

// @ts-ignore
@inline
export function storeTypedOutput<T>(output: T): Result<Void, FnError> {
  return toArrayBuffer<T>(output).map<Void>((buffer: ArrayBuffer) => {
    Host.output(Uint8Array.wrap(buffer));
    return null;
  });
}

// @ts-ignore
@inline
export function storeTypedError<T>(error: T): Result<Void, FnError> {
  return toArrayBuffer<T>(error).map<Void>((buffer: ArrayBuffer) => {
    Host.error(Uint8Array.wrap(buffer));
    return null;
  });
}
