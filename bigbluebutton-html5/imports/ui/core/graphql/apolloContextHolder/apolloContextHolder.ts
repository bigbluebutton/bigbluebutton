import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { SubscriptionClient } from 'subscriptions-transport-ws';

class ApolloContextHolder {
  private client: ApolloClient<NormalizedCacheObject> | null = null;

  private link: SubscriptionClient | null = null;

  public setClient(client: ApolloClient<NormalizedCacheObject>): void {
    this.client = client;
  }

  public getClient(): ApolloClient<NormalizedCacheObject> {
    if (!this.client) {
      throw new Error('ApolloClient has not been initialized yet');
    }
    return this.client;
  }

  public setLink(link: SubscriptionClient): void {
    this.link = link;
  }

  public getLink(): SubscriptionClient {
    if (!this.link) {
      throw new Error('SubscriptionClient has not been initialized yet');
    }
    return this.link;
  }
}

export default new ApolloContextHolder();
