import {NestedRowBuilder, Row, RowBuilder, RowJsonInterface, RowSerializer} from "./Row";
import {ClassArrayBuilder, ClassBuilder, NestedClassBuilder} from "./ClassBuilder";
import {AsObservable, BehaviorSubjectify} from "../interfaces/interfaces";
import {BehaviorSubject, Observable} from "rxjs";
import {List} from "immutable";
import {AbstractModel} from "./AbstractModel";
import {Injectable} from "@angular/core";
import {Metadata} from "./Metadata";
import {validate} from "validate.js";
import {AbstractMetadataService} from "../services/MetadataService";
import {Transformer, TransformerBuilder} from "./Transformer";
import {TransformerDef} from "./TransformerDef";
import {PropertyBuilder, PropertySerializer} from "app/classes/Property";

export interface ConfigJsonInterface {
  name: string;
  description: string;
  metadataVersion: string;
  rows: RowJsonInterface[]
}

interface ModifiableConfigInterface {
  name: string;
  description: string;
  rows: Row[]
}

interface UnmodifiableConfigInterface {
  metadataVersion: string;
}

export interface ConfigInterface extends ModifiableConfigInterface, UnmodifiableConfigInterface {}

export class Config extends AbstractModel<ConfigJsonInterface, never> implements AsObservable, BehaviorSubjectify<ModifiableConfigInterface>, UnmodifiableConfigInterface {
  readonly name: BehaviorSubject<string>;
  readonly description: BehaviorSubject<string>;
  readonly metadataVersion: string;
  readonly rows : BehaviorSubject<List<Row>>;

  constructor(obj: ConfigInterface) {
    super();
    this.name = new BehaviorSubject(obj.name || "");
    this.description = new BehaviorSubject(obj.description || "");
    this.metadataVersion = obj.metadataVersion;
    this.rows = new BehaviorSubject(List(obj.rows));
  }

  asObservable(): Observable<this> {
    return Observable.merge(
      this.name,
      this.description,
      this.rows,
      this.rows.switchMap(rows => Observable.merge(...rows.toArray().map(row => row.asObservable())))
    ).mapTo(this);
  }

  validate(): this {
    //TODO: do some validation
    if (validate.isEmpty(this.name.getValue())) { throw new Error('Name cannot be empty'); }
    if (validate.isEmpty(this.metadataVersion)) { throw new Error('Version cannot be empty'); }
    if (this.rows.getValue().size === 0) {throw new Error('Configuration must contain at least one row'); }
    return this;
  }

  removeRow(row: Row) {
    this.rows.next(List<Row>(this.rows.getValue().filter(_row => _row !== row)));
  }
}

export class ConfigBuilder extends ClassBuilder<Config> implements ConfigInterface {
  name: string = "";
  description: string = "";
  metadataVersion: string = "0.0.0.0";
  rows: Row[] = [];

  Name(name: string): this {
    this.name = name;
    return this;
  }

  Description(description: string): this {
    this.description = description;
    return this;
  }

  MetadataVersion(metadataVersion: string): this {
    this.metadataVersion = metadataVersion;
    return this;
  }

  Rows(rows: Row[]): this {
    this.rows = rows;
    return this;
  }
  pushRow(...row: Row[]): this {
    this.rows.push(...row);
    return this;
  }
  withRow(): NestedRowBuilder<this> {
    return new NestedRowBuilder((row) => { this.rows.push(row); return this;});
  }

  build(): Config {
    return new Config(this);
  }

  static fromJson(json: ConfigJsonInterface): ConfigBuilder {
    return new ConfigBuilder()
      .Name(json.name)
      .Description(json.description)
      .Rows(json.rows.map((row) => RowBuilder.fromJson(row).build()));
  }
}

export class NestedConfigBuilder<Parent> extends ConfigBuilder implements NestedClassBuilder<Parent> {
  constructor(private callback: (config: Config) => Parent) {
    super();
  }

  endWith(): Parent {
    return this.callback(this.build());
  }
}

export class ConfigArrayBuilder extends ClassArrayBuilder<Config, NestedConfigBuilder<ConfigArrayBuilder>> {
  constructor() {
    super(NestedConfigBuilder);
  }
}

@Injectable()
export class ConfigSerializer {

  constructor(private rowSerializer: RowSerializer, private metadataService: AbstractMetadataService) {}

  static createRow(rowBuilder: RowBuilder, rowAnalytics : {analytic: Transformer, inChannelNames: string[], outChannelNames: string[]}[]) : Row {

    if (rowAnalytics.length) {

      rowAnalytics[0].inChannelNames.forEach( (inChannelName, i) => {
        rowBuilder.withInputChannel(i).Name(inChannelName).endWith();
      });

      rowAnalytics[rowAnalytics.length > 1 ? rowAnalytics.length - 1 : 0].outChannelNames.forEach( (outChannelName, i) => {
        rowBuilder.withOutputChannel(i).Name(outChannelName).endWith();
      });
    }

    rowBuilder.Transformers(rowAnalytics.map( analytic => {
      return analytic.analytic;
    }));

    return rowBuilder.build();
  }

