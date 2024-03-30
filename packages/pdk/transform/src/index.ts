import { SourceTransformVisitor } from "./source-transform.js";
import { HostFunctionTransform } from "./host-function-transform.js";
import { PluginFunctionTransform } from "./plugin-function-transform.js";
import { Parser } from "assemblyscript";
import { AddJsonImportTransform } from "./add-json-import-transform.js";

class Combined extends PluginFunctionTransform(
  HostFunctionTransform(AddJsonImportTransform(SourceTransformVisitor)),
) {
  afterParse(parser: Parser) {
    this.parser = parser;

    const sources = parser.sources;

    for (const source of sources) {
      this["visit"](source);
    }
  }
}

export default Combined;
