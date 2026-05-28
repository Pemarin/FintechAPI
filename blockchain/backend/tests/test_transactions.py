"""
test_transactions.py — Testes de integração dos endpoints /transactions.

Cobre:
- RF01/RF02/RF03: POST /transactions  (registrar hash)
- RF04: GET /transactions/{id}        (consultar por ID)
- RF04/RF05/RF06: POST /transactions/{id}/verify (verificar integridade)
- RF07: GET /transactions/fintech/{id}/history
- RF08: GET /transactions/{id}/history
- Autenticação via x-api-key (válida, inválida, ausente)
- Tratamento de erros (404, 409, 500)
"""

import pytest
from unittest.mock import patch

from tests.conftest import (
    MOCK_REGISTER_RESULT,
    MOCK_VERIFY_RESULT,
    MOCK_QUERY_RESULT,
    MOCK_HISTORY_RESULT,
)


# ─── Autenticação ─────────────────────────────────────────────────────────────

class TestAutenticacao:

    def test_sem_api_key_retorna_422(self, client, sample_transaction_payload):
        """Requisição sem x-api-key deve retornar 422 (header obrigatório ausente)."""
        response = client.post("/transactions/", json=sample_transaction_payload)
        assert response.status_code == 422

    def test_api_key_invalida_retorna_401(
        self, client, invalid_headers, sample_transaction_payload
    ):
        """API Key errada deve retornar 401 Unauthorized."""
        response = client.post(
            "/transactions/",
            json=sample_transaction_payload,
            headers=invalid_headers,
        )
        assert response.status_code == 401

    def test_api_key_invalida_mensagem_de_erro(
        self, client, invalid_headers, sample_transaction_payload
    ):
        """Detalhe do erro deve indicar 'API Key inválida'."""
        response = client.post(
            "/transactions/",
            json=sample_transaction_payload,
            headers=invalid_headers,
        )
        assert "API Key" in response.json()["detail"]

    def test_api_key_valida_nao_retorna_401(
        self, client, auth_headers, sample_transaction_payload
    ):
        """Com API Key correta, não deve retornar 401."""
        response = client.post(
            "/transactions/",
            json=sample_transaction_payload,
            headers=auth_headers,
        )
        assert response.status_code != 401


# ─── RF01-RF03: POST /transactions/ — Registrar Transação ────────────────────

