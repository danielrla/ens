import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  // Rotas públicas de autenticação
  {
    path: 'login',
    title: 'Entrar no Sistema | ENS',
    loadComponent: () =>
      import('./features/auth/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'esqueci-senha',
    title: 'Recuperar Senha | ENS',
    loadComponent: () =>
      import('./features/auth/esqueci-senha-page').then((m) => m.EsqueciSenhaPage),
  },
  {
    path: 'reset-senha',
    title: 'Criar Nova Senha | ENS',
    loadComponent: () =>
      import('./features/auth/reset-senha-page').then((m) => m.ResetSenhaPage),
  },

  // Redirecionamento inicial
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },

  // Rotas protegidas por RBAC
  {
    path: 'dashboard',
    title: 'Dashboard Geral | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard-geral-page').then((m) => m.DashboardGeralPage),
  },
  {
    path: 'estrutura',
    title: 'Estrutura Territorial | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/estrutura/estrutura-page').then((m) => m.EstruturaPage),
  },
  {
    path: 'equipes',
    title: 'Equipes | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/equipes/equipes-page').then((m) => m.EquipesPage),
  },
  {
    path: 'reunioes',
    title: 'Agenda e Reunião | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reunioes/agenda-reunioes-page').then((m) => m.AgendaReunioesPage),
  },
  {
    path: 'reunioes/dashboard',
    title: 'Dashboard Equipe | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reunioes/dashboard-equipe-page').then((m) => m.DashboardEquipePage),
  },
  {
    path: 'vida-equipe/dashboard',
    title: 'Dashboard Equipe | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reunioes/dashboard-equipe-page').then((m) => m.DashboardEquipePage),
  },
  {
    path: 'casais',
    title: 'Casais | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/casais/casais-page').then((m) => m.CasaisPage),
  },
  {
    path: 'mandatos',
    title: 'Mandatos | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mandatos/mandatos-page').then((m) => m.MandatosPage),
  },
  {
    path: 'sacerdotes',
    title: 'Sacerdotes e SCE | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/sacerdotes/sacerdotes-page').then((m) => m.SacerdotesPage),
  },
  {
    path: 'perfil',
    title: 'Meu Perfil e Dados do Casal | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/casais/perfil-casal-page').then((m) => m.PerfilCasalPage),
  },
  {
    path: 'mural',
    title: 'Mural de Bordo | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/mural/mural-bordo-page').then((m) => m.MuralBordoPage),
  },
  {
    path: 'admin/usuarios',
    title: 'Gestão de Usuários e Acessos | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/usuarios-admin-page').then((m) => m.UsuariosAdminPage),
  },
  {
    path: 'admin/integracao',
    title: 'Administração de Integrações | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/integracao-admin-page').then((m) => m.IntegracaoAdminPage),
  },
  {
    path: 'admin/integracao/callback',
    title: 'Conectando ao Google... | ENS',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/google-callback-page').then((m) => m.GoogleCallbackPage),
  },
  { path: '**', redirectTo: 'dashboard' },
];
