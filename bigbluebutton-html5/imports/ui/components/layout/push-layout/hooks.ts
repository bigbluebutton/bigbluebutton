import { useMutation } from '@apollo/client';
import { SET_LAYOUT_PROPS, SET_SYNC_WITH_PRESENTER_LAYOUT } from './mutations';
import { Input, Output } from '../layoutTypes';
import { calculatePresentationVideoRate } from './service';

const usePushLayoutUpdater = () => {
  const [setSyncWithPresenterLayout] = useMutation(SET_SYNC_WITH_PRESENTER_LAYOUT);

  const setPushLayout = () => {
    setSyncWithPresenterLayout({
      variables: {
        syncWithPresenterLayout: true,
      },
    });
  };

  return setPushLayout;
};

const useMeetingLayoutUpdater = (
  cameraDockOutput: Output['cameraDock'],
  cameraDockInput: Input['cameraDock'],
  presentationInput: Input['presentation'],
  applicationSettings: { selectedLayout: boolean },
) => {
  const [setMeetingLayoutProps] = useMutation(SET_LAYOUT_PROPS);

  const { focusedId, position } = cameraDockOutput;
  const { isResizing } = cameraDockInput;
  const { isOpen: presentationIsOpen } = presentationInput;
  const { selectedLayout } = applicationSettings;

  const setMeetingLayout = () => {
    setMeetingLayoutProps({
      variables: {
        layout: selectedLayout,
        syncWithPresenterLayout: true,
        presentationIsOpen,
        isResizing,
        cameraPosition: position || 'contentTop',
        focusedCamera: focusedId || 'none',
        presentationVideoRate: calculatePresentationVideoRate(cameraDockOutput),
      },
    });
  };

  return setMeetingLayout;
};

export {
  useMeetingLayoutUpdater,
  usePushLayoutUpdater,
};
