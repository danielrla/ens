import { Pipe, PipeTransform } from '@angular/core';
import { formatarDataCuiaba } from './cuiaba-date.util';

@Pipe({
  name: 'ensDate',
  standalone: true,
})
export class EnsDatePipe implements PipeTransform {
  transform(
    value: string | Date | null | undefined,
    comHora: boolean | 'comHora' = false
  ): string {
    const incluirHora = comHora === true || comHora === 'comHora';
    return formatarDataCuiaba(value, incluirHora);
  }
}
