import { ToolContext } from "../shared";


@json
export class LocateExecutablesInput {
  context: ToolContext = new ToolContext();
}


@json
export class LocateExecutablesOutput {
  globals_lookup_dirs: string[] = [];
  globals_prefix: string | null = null;
  primary: ExecutableConfig | null = null;
  secondary: Map<string, ExecutableConfig> = new Map();
}


@json
export class ExecutableConfig {
  exe_path: string | null = null;
  exe_link_path: string | null = null;
  no_bin: bool = false;
  no_shim: bool = false;
  parent_exe_name: string | null = null;
  // TODO: figure out how to do this without tuples
  // shim_before_args: string | string[] | null = null;
  // shim_after_args: string | string[] | null = null;
  shim_env_vars: Map<string, string> | null = null;

  constructor(exe_path: string, parent_exe: string | null = null) {
    this.exe_path = exe_path;
    this.parent_exe_name = parent_exe;
  }
}
