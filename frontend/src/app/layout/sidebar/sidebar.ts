import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarItem } from './sidebar-item';
import { MENU_ITEMS } from './nav-item.model';
import { LayoutService } from '../layout.service';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, SidebarItem],
  template: `
    <!-- Overlay semitransparente escuro para Mobile -->
    @if (mobileDrawerOpen()) {
      <div
        class="backdrop-mobile"
        (click)="closeMobile()"
        aria-hidden="true"
      ></div>
    }

    <!-- Container da Sidebar -->
    <aside
      class="sidebar-container"
      [class.expandida]="sidebarExpanded()"
      [class.colapsada]="!sidebarExpanded()"
      [class.mobile-aberto]="mobileDrawerOpen()"
      aria-label="Menu Principal"
    >
      <!-- Topo da Sidebar com Logo e Marca -->
      <div class="sidebar-header">
        <a routerLink="/" class="marca" (click)="closeMobile()">
          <img src="logo-ens.png" alt="Logo ENS" width="36" height="36" class="logo-img" />
          @if (sidebarExpanded() || mobileDrawerOpen()) {
            <div class="marca-texto">
              <strong>ENS Brasil</strong>
              <small>Equipes de Nossa Senhora</small>
            </div>
          }
        </a>
      </div>

      <!-- Navegação Principal com Nós Recursivos -->
      <nav class="sidebar-nav" role="tree">
        @for (item of menuItems; track item.id) {
          <app-sidebar-item [item]="item" [level]="0" />
        }
      </nav>

      <!-- Rodapé da Sidebar: Toggle Desktop / Status -->
      <div class="sidebar-footer">
        <button
          type="button"
          class="btn-toggle"
          (click)="toggle()"
          [attr.title]="sidebarExpanded() ? 'Recolher Menu (72px)' : 'Expandir Menu (280px)'"
        >
          <span class="icone-toggle">{{ sidebarExpanded() ? '◀' : '▶' }}</span>
          @if (sidebarExpanded() || mobileDrawerOpen()) {
            <span>Recolher menu</span>
          }
        </button>
      </div>
    </aside>
  `,
  styles: `
    :host {
      display: contents;
    }

    /* Backdrop para telas mobile/tablet */
    .backdrop-mobile {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.6);
      backdrop-filter: blur(4px);
      z-index: 40;
      animation: fadeIn 0.2s ease-out;
    }

    /* Sidebar Base */
    .sidebar-container {
      background: #0f172a; /* Navy escuro elegante */
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      height: 100vh;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 2px 0 12px rgba(0, 0, 0, 0.15);
      transition: width 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 200ms cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    /* Desktop widths */
    @media (min-width: 1024px) {
      .sidebar-container.expandida {
        width: 280px;
        min-width: 280px;
      }
      .sidebar-container.colapsada {
        width: 72px;
        min-width: 72px;
      }
    }

    /* Mobile Drawer */
    @media (max-width: 1023px) {
      .sidebar-container {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        width: 85vw;
        max-width: 320px;
        transform: translateX(-100%);
      }
      .sidebar-container.mobile-aberto {
        transform: translateX(0);
      }
    }

    /* Cabeçalho da Sidebar */
    .sidebar-header {
      height: 64px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .marca {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: #ffffff;
      overflow: hidden;
    }
    .logo-img {
      border-radius: 50%;
      background: #ffffff;
      padding: 2px;
      flex-shrink: 0;
    }
    .marca-texto {
      display: flex;
      flex-direction: column;
      white-space: nowrap;
      line-height: 1.2;
    }
    .marca-texto strong {
      font-size: 0.95rem;
      letter-spacing: 0.02em;
    }
    .marca-texto small {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    /* Navegação */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.65rem;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    /* Rodapé da Sidebar */
    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(0, 0, 0, 0.15);
    }
    .btn-toggle {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.55rem;
      background: transparent;
      border: none;
      color: #94a3b8;
      font: inherit;
      font-size: 0.85rem;
      border-radius: var(--raio-sm);
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    .btn-toggle:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .icone-toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      font-size: 0.8rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
})
export class Sidebar {
  private readonly layoutService = inject(LayoutService);

  protected readonly sidebarExpanded = this.layoutService.sidebarExpanded;
  protected readonly mobileDrawerOpen = this.layoutService.mobileDrawerOpen;
  protected readonly menuItems = MENU_ITEMS;

  toggle(): void {
    this.layoutService.toggleSidebar();
  }

  closeMobile(): void {
    this.layoutService.closeMobileDrawer();
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.mobileDrawerOpen()) {
      this.closeMobile();
    }
  }
}
