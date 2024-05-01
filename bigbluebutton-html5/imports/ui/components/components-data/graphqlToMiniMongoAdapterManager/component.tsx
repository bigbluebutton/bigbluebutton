import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import UserGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/userGrapQlMiniMongoAdapter/component';
import VoiceUserGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/voiceUserGraphQlMiniMongoAdapter/component';
import MeetingGrapQlMiniMongoAdapter from '/imports/ui/components/components-data/meetingGrapQlMiniMongoAdapter/component';
import ScreenShareGraphQlMiniMongoAdapterContainer from '/imports/ui/components/components-data/screenshareGraphQlMiniMongoAdapter/component';
import VideoStreamAdapter from '/imports/ui/components/video-provider/video-provider-graphql/adapter';

interface GraphqlToMiniMongoAdapterManagerProps {
  children: React.ReactNode;
}

export interface AdapterProps extends GraphqlToMiniMongoAdapterManagerProps {
  onReady: (key:string) => void;
}

const GraphqlToMiniMongoAdapterManager: React.FC<GraphqlToMiniMongoAdapterManagerProps> = ({ children }) => {
  const [adapterLoaded, setAdapterLoaded] = useState(false);
  const loadedComponents = useRef<{
    [key: string]: number;
  }>({});
  const adapterComponents = useRef([
    UserGrapQlMiniMongoAdapter,
    MeetingGrapQlMiniMongoAdapter,
    VideoStreamAdapter,
    VoiceUserGrapQlMiniMongoAdapter,
  ]);

  const onReady = useCallback((key: string) => {
    loadedComponents.current[key] = 1;
    if (Object.keys(loadedComponents.current).length >= adapterComponents.current.length) {
      setAdapterLoaded(true);
    }
  }, []);

  const nestAdapters = useMemo(() => {
    return adapterComponents.current.reduce((acc, Component) => (
      <Component onReady={onReady}>
        {acc}
      </Component>
    ), <span />);
  }, []);
  return (
    <>
      {/* screenshare loads conditionally  so can't be used on lock loading */}
      <ScreenShareGraphQlMiniMongoAdapterContainer />
      {nestAdapters}
      {adapterLoaded ? children : null}
    </>
  );
};

export default GraphqlToMiniMongoAdapterManager;
