import { ToolContext } from "../shared";


@json
export class NativeUninstallInput {
  context: ToolContext = new ToolContext();
}


@json
export class NativeUninstallOutput {
  error: string | null = null;
  uninstalled: bool = false;
  skip_uninstall: bool = false;
}
