package br.org.ens.seguranca;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CriptografiaServiceTest {

    private CriptografiaService service;

    @BeforeEach
    void setUp() {
        service = new CriptografiaService("12345678901234567890123456789012");
    }

    @Test
    void deveCifrarEDecifrarComSucesso() {
        String tokenOriginal = "ya29.a0AfH6SMB_secret_token_12345";
        String cifrado = service.cifrar(tokenOriginal);

        assertNotNull(cifrado);
        assertNotEquals(tokenOriginal, cifrado);

        String decifrado = service.decifrar(cifrado);
        assertEquals(tokenOriginal, decifrado);
    }

    @Test
    void deveRetornarNullParaDadoNuloOuVazio() {
        assertNull(service.cifrar(null));
        assertNull(service.cifrar("   "));
        assertNull(service.decifrar(null));
        assertNull(service.decifrar("   "));
    }
}
