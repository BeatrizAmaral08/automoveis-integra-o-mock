
import { beforeEach, describe, expect, test, vi } from 'vitest';
import request from 'supertest';
import app from './src/app.js';

import clienteRepository from './src/repositories/clienteRepository.js';
import veiculoRepository from './src/repositories/veiculoRepository.js';
import montadoraRepository from './src/repositories/montadoraRepository.js';
import { consultarCep } from './utils/consultarCep.js';


// ===========================================
// MOCKS DOS REPOSITÓRIOS E DA CONSULTA DE CEP
// ===========================================

vi.mock('./src/repositories/clienteRepository.js', () => ({
    default: {
        criar: vi.fn(),
        editar: vi.fn(),
        deletar: vi.fn(),
        selecionar: vi.fn()
    }
}));

vi.mock('./src/repositories/veiculoRepository.js', () => ({
    default: {
        criar: vi.fn(),
        editar: vi.fn(),
        deletar: vi.fn(),
        selecionar: vi.fn()
    }
}));

vi.mock('./src/repositories/montadoraRepository.js', () => ({
    default: {
        criar: vi.fn(),
        editar: vi.fn(),
        deletar: vi.fn(),
        selecionar: vi.fn()
    }
}));

vi.mock('./utils/consultarCep.js', () => ({
    consultarCep: vi.fn()
}));


// ===========================================
// DADOS PARA OS TESTES
// ===========================================

const clienteValido = {
    nome: 'Cliente Teste',
    cpf: '12345678901',
    cep: '01001000',
    numero: '100',
    complemento: 'Casa'
};

const veiculoValido = {
    modelo: 'Corolla',
    placa: 'ABC1234',
    ano: 2024,
    cor: 'Prata',
    valor: 120000,
    idCliente: 1,
    idMontadora: 1
};

const montadoraValida = {
    nome: 'Toyota',
    pais: 'Japão'
};

const erroBanco = new Error('Falha simulada no banco');


// ===========================================
// CONFIGURAÇÃO ANTES DE CADA TESTE
// ===========================================

beforeEach(() => {

    vi.resetAllMocks();

    consultarCep.mockResolvedValue({
        cep: '01001000',
        logradouro: 'Praça da Sé',
        bairro: 'Sé',
        cidade: 'São Paulo',
        uf: 'SP'
    });

    const repositories = [
        clienteRepository,
        veiculoRepository,
        montadoraRepository
    ];

    for (const repository of repositories) {

        repository.criar.mockResolvedValue({
            insertId: 1,
            affectedRows: 1
        });

        repository.editar.mockResolvedValue({
            affectedRows: 1
        });

        repository.deletar.mockResolvedValue({
            affectedRows: 1
        });

        repository.selecionar.mockResolvedValue([
            { Id: 1, Nome: 'Registro Teste' }
        ]);
    }
});


// ===========================================
// SUÍTE DE TESTES - API
// ===========================================

