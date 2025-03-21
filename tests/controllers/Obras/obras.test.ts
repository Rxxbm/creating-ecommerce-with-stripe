import request from "supertest";
import app, { initializeApp } from "../../../src/app"; // Importa o Express.js
import { AppDataSource } from "../../../src/config/data-source"; // Importa o DataSource

beforeAll(async () => {
  await initializeApp();
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository("Obras").clear(); // Limpa a tabela de obrass
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy(); // Fecha a conexão
  }
});

describe("Testando o controlador de obras - ROTAS GET", () => {
  it("Deve retornar uma lista vazia no GET /obras/list", async () => {
    const response = await request(app).get("/obras/list");
    expect(response.body.data.result).toBeInstanceOf(Array);
    expect(response.body.data.result).toHaveLength(0);
    expect(response.status).toBe(200);
  });
  it("Deve retornar um erro 404 no GET /obras/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).get(
      "/obras/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
});

describe("Testando o controlador de obras - Rotas POST", () => {
  it("Deve retornar um erro 400 no POST /obras/create", async () => {
    const response = await request(app).post("/obras/create");
    expect(response.body.error.message).toBe("Dados inválidos");
    expect(response.status).toBe(400);
  });
  it("Deve criar um obras com dados válidos no POST /obras/create", async () => {
    const obras = {
      name: "João Silva",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      address_neighborhood: "Centro",
      address_complement: "Apto 101",
    };

    const response = await request(app).post("/obras/create").send(obras);
    expect(response.status).toBe(201); // Supondo que a criação seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o obras criado tenha um id
    expect(response.body.data.name).toBe(obras.name); // Verificando se o nome retornado é o mesmo que foi enviado

    // Verificando se o obras foi criado corretamente
    const responseGet = await request(app).get(
      `/obras/${response.body.data.id}`
    );
    expect(responseGet.status).toBe(200);
    expect(responseGet.body.data).toHaveProperty("id");
  });
});

describe("Testando o controlador de obras - Rotas PUT", () => {
  it("Deve retornar um erro 404 no PUT /obras/update/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).put(
      "/obras/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve retornar um obras editado com sucesso no PUT /obras/:id", async () => {
    const obras = {
      name: "João Silva",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      address_neighborhood: "Centro",
      address_complement: "Apto 101",
    };

    const responseCreate = await request(app).post("/obras/create").send(obras);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const obrasEditado = {
      name: "Davi Silva",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      address_neighborhood: "Centro",
      address_complement: "Apto 101",
    };
    const response = await request(app)
      .put(`/obras/${responseCreate.body.data.id}`)
      .send(obrasEditado);
    expect(response.status).toBe(200); // Supondo que a edição seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o obras editado tenha um id
    expect(response.body.data.name).toBe(obrasEditado.name); // Verificando se o nome retornado é o mesmo que foi enviado
  });
});

describe("Testando o controlador de obras - Rotas DELETE", () => {
  it("Deve retornar um erro 404 no DELETE /obras/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).delete(
      "/obras/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve deletar um obras com sucesso no DELETE /obras/:id", async () => {
    const obras = {
      name: "João Silva",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      address_neighborhood: "Centro",
      address_complement: "Apto 101",
    };

    const responseCreate = await request(app).post("/obras/create").send(obras);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const response = await request(app).delete(
      `/obras/${responseCreate.body.data.id}`
    );
    expect(response.status).toBe(204); // Supondo que a exclusão seja bem-sucedida
  });
});
