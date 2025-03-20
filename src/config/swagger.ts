import { securityRules } from "firebase-admin";
import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Api de gerenciamento de Ecommmerce",
      version: "1.0.0",
      description: "Documentação da API",
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: "Servidor de desenvolvimento",
      },
      {
        url: "https://mega-backend-35me.onrender.com/",
        description: "Servidor de produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ConfirmPayment: {
          type: "object",
          properties: {
            payment_intent_id: {
              type: "string",
              description: "ID do pagamento",
            },
          },
        },
        Payment: {
          type: "object",
          properties: {
            payment_method: {
              type: "string",
              description: "metodo de pagamento",
            },
            orderID: {
              type: "string",
              description: "id do pedido",
            },
          },
        },
        CreateCustomer: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome do cliente",
            },
            email: {
              type: "string",
              description: "Email do cliente",
            },
            password: {
              type: "string",
              description: "Senha do cliente",
            },
          },
        },
        Login: {
          type: "object",
          properties: {
            email: {
              type: "string",
              description: "Email do cliente",
            },
            password: {
              type: "string",
              description: "Senha do cliente",
            },
          },
        },
        AddItem: {
          type: "object",
          properties: {
            productID: {
              type: "string",
              description: "ID do produto",
            },
            quantity: {
              type: "integer",
              description: "Quantidade do produto",
            },
            costumerID: {
              type: "string",
              description: "ID do cliente",
            },
          },
        },
        Category: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome da classificação",
            },
            description: {
              type: "string",
              description: "Descrição da classificação",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Nome do produto",
            },
            category: {
              type: "string",
              description: "Categoria do produto",
            },
            price: {
              type: "string",
              description: "Preço do produto",
            },
            description: {
              type: "string",
              description: "Descrição do produto",
            },
            quantity: {
              type: "number",
              description: "Quantidade do produto",
            },
            image: {
              type: "string",
              description: "Url da imagem do produto",
            },
          },
        },
      },
    },
  },
  apis: ["./src/controllers/*.ts", "./dist/src/controllers/*.js"], // Caminho para os arquivos onde a documentação será gerada
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
export default swaggerDocs;
