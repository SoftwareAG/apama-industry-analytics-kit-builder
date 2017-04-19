
export function findAll(pattern: RegExp, str: string) {
  const result = new Array<RegExpExecArray>();
  let match;
  while(match = pattern.exec(str)) {
    const [, ...thisMatch] = match;
    result.push(thisMatch);
  }
  return result;
}
