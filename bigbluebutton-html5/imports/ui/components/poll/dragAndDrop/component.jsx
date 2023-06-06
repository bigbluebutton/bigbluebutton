import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Styled from './styles';

// src: https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929

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

  getCleanProps() {
    const props = Object.assign({}, this.props);
    const propsToDelete = ['MAX_INPUT_CHARS', 'handlePollValuesText'];

    propsToDelete.forEach((prop) => {
      delete props[prop];
    });

    return props;
  }

  render() {
    const { drag } = this.state;
    return (
      <Styled.DndTextArea
        ref={this.dropRef}
        active={drag}
        {...this.getCleanProps()}
      />
    );
  }
}

DragAndDrop.propTypes = {
  MAX_INPUT_CHARS: PropTypes.number.isRequired,
  handlePollValuesText: PropTypes.func.isRequired,
};

export default DragAndDrop;
