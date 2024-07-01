import { makeVar } from '@apollo/client';

class ConnectionStatus {
  private connected = makeVar(false);

  public setConnectedStatus(value: boolean): void {
    this.connected = makeVar(value);
  }

  public getConnectedStatus() {
    return this.connected();
  }

  public getConnectedStatusVar() {
    return this.connected;
  }
}

export default new ConnectionStatus();
