import { Result, Void, FnError } from "@as-extism/pdk";

// @ts-ignore
@hostFunction("host_log")
export declare function hostLog(input: HostLogInput): Result<Void, FnError>;

export abstract class HostLogTarget {
  static readonly Stderr: string = "stderr";
  static readonly Stdout: string = "stdout";
  static readonly Tracing: string = "tracing";
}


@json
export class HostLogInput {
  // TODO: original is Map<string, any>, can that be kept somehow?
  data: Map<string, string> = new Map();
  message: string = "";
  target: string = HostLogTarget.Tracing;

  constructor(message: string) {
    this.message = message;
  }
}
