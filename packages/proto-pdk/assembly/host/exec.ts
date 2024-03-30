import { FnError, Result } from "@as-extism/pdk";


@json
export class ExecCommandInput {
  args: string[] = [];
  command: string = "";
  env: Map<string, string> = new Map();
  set_executable: bool = false;
  stream: bool = false;
  //   working_dir: VirtualPath | null = null;
}


@json
export class ExecCommandOutput {
  command: string = "";
  exit_code: i32 = 0;
  stderr: string = "";
  stdout: string = "";
}

// @ts-ignore
@hostFunction("exec_command")
export declare function execCommand(
  input: ExecCommandInput,
): Result<ExecCommandOutput, FnError>;
