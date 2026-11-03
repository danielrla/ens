import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavItem } from './nav-item.model';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-sidebar-item',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="item-wrapper" [class.colapsado]="!sidebarExpanded()">
      <!-- Item com submenus (pasta/nó expansível) -->
      @if (item.children && item.children.length > 0) {
        <button
          type="button"
          class="item-btn"
          [style.padding-left]="indentacao()"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-controls]="'submenu-' + item.id"
          [attr.title]="!sidebarExpanded() ? item.label : null"
          (click)="toggleOpen()"
        >
          @if (item.icon) {
            <span class="icone">{{ item.icon }}</span>
          }
          @if (sidebarExpanded()) {
            <span class="rotulo">{{ item.label }}</span>
            @if (item.badge) {
              <span class="item-badge" [style.background]="item.badgeColor || 'var(--azul-100)'">
                {{ item.badge }}
              </span>
            }
            <span class="chevron" [class.aberto]="isOpen()">›</span>
          }
        </button>

        <!-- Submenu Recursivo -->
        @if (isOpen() && sidebarExpanded()) {
          <div [id]="'submenu-' + item.id" class="submenu-container" role="region">
            @for (sub of item.children; track sub.id) {
              <app-sidebar-item [item]="sub" [level]="level + 1" />
            }
          </div>
        }
      } @else {
        <!-- Item folha com rota -->
        <a
          [routerLink]="item.route || '/'"
          class="item-link"
          [class.ativo]="isAtivo()"
          [style.padding-left]="indentacao()"
          [attr.title]="!sidebarExpanded() ? item.label : null"
          (click)="aoClicarItem()"
        >
          @if (item.icon) {
            <span class="icone">{{ item.icon }}</span>
          }
          @if (sidebarExpanded()) {
            <span class="rotulo">{{ item.label }}</span>
            @if (item.badge) {
              <span class="item-badge" [style.background]="item.badgeColor || 'var(--azul-100)'">
                {{ item.badge }}
              </span>
            }
          }
        </a>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
    .item-wrapper {
      width: 100%;
    }
    .item-btn,
    .item-link {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 0.65rem 0.85rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      font: inherit;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      border-radius: var(--raio-sm);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      box-sizing: border-box;
      gap: 0.75rem;
    }
    .item-btn:hover,
    .item-link:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #f1f5f9;
    }
    .item-link.ativo {
      background: rgba(255, 255, 255, 0.09);
      color: #ffffff;
      font-weight: 600;
      border-left: 3px solid #d97706;
    }
    .icone {
      font-size: 1.15rem;
      line-height: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
    }
    .rotulo {
      flex: 1;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chevron {
      font-size: 1.1rem;
      line-height: 1;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .chevron.aberto {
      transform: rotate(90deg);
    }
    .item-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 0.15rem 0.45rem;
      border-radius: 999px;
      color: #ffffff;
    }
    .submenu-container {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
      margin-top: 0.15rem;
    }
    .colapsado .item-btn,
    .colapsado .item-link {
      justify-content: center;
      padding: 0.75rem 0 !important;
    }
  `,
})
export class SidebarItem {
  @Input({ required: true }) item!: NavItem;
  @Input() level: number = 0;

  private readonly layoutService = inject(LayoutService);
  protected readonly sidebarExpanded = this.layoutService.sidebarExpanded;

  protected readonly isOpen = signal<boolean>(false);

  ngOnInit(): void {
    if (typeof localStorage !== 'undefined' && this.item.children) {
      const saved = localStorage.getItem(`ens_menu_exp_${this.item.id}`);
      if (saved !== null) {
        this.isOpen.set(saved === 'true');
      } else if (this.level === 0) {
        // Primeiro nível aberto por padrão
        this.isOpen.set(this.item.id === 'estrutura' || this.item.id === 'membros');
      }
    }
  }

  protected indentacao(): string {
    if (!this.sidebarExpanded()) return '0';
    return `calc(0.85rem + ${this.level * 0.9}rem)`;
  }

  protected toggleOpen(): void {
    this.isOpen.update((v) => {
      const next = !v;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`ens_menu_exp_${this.item.id}`, next.toString());
      }
      return next;
    });
  }

  protected isAtivo(): boolean {
    return this.layoutService.activeNavItemId() === this.item.id;
  }

  protected aoClicarItem(): void {
    this.layoutService.setActiveNavItem(this.item.id);
    this.fecharMobileAposClique();
  }

  protected fecharMobileAposClique(): void {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      this.layoutService.closeMobileDrawer();
    }
  }
}
