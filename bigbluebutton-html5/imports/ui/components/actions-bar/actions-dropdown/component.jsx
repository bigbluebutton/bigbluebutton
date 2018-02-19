import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import PresentationUploaderContainer from '/imports/ui/components/presentation/presentation-uploader/container';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import { styles } from '../styles';

const propTypes = {
  isUserPresenter: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  mountModal: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  actionsLabel: {
    id: 'app.actionsBar.actionsDropdown.actionsLabel',
    description: 'Actions button label',
  },
  presentationLabel: {
    id: 'app.actionsBar.actionsDropdown.presentationLabel',
    description: 'Upload a presentation option label',
  },
  presentationDesc: {
    id: 'app.actionsBar.actionsDropdown.presentationDesc',
    description: 'adds context to upload presentation option',
  },
  desktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.desktopShareLabel',
    description: 'Desktop Share option label',
  },
  stopDesktopShareLabel: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareLabel',
    description: 'Stop Desktop Share option label',
  },
  desktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.desktopShareDesc',
    description: 'adds context to desktop share option',
  },
  stopDesktopShareDesc: {
    id: 'app.actionsBar.actionsDropdown.stopDesktopShareDesc',
    description: 'adds context to stop desktop share option',
  },
  startRecording: {
    id: 'app.actionsBar.actionsDropdown.startRecording',
    description: 'start recording option',
  },
  endRecording: {
    id: 'app.actionsBar.actionsDropdown.endRecording',
    description: 'end recording option',
  },
});

class ActionsDropdown extends Component {
  constructor(props) {
    super(props);
    this.handlePresentationClick = this.handlePresentationClick.bind(this);
    this.handleToggleRecording = this.handleToggleRecording.bind(this);
  }

  componentWillMount() {
    this.presentationItemId = _.uniqueId('action-item-');
    this.videoItemId = _.uniqueId('action-item-');
    this.recordId = _.uniqueId('action-item-');
  }

  componentWillUpdate(nextProps) {
    const { isUserPresenter: isPresenter } = nextProps;
    const { isUserPresenter: wasPresenter, mountModal } = this.props;
    if (wasPresenter && !isPresenter) {
      mountModal(null);
    }
  }

  handlePresentationClick() {
    this.props.mountModal(<PresentationUploaderContainer />);
  }

  handleToggleRecording() {
    makeCall('toggleRecording');
  }

  getAvailableActions() {
    const {
      intl,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      isUserPresenter,
      isUserModerator,
      allowStartStopRecording,
      isRecording,
      record,
    } = this.props;

    return _.compact([
      (isUserPresenter ?
        <DropdownListItem
          icon="presentation"
          label={intl.formatMessage(intlMessages.presentationLabel)}
          description={intl.formatMessage(intlMessages.presentationDesc)}
          key={this.presentationItemId}
          onClick={this.handlePresentationClick}
        />
      : null),
      (Meteor.settings.public.kurento.enableScreensharing && isUserPresenter ?
        <DropdownListItem
          icon="desktop"
          label={intl.formatMessage(isVideoBroadcasting ? intlMessages.stopDesktopShareLabel : intlMessages.desktopShareLabel)}
          description={intl.formatMessage(isVideoBroadcasting ? intlMessages.stopDesktopShareDesc : intlMessages.desktopShareDesc)}
          key={this.videoItemId}
          onClick={isVideoBroadcasting ? handleUnshareScreen : handleShareScreen }
        />
      : null),
      (record && isUserModerator && allowStartStopRecording ?
        <DropdownListItem
          icon="record"
          label={intl.formatMessage(isRecording ? intlMessages.endRecording : intlMessages.startRecording)}
          description={intl.formatMessage(isRecording ? intlMessages.endRecording : intlMessages.startRecording)}
          key={this.recordId}
          onClick={this.handleToggleRecording}
        />
      : null),
    ]);
  }

  render() {
    const {
      intl,
      isUserPresenter,
      handleShareScreen,
      handleUnshareScreen,
      isVideoBroadcasting,
      isUserModerator,
      allowStartStopRecording,
      isRecording,
      record
    } = this.props;

    const availableActions = this.getAvailableActions();

    if (!isUserPresenter && !isUserModerator || (isUserModerator && !allowStartStopRecording && !isUserPresenter) || availableActions.length == 0) return null;

    return (
      <Dropdown ref={(ref) => { this._dropdown = ref; }} >
        <DropdownTrigger tabIndex={0} >
          <Button
            hideLabel
            aria-label={intl.formatMessage(intlMessages.actionsLabel)}
            className={styles.button}
            label={intl.formatMessage(intlMessages.actionsLabel)}
            icon="plus"
            color="primary"
            size="lg"
            circle
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            {availableActions}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

ActionsDropdown.propTypes = propTypes;

export default withModalMounter(injectIntl(ActionsDropdown));
