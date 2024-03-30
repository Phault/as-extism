
@json
export class ToolContext {
  proto_version: string | null = null;
  tool_dir: string = "";
  version: string = "";
}

export abstract class PluginType {
  static Language: string = "language";
  static DependencyManager: string = "dependencyManager";
  static CLI: string = "cli";
}
