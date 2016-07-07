import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';

const propTypes = {
  text: React.PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
};

const defaultProps = {
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export default class MessageListItem extends Component {
  constructor(props) {
    super(props);

    this.ticking = false;

    this.handleMessageInViewport = this.handleMessageInViewport.bind(this);
  }

  handleMessageInViewport(e) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const node = findDOMNode(this);
        const scrollArea = document.getElementById(this.props.chatAreaId);

        if (isElementInViewport(node)) {
          this.props.handleReadMessage(this.props.time);
          eventsToBeBound.forEach(e => scrollArea.removeEventListener(e, this.handleMessageInViewport));
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  componentDidMount() {
    const node = findDOMNode(this);

    if (isElementInViewport(node)) {
      this.props.handleReadMessage(this.props.time);
    } else {
      const scrollArea = document.getElementById(this.props.chatAreaId);
      eventsToBeBound.forEach(e => scrollArea.addEventListener(e, this.handleMessageInViewport));
    }
  }

  componentWillUnmount() {
    const node = findDOMNode(this);
    const scrollArea = document.getElementById(this.props.chatAreaId);

    eventsToBeBound.forEach(e => scrollArea.removeEventListener(e, this.handleMessageInViewport));
  }

  render() {
    const {
      text,
      time,
    } = this.props;

    return (
      <p
        dangerouslySetInnerHTML={{ __html: text }}
        className={this.props.className}
      />
    );
  }

}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
