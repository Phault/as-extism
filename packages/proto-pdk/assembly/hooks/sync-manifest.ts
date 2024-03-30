import { ToolContext } from "../shared";


@json
export class SyncManifestInput {
  context: ToolContext = new ToolContext();
}


@json
export class SyncManifestOutput {
  versions: string[] | null = null;
  skip_sync: bool = false;
}
