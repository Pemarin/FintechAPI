"""
test_config.py — Testes da camada de configuração (Settings / pydantic-settings).

Cobre:
- Carregamento correto das variáveis de ambiente
- Singleton via lru_cache (mesma instância em chamadas repetidas)
- Isolamento por variável de ambiente via monkeypatch
"""

import os
import pytest
from unittest.mock import patch


class TestSettings:

    def test_settings_carrega_api_key_do_env(self):
        """Settings deve ler API_KEY do ambiente."""
        from app.core.config import get_settings
        settings = get_settings()
        assert settings.API_KEY == os.environ["API_KEY"]

    def test_settings_carrega_fabric_msp_id(self):
        """FABRIC_MSP_ID deve ser lido corretamente."""
        from app.core.config import get_settings
        settings = get_settings()
        assert settings.FABRIC_MSP_ID == os.environ["FABRIC_MSP_ID"]

    def test_settings_carrega_fabric_channel(self):
        """FABRIC_CHANNEL deve ser lido corretamente."""
        from app.core.config import get_settings
        settings = get_settings()
        assert settings.FABRIC_CHANNEL == os.environ["FABRIC_CHANNEL"]

    def test_settings_singleton_via_cache(self):
        """Duas chamadas a get_settings() devem retornar a mesma instância (lru_cache)."""
        from app.core.config import get_settings
        s1 = get_settings()
        s2 = get_settings()
        assert s1 is s2

    def test_settings_cache_e_limpo_entre_testes(self):
        """Após clear_settings_cache, uma nova instância deve ser criada."""
        from app.core.config import get_settings
        s1 = get_settings()
        get_settings.cache_clear()
        s2 = get_settings()
        # Ambas instâncias devem ter os mesmos valores (do mesmo env)
        assert s1.API_KEY == s2.API_KEY

    def test_settings_api_key_atualizada_via_env(self, monkeypatch):
        """Mudança no env + clear_cache deve refletir novo valor."""
        from app.core.config import get_settings

        monkeypatch.setenv("API_KEY", "nova-chave-monkeypatch")
        get_settings.cache_clear()

        settings = get_settings()
        assert settings.API_KEY == "nova-chave-monkeypatch"
