import {ConfigBuilder} from "../classes/Config";
import {ChannelBuilder} from "../classes/Channel";
import {AbstractDataService} from "./AbstractDataService";
import {Injectable} from "@angular/core";

@Injectable()
export class DataService extends AbstractDataService {
  loadConfigurations() {

    this.configurations.next(this.configurations.getValue().push(
      new ConfigBuilder()
        .Name("Single row with a single Analytic containing one input and output channel")
        .Description("This configuration demonstrates a single row with a single Analytic containing one input and output channel")
        .withRow()
          .MaxTransformerCount(3)
          .withInputChannel().Name("Input Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("decimal").Optional(false).Value(10.0).endWith()
          .endWith()
        .endWith()
        .build()
    ));

    this.configurations.next(this.configurations.getValue().push(
      new ConfigBuilder()
        .Name("Single row with two Analytics each containing one input and output channel")
        .Description("This configuration demonstrates a single row with two Analytics each containing one input and output channel")
        .withRow()
          .MaxTransformerCount(3)
          .withInputChannel().Name("Input Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Analytic 1 : Channel In").endWith()
            .withOutputChannel().Name("Analytic 1: Channel Out").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
          .withTransformer()
            .Name("Analytic 2")
            .withInputChannel().Name("Analytic 2 : Channel In").endWith()
            .withOutputChannel().Name("Analytic 2: Channel Out").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("boolean").Optional(false).Value(true).endWith()
          .endWith()
        .endWith()
        .build()
    ));

    this.configurations.next(this.configurations.getValue().push(
      new ConfigBuilder()
        .Name("Single row with a single Analytic containing two input channels and two output channels")
        .Description("This configuration demonstrates a single row with a single Analytic containing two input channels and two output channels")
        .withRow()
          .MaxTransformerCount(3)
          .withInputChannel().Name("Input Channel 1").endWith()
          .withInputChannel().Name("Input Channel 2").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 2").endWith()
          .withTransformer()
            .Name("Single Analytic")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withInputChannel().Name("Input Channel 2").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 2").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("float").Optional(false).Value(5.2).endWith()
          .endWith()
        .endWith()
        .build()
    ));

    this.configurations.next(this.configurations.getValue().push(
      new ConfigBuilder()
        .Name("Three rows with complex Analytic and channel configurations")
        .Description("This configuration demonstrates a multiple rows containing one or more analytics with one or more input and output channels")
        .withRow()
          .MaxTransformerCount(3)
          .withInputChannel().Name("Input Channel 1").endWith()
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
            .withProperty().Name("My second property").Description("A property2").Type("decimal").Optional(true).endWith()
            .withProperty().Name("My third property").Description("A property3").Type("boolean").Repeated(true).endWith()
          .endWith()
          .withTransformer()
            .Name("Analytic 2")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
        .endWith()

        .withRow()
          .MaxTransformerCount(3)
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withInputChannel().Name("Input Channel 2").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
        .endWith()

        .withRow()
          .MaxTransformerCount(3)
          .withOutputChannel().Name("Output Channel 1").endWith()
          .withTransformer()
            .Name("Analytic 1")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
          .withTransformer()
            .Name("Analytic 2")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
          .withTransformer()
            .Name("Analytic 3")
            .withInputChannel().Name("Input Channel 1").endWith()
            .withOutputChannel().Name("Output Channel 1").endWith()
            .withPopulatedProperty().Name("My first property").Description("A property").Type("string").Optional(false).Value("Hello World").endWith()
          .endWith()
        .endWith()
        .build()
    ));

    this.configurations.next(this.configurations.getValue().push(
      new ConfigBuilder()
        .Name("Blank row")
        .Description("This configuration demonstrates a single row with a no Analytics")
        .withRow()
          .MaxTransformerCount(4)
        .endWith()
        .build()
    ));
  }

  loadChannels()
  {
    this.channels.next(this.channels.getValue().push(
      new ChannelBuilder()
        .Name("Channel 1")
        .build()
    ));

    this.channels.next(this.channels.getValue().push(
      new ChannelBuilder()
        .Name("Channel 2")
        .build()
    ));
  }
}
