import { TransformVisitor } from "visitor-as/dist/index.js";
import { Source, Statement } from "assemblyscript";
import { parseTopLevelStatement } from "./utils.js";
import assert from "assert";

// doesn't currently support nested source visits
export class SourceTransformVisitor extends TransformVisitor {
  #moduleAliases = new Map<string, string>();
  #currentSource: Source | null = null;

  override visitSource(node: Source): Source {
    this.#moduleAliases.clear();
    this.#currentSource = node;

    return super.visitSource(node);
  }

  addTopLevelStatement(code: string, index?: number): Statement {
    assert(this.#currentSource);

    const statement = parseTopLevelStatement(
      this.#currentSource.range.source.internalPath,
      code,
    )!;
    this.#currentSource.statements.splice(
      index ?? this.#currentSource.statements.length,
      0,
      statement,
    );
    return statement;
  }

  addImport<Identifier extends string>(
    module: string,
    ...imports: Identifier[]
  ): Record<Identifier, string> {
    let alias = this.#moduleAliases.get(module);

    if (!alias) {
      alias = `__${module.replace(/[^a-zA-Z0-9_]/g, "")}`;
      this.addTopLevelStatement(`import * as ${alias} from '${module}';`);
      this.#moduleAliases.set(module, alias);
    }

    const aliased = Object.fromEntries(
      imports.map((id) => [id, `${alias}.${id}`]),
    );
    return aliased as Record<Identifier, string>;
  }
}
