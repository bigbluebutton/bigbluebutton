import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import useTimer from '/imports/ui/core/hooks/useTimer';

const formatTimerResponseFromGraphql = (
  response: ReturnType<typeof useTimer>,
): PluginSdk.GraphqlResponseWrapper<PluginSdk.TimerData> => ({
  data: response.data ? {
    accumulated: response.data.accumulated,
    active: response.data.active,
    songTrack: response.data.songTrack,
    time: response.data.time,
    stopwatch: response.data.stopwatch,
    running: response.data.running,
    startedAt: response.data.startedAt as string | null,
    elapsed: response.data.elapsed ?? false,
    timePassed: response.data.timePassed,
  } : undefined,
  loading: response.loading ?? false,
  error: 'error' in response ? response.error : undefined,
} as PluginSdk.GraphqlResponseWrapper<PluginSdk.TimerData>);

export default formatTimerResponseFromGraphql;
