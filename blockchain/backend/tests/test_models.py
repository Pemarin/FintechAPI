"""
test_models.py — Testes unitários dos modelos Pydantic.

Cobre:
- Cálculo de hash SHA-256 (RegisterTransactionRequest e VerifyTransactionRequest)
- Determinismo do hash (mesmos dados → mesmo hash)
- Sensibilidade do hash a alterações
- Ordenação de chaves (sort_keys=True)
- Validação de campos obrigatórios
"""

import hashlib
import json

import pytest
from pydantic import ValidationError

from app.models.transaction import (
    RegisterTransactionRequest,
    RegisterTransactionResponse,
    VerifyTransactionRequest,
    VerifyTransactionResponse,
)


# ─── RegisterTransactionRequest ───────────────────────────────────────────────

class TestRegisterTransactionRequest:

    def test_compute_hash_retorna_sha256_valido(self):
        """Hash gerado deve ser um hexadecimal SHA-256 de 64 chars."""
        req = RegisterTransactionRequest(
            transaction_id="TXN-001",
            transaction_data={"amount": 100, "sender": "Alice"},
            fintech_id="FT-1",
        )
        h = req.compute_hash()
        assert len(h) == 64
        assert all(c in "0123456789abcdef" for c in h)

    def test_compute_hash_deterministico(self):
        """Mesmos dados devem sempre produzir o mesmo hash."""
        data = {"amount": 500.0, "currency": "BRL", "receiver": "Bob"}
        req1 = RegisterTransactionRequest(
            transaction_id="TXN-A", transaction_data=data, fintech_id="FT-1"
        )
        req2 = RegisterTransactionRequest(
            transaction_id="TXN-A", transaction_data=data, fintech_id="FT-1"
        )
        assert req1.compute_hash() == req2.compute_hash()

    def test_compute_hash_sensivel_a_mudancas(self):
        """Uma mudança mínima nos dados deve produzir um hash diferente."""
        base = {"amount": 100, "sender": "Alice"}
        modified = {"amount": 101, "sender": "Alice"}  # valor diferente

        req1 = RegisterTransactionRequest(
            transaction_id="TXN-1", transaction_data=base, fintech_id="FT-1"
        )
        req2 = RegisterTransactionRequest(
            transaction_id="TXN-1", transaction_data=modified, fintech_id="FT-1"
        )
        assert req1.compute_hash() != req2.compute_hash()

    def test_compute_hash_independente_da_ordem_das_chaves(self):
        """sort_keys=True garante que a ordem dos campos não afeta o hash."""
        data_a = {"amount": 100, "sender": "Alice", "currency": "BRL"}
        data_b = {"currency": "BRL", "sender": "Alice", "amount": 100}

        req1 = RegisterTransactionRequest(
            transaction_id="TXN-1", transaction_data=data_a, fintech_id="FT-1"
        )
        req2 = RegisterTransactionRequest(
            transaction_id="TXN-1", transaction_data=data_b, fintech_id="FT-1"
        )
        assert req1.compute_hash() == req2.compute_hash()

    def test_compute_hash_corresponde_a_calculo_manual(self):
        """Hash deve ser idêntico ao cálculo manual com hashlib."""
        data = {"amount": 250.0, "sender": "Carlos"}
        req = RegisterTransactionRequest(
            transaction_id="TXN-X", transaction_data=data, fintech_id="FT-2"
        )

        expected = hashlib.sha256(
            json.dumps(data, sort_keys=True).encode()
        ).hexdigest()

        assert req.compute_hash() == expected

    def test_campos_obrigatorios(self):
        """Omitir campos obrigatórios deve lançar ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            RegisterTransactionRequest(
                transaction_data={"amount": 100},
                fintech_id="FT-1",
            )
        errors = exc_info.value.errors()
        fields_with_error = {e["loc"][0] for e in errors}
        assert "transaction_id" in fields_with_error

    def test_transaction_data_vazio_gera_hash_fixo(self):
        """Dicionário vazio deve sempre gerar o mesmo hash (hash de '{}')."""
        req = RegisterTransactionRequest(
            transaction_id="TXN-EMPTY",
            transaction_data={},
            fintech_id="FT-1",
        )
        expected = hashlib.sha256(b"{}").hexdigest()
        assert req.compute_hash() == expected

    def test_transaction_data_aninhado(self):
        """Dados aninhados (dict dentro de dict) devem ser hasheados sem erro."""
        data = {
            "pix": {
                "key": "cpf",
                "value": "000.000.000-00",
            },
            "amount": 99.99,
        }
        req = RegisterTransactionRequest(
            transaction_id="TXN-PIX",
            transaction_data=data,
            fintech_id="FT-PIX",
        )
        h = req.compute_hash()
        assert isinstance(h, str)
        assert len(h) == 64


# ─── VerifyTransactionRequest ─────────────────────────────────────────────────

class TestVerifyTransactionRequest:

    def test_compute_hash_identico_ao_register(self):
        """O hash gerado para verificação deve ser idêntico ao do registro."""
        data = {"amount": 750.0, "receiver": "Débora"}

        register_req = RegisterTransactionRequest(
            transaction_id="TXN-V",
            transaction_data=data,
            fintech_id="FT-3",
        )
        verify_req = VerifyTransactionRequest(
            transaction_id="TXN-V",
            transaction_data=data,
        )

        assert register_req.compute_hash() == verify_req.compute_hash()

    def test_hash_diferente_detecta_adulteracao(self):
        """Dados alterados entre registro e verificação devem gerar hashes distintos."""
        original = {"amount": 1000.0, "sender": "Eduardo"}
        tampered = {"amount": 9999.0, "sender": "Eduardo"}  # valor adulterado

        reg = RegisterTransactionRequest(
            transaction_id="TXN-T", transaction_data=original, fintech_id="FT-4"
        )
        vrfy = VerifyTransactionRequest(
            transaction_id="TXN-T", transaction_data=tampered
        )

        assert reg.compute_hash() != vrfy.compute_hash()

    def test_campos_obrigatorios(self):
        """Falta de transaction_data deve lançar ValidationError."""
        with pytest.raises(ValidationError):
            VerifyTransactionRequest(transaction_id="TXN-FAIL")


# ─── Modelos de Resposta ──────────────────────────────────────────────────────

class TestResponseModels:

    def test_register_response_valida(self):
        resp = RegisterTransactionResponse(
            status="SUCCESS",
            transaction_id="TXN-001",
            verification_id="VRF-abc",
            hash="a" * 64,
            timestamp="2024-01-01T00:00:00Z",
        )
        assert resp.status == "SUCCESS"
        assert len(resp.hash) == 64

    def test_verify_response_intact_true(self):
        resp = VerifyTransactionResponse(
            transaction_id="TXN-001",
            verification_id="VRF-abc",
            fintech_id="FT-1",
            status="VERIFIED",
            intact=True,
            registered_at="2024-01-01T00:00:00Z",
            verified_at="2024-01-02T00:00:00Z",
        )
        assert resp.intact is True

    def test_verify_response_intact_false_indica_adulteracao(self):
        resp = VerifyTransactionResponse(
            transaction_id="TXN-002",
            verification_id="VRF-xyz",
            fintech_id="FT-2",
            status="TAMPERED",
            intact=False,
            registered_at="2024-01-01T00:00:00Z",
            verified_at="2024-01-02T00:00:00Z",
        )
        assert resp.intact is False
        assert resp.status == "TAMPERED"
