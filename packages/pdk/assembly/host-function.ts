import { Memory } from "@extism/as-pdk";
import { fromArrayBuffer, toArrayBuffer } from "./array-buffer";
import { Result } from "./result";
import { length } from "@extism/as-pdk/lib/env";
import { FnError } from "./errors";

export function storeTypedInput<T>(input: T): Result<u64, FnError> {
  return toArrayBuffer(input).map<u64>(
    (buffer: ArrayBuffer) =>
      Memory.allocateBytes(Uint8Array.wrap(buffer)).offset,
  );
}

export function loadTypedOutput<T>(rawOutputOffset: u64): Result<T, FnError> {
  const output = new Memory(
    rawOutputOffset,
    length(rawOutputOffset),
  ).toUint8Array();

  return fromArrayBuffer<T>(output.buffer);
}
