import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CasalDto, MovimentacaoDto, PageResponse } from './casal.service';
import { EquipeDetalheDto, EquipeResumoDto } from './equipe.service';
import { NoArvore, NoEstrutura } from './estrutura.service';
import { MandatoDto } from './mandato.service';
import { MomentoMuralDto } from './mural.service';
import { ReuniaoDto } from './reuniao.service';
import { SceDto } from './sce.service';
import {
  INITIAL_CASAIS,
  INITIAL_EQUIPES,
  INITIAL_ESTRUTURA,
  INITIAL_MANDATOS,
  INITIAL_MOVIMENTACOES,
  INITIAL_MURAL,
  INITIAL_REUNIOES,
  INITIAL_SCES,
} from './mock-data';

const STORAGE_PREFIX = 'ens_data_v3_';

// Clean legacy localStorage keys from prior versions
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    for (let i = window.localStorage.length - 1; i >= 0; i--) {
      const k = window.localStorage.key(i);
      if (k && (k.startsWith('ens_data_v1_') || k.startsWith('ens_data_v2_'))) {
        window.localStorage.removeItem(k);
      }
    }
  } catch {
    // ignore
  }
}

function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

export const mockApiInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const url = req.url;

  // Only intercept /api/* requests
  if (!url.startsWith('/api') && !url.startsWith('/auth')) {
    return next(req);
  }

  // Parse path and params
  const cleanUrl = url.split('?')[0];
  const method = req.method;

  // 1. AUTH
  if (cleanUrl === '/api/auth/me' || cleanUrl === '/auth/me') {
    const user = {
      casalId: '6ae08c88ca048c6290d5fdcd',
      nomeCompleto: 'Daniel Rios lima Amaral e Aline Freire Pereira Rios',
      email: 'danielrla@gmail.com',
      funcao: 'MEMBRO',
      equipeId: '6ae08c88ca048c6290d5fdcc',
      nomeEquipe: 'NOSSA SENHORA APARECIDA',
      setorId: '6ae08c87ca048c6290d5fd23',
    };
    return of(new HttpResponse({ status: 200, body: user })).pipe(delay(30));
  }

  if (cleanUrl === '/api/auth/login' || cleanUrl === '/auth/login' || cleanUrl === '/api/auth/refresh' || cleanUrl === '/auth/refresh') {
    return of(
      new HttpResponse({
        status: 200,
        body: {
          accessToken: 'mock-jwt-token-ens-2026',
          refreshToken: 'mock-refresh-token-ens-2026',
          expiresIn: 3600,
        },
      })
    ).pipe(delay(30));
  }

  // 2. CASAIS
  // GET/PUT /api/casais/perfil
  if (cleanUrl === '/api/casais/perfil') {
    const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
    let casalLogado = casais.find((c) => c.id === '6ae08c88ca048c6290d5fdcd') || casais[0];
    if (method === 'PUT') {
      const body = req.body as Partial<CasalDto>;
      casalLogado = { ...casalLogado, ...body };
      const updated = casais.map((c) => (c.id === casalLogado.id ? casalLogado : c));
      setStored('casais', updated);
    }
    return of(new HttpResponse({ status: 200, body: casalLogado })).pipe(delay(30));
  }

  // /api/casais/:id/movimentacoes
  const movMatch = cleanUrl.match(/^\/api\/casais\/([^/]+)\/movimentacoes$/);
  if (movMatch) {
    const casalId = movMatch[1];
    const movimentacoes = getStored<MovimentacaoDto[]>('movimentacoes', INITIAL_MOVIMENTACOES);
    if (method === 'GET') {
      const list = movimentacoes.filter((m) => m.casalId === casalId);
      return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
    }
    if (method === 'POST') {
      const body = req.body as Partial<MovimentacaoDto>;
      const newMov: MovimentacaoDto = {
        id: 'mov-' + Date.now(),
        casalId,
        tipo: body.tipo ?? 'TRANSFERENCIA',
        equipeOrigemId: body.equipeOrigemId,
        nomeEquipeOrigem: body.nomeEquipeOrigem,
        equipeDestinoId: body.equipeDestinoId,
        nomeEquipeDestino: body.nomeEquipeDestino,
        data: body.data || new Date().toISOString().substring(0, 10),
        motivo: body.motivo || '',
        observacoes: body.observacoes,
      };
      movimentacoes.unshift(newMov);
      setStored('movimentacoes', movimentacoes);
      return of(new HttpResponse({ status: 201, body: newMov })).pipe(delay(30));
    }
  }

  // /api/casais/:id/mandatos
  const casalMandatoMatch = cleanUrl.match(/^\/api\/casais\/([^/]+)\/mandatos$/);
  if (casalMandatoMatch && method === 'GET') {
    const casalId = casalMandatoMatch[1];
    const mandatos = getStored<MandatoDto[]>('mandatos', INITIAL_MANDATOS);
    const list = mandatos.filter((m) => m.casalId === casalId);
    return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
  }

  // /api/casais/:id/inativar
  const inativarMatch = cleanUrl.match(/^\/api\/casais\/([^/]+)\/inativar$/);
  if (inativarMatch && method === 'POST') {
    const casalId = inativarMatch[1];
    const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
    const body = req.body as { motivo?: string };
    const updated = casais.map((c) =>
      c.id === casalId ? { ...c, status: 'INATIVO' as const, motivoInativacao: body.motivo || 'Inativado' } : c
    );
    setStored('casais', updated);
    return of(new HttpResponse({ status: 200, body: null })).pipe(delay(30));
  }

  // /api/casais/:id/transferir
  const transferirMatch = cleanUrl.match(/^\/api\/casais\/([^/]+)\/transferir$/);
  if (transferirMatch && method === 'POST') {
    const casalId = transferirMatch[1];
    const body = req.body as { equipeDestinoId: string; motivo?: string };
    const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
    const equipes = getStored<EquipeDetalheDto[]>('equipes', INITIAL_EQUIPES);
    const destEquipe = equipes.find((e) => e.id === body.equipeDestinoId);
    const updated = casais.map((c) =>
      c.id === casalId
        ? {
            ...c,
            equipeId: body.equipeDestinoId,
            nomeEquipe: destEquipe?.nomeDevocao || 'Equipe',
          }
        : c
    );
    setStored('casais', updated);
    return of(new HttpResponse({ status: 200, body: null })).pipe(delay(30));
  }

  // /api/casais/:id
  const casalIdMatch = cleanUrl.match(/^\/api\/casais\/([^/]+)$/);
  if (casalIdMatch) {
    const id = casalIdMatch[1];
    const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
    if (method === 'GET') {
      const item = casais.find((c) => c.id === id);
      if (item) {
        return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
      }
      return of(new HttpResponse({ status: 404, statusText: 'Casal não encontrado' }));
    }
    if (method === 'PUT') {
      const body = req.body as Partial<CasalDto>;
      const updated = casais.map((c) => (c.id === id ? { ...c, ...body, id } : c));
      setStored('casais', updated);
      const saved = updated.find((c) => c.id === id);
      return of(new HttpResponse({ status: 200, body: saved })).pipe(delay(30));
    }
  }

  // /api/casais (list or create)
  if (cleanUrl === '/api/casais') {
    const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
    if (method === 'GET') {
      const busca = req.params.get('busca')?.toLowerCase();
      const status = req.params.get('status');
      const equipeId = req.params.get('equipeId');
      const page = Number(req.params.get('page') || 0);
      const size = Number(req.params.get('size') || 20);

      let filtered = casais;
      if (status) filtered = filtered.filter((c) => c.status === status);
      if (equipeId) filtered = filtered.filter((c) => c.equipeId === equipeId);
      if (busca) {
        filtered = filtered.filter(
          (c) =>
            c.esposo.nomeCompleto.toLowerCase().includes(busca) ||
            c.esposa.nomeCompleto.toLowerCase().includes(busca) ||
            (c.nomeEquipe && c.nomeEquipe.toLowerCase().includes(busca))
        );
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);

      const res: PageResponse<CasalDto> = {
        page,
        size,
        totalElements,
        totalPages,
        content,
      };
      return of(new HttpResponse({ status: 200, body: res })).pipe(delay(30));
    }

    if (method === 'POST') {
      const body = req.body as Partial<CasalDto>;
      const newCasal: CasalDto = {
        id: 'c-' + Date.now(),
        esposo: body.esposo!,
        esposa: body.esposa!,
        dataMatrimonio: body.dataMatrimonio,
        paroquiaCasamento: body.paroquiaCasamento,
        recebeCartaMensal: body.recebeCartaMensal || 'NÃO',
        status: body.status || 'ATIVO',
        equipeId: body.equipeId,
        nomeEquipe: body.nomeEquipe,
        endereco: body.endereco,
        filhos: body.filhos || [],
      };
      casais.push(newCasal);
      setStored('casais', casais);
      return of(new HttpResponse({ status: 201, body: newCasal })).pipe(delay(30));
    }
  }

  // 3. ESTRUTURA
  // GET /api/estrutura/arvore
  if (cleanUrl === '/api/estrutura/arvore') {
    const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);

    // Build hierarchy tree
    function buildTree(paiId: string | null): NoArvore[] {
      return estrutura
        .filter((n) => n.paiId === paiId)
        .map((n) => {
          const filhos = buildTree(n.id);
          return {
            ...n,
            totalFilhos: filhos.length,
            filhos,
          };
        });
    }

    const arvore = buildTree(null);
    return of(new HttpResponse({ status: 200, body: arvore })).pipe(delay(30));
  }

  // GET /api/estrutura/detalhe/:id
  const estruturaDetalheMatch = cleanUrl.match(/^\/api\/estrutura\/detalhe\/([^/]+)$/);
  if (estruturaDetalheMatch && method === 'GET') {
    const id = estruturaDetalheMatch[1];
    const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);
    const item = estrutura.find((e) => e.id === id);
    return of(new HttpResponse({ status: item ? 200 : 404, body: item })).pipe(delay(30));
  }

  // GET /api/estrutura/:nivel
  const estruturaNivelMatch = cleanUrl.match(/^\/api\/estrutura\/(SUPER_REGIAO|PROVINCIA|REGIAO|SETOR)$/);
  if (estruturaNivelMatch && method === 'GET') {
    const nivel = estruturaNivelMatch[1];
    const paiId = req.params.get('paiId');
    const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);

    let list = estrutura.filter((e) => e.nivel === nivel);
    if (paiId) {
      list = list.filter((e) => e.paiId === paiId);
    }
    return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
  }

  // POST /api/estrutura
  if (cleanUrl === '/api/estrutura' && method === 'POST') {
    const body = req.body as Partial<NoEstrutura>;
    const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);
    const newNo: NoEstrutura = {
      id: 'no-' + Date.now(),
      nome: body.nome || 'Novo Nó',
      nivel: body.nivel || 'SETOR',
      paiId: body.paiId || null,
    };
    estrutura.push(newNo);
    setStored('estrutura', estrutura);
    return of(new HttpResponse({ status: 201, body: newNo })).pipe(delay(30));
  }

  // PUT / DELETE /api/estrutura/:id
  const estruturaIdMatch = cleanUrl.match(/^\/api\/estrutura\/([^/]+)$/);
  if (estruturaIdMatch) {
    const id = estruturaIdMatch[1];
    const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);
    if (method === 'PUT') {
      const body = req.body as Partial<NoEstrutura>;
      const updated = estrutura.map((e) => (e.id === id ? { ...e, ...body, id } : e));
      setStored('estrutura', updated);
      const item = updated.find((e) => e.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
    if (method === 'DELETE') {
      const updated = estrutura.filter((e) => e.id !== id);
      setStored('estrutura', updated);
      return of(new HttpResponse({ status: 204, body: null })).pipe(delay(30));
    }
  }

  // 4. EQUIPES
  // /api/equipes/:id/vinculos
  const vinculosMatch = cleanUrl.match(/^\/api\/equipes\/([^/]+)\/vinculos$/);
  if (vinculosMatch && method === 'PUT') {
    const equipeId = vinculosMatch[1];
    const equipes = getStored<EquipeDetalheDto[]>('equipes', INITIAL_EQUIPES);
    const vinculos = req.body as EquipeDetalheDto['vinculos'];
    const updated = equipes.map((e) => (e.id === equipeId ? { ...e, vinculos } : e));
    setStored('equipes', updated);
    const item = updated.find((e) => e.id === equipeId);
    return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
  }

  // /api/equipes/:id/arquivar
  const arquivarMatch = cleanUrl.match(/^\/api\/equipes\/([^/]+)\/arquivar$/);
  if (arquivarMatch && method === 'POST') {
    const equipeId = arquivarMatch[1];
    const equipes = getStored<EquipeDetalheDto[]>('equipes', INITIAL_EQUIPES);
    const updated = equipes.map((e) => (e.id === equipeId ? { ...e, status: 'INATIVA' as const } : e));
    setStored('equipes', updated);
    return of(new HttpResponse({ status: 200, body: null })).pipe(delay(30));
  }

  // /api/equipes/:id/reunioes
  const eqReuniaoMatch = cleanUrl.match(/^\/api\/equipes\/([^/]+)\/reunioes$/);
  if (eqReuniaoMatch) {
    const equipeId = eqReuniaoMatch[1];
    const reunioes = getStored<ReuniaoDto[]>('reunioes', INITIAL_REUNIOES);
    if (method === 'GET') {
      const list = reunioes.filter((r) => r.equipeId === equipeId);
      return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
    }
    if (method === 'POST') {
      const body = req.body as Partial<ReuniaoDto>;
      const newReun: ReuniaoDto = {
        id: 'reun-' + Date.now(),
        equipeId,
        data: body.data || new Date().toISOString().substring(0, 10),
        horario: body.horario || '14:30',
        tipo: body.tipo || 'FORMAL',
        casalAnimadorId: body.casalAnimadorId,
        nomeCasalAnimador: body.nomeCasalAnimador,
        tema: body.tema || 'Tema Mensal',
        casalAnfitriaoId: body.casalAnfitriaoId,
        nomeCasalAnfitriao: body.nomeCasalAnfitriao,
        enderecoAnfitriao: body.enderecoAnfitriao,
        localObservacao: body.localObservacao,
        scePresente: body.scePresente !== undefined ? !!body.scePresente : true,
        presencas: body.presencas || [],
        anotacoesCre: body.anotacoesCre,
        fotos: body.fotos || [],
        totalPresentes: body.presencas?.filter((p) => p.status === 'PRESENTE').length ?? 0,
        totalFaltas: body.presencas?.filter((p) => p.status === 'FALTOU').length ?? 0,
        totalJustificadas: body.presencas?.filter((p) => p.status === 'JUSTIFICOU').length ?? 0,
      };
      reunioes.push(newReun);
      setStored('reunioes', reunioes);
      return of(new HttpResponse({ status: 201, body: newReun })).pipe(delay(30));
    }
  }

  // /api/equipes/:id/mural
  const eqMuralMatch = cleanUrl.match(/^\/api\/equipes\/([^/]+)\/mural$/);
  if (eqMuralMatch) {
    const equipeId = eqMuralMatch[1];
    const mural = getStored<MomentoMuralDto[]>('mural', INITIAL_MURAL);
    if (method === 'GET') {
      const list = mural.filter((m) => m.equipeId === equipeId);
      return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
    }
    if (method === 'POST') {
      const body = req.body as Partial<MomentoMuralDto>;
      const newMomento: MomentoMuralDto = {
        id: 'mur-' + Date.now(),
        equipeId,
        titulo: body.titulo || 'Momento da Equipe',
        data: body.data || new Date().toISOString().substring(0, 10),
        categoria: body.categoria || 'OUTRO',
        descricao: body.descricao,
        fotos: body.fotos || [],
        autorCasalId: body.autorCasalId || '6ae08c88ca048c6290d5fdcd',
        autorNome: body.autorNome || 'Daniel e Aline',
        criadoEm: new Date().toISOString(),
      };
      mural.unshift(newMomento);
      setStored('mural', mural);
      return of(new HttpResponse({ status: 201, body: newMomento })).pipe(delay(30));
    }
  }

  // /api/equipes/:id
  const equipeIdMatch = cleanUrl.match(/^\/api\/equipes\/([^/]+)$/);
  if (equipeIdMatch) {
    const id = equipeIdMatch[1];
    const equipes = getStored<EquipeDetalheDto[]>('equipes', INITIAL_EQUIPES);
    if (method === 'GET') {
      const item = equipes.find((e) => e.id === id);
      return of(new HttpResponse({ status: item ? 200 : 404, body: item })).pipe(delay(30));
    }
    if (method === 'PUT') {
      const body = req.body as Partial<EquipeDetalheDto>;
      const updated = equipes.map((e) => (e.id === id ? { ...e, ...body, id } : e));
      setStored('equipes', updated);
      const item = updated.find((e) => e.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
  }

  // /api/equipes (list or create)
  if (cleanUrl === '/api/equipes') {
    const equipes = getStored<EquipeDetalheDto[]>('equipes', INITIAL_EQUIPES);
    if (method === 'GET') {
      const superRegiaoId = req.params.get('superRegiaoId');
      const provinciaId = req.params.get('provinciaId');
      const regiaoId = req.params.get('regiaoId');
      const setorId = req.params.get('setorId');
      const status = req.params.get('status');
      const page = Number(req.params.get('page') || 0);
      const size = Number(req.params.get('size') || 20);

      let filtered = equipes;
      if (superRegiaoId) filtered = filtered.filter((e) => e.superRegiao?.id === superRegiaoId);
      if (provinciaId) filtered = filtered.filter((e) => e.provincia?.id === provinciaId);
      if (regiaoId) filtered = filtered.filter((e) => e.regiao?.id === regiaoId);
      if (setorId) filtered = filtered.filter((e) => e.setor?.id === setorId);
      if (status) filtered = filtered.filter((e) => e.status === status);

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);

      const res: PageResponse<EquipeResumoDto> = {
        page,
        size,
        totalElements,
        totalPages,
        content,
      };
      return of(new HttpResponse({ status: 200, body: res })).pipe(delay(30));
    }

    if (method === 'POST') {
      const body = req.body as Partial<EquipeDetalheDto> & {
        superRegiaoId?: string;
        provinciaId?: string;
        regiaoId?: string;
        setorId?: string;
      };
      const estrutura = getStored<NoEstrutura[]>('estrutura', INITIAL_ESTRUTURA);
      const superRegiao = estrutura.find((e) => e.id === body.superRegiaoId);
      const provincia = estrutura.find((e) => e.id === body.provinciaId);
      const regiao = estrutura.find((e) => e.id === body.regiaoId);
      const setor = estrutura.find((e) => e.id === body.setorId);

      const newEq: EquipeDetalheDto = {
        id: 'eq-' + Date.now(),
        numero: body.numero || equipes.length + 1,
        nomeDevocao: body.nomeDevocao || 'NOSSA SENHORA',
        status: body.status || 'ATIVA',
        emPilotagem: !!body.emPilotagem,
        superRegiao,
        provincia,
        regiao,
        setor,
        nomeSce: body.nomeSce,
        cre: body.cre,
        situacaoMandatoCre: 'VIGENTE_REGULAR',
        alertaMandato: 'NENHUM',
        totalCasais: 0,
        estado: body.estado || 'MT',
        municipio: body.municipio || 'Cuiabá',
        dataFundacao: body.dataFundacao || new Date().toISOString().substring(0, 10),
        temaEstudoAno: body.temaEstudoAno || '',
        temasAnuais: body.temasAnuais || [],
        vinculos: [],
      };
      equipes.push(newEq);
      setStored('equipes', equipes);
      return of(new HttpResponse({ status: 201, body: newEq })).pipe(delay(30));
    }
  }

  // 5. SCE (Sacerdotes)
  if (cleanUrl === '/api/sce/ativos' && method === 'GET') {
    const sces = getStored<SceDto[]>('sces', INITIAL_SCES);
    const ativos = sces.filter((s) => s.status === 'ATIVO');
    return of(new HttpResponse({ status: 200, body: ativos })).pipe(delay(30));
  }

  const sceInativarMatch = cleanUrl.match(/^\/api\/sce\/([^/]+)\/inativar$/);
  if (sceInativarMatch && method === 'POST') {
    const id = sceInativarMatch[1];
    const sces = getStored<SceDto[]>('sces', INITIAL_SCES);
    const updated = sces.map((s) => (s.id === id ? { ...s, status: 'INATIVO' as const } : s));
    setStored('sces', updated);
    return of(new HttpResponse({ status: 204, body: null })).pipe(delay(30));
  }

  const sceIdMatch = cleanUrl.match(/^\/api\/sce\/([^/]+)$/);
  if (sceIdMatch) {
    const id = sceIdMatch[1];
    const sces = getStored<SceDto[]>('sces', INITIAL_SCES);
    if (method === 'GET') {
      const item = sces.find((s) => s.id === id);
      return of(new HttpResponse({ status: item ? 200 : 404, body: item })).pipe(delay(30));
    }
    if (method === 'PUT') {
      const body = req.body as Partial<SceDto>;
      const updated = sces.map((s) => (s.id === id ? { ...s, ...body, id } : s));
      setStored('sces', updated);
      const item = updated.find((s) => s.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
  }

  if (cleanUrl === '/api/sce') {
    const sces = getStored<SceDto[]>('sces', INITIAL_SCES);
    if (method === 'GET') {
      const busca = req.params.get('busca')?.toLowerCase();
      const page = Number(req.params.get('page') || 0);
      const size = Number(req.params.get('size') || 20);

      let filtered = sces;
      if (busca) {
        filtered = filtered.filter(
          (s) =>
            s.nomeCompleto.toLowerCase().includes(busca) ||
            (s.paroquia && s.paroquia.toLowerCase().includes(busca)) ||
            (s.dioceseCongregacao && s.dioceseCongregacao.toLowerCase().includes(busca))
        );
      }

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);

      const res: PageResponse<SceDto> = {
        page,
        size,
        totalElements,
        totalPages,
        content,
      };
      return of(new HttpResponse({ status: 200, body: res })).pipe(delay(30));
    }

    if (method === 'POST') {
      const body = req.body as Partial<SceDto>;
      const newSce: SceDto = {
        id: 'sce-' + Date.now(),
        nomeCompleto: body.nomeCompleto || 'Padre Conselheiro',
        titulo: body.titulo || 'PADRE',
        dioceseCongregacao: body.dioceseCongregacao,
        paroquia: body.paroquia,
        telefones: body.telefones || [],
        email: body.email,
        fotoUrl: body.fotoUrl,
        status: 'ATIVO',
        dataNascimento: body.dataNascimento,
        dataOrdenacaoConsagracao: body.dataOrdenacaoConsagracao,
      };
      sces.push(newSce);
      setStored('sces', sces);
      return of(new HttpResponse({ status: 201, body: newSce })).pipe(delay(30));
    }
  }

  // 6. MANDATOS
  if (cleanUrl === '/api/mandatos/sugestao-prazo') {
    const funcao = req.params.get('funcao');
    const dataInicio = req.params.get('dataInicio') || '2025-10-30';
    const date = new Date(dataInicio);
    const anos = funcao === 'CRE' ? 1 : funcao === 'CL' ? 2 : 3;
    date.setFullYear(date.getFullYear() + anos);
    const dataPrevistaTermino = date.toISOString().substring(0, 10);
    return of(new HttpResponse({ status: 200, body: { dataPrevistaTermino } })).pipe(delay(30));
  }

  const mandatoInterromperMatch = cleanUrl.match(/^\/api\/mandatos\/([^/]+)\/interromper$/);
  if (mandatoInterromperMatch && method === 'POST') {
    const id = mandatoInterromperMatch[1];
    const mandatos = getStored<MandatoDto[]>('mandatos', INITIAL_MANDATOS);
    const updated = mandatos.map((m) =>
      m.id === id
        ? {
            ...m,
            status: 'INTERROMPIDO_ANTECIPADAMENTE' as const,
            dataEncerramentoEfetivo: new Date().toISOString().substring(0, 10),
          }
        : m
    );
    setStored('mandatos', updated);
    return of(new HttpResponse({ status: 200, body: null })).pipe(delay(30));
  }

  const mandatoIdMatch = cleanUrl.match(/^\/api\/mandatos\/([^/]+)$/);
  if (mandatoIdMatch) {
    const id = mandatoIdMatch[1];
    const mandatos = getStored<MandatoDto[]>('mandatos', INITIAL_MANDATOS);
    if (method === 'GET') {
      const item = mandatos.find((m) => m.id === id);
      return of(new HttpResponse({ status: item ? 200 : 404, body: item })).pipe(delay(30));
    }
    if (method === 'PUT') {
      const body = req.body as Partial<MandatoDto>;
      const updated = mandatos.map((m) => (m.id === id ? { ...m, ...body, id } : m));
      setStored('mandatos', updated);
      const item = updated.find((e) => e.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
  }

  if (cleanUrl === '/api/mandatos') {
    const mandatos = getStored<MandatoDto[]>('mandatos', INITIAL_MANDATOS);
    if (method === 'GET') {
      const funcao = req.params.get('funcao');
      const status = req.params.get('status');
      const alerta = req.params.get('alerta');
      const page = Number(req.params.get('page') || 0);
      const size = Number(req.params.get('size') || 20);

      let filtered = mandatos;
      if (funcao) filtered = filtered.filter((m) => m.funcao === funcao);
      if (status) filtered = filtered.filter((m) => m.status === status);
      if (alerta) filtered = filtered.filter((m) => m.alerta === alerta);

      const totalElements = filtered.length;
      const totalPages = Math.ceil(totalElements / size) || 1;
      const content = filtered.slice(page * size, (page + 1) * size);

      const res: PageResponse<MandatoDto> = {
        page,
        size,
        totalElements,
        totalPages,
        content,
      };
      return of(new HttpResponse({ status: 200, body: res })).pipe(delay(30));
    }

    if (method === 'POST') {
      const body = req.body as Partial<MandatoDto>;
      const casais = getStored<CasalDto[]>('casais', INITIAL_CASAIS);
      const casal = casais.find((c) => c.id === body.casalId);
      const nomeResponsavel = casal
        ? `${casal.esposo.nomeCompleto.split(' ')[0]} e ${casal.esposa.nomeCompleto.split(' ')[0]}`
        : 'Casal Responsável';

      const newMan: MandatoDto = {
        id: 'man-' + Date.now(),
        casalId: body.casalId,
        nomeResponsavel,
        funcao: body.funcao || 'CRE',
        nivelInstancia: body.nivelInstancia || 'EQUIPE',
        instanciaId: body.instanciaId || '6ae08c88ca048c6290d5fdcc',
        nomeInstancia: body.nomeInstancia || 'Equipe 01 - NOSSA SENHORA APARECIDA',
        dataInicio: body.dataInicio || '2025-10-30',
        dataPrevistaTermino: body.dataPrevistaTermino || '2026-10-30',
        status: body.status || 'VIGENTE',
        alerta: 'NENHUM',
        diasParaTermino: 365,
        observacoes: body.observacoes,
      };
      mandatos.push(newMan);
      setStored('mandatos', mandatos);
      return of(new HttpResponse({ status: 201, body: newMan })).pipe(delay(30));
    }
  }

  // 7. REUNIÕES
  if (cleanUrl === '/api/reunioes/minha-equipe' && method === 'GET') {
    const reunioes = getStored<ReuniaoDto[]>('reunioes', INITIAL_REUNIOES);
    const list = reunioes.filter((r) => r.equipeId === '6ae08c88ca048c6290d5fdcc');
    return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
  }

  // /api/reunioes/:id/presencas
  const reuniaoPresencaMatch = cleanUrl.match(/^\/api\/reunioes\/([^/]+)\/presencas$/);
  if (reuniaoPresencaMatch && method === 'PUT') {
    const id = reuniaoPresencaMatch[1];
    const reunioes = getStored<ReuniaoDto[]>('reunioes', INITIAL_REUNIOES);
    const body = req.body as { presencas: ReuniaoDto['presencas']; scePresente?: boolean; anotacoesCre?: string };
    const updated = reunioes.map((r) => {
      if (r.id === id) {
        const totalPresentes = body.presencas.filter((p) => p.status === 'PRESENTE').length;
        const totalFaltas = body.presencas.filter((p) => p.status === 'FALTOU').length;
        const totalJustificadas = body.presencas.filter((p) => p.status === 'JUSTIFICOU').length;
        return {
          ...r,
          presencas: body.presencas,
          scePresente: body.scePresente !== undefined ? body.scePresente : r.scePresente,
          anotacoesCre: body.anotacoesCre !== undefined ? body.anotacoesCre : r.anotacoesCre,
          totalPresentes,
          totalFaltas,
          totalJustificadas,
        };
      }
      return r;
    });
    setStored('reunioes', updated);
    const item = updated.find((r) => r.id === id);
    return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
  }

  const reuniaoIdMatch = cleanUrl.match(/^\/api\/reunioes\/([^/]+)$/);
  if (reuniaoIdMatch) {
    const id = reuniaoIdMatch[1];
    const reunioes = getStored<ReuniaoDto[]>('reunioes', INITIAL_REUNIOES);
    if (method === 'GET') {
      const item = reunioes.find((r) => r.id === id);
      return of(new HttpResponse({ status: item ? 200 : 404, body: item })).pipe(delay(30));
    }
    if (method === 'PUT') {
      const body = req.body as Partial<ReuniaoDto>;
      const updated = reunioes.map((r) => (r.id === id ? { ...r, ...body, id } : r));
      setStored('reunioes', updated);
      const item = updated.find((r) => r.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
    if (method === 'DELETE') {
      const updated = reunioes.filter((r) => r.id !== id);
      setStored('reunioes', updated);
      return of(new HttpResponse({ status: 204, body: null })).pipe(delay(30));
    }
  }

  if (cleanUrl === '/api/reunioes') {
    const reunioes = getStored<ReuniaoDto[]>('reunioes', INITIAL_REUNIOES);
    const equipeId = req.params.get('equipeId');
    let list = reunioes;
    if (equipeId) {
      list = list.filter((r) => r.equipeId === equipeId);
    }
    return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
  }

  // 8. MURAL
  if (cleanUrl === '/api/mural/meu-mural') {
    const mural = getStored<MomentoMuralDto[]>('mural', INITIAL_MURAL);
    if (method === 'GET') {
      const list = mural.filter((m) => m.equipeId === '6ae08c88ca048c6290d5fdcc');
      return of(new HttpResponse({ status: 200, body: list })).pipe(delay(30));
    }
    if (method === 'POST') {
      const body = req.body as Partial<MomentoMuralDto>;
      const newMomento: MomentoMuralDto = {
        id: 'mur-' + Date.now(),
        equipeId: '6ae08c88ca048c6290d5fdcc',
        titulo: body.titulo || 'Momento da Equipe',
        data: body.data || new Date().toISOString().substring(0, 10),
        categoria: body.categoria || 'OUTRO',
        descricao: body.descricao,
        fotos: body.fotos || [],
        autorCasalId: '6ae08c88ca048c6290d5fdcd',
        autorNome: 'Daniel e Aline',
        criadoEm: new Date().toISOString(),
      };
      mural.unshift(newMomento);
      setStored('mural', mural);
      return of(new HttpResponse({ status: 201, body: newMomento })).pipe(delay(30));
    }
  }

  const muralIdMatch = cleanUrl.match(/^\/api\/mural\/([^/]+)$/);
  if (muralIdMatch) {
    const id = muralIdMatch[1];
    const mural = getStored<MomentoMuralDto[]>('mural', INITIAL_MURAL);
    if (method === 'PUT') {
      const body = req.body as Partial<MomentoMuralDto>;
      const updated = mural.map((m) => (m.id === id ? { ...m, ...body, id } : m));
      setStored('mural', updated);
      const item = updated.find((m) => m.id === id);
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(30));
    }
    if (method === 'DELETE') {
      const updated = mural.filter((m) => m.id !== id);
      setStored('mural', updated);
      return of(new HttpResponse({ status: 204, body: null })).pipe(delay(30));
    }
  }

  // Fallback for any other /api/* request
  return of(new HttpResponse({ status: 200, body: [] })).pipe(delay(30));
};
