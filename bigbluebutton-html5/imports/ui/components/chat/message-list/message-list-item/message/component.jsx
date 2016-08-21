import React, { Component, PropTypes } from 'react';
import _ from 'underscore';

const propTypes = {
  text: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  unread: PropTypes.bool.isRequired,
};

const defaultProps = {
  unread: true,
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

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
  }

  handleMessageInViewport(e) {
    if (!this.ticking) {
      window.requestAnimationFrame(() => {
        const node = this.refs.text;
        const scrollArea = document.getElementById(this.props.chatAreaId);

        if (isElementInViewport(node)) {
          this.props.handleReadMessage(this.props.time);
          eventsToBeBound.forEach(
            e => scrollArea.removeEventListener(e, this.handleMessageInViewport)
          );
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  componentDidMount() {
    if (!this.props.lastReadMessageTime > this.props.time) {
      return;
    }

    const node = this.refs.text;

    if (isElementInViewport(node)) {
      this.props.handleReadMessage(this.props.time);
    } else {
      const scrollArea = document.getElementById(this.props.chatAreaId);
      eventsToBeBound.forEach(
        e => scrollArea.addEventListener(e, this.handleMessageInViewport, false)
      );
    }
  }

  componentWillUnmount() {
    if (!this.props.lastReadMessageTime > this.props.time) {
      return;
    }

    const scrollArea = document.getElementById(this.props.chatAreaId);
    eventsToBeBound.forEach(
      e => scrollArea.removeEventListener(e, this.handleMessageInViewport, false)
    );
  }

  render() {
    const {
      text,
      time,
    } = this.props;

    return (
      <p
        ref="text"
        dangerouslySetInnerHTML={{ __html: text }}
        className={this.props.className}
      />
    );
  }

}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
