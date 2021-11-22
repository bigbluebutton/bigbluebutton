import React, { Component } from 'react';
import Draggable from 'react-draggable';
import Resizable from 're-resizable';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles.scss';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
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
  chatLoggerLabel: {
    id: 'app.debugWindow.form.chatLoggerLabel',
    description: 'Chat logger level form label',
  },
  applyButtonLabel: {
    id: 'app.debugWindow.form.button.apply',
    description: 'Chat logger level form apply button',
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
    };
  }

  componentDidMount() {
    document.addEventListener('keyup', (event) => {
      const { key, code } = event;
      const eventKey = key?.toUpperCase();
      const eventCode = code;
      if (DEBUG_WINDOW_ENABLED && event?.altKey && (eventKey === SHOW_DEBUG_WINDOW_ACCESSKEY || eventCode === `Key${SHOW_DEBUG_WINDOW_ACCESSKEY}`)) {
        this.debugWindowToggle();
      }
    });
  }

  setShowDebugWindow(showDebugWindow) {
    this.setState({ showDebugWindow });
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

  render() {
    const { showDebugWindow, logLevel } = this.state;
    const chatLoggerLevelsNames = Object.keys(ChatLogger.levels);

    if (!DEBUG_WINDOW_ENABLED || !showDebugWindow) return false;

    const { intl } = this.props;

    return (
      <Draggable
        handle="#debugWindowHeader"
        bounds="body"
        enableUserSelectHack={false}
      >
        <Resizable
          className={styles.debugWindowWrapper}
          minWidth={window.innerWidth * 0.2}
          minHeight={window.innerHeight * 0.2}
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
                    {`${intl.formatMessage(intlMessages.chatLoggerLabel)}:`}
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
                            const idx = index;
                            return (<option key={`${i}-${idx}`}>{i}</option>);
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
                        {`${intl.formatMessage(intlMessages.applyButtonLabel)}`}
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

export default injectIntl(DebugWindow);
