import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';

import VideoStreamAdapter from '/imports/ui/components/video-provider/adapter';

interface GraphqlToMakeVarAdapterManagerProps {
  children: React.ReactNode;
}

export interface AdapterProps extends GraphqlToMakeVarAdapterManagerProps {
  onReady: (key:string) => void;
}

const GraphqlToMakeVarAdapterManager: React.FC<GraphqlToMakeVarAdapterManagerProps> = ({ children }) => {
  const [adapterLoaded, setAdapterLoaded] = useState(false);
  const loadedComponents = useRef<{
    [key: string]: number;
  }>({});
  const adapterComponents = useRef([
    VideoStreamAdapter,
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
      {nestAdapters}
      {adapterLoaded ? children : null}
    </>
  );
};

export default GraphqlToMakeVarAdapterManager;
