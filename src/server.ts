import app, { initializeApp } from "./app";
import logger from "./config/logger";

const port = process.env.PORT || 3000;

initializeApp()
  .then(() => {
    app.listen(port, () => {
      logger.info(`Servidor rodando em http://localhost:${port}`);
      logger.info(
        `Documentação disponível em http://localhost:${port}/api-docs`
      );
    });
  })
  .catch((error) => {
    console.error("Erro ao conectar ao banco de dados", error);
    process.exit(1);
  });
