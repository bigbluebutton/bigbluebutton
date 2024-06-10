import { GenericMainContent } from 'bigbluebutton-html-plugin-sdk';
import { GenericMainContent as GenericMainContentLayout } from '../layout/layoutTypes';

export interface GenericMainContentContainerProps {
    genericMainContentId: string;
}

export interface GenericMainContentProps {
    isResizing: boolean;
    genericContentId: string;
    genericContentLayoutInformation: GenericMainContentLayout;
    renderFunctionComponents: GenericMainContent[];
}

