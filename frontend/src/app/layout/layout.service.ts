import { Injectable, signal } from '@angular/core';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly STORAGE_SIDEBAR_KEY = 'ens_sidebar_collapsed';

  // Desktop sidebar expandida por padrão (false = recolhida 72px, true = expandida 280px)
  readonly sidebarExpanded = signal<boolean>(
    typeof localStorage !== 'undefined'
      ? localStorage.getItem(this.STORAGE_SIDEBAR_KEY) !== 'true'
      : true
  );

  // Mobile drawer (aberto/fechado)
  readonly mobileDrawerOpen = signal<boolean>(false);

  // Ano pastoral ativo (ciclo vigente)
  readonly anoPastoral = signal<number>(new Date().getFullYear());

  // Item de menu ativo no momento
  readonly activeNavItemId = signal<string>('dashboard');

  // Breadcrumbs dinâmicos
  readonly breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'Super-Região Brasil', route: '/equipes' }
  ]);

  toggleSidebar(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.mobileDrawerOpen.update((open) => !open);
    } else {
      this.sidebarExpanded.update((expanded) => {
        const next = !expanded;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(this.STORAGE_SIDEBAR_KEY, (!next).toString());
        }
        return next;
      });
    }
  }

  closeMobileDrawer(): void {
    this.mobileDrawerOpen.set(false);
  }

  setAnoPastoral(ano: number): void {
    this.anoPastoral.set(ano);
  }

  setActiveNavItem(id: string): void {
    this.activeNavItemId.set(id);
  }

  setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbs.set(items);
  }
}
