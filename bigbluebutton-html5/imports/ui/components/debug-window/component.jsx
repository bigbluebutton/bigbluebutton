import React, { Component } from 'react';
import Draggable from 'react-draggable';
import Resizable from 're-resizable';
import { Session } from 'meteor/session';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import Toggle from '/imports/ui/components/switch/component';
import Storage from '/imports/ui/services/storage/session';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import { ACTIONS, LAYOUT_TYPE } from '../layout/enums';
import NewLayoutContext from '../layout/context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';

const intlMessages = defineMessages({
  modalClose: {
    id: 'app.modal.close',
    description: 'Close',
  },
  modalCloseDescription: {
    id: 'app.modal.close.description',
    description: 'Disregards changes and closes the modal',
  },
  debugWindowTitle: {
    id: 'app.debugWindow.windowTitle',
    description: 'Debug window title',
  },
  userAgentLabel: {
    id: 'app.debugWindow.form.userAgentLabel',
    description: 'User agent form label',
  },
  copyButtonLabel: {
    id: 'app.debugWindow.form.button.copy',
    description: 'User agent form copy button',
  },
  enableAutoarrangeLayoutLabel: {
    id: 'app.debugWindow.form.enableAutoarrangeLayoutLabel',
    description: 'Enable Autoarrange layout label',
  },
  enableAutoarrangeLayoutDescription: {
    id: 'app.debugWindow.form.enableAutoarrangeLayoutDescription',
    description: 'Enable Autoarrange layout description',
  },
  on: {
    id: 'app.switch.onLabel',
    description: 'label for toggle switch on state',
  },
  off: {
    id: 'app.switch.offLabel',
    description: 'label for toggle switch off state',
  },
});

const DEBUG_WINDOW_ENABLED = Meteor.settings.public.app.enableDebugWindow;
const SHOW_DEBUG_WINDOW_ACCESSKEY = Meteor.settings.public.app.shortcuts.openDebugWindow.accesskey;

class DebugWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDebugWindow: false,
      logLevel: ChatLogger.getLogLevel(),
      autoArrangeLayout: Storage.getItem('autoArrangeLayout'),
    };

    this.setLayoutManagerToLoad = this.setLayoutManagerToLoad.bind(this);
    this.setLayoutType = this.setLayoutType.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', (event) => {
      const { key, code } = event;
      const eventKey = key.toUpperCase();
      const eventCode = code;
      if (DEBUG_WINDOW_ENABLED && event.altKey && (eventKey === SHOW_DEBUG_WINDOW_ACCESSKEY || eventCode === `Key${SHOW_DEBUG_WINDOW_ACCESSKEY}`)) {
        this.debugWindowToggle();
      }
    });
  }

  setShowDebugWindow(showDebugWindow) {
    this.setState({ showDebugWindow });
  }

  setLayoutManagerToLoad(event) {
    const { newLayoutContextDispatch } = this.props;
    Session.set('layoutManagerLoaded', event.target.value);
    newLayoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_LOADED,
      value: event.target.value,
    });
  }

  setLayoutType(event) {
    const { newLayoutContextDispatch } = this.props;
    newLayoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_TYPE,
      value: event.target.value,
    });
  }

  debugWindowToggle() {
    const { showDebugWindow } = this.state;
    if (showDebugWindow) {
      this.setShowDebugWindow(false);
    } else {
      this.setShowDebugWindow(true);
    }
  }

  displaySettingsStatus(status) {
    const { intl } = this.props;

    return (
      <span className={styles.toggleLabel}>
        {status ? intl.formatMessage(intlMessages.on)
          : intl.formatMessage(intlMessages.off)}
      </span>
    );
  }

  autoArrangeToggle() {
    const { layoutContextDispatch } = this.props;
    const autoArrangeLayout = Storage.getItem('autoArrangeLayout');

    this.setState({
      autoArrangeLayout: !autoArrangeLayout,
    });

    layoutContextDispatch(
      {
        type: 'setAutoArrangeLayout',
        value: !autoArrangeLayout,
      },
    );

    window.dispatchEvent(new Event('autoArrangeChanged'));
  }

  render() {
    const { showDebugWindow, logLevel } = this.state;
    const chatLoggerLevelsNames = Object.keys(ChatLogger.levels);

    if (!DEBUG_WINDOW_ENABLED || !showDebugWindow) return false;

    const { intl, newLayoutContextState } = this.props;
    const { layoutType } = newLayoutContextState;
    const layoutManagerLoaded = Session.get('layoutManagerLoaded');
    const { autoArrangeLayout } = this.state;

    return (
      <Draggable
        handle="#debugWindowHeader"
        bounds="body"
        // onStart={}
        // onStop={}
        // disabled={}
        // position={}
        enableUserSelectHack={false}
      >
        <Resizable
          className={styles.debugWindowWrapper}
          minWidth={window.innerWidth * 0.2}
          minHeight={window.innerHeight * 0.2}
          // size={
          //   {
          //     width: sizeWidth,
          //     height: sizeHeight,
          //   }
          // }
          // lockAspectRatio
          // handleWrapperClass="resizeWrapper"
          // onResizeStart={}
          // onResize={}
          // onResizeStop={(e, direction, ref, d) => {
          //   this.setWebcamsAreaResizable(d.width, d.height);
          // }}
          enable={{
            top: false,
            bottom: false,
            left: false,
            right: false,
            topLeft: false,
            topRight: false,
            bottomLeft: false,
            bottomRight: true,
          }}
        >
          <div
            className={styles.debugWindow}
          >
            <div
              id="debugWindowHeader"
              className={styles.header}
            >
              <Icon iconName="fit_to_screen" className={styles.moveIcon} />
              <div className={styles.title}>
                {intl.formatMessage(intlMessages.debugWindowTitle)}
              </div>
              <Button
                className={styles.close}
                label={intl.formatMessage(intlMessages.modalClose)}
                aria-label={`${intl.formatMessage(intlMessages.modalClose)} ${intl.formatMessage(intlMessages.debugWindowTitle)}`}
                icon="close"
                circle
                hideLabel
                onClick={() => this.setShowDebugWindow(false)}
              />
            </div>
            <div className={styles.debugWindowContent}>
              <div className={styles.table}>
                <div className={styles.row}>
                  <div className={styles.cell}>
                    {`${intl.formatMessage(intlMessages.userAgentLabel)}:`}
                  </div>
                  <div className={styles.cell}>
                    <input
                      className={styles.userAgentInput}
                      id="debugModalUserAgent"
                      type="text"
                      value={window.navigator.userAgent}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(window.navigator.userAgent)}
                    >
                      {`${intl.formatMessage(intlMessages.copyButtonLabel)}`}
                    </button>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.cell}>
                    {`${intl.formatMessage(intlMessages.enableAutoarrangeLayoutLabel)}:`}
                  </div>
                  <div className={styles.cell}>
                    <div className={styles.cellContent}>
                      {this.displaySettingsStatus(autoArrangeLayout)}
                      <Toggle
                        className={styles.autoArrangeToggle}
                        icons={false}
                        defaultChecked={autoArrangeLayout}
                        onChange={() => this.autoArrangeToggle()}
                        ariaLabel={intl.formatMessage(intlMessages.enableAutoarrangeLayoutLabel)}
                        showToggleLabel={false}
                      />
                      <p>{`${intl.formatMessage(intlMessages.enableAutoarrangeLayoutDescription)}`}</p>
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.cell}>
                    Layout
                  </div>
                  <div className={styles.cell}>
                    <div className={styles.cellContent}>
                      {/* <Toggle
                        className={styles.autoArrangeToggle}
                        icons={false}
                        defaultChecked
                        ariaLabel="teste"
                      /> */}
                      <select
                        value={layoutManagerLoaded}
                        onChange={this.setLayoutManagerToLoad}
                      >
                        <option value="legacy">Legacy</option>
                        <option value="new">New Layout Manager</option>
                        <option value="both">Both</option>
                      </select>
                      {
                        layoutManagerLoaded === 'new'
                        && (
                          <select
                            value={layoutType}
                            onChange={this.setLayoutType}
                          >
                            <option value={LAYOUT_TYPE.CUSTOM_LAYOUT}>Custom</option>
                            <option value={LAYOUT_TYPE.SMART_LAYOUT}>Smart Layout</option>
                            <option value={LAYOUT_TYPE.VIDEO_FOCUS}>Focus on Video</option>
                            <option value={LAYOUT_TYPE.PRESENTATION_FOCUS}>
                              Focus on Presentation
                            </option>
                          </select>
                        )
                      }
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.cell}>
                    Testing the chatLogger levels:
                  </div>
                  <div className={styles.cell}>
                    <div className={styles.cellContent}>
                      <select
                        style={{ marginRight: '1rem' }}
                        onChange={(ev) => {
                          this.setState({
                            logLevel: ev.target.value,
                          });
                        }}
                      >
                        {
                          chatLoggerLevelsNames.map((i, index) => {
                            return (<option key={`${i}-${index}`}>{i}</option>);
                          })
                        }
                      </select>
                      <button
                        type="button"
                        disabled={logLevel === ChatLogger.getLogLevel()}
                        onClick={() => {
                          ChatLogger.setLogLevel(logLevel);
                          this.setState({
                            logLevel: ChatLogger.getLogLevel(),
                          });
                        }}
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Resizable>
      </Draggable>
    );
  }
}

export default withLayoutConsumer(injectIntl(NewLayoutContext.withConsumer(DebugWindow)));
