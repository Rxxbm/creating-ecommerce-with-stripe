import request from "supertest";
import app, { initializeApp } from "../../../src/app"; // Importa o Express.js
import { AppDataSource } from "../../../src/config/data-source"; // Importa o DataSource

beforeAll(async () => {
  await initializeApp();
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository("Fornecedor").clear(); // Limpa a tabela de fornecedors
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy(); // Fecha a conexão
  }
});

describe("Testando o controlador de fornecedor - ROTAS GET", () => {
  it("Deve retornar uma lista vazia no GET /fornecedor/list", async () => {
    const response = await request(app).get("/fornecedor/list");
    expect(response.body.data.result).toBeInstanceOf(Array);
    expect(response.body.data.result).toHaveLength(0);
    expect(response.status).toBe(200);
  });
  it("Deve retornar um erro 404 no GET /fornecedor/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).get(
      "/fornecedor/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
});

describe("Testando o controlador de fornecedor - Rotas POST", () => {
  it("Deve retornar um erro 400 no POST /fornecedor/create", async () => {
    const response = await request(app).post("/fornecedor/create");
    expect(response.body.error.message).toBe("Dados inválidos");
    expect(response.status).toBe(400);
  });
  it("Deve criar um fornecedor com dados válidos no POST /fornecedor/create", async () => {
    const fornecedor = {
      razao_social: "Empresa Teste",
      cpf_cnpj: "12345678000195",
      email: "teste@email.com",
      telefone: "11987654321",
    };

    const response = await request(app)
      .post("/fornecedor/create")
      .send(fornecedor);
    expect(response.status).toBe(201); // Supondo que a criação seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o fornecedor criado tenha um id
    expect(response.body.data.razao_social).toBe(fornecedor.razao_social); // Verificando se o nome retornado é o mesmo que foi enviado

    // Verificando se o fornecedor foi criado corretamente
    const responseGet = await request(app).get(
      `/fornecedor/${response.body.data.id}`
    );
    expect(responseGet.status).toBe(200);
    expect(responseGet.body.data).toHaveProperty("id");
  });
});

describe("Testando o controlador de fornecedor - Rotas PUT", () => {
  it("Deve retornar um erro 404 no PUT /fornecedor/update/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).put(
      "/fornecedor/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve retornar um fornecedor editado com sucesso no PUT /fornecedor/:id", async () => {
    const fornecedor = {
      razao_social: "Empresa Teste",
      cpf_cnpj: "12345678000195",
      email: "teste@email.com",
      telefone: "11987654321",
    };

    const responseCreate = await request(app)
      .post("/fornecedor/create")
      .send(fornecedor);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const fornecedorEditado = {
      razao_social: "Empresa Nova",
    };
    const response = await request(app)
      .put(`/fornecedor/${responseCreate.body.data.id}`)
      .send(fornecedorEditado);

    expect(response.status).toBe(200); // Supondo que a edição seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o fornecedor editado tenha um id
    expect(response.body.data.razao_social).toBe(
      fornecedorEditado.razao_social
    ); // Verificando se o nome retornado é o mesmo que foi enviado
  });
});

describe("Testando o controlador de fornecedor - Rotas DELETE", () => {
  it("Deve retornar um erro 404 no DELETE /fornecedor/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).delete(
      "/fornecedor/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve deletar um fornecedor com sucesso no DELETE /fornecedor/:id", async () => {
    const fornecedor = {
      razao_social: "Empresa Nova",
      cpf_cnpj: "12345678000195",
      email: "teste@email.com",
      telefone: "11987654321",
    };

    const responseCreate = await request(app)
      .post("/fornecedor/create")
      .send(fornecedor);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const response = await request(app).delete(
      `/fornecedor/${responseCreate.body.data.id}`
    );
    expect(response.status).toBe(204); // Supondo que a exclusão seja bem-sucedida
  });
});
