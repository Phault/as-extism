import { utils } from "visitor-as/dist/index.js";
import {
  FunctionDeclaration,
  NamedTypeNode,
  Parser,
  Source,
  Tokenizer,
} from "assemblyscript";
import { Node } from "types:assemblyscript/src/ast";
import { SourceTransformVisitor } from "./source-transform.js";

/**
 * Turns this:
 *
 * ```ts
 * ＠hostFunction("get_or_set")
 * export declare function getOrSet(name: string, value: string): Result<string, FnError>;
 * ```
 *
 * ... into something like this:
 *
 * ```ts
 * ＠external("extism:host/user", "get_or_set")
 * declare function __get_or_set(name: u64, value: u64): u64;
 *
 * export function getOrSet(name: string, value: string): Result<string, FnError> {
 *   return Result.fromArray([storeTypedInput(name), storeTypedInput(name)])
 *     .map<u64>((inputs: u64[]) => __get_or_set(inputs[0], inputs[1]))
 *     .andThen((output: u64) => loadTypedOutput<string>(output));
 * }
 * ```
 */
export function HostFunctionTransform<
  TBase extends new (...args: any[]) => SourceTransformVisitor,
>(Base: TBase) {
  return class HostFunctionTransform extends Base {
    parser: Parser = null!;

    public override _visit(node: Node): Node {
      return super._visit(node);
    }

    override visitFunctionDeclaration(node: FunctionDeclaration) {
      node = super.visitFunctionDeclaration(node);

      const decorator = utils.getDecorator(node, "hostFunction");
      if (!decorator) {
        return node;
      }

      const name = utils.getName(node);

      // @ts-ignore
      const externalName = decorator?.args?.at(0).value ?? name;

      const returnType = node.signature.returnType as NamedTypeNode;
      if (!returnType || utils.getTypeName(returnType.name) !== "Result") {
        throw new Error(
          `Unexpected return type for host function '${name}': expected Result<T, E> but found '${utils.toString(node.signature.returnType)}'`,
        );
      }

      const okType = utils.toString(returnType.typeArguments!.at(0)!);

      // TODO: pretty dumb
      const rawParams = node.signature.parameters
        .map((p) => `${utils.getName(p)}: u64`)
        .join(",");
      const rawReturnType = okType.toLowerCase() === "void" ? "void" : "u64";

      this.addTopLevelStatement(`
        @external("extism:host/user", "${externalName}")
        declare function __${externalName}(${rawParams}): ${rawReturnType};
      `);

      const { storeTypedInput, loadTypedOutput } = this.addImport(
        "@as-extism/pdk",
        "storeTypedInput",
        "loadTypedOutput",
      );

      const inputs = node.signature.parameters
        .map((p) => `${storeTypedInput}(${utils.getName(p)})`)
        .join(",");

      const inputIndices = node.signature.parameters
        .map((_, i) => `inputs[${i}]`)
        .join(",");

      const body =
        okType.toLowerCase() === "void"
          ? `
        {
            return Result.fromArray([${inputs}])
              .map<Void>((inputs: u64[]) => {
                __${externalName}(${inputIndices})
                return null;
              });
        }
      `
          : `
        {
          return Result.fromArray([${inputs}])
            .map<${rawReturnType}>((inputs: u64[]) => __${externalName}(${inputIndices}))
            .andThen((output: ${rawReturnType}) => ${loadTypedOutput}<${okType}>(output));
        }
      `;

      const tokenizer = new Tokenizer(
        new Source(
          /* SourceKind.User */ 0,
          node.range.source.internalPath,
          body,
        ),
      );
      node.body = this.parser.parseStatement(tokenizer);
      node.decorators?.splice(node.decorators.indexOf(decorator), 1);
      node.flags &= ~4; // CommonFlags.Declare
      node.flags &= ~32768; // CommonFlags.Ambient
      return node;
    }
  };
}

export default HostFunctionTransform(SourceTransformVisitor);
