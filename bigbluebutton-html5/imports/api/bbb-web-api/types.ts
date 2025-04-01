export interface IndexResponse {
  response: {
    returncode: string;
    version: string;
    apiVersion: string;
    bbbVersion: string;
    graphqlApiUrl: string;
    graphqlWebsocketUrl: string;
  }
}
