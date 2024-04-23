import { GenericComponent } from 'bigbluebutton-html-plugin-sdk';
import { GenericComponent as GenericComponentLayout } from '../layout/layoutTypes';

export interface GenericComponentContainerProps {
    genericComponentMainContentId: string;
}
export interface GenericComponentProps {
    isResizing: boolean;
    genericComponentMainContentId: string;
    genericComponentMainContentLayoutInformation: GenericComponentLayout;
    renderFunctionComponents: GenericComponent[];
}
