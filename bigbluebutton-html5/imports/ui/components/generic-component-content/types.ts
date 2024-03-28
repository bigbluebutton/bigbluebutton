import { GenericComponent } from 'bigbluebutton-html-plugin-sdk';
import { GenericComponent as GenericComponentLayout } from '../layout/layoutTypes';

export interface GenericComponentContainerProps {
    genericComponentId: string;
}
export interface GenericComponentProps {
    isResizing: boolean;
    genericComponentId: string;
    genericComponentLayoutInformation: GenericComponentLayout;
    renderFunctionComponents: GenericComponent[];
}
