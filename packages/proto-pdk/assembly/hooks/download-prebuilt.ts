import { ToolContext } from "../shared";


@json
export class DownloadPrebuiltInput {
  context: ToolContext = new ToolContext();
  install_dir: string = "";
}


@json
export class DownloadPrebuiltOutput {
  archive_prefix: string | null = null;

  checksum_name: string | null = null;
  checksum_public_key: string | null = null;
  checksum_url: string | null = null;

  download_name: string | null = null;
  download_url: string = "";
}
