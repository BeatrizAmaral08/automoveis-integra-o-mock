import { describe, test, expect } from 'vitest';
import request from 'supertest';
import app from './src/app.js';

describe('Suíte de Testes - API', () => {



    // CT-001 - Criar clientes
  
    test('CT-001 - Deve criar um cliente com sucesso', async () => {

        const cliente = {
            nome: 'Cliente Teste',
            CPF: '12345678901',
            CEP: '01001000',
            logradouro: 'Rua Teste',
            bairro: 'Centro',
            cidade: 'São Paulo',
            UF: 'SP',
            numero: '100',
            complemento: 'Casa'
        };

        const resposta = await request(app)
            .post('/clientes')
            .send(cliente);

        expect(resposta.statusCode).toBe(201);
        expect(resposta.body).toBeDefined();
    });



    // CT-002 - Deletar clientes

    test('CT-002 - Deve excluir um cliente com sucesso', async () => {

        const idCliente = 66;

        const resposta = await request(app)
            .delete(`/clientes/${idCliente}`);

        expect([200, 204]).toContain(resposta.statusCode);
    });



    // CT-003 - Criar veículos

    test('CT-003 - Deve criar um veículo com sucesso', async () => {

        const veiculo = {
            modelo: 'Corolla',
            placa: 'ABC1234',
            ano: 2024,
            cor: 'Prata',
            valor: 120000,
            idCliente: 1,
            idMontadora: 1
        };

        const resposta = await request(app)
            .post('/veiculos')
            .send(veiculo);

        expect(resposta.statusCode).toBe(201);
        expect(resposta.body).toBeDefined();
    });



    // CT-004 - Atualizar veículos
   
    test('CT-004 - Deve atualizar um veículo com sucesso', async () => {

        const novosDados = {
            modelo: 'Corolla XEi',
            placa: 'ABC1234',
            ano: 2024,
            cor: 'Preto',
            valor: 125000,
            idCliente: 1,
            idMontadora: 1
        };

        const resposta = await request(app)
            .put('/veiculos?id=8')
            .send(novosDados);

        expect([200, 204]).toContain(resposta.statusCode);
    });


    // CT-005 - Exibir listagem de veículos

    test('CT-005 - Deve listar os veículos cadastrados', async () => {

        const resposta = await request(app)
            .get('/veiculos');

        expect(resposta.statusCode).toBe(200);
        expect(Array.isArray(resposta.body)).toBe(true);
    });



    // CT-006 - Cadastro de montadoras

    test('CT-006 - Deve cadastrar uma montadora com sucesso', async () => {

        const montadora = {
            nome: 'Toyota',
            pais: 'Japão'
        };

        const resposta = await request(app)
            .post('/montadoras')
            .send(montadora);

        expect(resposta.statusCode).toBe(201);
        expect(resposta.body).toBeDefined();
    });



    // CT-007 - Selecionar montadoras

    test('CT-007 - Deve listar as montadoras cadastradas', async () => {

        const resposta = await request(app)
            .get('/montadoras');

        expect(resposta.statusCode).toBe(200);
        expect(Array.isArray(resposta.body)).toBe(true);
    });


    // CT-008 - Excluir montadoras

    test('CT-008 - Deve excluir uma montadora com sucesso', async () => {

        const idMontadora = 295;

        const resposta = await request(app)
            .delete(`/montadoras/${idMontadora}`);

        expect([200, 204]).toContain(resposta.statusCode);
    });

});