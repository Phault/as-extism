import {
  LoadVersionsInput,
  LoadVersionsOutput,
  PluginType,
  ToolMetadataInput,
  ToolMetadataOutput,
  ok,
  Result,
  FnError,
} from "@as-extism/proto-pdk";

// @ts-ignore
@pluginFunction()
export function load_versions(
  input: LoadVersionsInput,
): Result<LoadVersionsOutput, FnError> {
  const output = new LoadVersionsOutput();
  output.versions = ["1.0.0"];
  output.latest = "1.0.0";

  return ok<LoadVersionsOutput, FnError>(output);
}

// @ts-ignore
@pluginFunction()
export function register_tool(
  input: ToolMetadataInput,
): Result<ToolMetadataOutput, FnError> {
  const output = new ToolMetadataOutput();
  output.name = "plugin-test";
  output.type_of = PluginType.CLI;
  output.plugin_version = "0.0.1";
  output.self_upgrade_commands = [];

  return ok<ToolMetadataOutput, FnError>(output);
}
