import React, { PureComponent } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Dropzone from 'react-dropzone';
import Icon from '/imports/ui/components/icon/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Modal from '/imports/ui/components/modal/simple/component';
import Button from '/imports/ui/components/button/component';
import Service from './service';
import { styles } from './styles';

const intlMessages = defineMessages({
  title: {
    id: 'app.captions.menu.ariaSelect',
    description: '',
  },
  subtitle: {
    id: 'app.captions.menu.ariaSelect',
    description: '',
  },
});

class MediaUpload extends PureComponent {
  constructor(props) {
    super(props);

    this.min = Service.getMinSize();
    this.max = Service.getMaxSize();
    this.types = Service.getMediaTypes();
  }

  render() {
    const {
      intl,
      closeModal,
    } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.title)}
      >
        <header className={styles.header}>
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.title)}
          </h3>
        </header>
        <div className={styles.content}>
          <label>
            {intl.formatMessage(intlMessages.subtitle)}
          </label>
          <Dropzone
            multiple
            className={styles.dropzone}
            activeClassName={styles.dropzoneActive}
            accept={this.types.map(type => type.extension)}
            minSize={this.min}
            maxSize={this.max}
            disablepreview="true"
            onDrop={this.handleOnDrop}
          >
            <Icon className={styles.dropzoneIcon} iconName="upload" />
            <p className={styles.dropzoneMessage}>
              {intl.formatMessage(intlMessages.title)}
              &nbsp;
              <span className={styles.dropzoneLink}>
                {intl.formatMessage(intlMessages.subtitle)}
              </span>
            </p>
          </Dropzone>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(withModalMounter(MediaUpload));
