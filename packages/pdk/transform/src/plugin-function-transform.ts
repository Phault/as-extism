import { utils } from "visitor-as/dist/index.js";
import {
  FunctionDeclaration,
  NamedTypeNode,
  Parser,
  Source,
  Tokenizer,
  Node,
} from "assemblyscript";
import { SourceTransformVisitor } from "./source-transform.js";

/**
 * Turns this:
 *
 * ```ts
 * ＠pluginFunction()
 * export function init(input: InitInput): Result<InitOutput, FnError> {
 *  if (input.protocalVersion < 2) {
 *    const error = new UnsupportedVersionError();
 *    return err<InitOutput, FnError>(error);
 *  }
 *
 *  const output = new InitOutput();
 *  output.displayName = "my-awesome-plugin"
 *  return ok<InitOutput, FnError>(output)
 * }
 * ```
 *
 * ... into something like this:
 *
 * ```ts
 * export function init(): i32 {
 *   function inner(input: InitInput): Result<InitOutput, FnError> {
 *     if (input.protocalVersion < 2) {
 *       const error = new UnsupportedVersionError();
 *       return err<InitOutput, FnError>(error);
 *     }
 *
 *     const output = new InitOutput();
 *     output.displayName = "my-awesome-plugin"
 *     return ok<InitOutput, FnError>(output)
 *   }
 *
 *   return pluginFunctionWithInputAdapter<InitInput, InitOutput, FnError>(init);
 * }
 * ```
 */
export function PluginFunctionTransform<
  TBase extends new (...args: any[]) => SourceTransformVisitor,
>(Base: TBase) {
  return class PluginFunctionTransform extends Base {
    parser: Parser = null!;

    public override _visit(node: Node): Node {
      return super._visit(node);
    }

    override visitFunctionDeclaration(node: FunctionDeclaration) {
      node = super.visitFunctionDeclaration(node);

      if (!utils.hasDecorator(node, "pluginFunction")) {
        return node;
      }

      const name = utils.getName(node);

      const returnType = node.signature.returnType as NamedTypeNode;
      if (!returnType || utils.getTypeName(returnType.name) !== "Result") {
        throw new Error(
          `Unexpected return type for plugin function '${name}': expected Result<T, E> but found '${utils.toString(node.signature.returnType)}'`,
        );
      }

      const inputTypeNode = node.signature.parameters.at(0)?.type;
      const inputType = inputTypeNode ? utils.toString(inputTypeNode) : null;
      const okType = utils.toString(returnType.typeArguments!.at(0)!);
      const errType = utils.toString(returnType.typeArguments!.at(1)!);

      const pluginFunctionAdapter = inputType
        ? "pluginFunctionWithInputAdapter"
        : "pluginFunctionAdapter";
      const adapterTypeParams = [inputType, okType, errType]
        .filter(Boolean)
        .join(",");

      const { [pluginFunctionAdapter]: adapter } = this.addImport(
        "@as-extism/pdk",
        pluginFunctionAdapter,
      );

      const inner = utils.cloneNode(node);
      inner.name.text = "inner";
      inner.decorators = null;
      inner.flags = 0;

      const body = `
        export function ${name}(): i32 {
          ${utils.toString(inner)}
          return ${adapter}<${adapterTypeParams}>(inner);
        }
      `;

      const tokenizer = new Tokenizer(
        new Source(
          /* SourceKind.User */ 0,
          node.range.source.internalPath,
          body,
        ),
      );

      return this.parser.parseTopLevelStatement(
        tokenizer,
      ) as FunctionDeclaration;
    }
  };
}

export default PluginFunctionTransform(SourceTransformVisitor);
