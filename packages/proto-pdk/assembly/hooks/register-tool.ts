import { PluginType } from "../shared";


@json
export class ToolMetadataInput {
  id: string = "";
}


@json
export class ToolMetadataOutput {
  default_version: string | null = null;
  inventory: ToolInventoryMetadata = new ToolInventoryMetadata();
  name: string = "";
  plugin_version: string | null = null;
  self_upgrade_commands: string[] = [];
  type_of: string = PluginType.Language;
}


@json
export class ToolInventoryMetadata {
  disable_progress_bars: bool = false;
  override_dir: string | null = null;
  version_suffix: string | null = null;
}
