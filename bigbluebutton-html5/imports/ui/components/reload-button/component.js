import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import cx from 'classnames';
import { styles } from './styles';

const intlMessages = defineMessages({
  fullscreenButton: {
    id: 'app.fullscreenButton.label',
    description: 'Fullscreen label',
  },
});

const ReloadButtonComponent = ({
  intl,
  handleReload,
}) => {

  return (
    <div className={styles.button}>
      <Button
        color="primary"
        icon="refresh"
        size="sm"
        onClick={handleReload}
        label="label"
        hideLabel
        className={""}
      />
    </div>
  );
};

export default injectIntl(ReloadButtonComponent);
