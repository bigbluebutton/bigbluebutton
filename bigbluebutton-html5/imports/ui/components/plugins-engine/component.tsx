import * as React  from 'react';
import { PluginsEngineComponentProps } from './types';

const PluginsEngineComponent = ( props: PluginsEngineComponentProps ) => {
    const {
        containerRef,
    } = props;
    return (
        <div
            ref={containerRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
            }}  
        />
    )
}

export default PluginsEngineComponent
