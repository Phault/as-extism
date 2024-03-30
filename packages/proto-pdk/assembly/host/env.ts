import { Result, FnError, Void } from "@as-extism/pdk";

// @ts-ignore
@hostFunction("get_env_var")
export declare function getEnvVar(name: string): Result<string, FnError>;

// @ts-ignore
@hostFunction("set_env_var")
export declare function setEnvVar(
  name: string,
  value: string,
): Result<Void, FnError>;
