
export abstract class Utils {
  static findAll(pattern: RegExp, str: string): Array<RegExpExecArray> {
    const result = [] as Array<RegExpExecArray>;
    let match;
    while(match = pattern.exec(str)) {
      const [, ...thisMatch] = match;
      result.push(thisMatch);
    }
    return result;
  }
}