describe('Suíte de Testes - API', () => {


    // =======================================
    // CLIENTES - 8 TESTES
    // =======================================

    describe('Testes de Clientes', () => {


        // CT-001 - Criar cliente (POSITIVO)

        test('CT-001 - Deve criar um cliente com sucesso', async () => {

            const resposta = await request(app)
                .post('/clientes')
                .send(clienteValido);

            expect(resposta.statusCode).toBe(201);

            expect(resposta.body.message)
                .toBe('Cliente criado com sucesso');

            expect(clienteRepository.criar)
                .toHaveBeenCalledOnce();
        });


        // CT-002 - Criar cliente (NEGATIVO)

        test('CT-002 - Deve rejeitar cliente com nome inválido', async () => {

            const cliente = {
                ...clienteValido,
                nome: 'A'
            };

            const resposta = await request(app)
                .post('/clientes')
                .send(cliente);

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.error)
                .toBe('Nome inválido');

            expect(clienteRepository.criar)
                .not.toHaveBeenCalled();
        });


        // CT-003 - Atualizar cliente (POSITIVO)

        test('CT-003 - Deve atualizar um cliente com sucesso', async () => {

            const novosDados = {
                ...clienteValido,
                nome: 'Cliente Editado'
            };

            const resposta = await request(app)
                .put('/clientes?id=1')
                .send(novosDados);

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Cliente atualizado com sucesso');

            expect(clienteRepository.editar)
                .toHaveBeenCalledOnce();
        });


        // CT-004 - Atualizar cliente (NEGATIVO)

        test('CT-004 - Deve rejeitar atualização com CEP inválido', async () => {

            consultarCep.mockRejectedValueOnce(
                new Error('CEP inválido')
            );

            const cliente = {
                ...clienteValido,
                cep: '123'
            };

            const resposta = await request(app)
                .put('/clientes?id=1')
                .send(cliente);

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.error)
                .toBe('CEP inválido');

            expect(clienteRepository.editar)
                .not.toHaveBeenCalled();
        });


        // CT-005 - Excluir cliente (POSITIVO)

        test('CT-005 - Deve excluir um cliente com sucesso', async () => {

            const resposta = await request(app)
                .delete('/clientes/1');

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Cliente deletado com sucesso');

            expect(clienteRepository.deletar)
                .toHaveBeenCalledWith(1);
        });


        // CT-006 - Excluir cliente (NEGATIVO)

        test('CT-006 - Deve tratar erro ao excluir cliente', async () => {

            clienteRepository.deletar
                .mockRejectedValueOnce(erroBanco);

            const resposta = await request(app)
                .delete('/clientes/1');

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.message)
                .toBe('Erro ao deletar cliente');
        });


        // CT-007 - Listar clientes (POSITIVO)

        test('CT-007 - Deve listar os clientes cadastrados', async () => {

            const resposta = await request(app)
                .get('/clientes');

            expect(resposta.statusCode).toBe(200);

            expect(Array.isArray(resposta.body.data))
                .toBe(true);

            expect(resposta.body.data)
                .toHaveLength(1);
        });


        // CT-008 - Listar clientes (NEGATIVO)

        test('CT-008 - Deve tratar erro ao listar clientes', async () => {

            clienteRepository.selecionar
                .mockRejectedValueOnce(erroBanco);

            const resposta = await request(app)
                .get('/clientes');

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.message)
                .toBe('Erro ao selecionar clientes');
        });

    });



    // =======================================
    // VEÍCULOS - 8 TESTES
    // =======================================

    describe('Testes de Veículos', () => {


        // CT-009 - Criar veículo (POSITIVO)

        test('CT-009 - Deve criar um veículo com sucesso', async () => {

            const resposta = await request(app)
                .post('/veiculos')
                .send(veiculoValido);

            expect(resposta.statusCode).toBe(201);

            expect(resposta.body.message)
                .toBe('Veículo criado com sucesso');

            expect(veiculoRepository.criar)
                .toHaveBeenCalledOnce();
        });


        // CT-010 - Criar veículo (NEGATIVO)

        test('CT-010 - Deve rejeitar veículo com ano inválido', async () => {

            const veiculo = {
                ...veiculoValido,
                ano: 1800
            };

            const resposta = await request(app)
                .post('/veiculos')
                .send(veiculo);

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.error)
                .toBe('Ano inválido');

            expect(veiculoRepository.criar)
                .not.toHaveBeenCalled();
        });


        // CT-011 - Atualizar veículo (POSITIVO)

        test('CT-011 - Deve atualizar um veículo com sucesso', async () => {

            const novosDados = {
                ...veiculoValido,
                cor: 'Preto'
            };

            const resposta = await request(app)
                .put('/veiculos?id=1')
                .send(novosDados);

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Veículo atualizado com sucesso');

            expect(veiculoRepository.editar)
                .toHaveBeenCalledOnce();
        });


        // CT-012 - Atualizar veículo (NEGATIVO)

        test('CT-012 - Deve rejeitar veículo com placa inválida', async () => {

            const veiculo = {
                ...veiculoValido,
                placa: 'A'
            };

            const resposta = await request(app)
                .put('/veiculos?id=1')
                .send(veiculo);

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.error)
                .toBe('Placa inválida');

            expect(veiculoRepository.editar)
                .not.toHaveBeenCalled();
        });


        // CT-013 - Excluir veículo (POSITIVO)

        test('CT-013 - Deve excluir um veículo com sucesso', async () => {

            const resposta = await request(app)
                .delete('/veiculos/1');

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Veículo deletado com sucesso');

            expect(veiculoRepository.deletar)
                .toHaveBeenCalledWith(1);
        });


        // CT-014 - Excluir veículo (NEGATIVO)

        test('CT-014 - Deve tratar erro ao excluir veículo', async () => {

            veiculoRepository.deletar
                .mockRejectedValueOnce(erroBanco);

            const resposta = await request(app)
                .delete('/veiculos/1');

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.message)
                .toBe('Erro ao deletar veículo');
        });


        // CT-015 - Listar veículos (POSITIVO)

        test('CT-015 - Deve listar os veículos cadastrados', async () => {

            const resposta = await request(app)
                .get('/veiculos');

            expect(resposta.statusCode).toBe(200);

            expect(Array.isArray(resposta.body.data))
                .toBe(true);

            expect(resposta.body.data)
                .toHaveLength(1);
        });


        // CT-016 - Listar veículos (NEGATIVO)

        test('CT-016 - Deve tratar erro ao listar veículos', async () => {

            veiculoRepository.selecionar
                .mockRejectedValueOnce(erroBanco);

            const resposta = await request(app)
                .get('/veiculos');

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.message)
                .toBe('Erro ao selecionar veículos');
        });

    });



    // =======================================
    // MONTADORAS - 8 TESTES
    // =======================================

    describe('Testes de Montadoras', () => {


        // CT-017 - Criar montadora (POSITIVO)

        test('CT-017 - Deve cadastrar uma montadora com sucesso', async () => {

            const resposta = await request(app)
                .post('/montadoras')
                .send(montadoraValida);

            expect(resposta.statusCode).toBe(201);

            expect(resposta.body.message)
                .toBe('Montadora criada com sucesso');

            expect(montadoraRepository.criar)
                .toHaveBeenCalledOnce();
        });


        // CT-018 - Criar montadora (NEGATIVO)

        test('CT-018 - Deve rejeitar montadora com nome inválido', async () => {

            const montadora = {
                nome: 'A',
                pais: 'Japão'
            };

            const resposta = await request(app)
                .post('/montadoras')
                .send(montadora);

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.error)
                .toBe('Nome inválido');

            expect(montadoraRepository.criar)
                .not.toHaveBeenCalled();
        });


        // CT-019 - Atualizar montadora (POSITIVO)

        test('CT-019 - Deve atualizar uma montadora com sucesso', async () => {

            const novosDados = {
                nome: 'Toyota',
                pais: 'Brasil'
            };

            const resposta = await request(app)
                .put('/montadoras?id=1')
                .send(novosDados);

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Montadora atualizada com sucesso');

            expect(montadoraRepository.editar)
                .toHaveBeenCalledOnce();
        });


        // CT-020 - Atualizar montadora (NEGATIVO)

        test('CT-020 - Deve rejeitar atualização de montadora inexistente', async () => {

            montadoraRepository.editar.mockResolvedValueOnce({
                affectedRows: 0
            });

            const resposta = await request(app)
                .put('/montadoras?id=99999')
                .send(montadoraValida);

            expect(resposta.statusCode).toBe(404);

            expect(resposta.body.message)
                .toBe('Montadora não encontrada');
        });


        // CT-021 - Excluir montadora (POSITIVO)

        test('CT-021 - Deve excluir uma montadora com sucesso', async () => {

            const resposta = await request(app)
                .delete('/montadoras/1');

            expect(resposta.statusCode).toBe(200);

            expect(resposta.body.message)
                .toBe('Montadora deletada com sucesso');

            expect(montadoraRepository.deletar)
                .toHaveBeenCalledWith(1);
        });


        // CT-022 - Excluir montadora (NEGATIVO)

        test('CT-022 - Deve rejeitar exclusão de montadora inexistente', async () => {

            montadoraRepository.deletar.mockResolvedValueOnce({
                affectedRows: 0
            });

            const resposta = await request(app)
                .delete('/montadoras/99999');

            expect(resposta.statusCode).toBe(404);

            expect(resposta.body.message)
                .toBe('Montadora não encontrada');
        });


        // CT-023 - Listar montadoras (POSITIVO)

        test('CT-023 - Deve listar as montadoras cadastradas', async () => {

            const resposta = await request(app)
                .get('/montadoras');

            expect(resposta.statusCode).toBe(200);

            expect(Array.isArray(resposta.body.data))
                .toBe(true);

            expect(resposta.body.data)
                .toHaveLength(1);
        });


        // CT-024 - Listar montadoras (NEGATIVO)

        test('CT-024 - Deve tratar erro ao listar montadoras', async () => {

            montadoraRepository.selecionar
                .mockRejectedValueOnce(erroBanco);

            const resposta = await request(app)
                .get('/montadoras');

            expect(resposta.statusCode).toBe(500);

            expect(resposta.body.message)
                .toBe('Erro ao selecionar montadoras');
        });

    });

});
