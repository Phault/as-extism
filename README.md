# as-extism

This project started as an exploration into using AssemblyScript as a simpler tech stack to write plugins
for [proto](https://moonrepo.dev/proto) with, as I feel there's a big gap there between TOML-based and Rust-based plugins.

However it ended up as an exploration into improving the Extism AssemblyScript PDK, adding features such as:

- JSON support (via [as-json](https://github.com/JairusSW/as-json))
- Type-safe inputs and outputs
- Macros (aka. transforms) via decorators for type-safe WASM imports and exports
- `Result<T, E>` class as AssemblyScript does not support catching exceptions
- Abort handler so that panics are caught and communicated to the host

## Contents

- [extism pdk](./packages/pdk/README.md)
- [proto pdk](./packages/proto-pdk/README.md)
- [proto test plugin](./packages/test-plugin/README.md)

## Maintainence

I do not intend to maintain this repository, nor are the packages going to be published on npm.

I am going to reach out to the maintainers of the official Extism PDK, to see if there's any interest in upstreaming
any of the work.

If you're interested in any of the packages, feel free to fork or rip out what you need.

## Development

This project uses:

- node@20
- npm@10
- [moon@1.23.1](https://moonrepo.dev/moon)
- [proto@0.32.1](https://moonrepo.dev/proto)

proto is not a requirement, except for testing the proto test-plugin (duh).

```bash
# build all packages
moon run :build

# build test-plugin
moon run test-plugin:build
```
