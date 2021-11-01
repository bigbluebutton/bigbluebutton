import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';

import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Button from '/imports/ui/components/button/component';


// src: https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929

const intlMessages = defineMessages({
  customPollTextArea: {
    id: 'app.poll.customPollTextArea',
    description: 'label for button to submit custom poll values',
  },
});

class DragAndDrop extends Component {
  static handleDrag(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  constructor(props) {
    super(props);

    this.state = {
      drag: false,
      pollValueText: '',
    };

    this.dropRef = React.createRef();
  }

  componentDidMount() {
    this.dragCounter = 0;
    const div = this.dropRef.current;
    div.addEventListener('dragenter', e => this.handleDragIn(e));
    div.addEventListener('dragleave', e => this.handleDragOut(e));
    div.addEventListener('dragover', e => DragAndDrop.handleDrag(e));
    div.addEventListener('drop', e => this.handleDrop(e));
  }

  componentWillUnmount() {
    const div = this.dropRef.current;
    div.removeEventListener('dragenter', e => this.handleDragIn(e));
    div.removeEventListener('dragleave', e => this.handleDragOut(e));
    div.removeEventListener('dragover', e => DragAndDrop.handleDrag(e));
    div.removeEventListener('drop', e => this.handleDrop(e));
  }

  setPollValues() {
    const { pollValueText } = this.state;
    const { handlePollValuesText } = this.props;
    if (pollValueText) {
      handlePollValuesText(pollValueText);
    }
  }

  setPollValuesFromFile(file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      this.setPollValueText(text);
      this.setPollValues();
    };
    reader.readAsText(file);
  }

  setPollValueText(pollText) {
    const { MAX_INPUT_CHARS } = this.props;
    const arr = pollText.split('\n');
    const text = arr.map(line => (line.length > MAX_INPUT_CHARS ? line.substring(0, MAX_INPUT_CHARS) : line)).join('\n');
    this.setState({ pollValueText: text });
  }


  handleTextInput(e) {
    this.setPollValueText(e.target.value);
  }


  handleDragIn(e) {
    DragAndDrop.handleDrag(e);
    this.dragCounter += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({ drag: true });
    }
  }

  handleDragOut(e) {
    DragAndDrop.handleDrag(e);
    this.dragCounter -= 1;
    if (this.dragCounter > 0) return;
    this.setState({ drag: false });
  }

  handleDrop(e) {
    DragAndDrop.handleDrag(e);
    this.setState({ drag: false });
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.setPollValuesFromFile(e.dataTransfer.files[0]);
      this.dragCounter = 0;
    }
  }


  render() {
    const { intl, children } = this.props;
    const { pollValueText, drag } = this.state;
    return (
      <div
        className={styles.dndContainer}
        ref={this.dropRef}
      >
        <textarea
          value={pollValueText}
          className={drag ? styles.dndActive : styles.dndInActive}
          onChange={e => this.handleTextInput(e)}
        />
        <Button
          onClick={() => this.setPollValues()}
          label={intl.formatMessage(intlMessages.customPollTextArea)}
          color="primary"
          disabled={pollValueText < 1}
          className={styles.btn}
        />
        {children}
      </div>

    );
  }
} export default withModalMounter(injectIntl(DragAndDrop));

DragAndDrop.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  MAX_INPUT_CHARS: PropTypes.number.isRequired,
  handlePollValuesText: PropTypes.func.isRequired,
  children: PropTypes.element.isRequired,
};
