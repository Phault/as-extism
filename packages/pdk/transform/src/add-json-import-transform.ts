import {
  Source,
  Node,
  ImportStatement,
  IdentifierExpression,
  DecoratorNode,
} from "assemblyscript";
import { parseTopLevelStatement } from "./utils.js";
import { BaseTransformVisitor } from "visitor-as/dist/baseTransform.js";

/**
 * Adds missing import statements for JSON usages introduced by json-as' transformer
 *  in certain cases.
 *
 * Should preferably be fixed upstream, but I want this project done asap.
 */
export function AddJsonImportTransform<
  TBase extends new (...args: any[]) => BaseTransformVisitor,
>(Base: TBase) {
  return class AddJsonImportTransform extends Base {
    #seenDecoratorPaths = new Set<string>();

    public override _visit(node: Node): Node {
      return super._visit(node);
    }

    override visitSource(node: Source): Source {
      node = super.visitSource(node);

      // skip this node if it already imports JSON
      for (const statement of node.statements) {
        if (!(statement instanceof ImportStatement)) continue;
        if (!statement.declarations) continue;

        for (const declaration of statement.declarations) {
          if (declaration.name.text === "JSON") {
            return node;
          }
        }
      }

      if (this.#seenDecoratorPaths.has(node.normalizedPath)) {
        const statement = parseTopLevelStatement(
          node.range.source.internalPath,
          `import { JSON } from '@as-extism/pdk`,
        )!;
        node.statements.unshift(statement);
      }

      return node;
    }

    override visitDecoratorNode(node: DecoratorNode): DecoratorNode {
      node = super.visitDecoratorNode(node);

      if (!(node.name instanceof IdentifierExpression)) return node;

      if (node.name.text === "json" || node.name.text === "serializable") {
        this.#seenDecoratorPaths.add(node.range.source.normalizedPath);
      }

      return node;
    }
  };
}
