import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLogado()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (!authService.podeAcessarRota(state.url)) {
    // Redireciona para rota inicial compatível com o perfil do usuário
    const usuario = authService.usuarioAtual();
    if (usuario?.perfis.includes('MEMBRO_EQUIPE')) {
      router.navigate(['/reunioes']);
    } else {
      router.navigate(['/reunioes/dashboard']);
    }
    return false;
  }

  return true;
};

