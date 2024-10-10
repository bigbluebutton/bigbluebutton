import Session from '/imports/ui/services/storage/session';
import { IndexResponse } from './types';

class BBBWebApi {
  private cachePrefix = 'bbbWebApi';

  private routes = {
    index: {
      // this needs to be a relative path because it may be mounted as a subpath
      // for example in cluster setups
      path: 'bigbluebutton/api',
      cacheKey: `${this.cachePrefix}_index`,
    },
  };

  private static buildURL(route: string) {
    const pathMatch = window.location.pathname.match('^(.*)/html5client/?$');
    const serverPathPrefix = pathMatch ? `${pathMatch[1]}/` : '';
    const { hostname, protocol } = window.location;

    return new URL(route, `${protocol}//${hostname}${serverPathPrefix}`);
  }

  public async index(signal?: AbortSignal): Promise<{
    data: IndexResponse['response'],
    response?: Response,
  }> {
    const cache = Session.getItem(this.routes.index.cacheKey);
    if (cache) {
      return {
        data: cache as IndexResponse['response'],
      };
    }

    const response = await fetch(BBBWebApi.buildURL(this.routes.index.path), {
      headers: {
        'Content-Type': 'application/json',
      },
      signal,
    });

    const body: IndexResponse = await response.json();
    Session.setItem(this.routes.index.cacheKey, body.response);

    return {
      response,
      data: body.response,
    };
  }
}

const BBBWeb = new BBBWebApi();
export default BBBWeb;
