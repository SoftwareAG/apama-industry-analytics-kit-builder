import * as d3 from "d3";

export abstract class TestUtils {
  static findAll(pattern: RegExp, str: string) {
    const result = [] as Array<RegExpExecArray>;
    let match;
    while(match = pattern.exec(str)) {
      const [, ...thisMatch] = match;
      result.push(thisMatch);
    }
    return result;
  }

  static withTempSvg() {
    return d3.select(document.createElementNS("http://www.w3.org/2000/svg", "svg"));
  }
}
