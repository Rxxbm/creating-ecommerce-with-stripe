import request from "supertest";
import app, { initializeApp } from "../../../src/app"; // Importa o Express.js
import { AppDataSource } from "../../../src/config/data-source"; // Importa o DataSource

beforeAll(async () => {
  await initializeApp();
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository("classificacao").clear(); // Limpa a tabela de classificacaos
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy(); // Fecha a conexão
  }
});

describe("Testando o controlador de Classificacao - ROTAS GET", () => {
  it("Deve retornar uma lista vazia no GET /classificacao/list", async () => {
    const response = await request(app).get("/classificacao/list");
    expect(response.body.data.result).toBeInstanceOf(Array);
    expect(response.body.data.result).toHaveLength(0);
    expect(response.status).toBe(200);
  });
  it("Deve retornar um erro 404 no GET /classificacao/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).get(
      "/classificacao/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
});

describe("Testando o controlador de Classificacao - Rotas POST", () => {
  it("Deve retornar um erro 400 no POST /classificacao/create", async () => {
    const response = await request(app).post("/classificacao/create");
    expect(response.body.error.message).toBe("Dados inválidos");
    expect(response.status).toBe(400);
  });
  it("Deve criar um classificacao com dados válidos no POST /classificacao/create", async () => {
    const classificacao = {
      nome: "João Silva",
      descricao: "João's Store",
    };

    const response = await request(app)
      .post("/classificacao/create")
      .send(classificacao);
    expect(response.status).toBe(201); // Supondo que a criação seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o classificacao criado tenha um id
    expect(response.body.data.nome).toBe(classificacao.nome); // Verificando se o nome retornado é o mesmo que foi enviado

    // Verificando se o classificacao foi criado corretamente
    const responseGet = await request(app).get(
      `/classificacao/${response.body.data.id}`
    );
    expect(responseGet.status).toBe(200);
    expect(responseGet.body.data).toHaveProperty("id");
  });
});

describe("Testando o controlador de Classificacao - Rotas PUT", () => {
  it("Deve retornar um erro 404 no PUT /classificacao/update/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).put(
      "/classificacao/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve retornar um classificacao editado com sucesso no PUT /classificacao/:id", async () => {
    const classificacao = {
      nome: "João Silva",
      descricao: "João's Store",
    };

    const responseCreate = await request(app)
      .post("/classificacao/create")
      .send(classificacao);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const classificacaoEditado = {
      nome: "João Silva Editado",
      descricao: "João's Store",
    };
    const response = await request(app)
      .put(`/classificacao/${responseCreate.body.data.id}`)
      .send(classificacaoEditado);
    expect(response.status).toBe(200); // Supondo que a edição seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o classificacao editado tenha um id
    expect(response.body.data.nome).toBe(classificacaoEditado.nome); // Verificando se o nome retornado é o mesmo que foi enviado
  });
});

describe("Testando o controlador de Classificacao - Rotas DELETE", () => {
  it("Deve retornar um erro 404 no DELETE /classificacao/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).delete(
      "/classificacao/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve deletar um classificacao com sucesso no DELETE /classificacao/:id", async () => {
    const classificacao = {
      nome: "João Silva",
      descricao: "João's Store",
    };

    const responseCreate = await request(app)
      .post("/classificacao/create")
      .send(classificacao);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const response = await request(app).delete(
      `/classificacao/${responseCreate.body.data.id}`
    );
    expect(response.status).toBe(204); // Supondo que a exclusão seja bem-sucedida
  });
});
