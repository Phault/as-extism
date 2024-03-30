
@json
export class LoadVersionsInput {
  initial: string = "";
}


@json
export class LoadVersionsOutput {
  canary: string | null = null;
  latest: string | null = null;
  aliases: Map<string, string> = new Map();
  versions: string[] = [];
}
