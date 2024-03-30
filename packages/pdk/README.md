# @as-extism/pdk

An expanded version of the Extism PDK for AssemblyScript.

## Features

- JSON support (via [as-json](https://github.com/JairusSW/as-json))
- Type-safe inputs and outputs
- Macros (aka. transforms) via decorators for type-safe WASM imports and exports
- `Result<T, E>` type as AssemblyScript does not support catching exceptions
- Abort handler so that panics are caught and communicated to the host

Still missing:

- HTTP requests
- Type-safe plugin variables (i.e. `var_set` and `var_get` wrappers)
- Type-safe config (i.e. a `config_get` wrapper)
- Tests & documentation

I imagine these would be very simple to implement now, but I've simply lost all
~~hope~~ interest in AssemblyScript.

## Installation

> Sorry, this won't be published on npm, I have no intention to maintain this.

Make sure to extend our `asconfig.json`, so that JSON and our decorators work,
like so:

```json
{
  "extends": "@as-extism/pdk/config"
}
```

## Usage

### Exporting plugin functions

You can export function to the plugin host via the `pluginFunction` decorator,
which will transform your function at compile time to take care of type conversions
and data transmission.

```ts
import { Result, FnError, ok, err, Json } from "@as-extism/pdk";


@json
class DivideInput {
  constructor(
    public a: f32,
    public b: f32,
  ) {}
}

// Our pretend host expects a JSON number, but not wrapped in an object,
// so we use the Json wrapper.
type DivideOutput = Json<f32>;


@pluginFunction
export function divide(input: DivideInput): Result<DivideOutput, FnError> {
  if (input.b === 0) {
    return err<DivideOutput, FnError>(new FnError("division by zero"));
  }

  const output = Json.new<f32>(input.a / input.b);
  return ok<DivideOutput, FnError>(output);
}
```

### Importing host functions

Similar to exporting you can import functions from the host via the `hostFunction`
decorator, which again takes care of any needed conversions:

```ts
import { Result, FnError } from "@as-extism/pdk";


@json
class ExecOutput {
  stdout: string = "";
}


@hostFunction("run_command")
export declare function runCommand(
  command: string,
  args: string[],
): Result<ExecOutput, FnError>;
```

Note that parameters do also support JSON here, but are omitted for brevity.

The above host function could then be used like so:

```ts
const result = runCommand("echo", ["hello", "world"]);

if (result.isOk) {
  const execOutput: ExecOutput = result.unwrap();
  assert(execOutput.stdout, "hello world");
} else {
  const error: FnError = result.unwrapErr();
  // recover somehow or just rethrow the error
}
```

`Result<T, E>` also has many helpful functions inspired by Rust's
implementation. However due to AssemblyScripts' lack of closure support
and poor type inference, it is not a very joyful experience using them.
