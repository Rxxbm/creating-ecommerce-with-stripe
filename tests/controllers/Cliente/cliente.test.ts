import request from "supertest";
import app, { initializeApp } from "../../../src/app"; // Importa o Express.js
import { AppDataSource } from "../../../src/config/data-source"; // Importa o DataSource

beforeAll(async () => {
  await initializeApp();
});

beforeEach(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.getRepository("cliente").clear(); // Limpa a tabela de clientes
  }
});

afterAll(async () => {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy(); // Fecha a conexão
  }
});

describe("Testando o controlador de Cliente - ROTAS GET", () => {
  it("Deve retornar uma lista vazia no GET /cliente/list", async () => {
    const response = await request(app).get("/cliente/list");
    expect(response.body.data.result).toBeInstanceOf(Array);
    expect(response.body.data.result).toHaveLength(0);
    expect(response.status).toBe(200);
  });
  it("Deve retornar um erro 404 no GET /cliente/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).get(
      "/cliente/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
});

describe("Testando o controlador de Cliente - Rotas POST", () => {
  it("Deve retornar um erro 400 no POST /cliente/create", async () => {
    const response = await request(app).post("/cliente/create");
    expect(response.body.error.message).toBe("Dados inválidos");
    expect(response.status).toBe(400);
  });
  it("Deve criar um cliente com dados válidos no POST /cliente/create", async () => {
    const cliente = {
      name: "João Silva",
      fantasy_name: "João's Store",
      cnpj_cpf: "12345678901234", // Supondo que seja um CPF válido
      phone: "11987654321",
      cellphone: "11998765432",
      client_state: "SP",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      person_type: "Física",
      address_neighborhood: "Centro",
    };

    const response = await request(app).post("/cliente/create").send(cliente);
    expect(response.status).toBe(201); // Supondo que a criação seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o cliente criado tenha um id
    expect(response.body.data.name).toBe(cliente.name); // Verificando se o nome retornado é o mesmo que foi enviado

    // Verificando se o cliente foi criado corretamente
    const responseGet = await request(app).get(
      `/cliente/${response.body.data.id}`
    );
    expect(responseGet.status).toBe(200);
    expect(responseGet.body.data).toHaveProperty("id");
  });
});

describe("Testando o controlador de Cliente - Rotas PUT", () => {
  it("Deve retornar um erro 404 no PUT /cliente/update/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).put(
      "/cliente/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve retornar um cliente editado com sucesso no PUT /cliente/:id", async () => {
    const cliente = {
      name: "João Silva",
      fantasy_name: "João's Store",
      cnpj_cpf: "12345678901234", // Supondo que seja um CPF válido
      phone: "11987654321",
      cellphone: "11998765432",
      client_state: "SP",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      person_type: "Física",
      address_neighborhood: "Centro",
    };

    const responseCreate = await request(app)
      .post("/cliente/create")
      .send(cliente);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const clienteEditado = {
      name: "João Silva Editado",
      fantasy_name: "João's Store Editado",
      cnpj_cpf: "12345678901234", // Supondo que seja um CPF válido
      phone: "11987654321",
      cellphone: "11998765432",
      client_state: "SP",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      person_type: "Física",
      address_neighborhood: "Centro",
    };
    const response = await request(app)
      .put(`/cliente/${responseCreate.body.data.id}`)
      .send(clienteEditado);
    expect(response.status).toBe(200); // Supondo que a edição seja bem-sucedida
    expect(response.body.data).toHaveProperty("id"); // Supondo que o cliente editado tenha um id
    expect(response.body.data.name).toBe(clienteEditado.name); // Verificando se o nome retornado é o mesmo que foi enviado
  });
});

describe("Testando o controlador de Cliente - Rotas DELETE", () => {
  it("Deve retornar um erro 404 no DELETE /cliente/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9", async () => {
    const response = await request(app).delete(
      "/cliente/2f01f4ba-efe6-4f41-af5a-9cf09992f1d9"
    );
    expect(response.status).toBe(404);
  });
  it("Deve deletar um cliente com sucesso no DELETE /cliente/:id", async () => {
    const cliente = {
      name: "João Silva",
      fantasy_name: "João's Store",
      cnpj_cpf: "12345678901234", // Supondo que seja um CPF válido
      phone: "11987654321",
      cellphone: "11998765432",
      client_state: "SP",
      address: "Rua X, 123",
      address_number: 123,
      address_cep: "01234567",
      address_uf: "SP",
      address_city: "São Paulo",
      person_type: "Física",
      address_neighborhood: "Centro",
    };

    const responseCreate = await request(app)
      .post("/cliente/create")
      .send(cliente);
    expect(responseCreate.status).toBe(201); // Supondo que a criação seja bem-sucedida

    const response = await request(app).delete(
      `/cliente/${responseCreate.body.data.id}`
    );
    expect(response.status).toBe(204); // Supondo que a exclusão seja bem-sucedida
  });
});
