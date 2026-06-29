import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phone',
  standalone: true,
})
export class PhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    const digits = value.replace(/\D/g, '');
    const national = digits.startsWith('221') ? digits.slice(3) : digits;
    const match = national.match(/^(\d{2})(\d{3})(\d{2})(\d{2})$/);
    if (match) {
      const [, a, b, c, d] = match;
      return `+221 ${a} ${b} ${c} ${d}`;
    }
    return value;
  }
}
