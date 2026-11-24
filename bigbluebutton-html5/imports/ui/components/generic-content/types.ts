import * as ReactDOM from 'react-dom/client';
import { GenericContentMainArea } from 'bigbluebutton-html-plugin-sdk';

export interface GenericContentMainAreaContainerProps {
    genericMainContentId: string;
}

export interface GenericContentMainAreaProps {
    isResizing: boolean;
    isLocalChange: boolean;
    genericContentId: string;
    /** the media box has no area: the content hides, as it did with a zero width and height */
    isMinimized: boolean;
    renderFunctionComponents: GenericContentMainArea[];
}

export interface GenericContentSidekickContainerProps {
    genericSidekickContentId: string;
}

export interface GenericSidekickContentProps {
    genericContentId: string;
    renderFunction: (element: HTMLElement) => ReactDOM.Root;
    dataTest: string;
    genericContentLabel: string;
}
