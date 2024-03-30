import { FnError, Result } from "@as-extism/pdk";

// @ts-ignore
@hostFunction("from_virtual_path")
export declare function fromVirtualPath(path: string): Result<string, FnError>;

// @ts-ignore
@hostFunction("to_virtual_path")
export declare function toVirtualPath(path: string): Result<string, FnError>;
