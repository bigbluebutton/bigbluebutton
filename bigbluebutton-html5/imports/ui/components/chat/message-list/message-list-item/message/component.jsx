import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import styles from './styles';
import Button from '../../../../button/component';
import Icon from '/imports/ui/components/icon/component';

const propTypes = {
  text: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  lastReadMessageTime: PropTypes.number,
  handleReadMessage: PropTypes.func.isRequired,
  scrollArea: PropTypes.instanceOf(Element),
  className: PropTypes.string.isRequired,
};

const defaultProps = {
  lastReadMessageTime: 0,
  scrollArea: undefined,
};

const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0
    && rect.left >= 0
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

export default class MessageListItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;

    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);

    this.handleFileDownload = this.handleFileDownload.bind(this);
  }

  componentDidMount() {
    this.listenToUnreadMessages();
  }

  componentDidUpdate() {
    this.listenToUnreadMessages();
  }

  componentWillUnmount() {
    // This was added 3 years ago, but never worked. Leaving it around in case someone returns
    // and decides it needs to be fixed like the one in listenToUnreadMessages()
    // if (!lastReadMessageTime > time) {
    //  return;
    // }

    this.removeScrollListeners();
  }

  addScrollListeners() {
    const {
      scrollArea,
    } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        e => scrollArea.addEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  handleMessageInViewport() {
    if (!this.ticking) {
      fastdom.measure(() => {
        const node = this.text;
        const {
          handleReadMessage,
          time,
          lastReadMessageTime,
        } = this.props;

        if (lastReadMessageTime > time) {
          this.removeScrollListeners();
          return;
        }

        if (isElementInViewport(node)) {
          handleReadMessage(time);
          this.removeScrollListeners();
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  removeScrollListeners() {
    const {
      scrollArea,
    } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        e => scrollArea.removeEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  // depending on whether the message is in viewport or not,
  // either read it or attach a listener
  listenToUnreadMessages() {
    const {
      handleReadMessage,
      time,
      lastReadMessageTime,
    } = this.props;

    if (lastReadMessageTime > time) {
      return;
    }

    const node = this.text;

    fastdom.measure(() => {
      const {
        lastReadMessageTime: updatedLastReadMessageTime,
      } = this.props;
      // this function is called after so we need to get the updated lastReadMessageTime

      if (updatedLastReadMessageTime > time) {
        return;
      }

      if (isElementInViewport(node)) { // no need to listen, the message is already in viewport
        handleReadMessage(time);
      } else {
        this.addScrollListeners();
      }
    });
  }

  handleFileDownload() {
    const {
      link,
    } = this.props;

    if(link) {
      window.open(link);
    }
  }

  render() {
    const {
      text,
      className,
      file,
    } = this.props;

    // const ext = file.fileName.split('.').pop();
    return (
      (file !== undefined) ? 
        (<div className={styles.wrapper}>
          <div className={styles.extensionBox}>
            {/* <span className={styles.extension}> */}
                <Icon iconName="file" />
            {/* </span>   */}
          </div> 
          <span className={styles.fileName}>{file.fileName}</span>
          
          <Button
            hideLabel
            label="Download"
            className={styles.button}
            color="default"
            icon="template_download"
            size="sm"
            circle
            onClick={()=> this.handleFileDownload()}
          />
        </div>) :
        (<p
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          className={className}
        />)
    );
  }
}

MessageListItem.propTypes = propTypes;
MessageListItem.defaultProps = defaultProps;
