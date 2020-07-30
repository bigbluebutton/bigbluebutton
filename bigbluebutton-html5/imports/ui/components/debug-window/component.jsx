import React, { PureComponent } from 'react';
import cx from 'classnames';
import Draggable from 'react-draggable';
import styles from './styles.scss';
import Modal from '/imports/ui/components/modal/simple/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import Toggle from '/imports/ui/components/switch/component';
import Button from '/imports/ui/components/button/component';
import Storage from '/imports/ui/services/storage/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';

class DebugWindow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      dragging: false,
      position: {
        x: 0,
        y: 0,
      },
    };

    this.handleResize = this.handleResize.bind(this);
    this.handleOnDrag = this.handleOnDrag.bind(this);
    this.handleDragStop = this.handleDragStop.bind(this);
    this.handleOnClick = this.handleOnClick.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
  }

  autoArrangeToggle() {
    const { layoutContextDispatch } = this.props;
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');
    layoutContextDispatch(
      {
        type: 'setAutoArrangeLayout',
        value: !autoArrangeLayout,
      },
    );
    window.dispatchEvent(new Event('autoArrangeChanged'));
  }

  handleResize() {
    const position = {
      x: window.innerWidth - 100,
      y: 10,
    };
    this.setState({ position });
  }

  handleOnDrag(e, data) {
    if (data.lastX !== data.x && data.lastY !== data.y) {
      this.setState({ dragging: true });
    }
  }

  handleDragStop(e, data) {
    this.setState({
      position: {
        x: data.x,
        y: data.y,
      },
    });
    setTimeout(() => this.setState({ dragging: false }), 500);
  }

  handleOnClick() {
    const { mountModal } = this.props;
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');
    return mountModal(
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={() => mountModal(null)}
        hideBorder
        contentLabel="Debug"
      >
        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <h3 className={styles.title}>Debug</h3>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <hr className={styles.modalhr}/>
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.col} aria-hidden="true">
            <div className={styles.formElement}>
              <div className={styles.label}>
                Enable Auto Arrange Layout
              </div>
            </div>
          </div>
          <div className={styles.col}>
            <div className={cx(styles.formElement, styles.pullContentRight)}>
              <Toggle
                icons={false}
                defaultChecked={autoArrangeLayout}
                onChange={() => this.autoArrangeToggle()}
                ariaLabel="teste"
              />
            </div>
          </div>
        </div>
      </Modal>,
    );
  }

  render() {
    const { dragging, position } = this.state;
    return (
      <Draggable
        bounds="body"
        onDrag={this.handleOnDrag}
        onStop={this.handleDragStop}
        onMouseDown={e => e.preventDefault()}
        // disabled={swapLayout || isCameraFullscreen || BROWSER_ISMOBILE || resizing}
        position={position}
      >
        <Button
          className={styles.btn}
          // icon="application"
          customIcon={(
            <i className={styles.debugIcon}>
              <svg id="Icons" version="1.1" viewBox="0 0 32 32" xmlSpace="preserve" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <path d="M29,15h-5.1c-0.1-1.2-0.5-2.4-1-3.5c1.9-1.5,3.1-3.7,3.1-6.1V5c0-0.6-0.4-1-1-1s-1,0.4-1,1v0.4c0,1.8-0.8,3.4-2.2,4.5  c-0.5-0.7-1.2-1.2-1.9-1.7c0-0.1,0-0.1,0-0.2c0-2.2-1.8-4-4-4s-4,1.8-4,4c0,0.1,0,0.1,0,0.2c-0.7,0.5-1.3,1-1.9,1.7  C8.8,8.8,8,7.2,8,5.4V5c0-0.6-0.4-1-1-1S6,4.4,6,5v0.4c0,2.4,1.1,4.7,3.1,6.1c-0.5,1-0.9,2.2-1,3.5H3c-0.6,0-1,0.4-1,1s0.4,1,1,1  h5.1c0.1,1.2,0.5,2.4,1,3.5C7.1,21.9,6,24.2,6,26.6V27c0,0.6,0.4,1,1,1s1-0.4,1-1v-0.4c0-1.8,0.8-3.4,2.2-4.5  c1.5,1.8,3.5,2.9,5.8,2.9s4.4-1.1,5.8-2.9c1.4,1.1,2.2,2.7,2.2,4.5V27c0,0.6,0.4,1,1,1s1-0.4,1-1v-0.4c0-2.4-1.1-4.7-3.1-6.1  c0.5-1,0.9-2.2,1-3.5H29c0.6,0,1-0.4,1-1S29.6,15,29,15z" />
              </svg>
            </i>
          )}
          label="Open Debug Window"
          color="primary"
          hideLabel
          circle
          size="lg"
          onClick={() => !dragging && this.handleOnClick()}
        />
      </Draggable>
    );
  }
}

export default withLayoutConsumer(withModalMounter(DebugWindow));
