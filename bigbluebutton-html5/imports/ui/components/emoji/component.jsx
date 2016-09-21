import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
// import ReactDOM from 'react-dom';
import classNames from 'classnames';
// import styles from '../styles';

// import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const propTypes = {
  // Emoji status of the current user
  userEmojiStatus: PropTypes.string.isRequired,
  actions: PropTypes.object.isRequired,
};

export default class EmojiMenu extends Component {
  constructor(props) {
    super(props);
    const { actions, } = this.props;
    awayHandler = actions.setEmojiHandler.bind(this, "Away");
    raiseHandler = actions.setEmojiHandler.bind(this, "Raise");
    undecidedHandler = actions.setEmojiHandler.bind(this, "Undecided");
    confusedHandler = actions.setEmojiHandler.bind(this, "Confused");
    sadHandler = actions.setEmojiHandler.bind(this, "Sad");
    happyHandler = actions.setEmojiHandler.bind(this, "Happy");
    clearHandler = actions.setEmojiHandler.bind(this, "Clear");
  }

  render() {
    console.log("About to render");
    const {
     userEmojiStatus,
     actions,
   } = this.props;

    return (
      <Dropdown ref="dropdown">
        <DropdownTrigger>
          <Button
            role="button"
            label="Status"
            icon="hand"
            ghost={false}
            circle={true}
            hideLabel={false}
            color={"primary"}
            size={"lg"}
            // className={styles.settingBtn}

            // FIXME: Without onClick react proptypes keep warning
            // even after the DropdownTrigger inject an onClick handler
            onClick={() => null}
          />
        </DropdownTrigger>
        <DropdownContent placement="top left">
          <DropdownList>
            <DropdownListItem
              icon="time"
              label="Away"
              // defaultMessage="Make the application fullscreen"
              onClick={awayHandler}
              aria-labelledby="awayLabel"
              aria-describedby="awayDesc"
            />
            <DropdownListItem
              icon="hand"
              label="Raise"
              // defaultMessage="Make the application fullscreen"
              onClick={raiseHandler}
              aria-labelledby="raiseLabel"
              aria-describedby="raiseDesc"
            />
            <DropdownListItem
              icon="undecided"
              label="Undecided"
              // defaultMessage="Make the application fullscreen"
              onClick={undecidedHandler}
              aria-labelledby="undecidedLabel"
              aria-describedby="undecidedDesc"
            />
            <DropdownListItem
              icon="confused"
              label="Confused"
              // defaultMessage="Make the application fullscreen"
              onClick={confusedHandler}
              aria-labelledby="confusedLabel"
              aria-describedby="confusedDesc"
            />
            <DropdownListItem
              icon="sad"
              label="Sad"
              // defaultMessage="Make the application fullscreen"
              onClick={sadHandler}
              aria-labelledby="sadLabel"
              aria-describedby="sadDesc"
            />
            <DropdownListItem
              icon="happy"
              label="Happy"
              // defaultMessage="Make the application fullscreen"
              onClick={happyHandler}
              aria-labelledby="happyLabel"
              aria-describedby="happyDesc"
            />
            <DropdownListItem
              icon="clear-status"
              label="Clear"
              // defaultMessage="Make the application fullscreen"
              onClick={clearHandler}
              aria-labelledby="clearLabel"
              aria-describedby="clearDesc"
            />

          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  renderAriaLabelsDescs() {
    return (
      <div>
        {/* Aria Labels and Descriptions for the trigger button*/}
        <p id="EmojiMenuTriggerLabel" hidden>
          <FormattedMessage
            id="app.emoji.EmojiMenuTriggerLabel"
            description="Aria label for the emoji trigger"
            defaultMessage="Status menu"
          />
        </p>
        <p id="EmojiMenuTriggerDesc" hidden>
          <FormattedMessage
            id="app.emoji.EmojiMenuTriggerDesc"
            description="Aria description for the emoji trigger"
            defaultMessage="Open the status menu to choose a status"
          />
        </p>

        {/* Aria Labels and Descriptions for each status option*/}
        <p id="awayLabel" hidden>
        <FormattedMessage
          id="app.emoji.awayLabel"
          description="Aria label for away status"
          defaultMessage="Away"
        />
        </p>
        <p id="awayDesc" hidden>
        <FormattedMessage
          id="app.emoji.awayDesc"
          description="Aria description for away status"
          defaultMessage="Choose your status as away"
        />
        </p>
        <p id="raiseLabel" hidden>
          <FormattedMessage
            id="app.emoji.raiseLabel"
            description="Aria label for raise status"
            defaultMessage="Raise"
          />
        </p>
        <p id="raiseDesc" hidden>
          <FormattedMessage
            id="app.emoji.raiseDesc"
            description="Aria description for raise status"
            defaultMessage="Raise your hand to ask a question"
          />
        </p>
        <p id="undecidedLabel" hidden>
          <FormattedMessage
            id="app.emoji.undecidedLabel"
            description="Aria label for undecided status"
            defaultMessage="Undecided"
          />
        </p>
        <p id="undecidedDesc" hidden>
          <FormattedMessage
            id="app.emoji.undecidedDesc"
            description="Aria description for undecided status"
            defaultMessage="Choose your status as undecided"
          />
        </p>
        <p id="confusedLabel" hidden>
          <FormattedMessage
            id="app.emoji.confusedLabel"
            description="Aria label for confused status"
            defaultMessage="Confused"
          />
        </p>
        <p id="confusedDesc" hidden>
          <FormattedMessage
            id="app.emoji.confusedDesc"
            description="Aria description for confused status"
            defaultMessage="Choose your status as confused"
          />
        </p>
        <p id="sadLabel" hidden>
          <FormattedMessage
            id="app.emoji.sadLabel"
            description="Aria label for sad status"
            defaultMessage="Sad"
          />
        </p>
        <p id="sadDesc" hidden>
          <FormattedMessage
            id="app.emoji.sadDesc"
            description="Aria description for sad status"
            defaultMessage="Choose your status as sad"
          />
        </p>
        <p id="happyLabel" hidden>
          <FormattedMessage
            id="app.emoji.happyLabel"
            description="Aria label for happy status"
            defaultMessage="Happy"
          />
        </p>
        <p id="happyDesc" hidden>
          <FormattedMessage
            id="app.emoji.happyDesc"
            description="Aria description for happy status"
            defaultMessage="Choose your status as happy"
          />
        </p>
        <p id="clearLabel" hidden>
          <FormattedMessage
            id="app.emoji.clearLabel"
            description="Aria label for clear status"
            defaultMessage="Clear"
          />
        </p>
        <p id="clearDesc" hidden>
          <FormattedMessage
            id="app.emoji.clearDesc"
            description="Aria description for clear status"
            defaultMessage="Clear your status"
          />
        </p>
      </div>
    );
  }
}

EmojiMenu.propTypes = propTypes;
