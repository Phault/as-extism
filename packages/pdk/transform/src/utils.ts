import { Parser, Source, Tokenizer } from "assemblyscript";

export function parseTopLevelStatement(sourcePath: string, code: string) {
  const tokenizer = new Tokenizer(
    new Source(/* SourceKind.User */ 0, sourcePath, code),
  );
  const parser = new Parser();
  parser.currentSource = tokenizer.source;
  return parser.parseTopLevelStatement(tokenizer);
}