class TestRegistrarTransacao:

    def test_registrar_retorna_201(self, client, auth_headers, sample_transaction_payload):
        """Registro bem-sucedido deve retornar HTTP 201 Created."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.return_value = MOCK_REGISTER_RESULT
            response = client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
        assert response.status_code == 201

    def test_registrar_retorna_campos_esperados(
        self, client, auth_headers, sample_transaction_payload
    ):
        """Resposta deve conter: status, transaction_id, verification_id, hash, timestamp."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.return_value = MOCK_REGISTER_RESULT
            response = client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
        body = response.json()
        assert body["status"] == "SUCCESS"
        assert body["transaction_id"] == "TXN-001"
        assert "verification_id" in body
        assert len(body["hash"]) == 64
        assert "timestamp" in body

    def test_registrar_chama_invoke_chaincode(
        self, client, auth_headers, sample_transaction_payload
    ):
        """invoke_chaincode deve ser chamado exatamente uma vez."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.return_value = MOCK_REGISTER_RESULT
            client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
            mock_inv.assert_called_once()

    def test_registrar_chama_RegisterHash(
        self, client, auth_headers, sample_transaction_payload
    ):
        """A função chamada no chaincode deve ser 'RegisterHash'."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.return_value = MOCK_REGISTER_RESULT
            client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
            call_args = mock_inv.call_args
            assert call_args[0][0] == "RegisterHash"

    def test_registrar_payload_incompleto_retorna_422(self, client, auth_headers):
        """Payload sem campos obrigatórios deve retornar 422."""
        response = client.post(
            "/transactions/",
            json={"transaction_id": "TXN-INCOMPLETO"},
            headers=auth_headers,
        )
        assert response.status_code == 422

    def test_registrar_duplicado_retorna_409(
        self, client, auth_headers, sample_transaction_payload
    ):
        """Transação já existente (ALREADY_EXISTS) deve retornar 409 Conflict."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.side_effect = Exception("ALREADY_EXISTS: transaction TXN-001")
            response = client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
        assert response.status_code == 409

    def test_registrar_erro_fabric_retorna_500(
        self, client, auth_headers, sample_transaction_payload
    ):
        """Erro genérico do Fabric deve retornar 500."""
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.side_effect = Exception("Connection refused")
            response = client.post(
                "/transactions/",
                json=sample_transaction_payload,
                headers=auth_headers,
            )
        assert response.status_code == 500

    def test_hash_nao_expoe_dados_originais(
        self, client, auth_headers
    ):
        """O hash retornado não deve conter dados sensíveis (apenas hexadecimal)."""
        payload = {
            "transaction_id": "TXN-SENSITIVE",
            "transaction_data": {"cpf": "000.000.000-00", "amount": 9999.99},
            "fintech_id": "FT-SECURE",
        }
        with patch("app.routers.transactions.invoke_chaincode") as mock_inv:
            mock_inv.return_value = {**MOCK_REGISTER_RESULT, "transactionId": "TXN-SENSITIVE"}
            response = client.post("/transactions/", json=payload, headers=auth_headers)

        body = response.json()
        # Hash deve ser hexadecimal puro — nunca dados sensíveis
        assert "cpf" not in body["hash"]
        assert "000" not in body["hash"]
        assert all(c in "0123456789abcdef" for c in body["hash"])


# ─── RF04: GET /transactions/{id} — Consultar Hash ───────────────────────────

class TestConsultarTransacao:

    def test_consultar_existente_retorna_200(self, client, auth_headers):
        """GET de ID existente deve retornar 200."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_QUERY_RESULT
            response = client.get("/transactions/TXN-001", headers=auth_headers)
        assert response.status_code == 200

    def test_consultar_retorna_dados_corretos(self, client, auth_headers):
        """Dados retornados devem corresponder ao registro mockado."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_QUERY_RESULT
            response = client.get("/transactions/TXN-001", headers=auth_headers)
        body = response.json()
        assert body["transactionId"] == "TXN-001"

    def test_consultar_nao_existente_retorna_404(self, client, auth_headers):
        """ID inexistente deve retornar 404."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.side_effect = ValueError("NOT_FOUND: TXN-9999")
            response = client.get("/transactions/TXN-9999", headers=auth_headers)
        assert response.status_code == 404

    def test_consultar_chama_QueryHash(self, client, auth_headers):
        """A função do chaincode deve ser 'QueryHash'."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_QUERY_RESULT
            client.get("/transactions/TXN-001", headers=auth_headers)
            assert mock_qry.call_args[0][0] == "QueryHash"

    def test_consultar_sem_auth_retorna_422(self, client):
        """Sem x-api-key deve retornar 422."""
        response = client.get("/transactions/TXN-001")
        assert response.status_code == 422


# ─── RF04-RF06: POST /transactions/{id}/verify — Verificar Integridade ───────

class TestVerificarIntegridade:

    def test_verificar_integro_retorna_200(self, client, auth_headers, sample_verify_payload):
        """Verificação bem-sucedida deve retornar 200."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_VERIFY_RESULT
            response = client.post(
                "/transactions/TXN-001/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
        assert response.status_code == 200

    def test_verificar_retorna_intact_true(self, client, auth_headers, sample_verify_payload):
        """Dados íntegros devem retornar intact=True."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_VERIFY_RESULT
            response = client.post(
                "/transactions/TXN-001/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
        assert response.json()["intact"] is True

    def test_verificar_adulterado_retorna_intact_false(
        self, client, auth_headers, sample_verify_payload
    ):
        """Dados adulterados devem retornar intact=False."""
        tampered_result = {**MOCK_VERIFY_RESULT, "intact": False, "status": "TAMPERED"}
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = tampered_result
            response = client.post(
                "/transactions/TXN-001/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
        assert response.json()["intact"] is False

    def test_verificar_nao_existente_retorna_404(
        self, client, auth_headers, sample_verify_payload
    ):
        """Verificar ID inexistente deve retornar 404."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.side_effect = ValueError("NOT_FOUND")
            response = client.post(
                "/transactions/TXN-9999/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
        assert response.status_code == 404

    def test_verificar_chama_VerifyIntegrity(
        self, client, auth_headers, sample_verify_payload
    ):
        """Função do chaincode deve ser 'VerifyIntegrity'."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_VERIFY_RESULT
            client.post(
                "/transactions/TXN-001/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
            assert mock_qry.call_args[0][0] == "VerifyIntegrity"

    def test_verificar_campos_de_resposta(
        self, client, auth_headers, sample_verify_payload
    ):
        """Resposta deve conter todos os campos esperados."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_VERIFY_RESULT
            response = client.post(
                "/transactions/TXN-001/verify",
                json=sample_verify_payload,
                headers=auth_headers,
            )
        body = response.json()
        required_fields = {
            "transaction_id", "verification_id", "fintech_id",
            "status", "intact", "registered_at", "verified_at",
        }
        assert required_fields.issubset(body.keys())


# ─── RF07: GET /transactions/fintech/{id}/history ────────────────────────────

class TestHistoricoFintech:

    def test_historico_fintech_retorna_200(self, client, auth_headers):
        """GET histórico de fintech deve retornar 200."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_HISTORY_RESULT
            response = client.get(
                "/transactions/fintech/FINTECH-XYZ/history",
                headers=auth_headers,
            )
        assert response.status_code == 200

    def test_historico_fintech_chama_GetTransactionsByFintech(self, client, auth_headers):
        """Função do chaincode deve ser 'GetTransactionsByFintech'."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_HISTORY_RESULT
            client.get(
                "/transactions/fintech/FINTECH-XYZ/history",
                headers=auth_headers,
            )
            assert mock_qry.call_args[0][0] == "GetTransactionsByFintech"

    def test_historico_fintech_page_size_default(self, client, auth_headers):
        """page_size default deve ser 10."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_HISTORY_RESULT
            client.get(
                "/transactions/fintech/FINTECH-XYZ/history",
                headers=auth_headers,
            )
            args = mock_qry.call_args[0][1]  # lista de args do chaincode
            assert args[1] == "10"

    def test_historico_fintech_page_size_customizado(self, client, auth_headers):
        """page_size customizado deve ser repassado ao chaincode."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = MOCK_HISTORY_RESULT
            client.get(
                "/transactions/fintech/FINTECH-XYZ/history?page_size=5",
                headers=auth_headers,
            )
            args = mock_qry.call_args[0][1]
            assert args[1] == "5"

    def test_historico_fintech_erro_retorna_500(self, client, auth_headers):
        """Erro no chaincode deve retornar 500."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.side_effect = Exception("Fabric timeout")
            response = client.get(
                "/transactions/fintech/FINTECH-XYZ/history",
                headers=auth_headers,
            )
        assert response.status_code == 500


# ─── RF08: GET /transactions/{id}/history ────────────────────────────────────

class TestHistoricoTransacao:

    def test_historico_transacao_retorna_200(self, client, auth_headers):
        """GET histórico de transação específica deve retornar 200."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = [MOCK_QUERY_RESULT]
            response = client.get(
                "/transactions/TXN-001/history",
                headers=auth_headers,
            )
        assert response.status_code == 200

    def test_historico_transacao_chama_GetTransactionHistory(self, client, auth_headers):
        """Função do chaincode deve ser 'GetTransactionHistory'."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.return_value = [MOCK_QUERY_RESULT]
            client.get(
                "/transactions/TXN-001/history",
                headers=auth_headers,
            )
            assert mock_qry.call_args[0][0] == "GetTransactionHistory"

    def test_historico_transacao_nao_existente_retorna_404(self, client, auth_headers):
        """ID inexistente deve retornar 404."""
        with patch("app.routers.transactions.query_chaincode") as mock_qry:
            mock_qry.side_effect = ValueError("NOT_FOUND")
            response = client.get(
                "/transactions/TXN-9999/history",
                headers=auth_headers,
            )
        assert response.status_code == 404
