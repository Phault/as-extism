import { LogLevel } from "@extism/as-pdk";
import { Host } from "./host";
import { Result, err } from "./result";

export function abort(
  message: string,
  fileName: string,
  line: u32,
  column: u32,
): void {
  const error = `Unrecoverable error occured at ${fileName}:${line}:${column} with message '${message}'`;
  Host.log(LogLevel.Error, error);
  Host.errorString(error);
}

/**
 * An error with a return code.
 */
export class FnError extends Error {
  constructor(
    message: string = "",
    public returnCode: i32 = -1,
  ) {
    super(message);
  }


  @inline
  toResult<T>(): Result<T, FnError> {
    return err<T, FnError>(this);
  }
}
