"""
conftest.py — Fixtures globais do PyTest para o backend FintechBlock.

Estratégia de mock:
- As variáveis de ambiente do Fabric são configuradas ANTES de qualquer import
  para que pydantic-settings as leia corretamente.
- `fabric_client` é completamente mockado: os testes não dependem de
  infra Hyperledger Fabric real.
- `get_settings` usa lru_cache; o cache é limpo entre os testes para
  garantir isolamento.
"""

import os
import json
from unittest.mock import MagicMock, patch
from functools import lru_cache

import pytest
from fastapi.testclient import TestClient

# ── Variáveis de ambiente de teste ────────────────────────────────────────────
MOCK_ENV = {
    "FABRIC_MSP_ID": "Org1MSP",
    "FABRIC_CHANNEL": "mychannel",
    "FABRIC_CHAINCODE": "hashverification",
    "FABRIC_ORDERER_ENDPOINT": "localhost:7050",
    "FABRIC_PEER_ENDPOINT": "localhost:7051",
    "FABRIC_PEER2_ENDPOINT": "localhost:9051",
    "FABRIC_SAMPLES_DIR": "/tmp/fabric-samples",
    "FABRIC_CERT_PATH": "/tmp/cert",
    "FABRIC_KEY_PATH": "/tmp/key",
    "FABRIC_TLS_CERT_PATH": "/tmp/tls.crt",
    "API_KEY": "test-api-key-secret",
}

# Garante que as variáveis existam antes de qualquer import de módulo da app
for key, value in MOCK_ENV.items():
    os.environ.setdefault(key, value)


# ── Payloads de resposta do chaincode ─────────────────────────────────────────

MOCK_REGISTER_RESULT = {
    "status": "SUCCESS",
    "transactionId": "TXN-001",
    "verificationId": "VRF-abc123",
    "hash": "a" * 64,
    "timestamp": "2024-01-15T10:30:00Z",
}

MOCK_VERIFY_RESULT = {
    "transactionId": "TXN-001",
    "verificationId": "VRF-abc123",
    "fintechId": "FINTECH-XYZ",
    "status": "VERIFIED",
    "intact": True,
    "registeredAt": "2024-01-15T10:30:00Z",
    "verifiedAt": "2024-01-15T11:00:00Z",
}

MOCK_QUERY_RESULT = {
    "transactionId": "TXN-001",
    "verificationId": "VRF-abc123",
    "fintechId": "FINTECH-XYZ",
    "hash": "a" * 64,
    "status": "REGISTERED",
    "registeredAt": "2024-01-15T10:30:00Z",
}

MOCK_HISTORY_RESULT = {
    "records": [MOCK_QUERY_RESULT],
    "bookmark": "",
    "count": 1,
}


# ── Fixtures ───────────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def clear_settings_cache():
    """Limpa o lru_cache de get_settings entre testes para garantir isolamento."""
    from app.core.config import get_settings
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest.fixture
def mock_invoke():
    """Mock de invoke_chaincode — simula escrita bem-sucedida na blockchain."""
    with patch("app.routers.transactions.invoke_chaincode") as m:
        m.return_value = MOCK_REGISTER_RESULT
        yield m


@pytest.fixture
def mock_query():
    """Mock de query_chaincode — simula leitura bem-sucedida da blockchain."""
    with patch("app.routers.transactions.query_chaincode") as m:
        m.return_value = MOCK_QUERY_RESULT
        yield m


@pytest.fixture
def mock_fabric(mock_invoke, mock_query):
    """Convenience fixture: ativa invoke E query ao mesmo tempo."""
    return mock_invoke, mock_query


@pytest.fixture
def client():
    """TestClient do FastAPI com fabric completamente mockado."""
    with patch("app.routers.transactions.invoke_chaincode") as inv, \
         patch("app.routers.transactions.query_chaincode") as qry:
        inv.return_value = MOCK_REGISTER_RESULT
        qry.return_value = MOCK_QUERY_RESULT
        from app.main import app
        with TestClient(app) as c:
            yield c


@pytest.fixture
def auth_headers():
    """Headers padrão com API Key válida."""
    return {"x-api-key": MOCK_ENV["API_KEY"]}


@pytest.fixture
def invalid_headers():
    """Headers com API Key inválida."""
    return {"x-api-key": "wrong-key"}


@pytest.fixture
def sample_transaction_payload():
    """Payload válido para registrar uma transação."""
    return {
        "transaction_id": "TXN-001",
        "transaction_data": {
            "sender": "Alice",
            "receiver": "Bob",
            "amount": 1500.00,
            "currency": "BRL",
        },
        "fintech_id": "FINTECH-XYZ",
    }


@pytest.fixture
def sample_verify_payload():
    """Payload válido para verificar uma transação."""
    return {
        "transaction_id": "TXN-001",
        "transaction_data": {
            "sender": "Alice",
            "receiver": "Bob",
            "amount": 1500.00,
            "currency": "BRL",
        },
    }
