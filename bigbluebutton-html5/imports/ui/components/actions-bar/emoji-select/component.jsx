import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, intlShape, injectIntl } from 'react-intl';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import styles from '../styles';

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'Emoji status button label',
  },
  changeStatusLabel: {
    id: 'app.actionsBar.changeStatusLabel',
    description: 'Aria-label for emoji status button',
  },
  currentStatusDesc: {
    id: 'app.actionsBar.currentStatusDesc',
    description: 'Aria description for status button',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  options: PropTypes.objectOf(PropTypes.string).isRequired,
  selected: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

const EmojiSelect = ({
  intl,
  options,
  selected,
  onChange,
}) => {
  const statuses = Object.keys(options);
  const lastStatus = statuses.pop();

  const statusLabel = statuses.indexOf(selected) === -1 ?
    intl.formatMessage(intlMessages.statusTriggerLabel)
    : intl.formatMessage({ id: `app.actionsBar.emojiMenu.${selected}Label` });

  return (
    <Dropdown autoFocus>
      <DropdownTrigger tabIndex={0}>
        <Button
          className={styles.button}
          label={statusLabel}
          aria-label={statusLabel}
          aria-describedby="currentStatus"
          icon={options[selected !== lastStatus ? selected : statuses[1]]}
          ghost={false}
          hideLabel
          circle
          size="lg"
          color="primary"
          onClick={() => null}
        >
          <div id="currentStatus" hidden>
            { intl.formatMessage(intlMessages.currentStatusDesc, { 0: selected }) }
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownContent placement="top left">
        <DropdownList>
          {
            statuses.map(status => (
              <DropdownListItem
                key={status}
                className={status === selected ? styles.emojiSelected : null}
                icon={options[status]}
                label={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Label` })}
                description={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Desc` })}
                onClick={() => onChange(status)}
                tabIndex={-1}
              />
            ))
            .concat(
              <DropdownListSeparator key={-1} />,
              <DropdownListItem
                key={lastStatus}
                icon={options[lastStatus]}
                label={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${lastStatus}Label` })}
                description={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${lastStatus}Desc` })}
                onClick={() => onChange(lastStatus)}
                tabIndex={-1}
              />,
            )
          }
        </DropdownList>
      </DropdownContent>
    </Dropdown>
  );
};

EmojiSelect.propTypes = propTypes;
export default injectIntl(EmojiSelect);
