import {registerDecorator, ValidationOptions, ValidationArguments} from "class-validator";

export function MatchesPredicate(predicate: (property: any) => boolean, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "matchesPredicate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions || {},
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (validationOptions && validationOptions.each) {
            return value.every(value => { return predicate.call(args.object, value); });
          } else {
            return predicate.call(args.object, value);
          }
        },
        defaultMessage(args: ValidationArguments) {
          return `Property "${propertyName}" did not match predicate "${predicate.toString()}"`;
        }
      }
    });
  };
}
