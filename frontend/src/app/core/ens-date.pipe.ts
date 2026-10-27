import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ensDate',
  standalone: true,
})
export class EnsDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) {
      return '—';
    }

    if (typeof value === 'string') {
      const semHora = value.includes('T') ? value.split('T')[0] : value;
      const partes = semHora.split('-');
      if (partes.length === 3 && partes[0].length === 4) {
        const [ano, mes, dia] = partes;
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      }
      const partesBarra = value.split('/');
      if (partesBarra.length === 3) {
        return value;
      }
    }

    const d = typeof value === 'string' ? new Date(value) : value;
    if (d instanceof Date && !isNaN(d.getTime())) {
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}/${mes}/${ano}`;
    }

    return String(value);
  }
}
