import apolloContextHolder from '../graphql/apolloContextHolder/apolloContextHolder';
import logger from '/imports/startup/client/logger';
import { GET_SERVER_TIME, GetServerTimeResponse } from '/imports/ui/core/graphql/queries/timer';

export async function fetchServerTimeSync(): Promise<number> {
  try {
    const clientSend = Date.now();
    const client = apolloContextHolder.getClient();
    const { data } = await client.query<GetServerTimeResponse>({
      query: GET_SERVER_TIME,
      fetchPolicy: 'network-only',
    });
    const clientReceive = Date.now();
    if (!data || !data.current_time || !data.current_time[0] || !data.current_time[0].currentTimestamp) {
      throw new Error('Invalid server time response');
    }
    const serverTime = new Date(data.current_time[0].currentTimestamp).getTime();
    const rtt = clientReceive - clientSend;
    const delay = rtt / 2;
    return serverTime - (clientSend + delay);
  } catch (err) {
    logger.warn({
      logCode: 'fetch_server_time_sync_error',
    }, 'Error when fetching server time. Time desync will be 0');
    return 0;
  }
}

export default {
  fetchServerTimeSync,
};
