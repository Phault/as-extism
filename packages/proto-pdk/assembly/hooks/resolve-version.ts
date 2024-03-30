
@json
export class ResolveVersionInput {
  initial: string = "";
}


@json
export class ResolveVersionOutput {
  candidate: string | null = null;
  version: string | null = null;
}
