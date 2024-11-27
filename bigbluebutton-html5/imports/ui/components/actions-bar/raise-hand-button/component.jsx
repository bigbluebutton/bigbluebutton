import React, { useState, useRef, useEffect } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import data from '@emoji-mart/data';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import { init } from 'emoji-mart';
import { SET_RAISE_HAND } from '/imports/ui/core/graphql/mutations/userMutations';
import { useMutation } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Styled from './styles';

const RaiseHandButton = (props) => {
  const {
    intl,
    userId,
    raiseHand,
    shortcuts,
  } = props;

  // Initialize emoji-mart data
  init({ data });

  const [setRaiseHand] = useMutation(SET_RAISE_HAND);

  const intlMessages = defineMessages({
    raiseHandLabel: {
      id: 'app.actionsBar.reactions.raiseHand',
      description: 'raise Hand Label',
    },
    notRaiseHandLabel: {
      id: 'app.actionsBar.reactions.lowHand',
      description: 'not Raise Hand Label',
    },
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleRaiseHandButtonClick = () => {
    setRaiseHand({
      variables: {
        userId,
        raiseHand: !raiseHand,
      },
    });
    document.activeElement.blur();
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const label = raiseHand ? intlMessages.notRaiseHandLabel : intlMessages.raiseHandLabel;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shouldOpenDropdown = getFromUserSettings('bbb_open_dropdown_on_raise_hand', false);

  const handleClick = () => {
    if (shouldOpenDropdown) {
      toggleDropdown();
    } else {
      handleRaiseHandButtonClick();
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }} ref={dropdownRef}>
      <Styled.RaiseHandButton
        data-test="raiseHandBtn"
        icon="hand"
        label={intl.formatMessage(label)}
        description="Reactions"
        onKeyPress={() => { }}
        onClick={handleClick}
        color={raiseHand ? 'primary' : 'default'}
        accessKey={shortcuts.raisehand}
        hideLabel
        circle
        size="lg"
      />
      {shouldOpenDropdown && dropdownOpen && (
        <Styled.Dropdown>
          <Styled.DropdownItem
            onClick={() => {
              handleRaiseHandButtonClick();
              setDropdownOpen(false);
            }}
          >
            {intl.formatMessage(intlMessages.raiseHandLabel)}
          </Styled.DropdownItem>
        </Styled.Dropdown>
      )}
    </div>
  );
};

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  userId: PropTypes.string.isRequired,
  raiseHand: PropTypes.bool,
  shortcuts: PropTypes.shape({
    raisehand: PropTypes.string,
  }).isRequired,
};

RaiseHandButton.propTypes = propTypes;

export default withShortcutHelper(RaiseHandButton, ['raiseHand']);