  fromApama(apama: string) : Config {
    const self = this;
    const apamaLines  = apama.split("\n");
    const commonPattern =/^\\\\\s*([^:]*)\s*:\s*(.*)\s*$/;
    const analyticPattern = /^com.industry.analytics.Analytic[^(]*\("([^"]*)",(\[[^\]]*]),(\[[^\]]*]),({[^}]*})/;

    const configBuilder = new ConfigBuilder();
    let rowBuilder = new RowBuilder();
    let buildingRow = false;

    const rowAnalytics : {analytic: Transformer, inChannelNames: string[], outChannelNames: string[]}[] = [];

    apamaLines.forEach((apamaLine) => {

      const match = apamaLine.match(commonPattern);
      if (match && match.length) {

        switch(match[1]) {
          case 'Name': {
            configBuilder.Name(match[2]);
            break;
          }
          case 'Description': {
            configBuilder.Description(match[2]);
            break;
          }
          case 'Version' : {
            configBuilder.MetadataVersion(match[2]);
            break;
          }
          case 'Row': {
            buildRow();
            break;
          }
        }
      } else {
          const analyticLine = apamaLine.match(analyticPattern) || [];
          if (analyticLine && analyticLine.length) {
            const [,analyticName, analyticInChannels, analyticOutChannels, analyticProperties] = analyticLine;
            buildAnalytic(analyticName, analyticInChannels, analyticOutChannels, analyticProperties);
          }
        }
    });
    if (buildingRow) {
      // Ensure that the last row is built and added to the configBuilder
      const newRow: Row = ConfigSerializer.createRow(rowBuilder, rowAnalytics);
      configBuilder.pushRow(newRow);
    }
    return configBuilder.build().validate();

    function buildRow() {
      if (buildingRow) {
        if (rowAnalytics.length) {
          const newRow: Row = ConfigSerializer.createRow(rowBuilder, rowAnalytics);
          configBuilder.pushRow(newRow);
        }
        // reset the array
        rowAnalytics.length = 0;
      }
      // Start a new rowBuilder to process this row
      rowBuilder = new RowBuilder()
        .MaxTransformerCount(3);
      buildingRow = true;
    }

    function buildAnalytic(analyticName: string, analyticInChannels: string, analyticOutChannels: string, analyticProperties: string) {
      let analytic: Transformer;
      let inChannelNames:string[] = [];
      let outChannelNames:string[] = [];

      if (buildingRow) {
        // find the transformer inside the metadata
        const transformerDef: TransformerDef = self.metadataService.metadata.getValue().getAnalytic(analyticName);
        if (transformerDef) {
          const transformerBuilder = TransformerBuilder.fromTransformerDef(transformerDef);

          // Channels
          const buildChannelResult = buildChannels(analyticInChannels, analyticOutChannels);
          inChannelNames = buildChannelResult.inChannelNames;
          outChannelNames = buildChannelResult.outChannelNames;

          // TODO: fix up and test, needs complicated logic
          inChannelNames.forEach(name => {
            transformerBuilder.withInputChannel().Name(name).endWith();
          });
          outChannelNames.forEach(name => {
            transformerBuilder.withOutputChannel().Name(name).endWith();
          });

          // Properties
          buildProperties(analyticProperties, transformerBuilder);
          analytic = transformerBuilder.build();

        } else {
          throw new Error(`Analytic '${analyticName}' not found in definitions`);
        }
        if (analytic) {
          rowAnalytics.push({
            analytic: analytic,
            inChannelNames: inChannelNames,
            outChannelNames: outChannelNames
          });
        }
      } else {
        throw new Error('Analytic cannot be processed outside of a Row');
      }
    }

    function buildChannels(analyticInChannels: string, analyticOutChannels: string) : {inChannelNames : string[], outChannelNames : string[]} {
      const channelsPattern = /"([^"]*)"/g;
      const inChannelNames = Array.from(analyticInChannels.match(channelsPattern) || [])
        .map(c => {
          return c.replace(/"/g, "");
      });
      const outChannelNames = Array.from(analyticOutChannels.match(channelsPattern) || [])
        .map(c => {
          return c.replace(/"/g, "");
      });
      return {inChannelNames : inChannelNames, outChannelNames : outChannelNames};
    }

    function buildProperties(analyticProperties: string, transformerBuilder: TransformerBuilder) {
      const validateProperties = /^{\s*(("[^"]*"\s*:\s*"[^"]*")(\s*,\s*("[^"]*"\s*:\s*"[^"]*"))*\s*)?}$/;
      const propertiesPattern = /("[^"]*"\s*:\s*"[^"]*")/g;
      const propertyPattern = /"([^"]*)"/g;

      if (!analyticProperties.match(validateProperties)) {
        throw new Error(`Properties in ${transformerBuilder.name} is not valid : ${analyticProperties}`);
      }

      const properties = analyticProperties.match(propertiesPattern) || [];
      if (properties && properties.length) {
        properties.forEach(property => {
          const data = property.match(propertyPattern);
          if (data && data.length == 2) {
            const name = data[0].replace(/"/g, "");
            const value = data[1].replace(/"/g, "");

            const propertyDef = self.metadataService.metadata.getValue().getAnalytic(transformerBuilder.name).getProperty(name);
            if (propertyDef) {
              // Set the property value
              transformerBuilder.pushPropertyValue(new PropertyBuilder()
                .NameAndDef(name)
                .Value(PropertySerializer.parseStringWithPropertyDef(value, propertyDef))
                .build()
                .validate(propertyDef)
              );
            } else {
              throw new Error(`Analytic '${transformerBuilder.name}' does not contain property '${name}'`);
            }
          } else {
            throw new Error(`Property must contain name and value pair e.g. "offset":"2.0d" (invalid property data is ${data})`);
          }
        });
      }
    }
  }

  toApama(metadata: Metadata, config: Config) {
    return "" +
      (config.name.getValue()  ? `\\\\ Name: ${config.name.getValue()}\n` : '') +
      (config.description.getValue()  ? `\\\\ Description: ${config.description.getValue()}\n` : '') +
      `\\\\ Version: ${config.metadataVersion}\n` +
      config.rows.getValue().map((row: Row, i: number) => this.rowSerializer.toApama(metadata, row, i)).join('\n\n');
  }
}
