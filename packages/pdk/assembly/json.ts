import { JSON } from "json-as/assembly";

/**
 * Wrapper to signal the contained value should be converted to and from JSON before transmission.
 *
 * This is only stricly necessary for primitives, as they will otherwise be sent as-is in
 * their binary form.
 */
// @ts-ignore
@final
export class Json<T> {
  public data!: T;

  private constructor() {}

  static new<T>(data: T): Json<T> {
    assert(
      isJsonConvertable(data),
      `${nameof<T>()} isn't convertable to JSON, did you forget the @json decorator?`,
    );

    const result = new Json<T>();
    result.data = data;
    return result;
  }


  @inline
  static fromString<T>(input: string): Json<T> {
    return new Json<T>().fromString(input);
  }


  @inline
  fromString(input: string): this {
    this.data = JSON.parse<T>(input);
    return this;
  }


  @inline
  toString(): string {
    return JSON.stringify<T>(this.data);
  }
}

export function isJsonConvertable<T>(value: T = changetype<T>(0)): bool {
  return (
    isInteger(value) ||
    isBoolean(value) ||
    isArrayLike(value) ||
    isFloat(value) ||
    isString(value) ||
    (isNullable(value) && value === null) ||
    value instanceof Map ||
    value instanceof Date ||
    // @ts-ignore: Hidden function
    isDefined(value.__JSON_Serialize) ||
    // @ts-ignore: Hidden function
    isDefined(value.__JSON_Set_Key)
  );
}

export { JSON };
