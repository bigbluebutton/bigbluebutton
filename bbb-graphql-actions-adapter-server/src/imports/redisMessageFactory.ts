import { RedisMessage } from "../types";

export const redisMessageFactory = {
  async buildMessage(sessionVariables: Record<string, unknown>, actionName: string, input: Record<string, unknown>): Promise<RedisMessage> {
    try {
      const action = await import(`../actions/${actionName}`);
      return action.default(sessionVariables, input);
    } catch (error) {
      console.error(`Error importing or executing action "${actionName}":`, error);
      throw error;
    }
  },
};
