"""
test_health.py — Testes do endpoint GET /health.

Valida:
- Resposta 200 OK
- Corpo da resposta (status e service)
- Endpoint acessível sem autenticação
- Content-Type application/json
"""

import pytest


class TestHealthEndpoint:

    def test_health_retorna_200(self, client):
        """GET /health deve retornar HTTP 200."""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_retorna_status_ok(self, client):
        """Campo 'status' deve ser 'ok'."""
        response = client.get("/health")
        body = response.json()
        assert body["status"] == "ok"

    def test_health_retorna_nome_do_servico(self, client):
        """Campo 'service' deve identificar a API."""
        response = client.get("/health")
        body = response.json()
        assert body["service"] == "hash-verification-api"

    def test_health_nao_exige_autenticacao(self, client):
        """Endpoint /health deve ser público (sem x-api-key)."""
        response = client.get("/health")
        # Não deve retornar 401 ou 403
        assert response.status_code not in (401, 403)

    def test_health_content_type_json(self, client):
        """Resposta deve ter Content-Type application/json."""
        response = client.get("/health")
        assert "application/json" in response.headers["content-type"]

    def test_health_body_tem_exatamente_duas_chaves(self, client):
        """Corpo deve ter exatamente 'status' e 'service'."""
        response = client.get("/health")
        body = response.json()
        assert set(body.keys()) == {"status", "service"}
