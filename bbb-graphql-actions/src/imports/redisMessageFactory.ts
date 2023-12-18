import { RedisMessage } from "../types";
import {ValidationError} from "../types/ValidationError";

export const redisMessageFactory = {
  async buildMessage(sessionVariables: Record<string, unknown>, actionName: string, input: Record<string, unknown>): Promise<RedisMessage> {
    try {
      const action = await import(`../actions/${actionName}`);
      return action.default(sessionVariables, input);
    } catch (error) {
      if (error instanceof ValidationError) {
        console.error(`Error importing or executing action "${actionName}":`, error.message);
        console.debug(sessionVariables);
        console.debug(input);
      } else {
        console.error(`Error importing or executing action "${actionName}":`, error);
      }
      throw error;
    }
  },
};
