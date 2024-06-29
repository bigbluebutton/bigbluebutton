import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { Client } from 'graphql-ws';

class ApolloContextHolder {
  private client: ApolloClient<NormalizedCacheObject> | null = null;

  private link: Client | null = null;

  private shouldRetry: boolean = true;

  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    this.client = client;
  }

  public getClient(): ApolloClient<NormalizedCacheObject> {
    if (!this.client) {
      throw new Error('ApolloClient has not been initialized yet');
    }
    return this.client;
  }

  public setLink(link: Client): void {
    this.link = link;
  }

  public getLink(): Client {
    if (!this.link) {
      throw new Error('SubscriptionClient has not been initialized yet');
    }
    return this.link;
  }

  public setShouldRetry(shouldRetry: boolean): void {
    this.shouldRetry = shouldRetry;
  }

  public getShouldRetry(): boolean {
    return this.shouldRetry;
  }
}

export default new ApolloContextHolder();
