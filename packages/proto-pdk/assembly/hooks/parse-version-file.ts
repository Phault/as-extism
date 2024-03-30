
@json
export class ParseVersionFileInput {
  contents: string = "";
  file: string = "";
}


@json
export class ParseVersionFileOutput {
  version: string | null = null;
}
