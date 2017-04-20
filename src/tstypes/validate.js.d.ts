interface ValidateJS {
  isObject(obj: any): boolean;
  contains(data: any, s: string): boolean;
  isString(data: string): boolean;
  isEmpty(data: string): boolean;
  isBoolean(data: any): boolean;
}

declare module 'validate.js' {
  const validate: ValidateJS;
}