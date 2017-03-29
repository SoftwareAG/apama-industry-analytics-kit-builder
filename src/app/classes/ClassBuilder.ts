export abstract class ClassBuilder<ClassToBuild> {
  abstract build(): ClassToBuild;
}

export class ClassArrayBuilder<ClassToBuild, BuilderForClass extends ClassBuilder<ClassToBuild>> {
  private arrayValues: ClassToBuild[] = [];

  constructor(private classBuilderConstructor: ClassBuilderConstructor<ClassToBuild, BuilderForClass, ClassArrayBuilder<ClassToBuild, BuilderForClass>>) {}

  with(): BuilderForClass {
    return new this.classBuilderConstructor((a: ClassToBuild) => { this.arrayValues.push(a); return this; });
  }

  build(): ClassToBuild[] {
    return this.arrayValues;
  }
}

interface ClassBuilderConstructor<ClassToBuild, BuilderForClass extends ClassBuilder<ClassToBuild>, ArrayBuilder extends ClassArrayBuilder<ClassToBuild, BuilderForClass>> {
  new (a: (classInstance: ClassToBuild) => ArrayBuilder): BuilderForClass;
}

export interface NestedClassBuilder<Parent> {
  endWith(): Parent;
}
