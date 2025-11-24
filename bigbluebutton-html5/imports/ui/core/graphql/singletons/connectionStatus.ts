import { makeVar, ReactiveVar } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import { User } from '/imports/ui/Types/user';

type NetworkData = {
  ready: boolean;
  user: User;
  audio: {
    audioCurrentUploadRate: number;
    audioCurrentDownloadRate: number;
    jitter: number;
    packetsLost: number;
    transportStats: Record<string, unknown>;
  },
  video: {
    videoCurrentUploadRate: number,
    videoCurrentDownloadRate: number,
  }
};

export enum MetricStatus {
  Unknown = 'unknown',
  Normal = 'normal',
  Warning = 'warning',
  Danger = 'danger',
  Critical = 'critical',
}

class ConnectionStatus {
  private connected = makeVar(false);

  private serverIsResponding = makeVar(true);

  private pingIsComing = makeVar(true);

  private rttStatus = makeVar('normal');

  private lastRttRequestSuccess = makeVar(true);

  private rttValue = makeVar(0);

  private subscriptionFailed = makeVar(false);

  // @ts-ignore
  private networkData: ReactiveVar<NetworkData> = makeVar({
    // These are placeholder values for the connstats modal to render something
    // other than *undefined* while initial data is being collected.
    // Do not replace it for empty stuff unless appropriately justified.
    ready: false,
    audio: {
      audioCurrentUploadRate: 0,
      audioCurrentDownloadRate: 0,
      jitter: 0,
      packetsLost: 0,
      transportStats: {},
    },
    video: {
      videoCurrentUploadRate: 0,
      videoCurrentDownloadRate: 0,
    },
  });

  private userNetworkHistory = makeVar<Array<{
    user: Pick<User, 'userId' | 'avatar' | 'isModerator' | 'color' | 'currentlyInMeeting' | 'name'>,
    lastUnstableStatus: string,
    lastUnstableStatusAt: Date | number,
    clientNotResponding?: boolean,
  }>>([]);

  private liveKitConnectionStatus = makeVar(MetricStatus.Unknown);

  public setLiveKitConnectionStatus(status: MetricStatus): void {
    if (this.liveKitConnectionStatus() !== status) {
      logger.info({
        logCode: 'stats_livekit_conn_state',
      }, `LiveKit connection status changed to ${status}`);
      this.liveKitConnectionStatus(status);
    }
  }

  public getLiveKitConnectionStatus() {
    return this.liveKitConnectionStatus();
  }

  public getLiveKitConnectionStatusVar() {
    return this.liveKitConnectionStatus;
  }

  private packetLossFraction = makeVar(0);

  private packetLossStatus = makeVar('normal');

  public setPacketLossStatus(value: string): void {
    if (value !== this.packetLossStatus()) {
      const lossPercentage = this.getPacketLossFraction() * 100;
      logger.info({
        logCode: 'stats_packet_loss_state',
      }, `Packet loss status changed to ${value} (packet loss=${lossPercentage.toFixed(2)}%)`);
      this.packetLossStatus(value);
    }
  }

  public getPacketLossStatus() {
    return this.packetLossStatus();
  }

  public getPacketLossStatusVar() {
    return this.packetLossStatus;
  }

  public setPacketLossFraction(fraction: number): void {
    if (fraction !== this.packetLossFraction()) {
      this.packetLossFraction(fraction);
    }
  }

  public getPacketLossFraction() {
    return this.packetLossFraction();
  }

  public getPacketLossFractionVar() {
    return this.packetLossFraction;
  }

  public setNetworkData(data: NetworkData): void {
    this.networkData(data);
  }

  public getNetworkData() {
    return this.networkData();
  }

  public getNetworkDataVar() {
    return this.networkData;
  }

