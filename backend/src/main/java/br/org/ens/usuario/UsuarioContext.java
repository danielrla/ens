package br.org.ens.usuario;

import br.org.ens.usuario.dto.UsuarioDto;

public final class UsuarioContext {

    private static final ThreadLocal<UsuarioDto> CURRENT_USER = new ThreadLocal<>();

    private UsuarioContext() {
    }

    public static void set(UsuarioDto usuario) {
        CURRENT_USER.set(usuario);
    }

    public static UsuarioDto get() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}

