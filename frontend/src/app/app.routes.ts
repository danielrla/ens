import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard Geral | ENS',
    loadComponent: () =>
      import('./features/dashboard/dashboard-geral-page').then((m) => m.DashboardGeralPage),
  },
  {
    path: 'estrutura',
    title: 'Estrutura Territorial | ENS',
    loadComponent: () =>
      import('./features/estrutura/estrutura-page').then((m) => m.EstruturaPage),
  },
  {
    path: 'equipes',
    title: 'Equipes | ENS',
    loadComponent: () =>
      import('./features/equipes/equipes-page').then((m) => m.EquipesPage),
  },
  {
    path: 'reunioes',
    title: 'Agenda e Reunião | ENS',
    loadComponent: () =>
      import('./features/reunioes/agenda-reunioes-page').then((m) => m.AgendaReunioesPage),
  },
  {
    path: 'reunioes/dashboard',
    title: 'Dashboard Equipe | ENS',
    loadComponent: () =>
      import('./features/reunioes/dashboard-equipe-page').then((m) => m.DashboardEquipePage),
  },
  {
    path: 'vida-equipe/dashboard',
    title: 'Dashboard Equipe | ENS',
    loadComponent: () =>
      import('./features/reunioes/dashboard-equipe-page').then((m) => m.DashboardEquipePage),
  },
  {
    path: 'casais',
    title: 'Casais | ENS',
    loadComponent: () =>
      import('./features/casais/casais-page').then((m) => m.CasaisPage),
  },
  {
    path: 'mandatos',
    title: 'Mandatos | ENS',
    loadComponent: () =>
      import('./features/mandatos/mandatos-page').then((m) => m.MandatosPage),
  },
  {
    path: 'sacerdotes',
    title: 'Sacerdotes e SCE | ENS',
    loadComponent: () =>
      import('./features/sacerdotes/sacerdotes-page').then((m) => m.SacerdotesPage),
  },
  {
    path: 'perfil',
    title: 'Meu Perfil e Dados do Casal | ENS',
    loadComponent: () =>
      import('./features/casais/perfil-casal-page').then((m) => m.PerfilCasalPage),
  },
  {
    path: 'mural',
    title: 'Mural de Bordo | ENS',
    loadComponent: () =>
      import('./features/mural/mural-bordo-page').then((m) => m.MuralBordoPage),
  },
  { path: '**', redirectTo: 'equipes' },
];
