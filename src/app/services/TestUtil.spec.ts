import * as d3 from "d3";

export abstract class TestUtils {
  static withTempSvg() {
    return d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
  }
}
