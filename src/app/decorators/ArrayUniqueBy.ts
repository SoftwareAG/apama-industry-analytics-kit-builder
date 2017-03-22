import {registerDecorator, ValidationOptions, ValidationArguments, Validator} from "class-validator";

const validator = new Validator();

export function ArrayUniqueBy(mapper: (value: any) => any, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "arrayUniqueBy",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(valueArr: any, args: ValidationArguments) {
          if (validationOptions && validationOptions.each) {
            return valueArr.every(valueSubArr => { return validator.arrayUnique(valueSubArr.map(mapper)); });
          } else {
            return validator.arrayUnique(valueArr.map(mapper));
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `Property "${propertyName}" did not match predicate "${mapper.toString()}"`;
        }
      }
    });
  };
}
