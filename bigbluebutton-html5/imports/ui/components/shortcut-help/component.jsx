import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Modal from '/imports/ui/components/modal/simple/component';
import styles from './styles.scss';

const intlMessages = defineMessages({
  shortcutTitle: {
    id: 'app.shortcut-help.shortcutTitle',
    description: 'title for shortcut help modal',
  },
  cancelLabel: {
    id: 'app.shortcut-help.cancelLabel',
    description: 'label for dismiss modal button',
  },
  cancelDesc: {
    id: 'app.shortcut-help.cancelDesc',
    description: 'description for dismiss modal button',
  },
  firstColTitle: {
    id: 'app.shortcut-help.firstColTitle',
    description: 'heading for shortcuts column',
  },
  secondColTitle: {
    id: 'app.shortcut-help.secondColTitle',
    description: 'heading for shortcut function column',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  shortcuts: PropTypes.arrayOf({
    keys: PropTypes.string.isRequired,
    descId: PropTypes.string.isRequired,
  }).isRequired,
};

class ShortcutHelpComponent extends React.PureComponent {
  render() {
    const { intl, shortcuts } = this.props;

    return (
      <Modal
        title={intl.formatMessage(intlMessages.shortcutTitle)}
        dismiss={{
          label: intl.formatMessage(intlMessages.cancelLabel),
          description: intl.formatMessage(intlMessages.cancelDesc),
        }}
      >
        <table className={styles.shortcutTable}>
          <tr>
            <th className={styles.tableTitle}>{intl.formatMessage(intlMessages.firstColTitle)}</th>
            <th className={styles.tableTitle}>{intl.formatMessage(intlMessages.secondColTitle)}</th>
          </tr>
          {shortcuts.map(shortcut => (
            <tr>
              <td className={styles.keyCell}>{shortcut.keys}</td>
              <td className={styles.descCell}>
                {intl.formatMessage({
                    id: `app.shortcut-help.${shortcut.descId}`,
                })}
              </td>
            </tr>
          ))}
        </table>
      </Modal>
    );
  }
}

export default injectIntl(ShortcutHelpComponent);

ShortcutHelpComponent.propTypes = propTypes;
