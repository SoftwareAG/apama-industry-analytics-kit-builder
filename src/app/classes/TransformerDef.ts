import {NestedPropertyDefBuilder, PropertyDef, PropertyDefBuilder, PropertyDefJsonInterface} from "./PropertyDef";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {
  NestedTransformerChannelDefBuilder,
  TransformerChannelDef,
  TransformerChannelDefBuilder,
  TransformerChannelDefJsonInterface
} from "./TransformerChannelDef";
import {List, OrderedMap} from "immutable";
import {AbstractModel} from "./AbstractModel";

export interface TransformerDefJsonInterface {
  name: string;
  description?: string;
  group?: string;
  documentation?: string;
  properties?: PropertyDefJsonInterface[];
  inputChannels?: TransformerChannelDefJsonInterface[];
  outputChannels?: TransformerChannelDefJsonInterface[];
}

export interface TransformerDefInterface {
  name: string;
  description: string;
  group: string;
  documentation: string;
  properties: PropertyDef[];
  inputChannels: TransformerChannelDef[];
  outputChannels: TransformerChannelDef[];
}

export class TransformerDef extends AbstractModel<TransformerDefJsonInterface, never> {
  readonly name: string;
  readonly description: string;
  readonly group: string;
  readonly documentation: string;
  readonly propertiesByName: OrderedMap<string, PropertyDef>;
  readonly inputChannelsByName: OrderedMap<string, TransformerChannelDef>;
  readonly outputChannelsByName: OrderedMap<string, TransformerChannelDef>;
  get properties(){ return List(this.propertiesByName.valueSeq()) };
  get inputChannels(){ return List(this.inputChannelsByName.valueSeq()) };
  get outputChannels(){ return List(this.outputChannelsByName.valueSeq()) };

  constructor(obj: TransformerDefInterface) {
    super();
    this.name = obj.name;
    this.description = obj.description;
    this.group = obj.group;
    this.documentation = obj.documentation;
    this.propertiesByName = OrderedMap<string, PropertyDef>(obj.properties.map(prop => [prop.name, prop]));
    this.inputChannelsByName = OrderedMap<string, TransformerChannelDef>(obj.inputChannels.map(chan => [chan.name, chan]));
    this.outputChannelsByName = OrderedMap<string, TransformerChannelDef>(obj.outputChannels.map(chan => [chan.name, chan]));
  }

  toJson(): TransformerDefJsonInterface {
    return {
      name: this.name,
      description: this.description,
      group: this.group,
      documentation: this.documentation,
      properties: this.properties.toArray().map(prop => prop.toJson()),
      inputChannels: this.inputChannels.toArray().map(chan => chan.toJson()),
      outputChannels: this.outputChannels.toArray().map(chan => chan.toJson())
    }
  }

  validate(): this {
    //TODO: do some validation
    return this;
  }

  getProperty(name: string): PropertyDef {
    return this.propertiesByName.get(name);
  }

  getRepeatedProperty() : PropertyDef | undefined {
    // return the repeated property in the Analytic if one exists
    return this.propertiesByName.find((propertyDef : PropertyDef) => {
      return propertyDef.repeated == true;
    });
  }

  getInputChannel(name: string): TransformerChannelDef {
    return this.inputChannelsByName.get(name);
  }

  getOutputChannel(name: string): TransformerChannelDef {
    return this.outputChannelsByName.get(name);
  }
}

export class TransformerDefBuilder extends ClassBuilder<TransformerDef> implements TransformerDefInterface {
  name: string;
  description: string = "";
  group: string = "";
  documentation: string = "";
  properties: PropertyDef[] = [];
  inputChannels: TransformerChannelDef[] = [];
  outputChannels: TransformerChannelDef[] = [];

  Name(name): this {
    this.name = name;
    return this;
  }
  Description(description: string): this {
    this.description = description;
    return this;
  }
  Group(group: string): this {
    this.group = group;
    return this;
  }
  Documentation(documentation: string): this {
    this.documentation = documentation;
    return this;
  }
  Properties(properties: PropertyDef[]): this {
    this.properties = properties;
    return this;
  }
  pushProperty(...property: PropertyDef[]): this {
    this.properties.push(...property);
    return this;
  }
  withProperty(): NestedPropertyDefBuilder<this> {
    return new NestedPropertyDefBuilder((property) => { this.properties.push(property); return this; });
  }
  InputChannels(inputChannels: TransformerChannelDef[]): this {
    this.inputChannels = inputChannels;
    return this;
  }
  pushInputChannel(...inputChannel: TransformerChannelDef[]): this {
    this.inputChannels.push(...inputChannel);
    return this;
  }
  withInputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => {this.inputChannels.push(channel); return this; });
  }
  OutputChannels(outputChannels: TransformerChannelDef[]): this {
    this.outputChannels = outputChannels;
    return this;
  }
  pushOutputChannel(...outputChannels: TransformerChannelDef[]): this {
    this.outputChannels.push(...outputChannels);
    return this;
  }
  withOutputChannel(): NestedTransformerChannelDefBuilder<this> {
    return new NestedTransformerChannelDefBuilder((channel) => {this.outputChannels.push(channel); return this; });
  }
  build(): TransformerDef {
    return new TransformerDef(this);
  }

  static fromJson(json: TransformerDefJsonInterface): TransformerDefBuilder {
    return new TransformerDefBuilder()
      .Name(json.name)
      .Description(json.description || "")
      .Group(json.group || "")
      .Documentation(json.documentation || "")
      .Properties((json.properties || []).map((prop) => PropertyDefBuilder.fromJson(prop).build()))
      .InputChannels((json.inputChannels || []).map((inChan) => TransformerChannelDefBuilder.fromJson(inChan).build()))
      .OutputChannels((json.outputChannels || []).map((outChan) => TransformerChannelDefBuilder.fromJson(outChan).build()))
  }
}

export class NestedTransformerDefBuilder<Parent> extends TransformerDefBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (transformerDef: TransformerDef) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class TransformerDefArrayBuilder extends ClassArrayBuilder<TransformerDef, NestedTransformerDefBuilder<TransformerDefArrayBuilder>> {
  constructor() {
    super(NestedTransformerDefBuilder);
  }
}
