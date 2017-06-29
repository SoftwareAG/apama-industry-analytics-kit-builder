import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'humanReadable'})
export class HumanReadablePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/[\s_]+/g, " ").trim().replace(/(\w)(?=[A-Z])/g, "$1 ").replace(/\b[a-z]/g, match => match.toUpperCase())
  }
}
