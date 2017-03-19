import {IsNotEmpty, IsString} from "class-validator";

export class Channel {
  @IsString()
  @IsNotEmpty()
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}
