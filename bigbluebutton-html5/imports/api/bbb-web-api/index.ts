import { IndexResponse } from './types';
import { getServerRoot } from '/imports/ui/services/url-builder';

class BBBWebApi {
  private lastResponse : IndexResponse['response'] | null = null;

  private routes = {
    index: {
      // this needs to be a relative path because it may be mounted as a subpath
      // for example in cluster setups
      path: 'bigbluebutton/api',
    },
  };

  private static buildURL(route: string) {
    return new URL(route, getServerRoot());
  }

  public async index(signal?: AbortSignal): Promise<{
    data: IndexResponse['response'],
    response?: Response,
  }> {
    if (this.lastResponse != null) {
      return {
        data: this.lastResponse as IndexResponse['response'],
      };
    }

    const response = await fetch(BBBWebApi.buildURL(this.routes.index.path), {
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
      credentials: 'omit',
    });

    const body: IndexResponse = await response.json();
    this.lastResponse = body.response;

    return {
      response,
      data: body.response,
    };
  }
}

const BBBWeb = new BBBWebApi();
export default BBBWeb;
