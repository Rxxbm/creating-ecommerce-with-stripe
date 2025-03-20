import { createClient, RedisClientType } from "redis";

export class Redis {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
        connectTimeout: 10000,
      },
    });

    this.client.on("error", (error: any) =>
      console.error("Redis Error:", error)
    );
    this.client.on("connect", () => console.log("Connected to Redis"));

    this.client
      .connect()
      .catch((err: any) => console.error("Redis connection failed:", err));
  }

  public async set(userID: string, token: string): Promise<void> {
    await this.client.set(`reset-token:${userID}`, token, { EX: 900 }); // Expira em 15 min
  }

  public async getRecoveryToken(userID: string): Promise<string | null> {
    return await this.client.get(`reset-token:${userID}`);
  }

  public async deleteRecoveryToken(userID: string): Promise<void> {
    await this.client.del(`reset-token:${userID}`);
  }

  public async close(): Promise<void> {
    await this.client.quit();
    console.log("Redis connection closed");
  }
}

export const redisClient = new Redis();

// Fechar conexão ao encerrar a aplicação
process.on("SIGINT", async () => {
  await redisClient.close();
  process.exit(0);
});