  public setConnectionStatus(newRttValue: number, newRttStatus: string): void {
    if (newRttValue !== this.rttValue() || newRttStatus !== this.rttStatus()) {
      switch (newRttStatus) {
        case 'critical':
          logger.warn({ logCode: 'stats_rtt_state' }, `Connection status changed to critical(rtt > ${newRttValue}ms)`);
          break;
        case 'danger':
          logger.warn({ logCode: 'stats_rtt_state' }, `Connection status changed to danger (rtt = ${newRttValue}ms)`);
          break;
        case 'warning':
        case 'normal':
          logger.debug({ logCode: 'stats_rtt_state' }, `Connection status changed to ${newRttStatus} (rtt = ${newRttValue}ms)`);
          break;
        default:
      }

      this.setRttValue(newRttValue);
      this.setRttStatus(newRttStatus);
    }
  }

  public setRttValue(value: number): void {
    if (value !== this.rttValue()) {
      logger.debug({ logCode: 'stats_rtt_value_state', extraInfo: { rtt: value } }, `RTT value changed to ${value}ms`);
      this.rttValue(value);
    }
  }

  public getRttValue() {
    return this.rttValue();
  }

  public getRttValueVar() {
    return this.rttValue;
  }

  public setLastRttRequestSuccess(value: boolean): void {
    if (value !== this.lastRttRequestSuccess()) {
      if (value === false) {
        logger.warn({ logCode: 'stats_rtt_success_state' }, `Last RTT request failed (rtt_success=${value})`);
      } else {
        logger.debug({ logCode: 'stats_rtt_success_state' }, `Last RTT request succeeded (rtt_success=${value})`);
      }
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
      logger.info({ logCode: 'stats_rtt_status_value' }, `RTT status changed to ${value}`);
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
      if (value) {
        logger.info({ logCode: 'stats_ping_state' }, `Ping is coming (ping_is_coming=${value})`);
      } else {
        logger.warn({ logCode: 'stats_ping_state' }, `Ping is not coming (ping_is_coming=${value})`);
      }
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
      if (value) {
        logger.info({ logCode: 'stats_server_state' }, `Server is responding (server_is_responding=${value})`);
      } else {
        logger.warn({ logCode: 'stats_server_state' }, `Server is not responding (server_is_responding=${value})`);
      }
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
      if (value) {
        logger.info({ logCode: 'stats_connection_state' }, `Connection status changed to connected (connected=${value})`);
      } else {
        logger.warn({ logCode: 'stats_connection_state' }, `Connection status changed to disconnected (connected=${value})`);
      }
      this.connected(value);
    }
  }

  public getConnectedStatus() {
    return this.connected();
  }

  public getConnectedStatusVar() {
    return this.connected;
  }

  public setSubscriptionFailed(value: boolean): void {
    if (value !== this.subscriptionFailed()) {
      if (value) {
        logger.warn({ logCode: 'stats_subscription_state' }, `Subscription failed (subscription_failed=${value})`);
      } else {
        logger.info({ logCode: 'stats_subscription_state' }, `Subscription recovered (subscription_failed=${value})`);
      }
      this.subscriptionFailed(value);
    }
  }

  public getSubscriptionFailed() {
    return this.subscriptionFailed();
  }

  public getSubscriptionFailedVar() {
    return this.subscriptionFailed;
  }

  public addUserNetworkHistory(
    user: User,
    lastUnstableStatus: string,
    lastUnstableStatusAt: Date | number,
  ): void {
    const userNetworkHistory = [...this.userNetworkHistory()];
    userNetworkHistory.push({
      user: {
        userId: user.userId,
        avatar: user.avatar,
        isModerator: user.isModerator,
        color: user.color,
        currentlyInMeeting: user.currentlyInMeeting,
        name: user.name,
      },
      lastUnstableStatus,
      lastUnstableStatusAt,
      clientNotResponding: false,
    });
    this.userNetworkHistory(userNetworkHistory);
  }

  public getUserNetworkHistory() {
    return this.userNetworkHistory();
  }
}

const connectionStatus = new ConnectionStatus();

export default connectionStatus;
