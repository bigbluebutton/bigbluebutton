import { IndexResponse } from './types';

class BBBWebApi {
  private lastResponse: IndexResponse['response'] | null = null;

  private routes = {
    index: { path: 'bigbluebutton/api' },
  };

  private static buildURL(route: string) {
    const pathMatch = window.location.pathname.match('^(.*)/html5client/?$');
    const serverPathPrefix = pathMatch ? `${pathMatch[1]}/` : '';
    const { hostname, protocol } = window.location;
    return new URL(route, `${protocol}//${hostname}${serverPathPrefix}`);
  }

  public async index({
    signal = undefined,
    retries = 3,
    retryDelay = 1000,
    timeout = 10000,
    forceRefresh = false,
  }: {
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  forceRefresh?: boolean;
  } = {}): Promise<{ data: IndexResponse['response']; response?: Response }> {
    // Return cached data unless forced to refresh
    if (this.lastResponse && !forceRefresh) {
      return { data: this.lastResponse };
    }

    // Build the BBB API URL
    const url = BBBWebApi.buildURL(this.routes.index.path);

    // Use your existing retry/timeout logic
    const response = await this.attemptFetch(url, {
      fetchOptions: {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'omit',
      },
      retries,
      retryDelay,
      signal,
      timeout,
    });

    // Parse and store result
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
      timeout = 10000, // ms
    }: {
      fetchOptions?: RequestInit;
      retries?: number;
      retryDelay?: number;
      signal?: AbortSignal;
      timeout?: number;
    } = {},
  ): Promise<Response> {
    const { data: indexData } = await this.index({
      signal,
      retries,
      retryDelay,
      timeout,
    });
    const url = buildUrl(indexData);

    return this.attemptFetch(url, {
      fetchOptions,
      retries,
      retryDelay,
      signal,
      timeout,
    });
  }

  /** Internal recursive fetch handler */
  private async attemptFetch(
    url: string | URL,
    {
      fetchOptions,
      retries,
      retryDelay,
      signal,
      timeout,
    }: {
      fetchOptions?: RequestInit;
      retries: number;
      retryDelay: number;
      signal?: AbortSignal;
      timeout: number;
    },
  ): Promise<Response> {
    const internalController = new AbortController();
    const timeoutId = setTimeout(() => internalController.abort(), timeout);

    const effectiveSignal = signal
      ? BBBWebApi.mergeSignals(signal, internalController.signal)
      : internalController.signal;

    try {
      const response = await fetch(url, { ...fetchOptions, signal: effectiveSignal });

      if (!response.ok && response.status >= 500 && retries > 0) {
        // Retry recursively
        await new Promise((r) => setTimeout(r, retryDelay));
        return this.attemptFetch(url, {
          fetchOptions,
          retries: retries - 1,
          retryDelay,
          signal,
          timeout,
        });
      }

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
      }

      return response;
    } catch (error: unknown) {
      if (error instanceof Error && (error.name === 'AbortError' || signal?.aborted)) throw new Error('Request aborted');

      if (retries > 0) {
        await new Promise((r) => setTimeout(r, retryDelay));
        return this.attemptFetch(url, {
          fetchOptions,
          retries: retries - 1,
          retryDelay,
          signal,
          timeout,
        });
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private static mergeSignals(...signals: AbortSignal[]): AbortSignal {
    if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);

    const controller = new AbortController();
    const onAbort = () => controller.abort();
    // eslint-disable-next-line no-restricted-syntax
    for (const sig of signals) {
      if (sig.aborted) {
        controller.abort();
        break;
      }
      sig.addEventListener('abort', onAbort, { once: true });
    }

    return controller.signal;
  }
}

const BBBWeb = new BBBWebApi();
export default BBBWeb;
