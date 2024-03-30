import { JSON } from "json-as/assembly";
import { Result, ok } from "./result";
import { FnError } from "./errors";
import { Json, isJsonConvertable } from "./json";

/*
 * These functions look too huge to inline, but all type checks will be eliminated.
 */

// @ts-ignore
@inline
export function toArrayBuffer<T>(value: T): Result<ArrayBuffer, FnError> {
  let result: ArrayBuffer;

  if (isInteger(value)) {
    result = new Uint64Array(1).fill(value).buffer;
  } else if (isFloat(value)) {
    result = new Float64Array(1).fill(value).buffer;
  } else if (isBoolean(value)) {
    result = new Int32Array(1).fill(i32(value)).buffer;
  } else if (isString(value)) {
    result = String.UTF8.encode(value.toString());
  } else if (value instanceof Error) {
    result = String.UTF8.encode(value.toString());
  } else if (value instanceof Json) {
    result = String.UTF8.encode(value.toString());
  } else if (isJsonConvertable(value)) {
    result = String.UTF8.encode(JSON.stringify<T>(value));
  } else {
    return new FnError(
      `unsupported type: ${nameof(value)}`,
    ).toResult<ArrayBuffer>();
  }

  return ok<ArrayBuffer, FnError>(result);
}

// @ts-ignore
@inline
export function fromArrayBuffer<T>(buffer: ArrayBuffer): Result<T, FnError> {
  let result: T = changetype<T>(0);

  if (isInteger<T>()) {
    result = <T>Uint64Array.wrap(buffer).at(0);
  } else if (isFloat<T>()) {
    result = <T>Float64Array.wrap(buffer).at(0);
  } else if (isBoolean<T>()) {
    result = <T>Int32Array.wrap(buffer).at(0);
  } else if (isString<T>()) {
    result = <T>String.UTF8.decode(buffer);
  } else if (result instanceof Json) {
    // @ts-ignore
    result = instantiate<T>().fromString(String.UTF8.decode(buffer));
  } else if (isJsonConvertable<T>()) {
    result = JSON.parse<T>(String.UTF8.decode(buffer));
  } else {
    return new FnError(`unsupported type: ${nameof<T>()}`).toResult<T>();
  }

  return ok<T, FnError>(result);
}
