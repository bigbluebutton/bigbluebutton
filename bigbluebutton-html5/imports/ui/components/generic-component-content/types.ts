import { GenericComponent } from "bigbluebutton-html-plugin-sdk";
import { GenericComponent as GenericComponentLayout } from "../layout/layoutTypes";

export interface GenericComponentContainerProps {
    shouldShowScreenshare: boolean ;
    shouldShowSharedNotes: boolean ; 
    shouldShowExternalVideo: boolean ;
} 

export interface GenericComponentProps {
    isResizing: boolean;
    genericComponent: GenericComponentLayout;
    renderFunctionComponents: GenericComponent[];
    hasExternalVideoOnLayout: boolean;
    isSharedNotesPinned: boolean;
    hasScreenShareOnLayout: boolean;
}

