export interface NavItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  badge?: string | number;
  badgeColor?: string;
  children?: NavItem[];
}

export const MENU_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard Geral',
    icon: '📊',
    route: '/dashboard',
  },
  {
    id: 'estrutura',
    label: 'Estrutura Organizacional',
    icon: '🏛️',
    children: [
      { id: 'est-geral', label: 'Estrutura', route: '/estrutura' },
      { id: 'est-equipes', label: 'Equipes de Base', route: '/equipes' },
    ],
  },
  {
    id: 'membros',
    label: 'Membros e Conselheiros',
    icon: '👥',
    children: [
      { id: 'membros-casais', label: 'Casais e Membros', route: '/casais' },
      { id: 'membros-sce', label: 'Sacerdotes e SCEs', route: '/sacerdotes' },
    ],
  },
  {
    id: 'mandatos',
    label: 'Mandatos e Prazos',
    icon: '⏳',
    route: '/mandatos',
  },
  {
    id: 'vida-equipe',
    label: 'Vida da Equipe (CRE)',
    icon: '🕊️',
    children: [
      { id: 've-dashboard', label: 'Dashboard Equipe', route: '/reunioes/dashboard' },
      { id: 've-agenda', label: 'Agenda e Reuniões', route: '/reunioes' },
      { id: 've-avisos', label: 'Quadro de Avisos', route: '/equipes' },
      { id: 've-mural', label: 'Mural de Bordo', route: '/mural' },
    ],
  },
];
