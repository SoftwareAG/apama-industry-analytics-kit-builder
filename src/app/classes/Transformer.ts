import {Channel} from "./Channel";
import {MatchesPredicate} from "../decorators/MatchesPredicate";
import {ValidateNested, Validator, IsIn, IsNotEmpty, IsString, ArrayUnique} from "class-validator";

const validator = new Validator();

export class PropertyDef {
  @IsString()
  @IsNotEmpty()
  readonly name: string;
  @IsIn(["integer", "string", "float", "decimal", "boolean"])
  readonly type: string;
  @IsIn([true, false, undefined])
  readonly optional?: boolean;

  constructor(props) {
    this.name = props.name;
    this.type = props.type;
    this.optional = props.optional;
  }
}

export class Property extends PropertyDef {
  @MatchesPredicate(function(value) {
    switch(typeof value) {
      case 'string': return this.type === 'string';
      case 'number': return (
        this.type === 'integer' && ((this.optional && value === undefined) || validator.isInt(value)))
        || this.type === 'float'
        || this.type === 'decimal';
      case 'boolean': return this.type === 'boolean';
      case 'undefined': //noinspection PointlessBooleanExpressionJS
        return !!this.optional;
      default: return false;
    }
  })
  value: number | string | boolean;

  constructor(props) {
    super(props);
    this.value = props.value;
  }
}

export class Transformer {
  inputChannels: Channel[] = [];
  outputChannels: Channel[] = [];
  @ValidateNested({each: true})
  @ArrayUnique()
  readonly properties: ReadonlyArray<Property>;

  constructor(properties: ReadonlyArray<Property> = []) {
    this.properties = properties;
  }
}
