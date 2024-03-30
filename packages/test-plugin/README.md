# test-plugin

A demonstration of both [pdk](../pdk/README.md) and [proto-pdk](../proto-pdk/README.md).

## Building

```bash
moon run test-plugin:build
```

## Testing

> You will need proto installed for this.

After building the test-plugin, you can test it with proto like so:

```bash
# required so the .prototools is detected
cd packages/test-plugin

# this will trigger both the register_tool and load_versions exports
proto list-remote test-plugin
```
