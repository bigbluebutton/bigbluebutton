import { ApolloClient, NormalizedCacheObject } from '@apollo/client';

class ApolloContextHolder {
  private client: ApolloClient<NormalizedCacheObject> | null = null;

  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    this.client = client;
  }

  public getClient(): ApolloClient<NormalizedCacheObject> {
    if (!this.client) {
      throw new Error('ApolloClient has not been initialized yet');
    }
    return this.client;
  }
}

export default new ApolloContextHolder();
