import { ToolContext } from "../shared";


@json
export class NativeInstallInput {
  context: ToolContext = new ToolContext();
  install_dir: string = "";
}


@json
export class NativeInstallOutput {
  error: string | null = null;
  installed: bool = false;
  skip_install: bool = false;
}
