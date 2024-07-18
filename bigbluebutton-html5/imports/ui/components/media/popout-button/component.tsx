import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { uniqueId } from '/imports/utils/string-utils';
import PropTypes from 'prop-types';
import PopoutService from './service';
import Styled from './styles';

const intlMessages = defineMessages({
  popoutButton: {
    id: 'app.popoutButton.label',
    description: 'Popout label',
  },
});

const propTypes = {
  popoutRef: PropTypes.instanceOf(HTMLDivElement),
  dark: PropTypes.bool,
  bottom: PropTypes.bool,
  elementName: PropTypes.string.isRequired,
  color: PropTypes.string,
  popOutStyle: PropTypes.bool,
  fullScreenEnabled: PropTypes.bool,
};

type PopoutButtonProps = PropTypes.InferProps<typeof propTypes>;

const PopoutButton: React.FC<PopoutButtonProps> = ({
  popoutRef = null,
  dark = false,
  bottom = false,
  color = 'default',
  popOutStyle = true,
  elementName = '',
  fullScreenEnabled = false,
}) => {
  const windowName: string = uniqueId('popout-');
  const [popout, setPopout] = React.useState<WindowProxy | null>(null);

  const handlePopoutUnload = React.useCallback(() => {
    if (popout !== null) {
      popout.removeEventListener('beforeunload', handlePopoutUnload);
      setPopout(null);
    }
  }, [popout]);

  const handleWindowUnload = React.useCallback(() => {
    if (popout !== null) {
      popout.removeEventListener('beforeunload', handlePopoutUnload);
      popout.close();
    }

    window.removeEventListener('beforeunload', handleWindowUnload);
  }, [popout]);

  React.useEffect(() => {
    window.addEventListener('beforeunload', handleWindowUnload);
    popout?.addEventListener('beforeunload', handlePopoutUnload);

    return () => {
      if (popout !== null) {
        popout.removeEventListener('beforeunload', handlePopoutUnload);
        popout.close();
      }

      window.removeEventListener('beforeunload', handleWindowUnload);
    };
  }, [handlePopoutUnload]);

  const handleOnClick = React.useCallback(() => {
    const newPopout = PopoutService.togglePopout(popoutRef, windowName, elementName);

    if (!popout) {
      setPopout(newPopout);
    }
  }, []);

  const intl = useIntl();

  const formattedLabel = intl.formatMessage(
    intlMessages.popoutButton,
    ({ 0: elementName || '' }),
  );

  return (
    <Styled.PopOutButtonWrapper
      theme={dark ? 'dark' : 'light'}
      position={bottom ? 'bottom' : 'top'}
      fullScreenEnabled={!!fullScreenEnabled}
    >
      <Styled.PopOutButton
        color={color || 'default'}
        isStyled={popOutStyle}
        icon="popout_window"
        size="sm"
        onClick={() => handleOnClick()}
        label={formattedLabel}
        disabled={popout !== null}
        hideLabel
        data-test="popoutButton"
      />
    </Styled.PopOutButtonWrapper>
  );
};

export default PopoutButton;
