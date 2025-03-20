// config/morgan.ts
import morgan from "morgan";
import logger from "./logger";

// Função para colorir o status HTTP com base no código
const getStatusColor = (status: number) => {
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // Vermelho para erros de servidor (5xx)
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // Amarelo para erros do cliente (4xx)
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // Ciano para redirecionamentos (3xx)
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // Verde para sucesso (2xx)
  return `\x1b[0m${status}`; // Branco para outros casos
};

// Configuração do Morgan com cores
const morganMiddleware = morgan(
  (tokens, req, res) => {
    const method = `\x1b[34m${tokens.method(req, res)}\x1b[0m`; // Azul
    const url = `\x1b[35m${tokens.url(req, res)}\x1b[0m`; // Magenta
    const status = getStatusColor(Number(tokens.status(req, res)));
    const contentLength = `\x1b[37m${
      tokens.res(req, res, "content-length") ?? "0"
    }\x1b[0m`; // Cinza
    const responseTime = `\x1b[37m${tokens["response-time"](
      req,
      res
    )} ms\x1b[0m`; // Branco

    return `${method} ${url} ${status} ${contentLength} - ${responseTime}`;
  },
  {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }
);

export default morganMiddleware;
