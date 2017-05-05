interface ValidateJS {
  isObject(obj: any): data is {};
  contains(data: any, s: string): boolean;
  isString(data: any): data is string;
  isEmpty(data: string): boolean;
  isBoolean(data: any): data is boolean;
  isNumber(data: any): data is number;
  isArray(data: any): data is Array<any>;
  isDefined(data: any): boolean;
}

declare module 'validate.js' {
  const validate: ValidateJS;
}
