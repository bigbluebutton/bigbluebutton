import ky from 'ky';
import type { IndexResponse } from './types';

class BBBWebApi {
  private lastResponse: IndexResponse['response'] | null = null;

  private routes = {
    index: { path: 'bigbluebutton/api' },
  };

  private static buildURL(route: string): string {
    const match = window.location.pathname.match(/^(.*)\/html5client\/?$/);
    const prefix = match ? `${match[1]}/` : '';
    const { protocol, hostname } = window.location;
    return new URL(route, `${protocol}//${hostname}${prefix}`).toString();
  }

  /** Centralised GET fetch with retry support */
  private static async fetchWithRetry(
    url: string,
    {
      fetchOptions = {},
      retries,
      retryDelay,
      signal,
      timeout,
    }: {
      fetchOptions?: RequestInit;
      retries: number;
      retryDelay: number;
      signal?: AbortSignal;
      timeout: number | false;
    },
  ): Promise<Response> {
    return ky.get(url, {
      ...fetchOptions,
      signal,
      timeout,
      retry: {
        limit: retries,
        delay: () => retryDelay,
        methods: ['get'],
        retryOnTimeout: true,
        // Define status codes because ky's default does not handle all of these
        statusCodes: [0, 408, 429, 500, 502, 503, 504],
        shouldRetry: () => true,
      },
    });
  }

  public async index({
    signal,
    retries = 3,
    retryDelay = 10000,
    timeout = 10000,
    forceRefresh = false,
  }: {
    signal?: AbortSignal;
    retries?: number;
    retryDelay?: number;
    timeout?: number | false;
    forceRefresh?: boolean;
  } = {}): Promise<{ data: IndexResponse['response']; response?: Response }> {
    if (this.lastResponse && !forceRefresh) {
      return { data: this.lastResponse };
    }
    const url = BBBWebApi.buildURL(this.routes.index.path);
    const response = await BBBWebApi.fetchWithRetry(url, {
      fetchOptions: {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
      },
      retries,
      retryDelay,
      signal,
      timeout,
    });
    const body: IndexResponse = await response.json();
    this.lastResponse = body.response;
    return { data: body.response, response };
  }

  public async request(
    buildUrl: (indexData: IndexResponse['response']) => string | URL,
    {
      fetchOptions = {},
      retries = 3,
      retryDelay = 1000,
      signal,
      timeout = 30000,
    }: {
      fetchOptions?: RequestInit;
      retries?: number;
      retryDelay?: number;
      signal?: AbortSignal;
      timeout?: number | false;
    } = {},
  ): Promise<Response> {
    const { data: indexData } = await this.index({
      signal,
      retries,
      retryDelay,
      timeout,
    });
    const url = buildUrl(indexData).toString();
    return BBBWebApi.fetchWithRetry(url, {
      fetchOptions,
      retries,
      retryDelay,
      signal,
      timeout,
    });
  }
}

const BBBWeb = new BBBWebApi();
export default BBBWeb;
