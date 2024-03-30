import { Host as BaseHost, Memory } from "@extism/as-pdk";
import { error_set } from "@extism/as-pdk/lib/env";

export class Host extends BaseHost {
  public static error(buffer: Uint8Array): void {
    // piggybacking on Memory here as @extism/as-pdk does not expose its internal store() function
    const memory = Memory.allocateBytes(buffer);
    this.errorMemory(memory);
  }

  public static errorMemory(memory: Memory): void {
    // how come output_set needs the length, but this doesn't?
    error_set(memory.offset);
  }

  public static errorString(str: string): void {
    const memory = Memory.allocateString(str);
    this.errorMemory(memory);
  }
}
