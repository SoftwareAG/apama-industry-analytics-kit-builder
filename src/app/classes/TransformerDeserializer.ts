import {Injectable} from "@angular/core";
import {AbstractMetadataService} from "../services/MetadataService";
import {PropertyBuilder, PropertyDeserializer} from "./Property";
import {TransformerChannelBuilder, TransformerChannelDeserializer} from "./TransformerChannel";
import {List, Map, OrderedMap} from "immutable";
import {TransformerChannelDef} from "./TransformerChannelDef";
import {Transformer, TransformerBuilder} from "./Transformer";
import {TransformerDef} from "./TransformerDef";
import {AbstractDataService} from "../services/AbstractDataService";

@Injectable()
export class TransformerDeserializer {
  readonly analyticPattern = /^\s*com.industry.analytics.Analytic\s*\(\s*"([^"]*)"\s*,\s*(\[[^\]]*])\s*,\s*(\[[^\]]*])\s*,\s*({[^}]*})\s*\)\s*$/;

  constructor(private readonly metadataService: AbstractMetadataService, private readonly propertyDeserializer: PropertyDeserializer,
              private readonly channelDeserializer: TransformerChannelDeserializer, private readonly dataService: AbstractDataService) {}

  applyRepeatedPrefixRule(channelNames: List<string>, transformerChannelDefs: List<TransformerChannelDef>): {remaining: List<string>, matched: OrderedMap<TransformerChannelDef, List<string>>, unprefixedChannels: List<TransformerChannelDef>} {
    return transformerChannelDefs.reduce((result: {remaining: List<string>, matched: OrderedMap<TransformerChannelDef, List<string>>, unprefixedChannels: List<TransformerChannelDef>}, transformerChannelDef: TransformerChannelDef) => {
      if (transformerChannelDef.hasPrefix()) {
        const filteredForPrefix = result.remaining.reduce((remainingAndRemovedChannelsNames: {remaining: List<string>, removed: List<string>}, channelName: string, i: number) => {
          if (channelName.startsWith(transformerChannelDef.prefix)) {
            return {
              remaining: remainingAndRemovedChannelsNames.remaining.remove(i - remainingAndRemovedChannelsNames.removed.size),
              removed: remainingAndRemovedChannelsNames.removed.push(channelName.substr(transformerChannelDef.prefix.length))
            }
          } else {
            return remainingAndRemovedChannelsNames;
          }
        }, {remaining: result.remaining, removed: List<string>()});
        return {
          remaining: filteredForPrefix.remaining,
          matched: result.matched.set(transformerChannelDef, filteredForPrefix.removed),
          unprefixedChannels: result.unprefixedChannels
        };
      } else {
        return {
          remaining: result.remaining,
          matched: result.matched,
          unprefixedChannels: result.unprefixedChannels.push(transformerChannelDef)
        }
      }
    }, {
      remaining: channelNames,
      matched: OrderedMap<TransformerChannelDef, List<string>>(),
      unprefixedChannels: List<TransformerChannelDef>()
    });
  }

  applyChannelRules(channelNames: List<string>, transformerChannelDefs: List<TransformerChannelDef>): OrderedMap<TransformerChannelDef, List<string>> {
    const remainingAndMatched = this.applyRepeatedPrefixRule(channelNames, transformerChannelDefs);
    const prefixed = remainingAndMatched.matched;

    const channelCounts = this.createChannelCounts(remainingAndMatched.unprefixedChannels, remainingAndMatched.remaining);
    const allOtherChannels = this.channelCountToChannelAndName(transformerChannelDefs, channelCounts, remainingAndMatched.remaining);

    const unorderedChannelMapping = prefixed.concat(allOtherChannels) as Map<TransformerChannelDef, List<string>>;

    // Sort the result by the order in the transformerDef
    return transformerChannelDefs.reduce((result: OrderedMap<TransformerChannelDef, List<string>>, channelDef: TransformerChannelDef) => {
      return result.set(channelDef, unorderedChannelMapping.get(channelDef, List<string>()));
    }, OrderedMap<TransformerChannelDef, List<string>>());
  }

  createChannelCounts(transformerChannelDefs: List<TransformerChannelDef>, channels: List<string>): Map<TransformerChannelDef, number> {
    const resultAfterRemovingNonOptional = transformerChannelDefs.reduce((result: {remainingCount: number, remainingChannelDefs: List<TransformerChannelDef>, channelCount: Map<TransformerChannelDef, number>}, channelDef: TransformerChannelDef) => {
      if (channelDef.optional || channelDef.repeated) {
        return result;
      } else {
        return {
          remainingCount: result.remainingCount - 1,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, 1)
        };
      }
    }, {
      remainingCount: channels.size,
      remainingChannelDefs: transformerChannelDefs,
      channelCount: Map<TransformerChannelDef, number>()
    });

    const finalResult = resultAfterRemovingNonOptional.remainingChannelDefs.reduce((result: {remainingCount: number, remainingChannelDefs: List<TransformerChannelDef>, channelCount: Map<TransformerChannelDef, number>}, channelDef: TransformerChannelDef) => {
      if (result.remainingCount === 0) {
        return result;
      }
      if (channelDef.optional) {
        return {
          remainingCount: result.remainingCount - 1,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, 1)
        };
      } else if (channelDef.repeated) {
        return {
          remainingCount: 0,
          remainingChannelDefs: result.remainingChannelDefs.filter(remainingChannelDef => remainingChannelDef !== channelDef),
          channelCount: result.channelCount.set(channelDef, result.remainingCount)
        };
      }
      return result;
    }, resultAfterRemovingNonOptional);

    return finalResult.channelCount;
  }

  channelCountToChannelAndName(transformerChannelDef: List<TransformerChannelDef>, channelCounts: Map<TransformerChannelDef, number>, channelNames: List<string>): OrderedMap<TransformerChannelDef, List<string>> {
    return transformerChannelDef.reduce((result: {remainingChannelNames: List<string>, channelDefToNames: OrderedMap<TransformerChannelDef, List<string>>}, channelDef: TransformerChannelDef) => {
      if (channelCounts.has(channelDef)) {
        const count = channelCounts.get(channelDef);
        return {
          remainingChannelNames: result.remainingChannelNames.skip(count),
          channelDefToNames: result.channelDefToNames.set(channelDef, result.remainingChannelNames.take(count) as List<string>)
        };
      } else {
        return result;
      }
    }, {
      remainingChannelNames: channelNames,
      channelDefToNames: OrderedMap<TransformerChannelDef, List<string>>()
    })
      .channelDefToNames;
  }

  buildAnalytic(analyticLine: string): {analytic: Transformer, inChannels: Map<number, string>, outChannels: Map<number, string>} {
    const analyticMatch = analyticLine.match(this.analyticPattern);
    if (analyticMatch && analyticMatch.length) {
      const [, analyticName, analyticInChannels, analyticOutChannels, analyticProperties] = analyticMatch;
      const transformerDef: TransformerDef = this.metadataService.getAnalytic(analyticName);
      if (transformerDef) {

        // Add the analytics input and output channel names into the Channels Component
        transformerDef.inputChannels.concat(transformerDef.outputChannels)
          .forEach(( channelData : TransformerChannelDef) => this.dataService.addChannel(channelData.name));

        const transformerBuilder = new TransformerBuilder()
          .Name(transformerDef.name)
          .PropertyValues(
            transformerDef.properties.toArray()
              .filter(propertyDef => !propertyDef.optional && !propertyDef.repeated)
              .map(propertyDef => PropertyBuilder.fromPropertyDef(propertyDef).build())
          );

        // Channels
        const inChannelNames = this.channelDeserializer.buildChannels(analyticInChannels);
        const outChannelNames = this.channelDeserializer.buildChannels(analyticOutChannels);

        const inputChannelMappings = this.applyChannelRules(inChannelNames, transformerDef.inputChannels);
        const outputChannelMappings = this.applyChannelRules(outChannelNames, transformerDef.outputChannels);

        inputChannelMappings.forEach((channelNames: List<string>, channelDef: TransformerChannelDef) => transformerBuilder.pushInputChannel(...channelNames.toArray().map(channelName => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())));
        outputChannelMappings.forEach((channelNames: List<string>, channelDef: TransformerChannelDef) => transformerBuilder.pushOutputChannel(...channelNames.toArray().map(channelName => TransformerChannelBuilder.fromTransformerChannelDef(channelDef).build())));

        const unPrefixedInChannelNames = inputChannelMappings.valueSeq().flatMap((channelNames: List<string>) => channelNames);
        const unPrefixedOutChannelNames = outputChannelMappings.valueSeq().flatMap((channelNames: List<string>) => channelNames);

        // Create the Row Channel Overrides
        const inChanNamesAndIndexes = unPrefixedInChannelNames.reduce((result: Map<number, string>, chanName: string, i: number) => {
          if (!chanName.startsWith("Row")) {
            return result.set(i, chanName);
          }
          return result;
        }, Map<number, string>());
        const outChanNamesAndIndexes = unPrefixedOutChannelNames.reduce((result: Map<number, string>, chanName: string, i: number) => {
          if (!chanName.startsWith("Row")) {
            return result.set(i, chanName);
          }
          return result;
        }, Map<number, string>());

        // Properties
        transformerBuilder.pushPropertyValue(...this.propertyDeserializer.buildProperties(transformerDef, analyticProperties));
        return {analytic: transformerBuilder.build().validate(transformerDef), inChannels: inChanNamesAndIndexes, outChannels: outChanNamesAndIndexes};
      } else {
        throw new Error(`Analytic '${analyticName}' not found in definitions`);
      }
    } else {
      throw new Error(`Not a valid analytic: ${analyticLine}`)
    }
  }
}
