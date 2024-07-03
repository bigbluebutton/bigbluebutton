import { makeVar } from '@apollo/client';
import logger from '/imports/startup/client/logger';

class ConnectionStatus {
  private connected = makeVar(false);

  private serverIsResponding = makeVar(true);

  private pingIsComing = makeVar(true);

  private rttStatus = makeVar('normal');

  private lastRttRequestSuccess = makeVar(true);

  public setLastRttRequestSuccess(value: boolean): void {
    if (value !== this.lastRttRequestSuccess()) {
      logger.info(`[network] : Last RTT request success changed to ${value}`);
      this.lastRttRequestSuccess(value);
    }
  }

  public getLastRttRequestSuccess() {
    return this.lastRttRequestSuccess();
  }

  public getLastRttRequestSuccessVar() {
    return this.lastRttRequestSuccess;
  }

  public setRttStatus(value: string): void {
    if (value !== this.rttStatus()) {
      logger.info(`[network] : RTT status changed to ${value}`);
      this.rttStatus(value);
    }
  }

  public getRttStatus() {
    return this.rttStatus();
  }

  public getRttStatusVar() {
    return this.rttStatus;
  }

  public setPingIsComing(value: boolean): void {
    if (value !== this.pingIsComing()) {
      logger.info(`[network] : Ping status changed to ${value}`);
      this.pingIsComing(value);
    }
  }

  public getPingIsComing() {
    return this.pingIsComing();
  }

  public getPingIsComingVar() {
    return this.pingIsComing;
  }

  public setServerIsResponding(value: boolean): void {
    if (value !== this.serverIsResponding()) {
      logger.info(`[network] : Server responding status changed to ${value}`);
      this.serverIsResponding(value);
    }
  }

  public getServerIsResponding() {
    return this.serverIsResponding();
  }

  public getServerIsRespondingVar() {
    return this.serverIsResponding;
  }

  public setConnectedStatus(value: boolean): void {
    if (value !== this.connected()) {
      logger.info(`[network] : Connection status changed to ${value}`);
      this.connected(value);
    }
  }

  public getConnectedStatus() {
    return this.connected();
  }

  public getConnectedStatusVar() {
    return this.connected;
  }
}

export default new ConnectionStatus();
