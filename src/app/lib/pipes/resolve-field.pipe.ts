import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'resolveField', standalone: true, pure: true })
export class ResolveFieldPipe implements PipeTransform {
  transform(obj: any, field: string): any {
    if (!obj || !field) return null;
    return field.split('.').reduce((acc, key) => acc?.[key], obj);
  }
}
