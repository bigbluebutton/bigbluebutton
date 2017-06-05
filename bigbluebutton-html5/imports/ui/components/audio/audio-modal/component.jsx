import React from 'react';
import ModalBase from '../../modal/base/component';
import styles from './styles.scss';
import JoinAudio from '../join-audio/component';
import AudioSettings from '../audio-settings/component';

export default class AudioModal extends React.Component {
  constructor(props) {
    super(props);

    this.JOIN_AUDIO = 0;
    this.AUDIO_SETTINGS = 1;

    this.submenus = [];
  }

  componentWillMount() {
    /* activeSubmenu represents the submenu in the submenus array to be displayed to the user,
     * initialized to 0
     */
    this.setState({ activeSubmenu: 0 });
    this.submenus.push({ componentName: JoinAudio });
    this.submenus.push({ componentName: AudioSettings });
  }

  handleSubmenuChange(i) {
    this.setState({ activeSubmenu: i });
  }

  renderSubmenu(key) {
    const curr = this.state.activeSubmenu ? 0 : this.state.activeSubmenu;

    const props = {
      changeMenu: this.handleSubmenuChange.bind(this),
      JOIN_AUDIO: this.JOIN_AUDIO,
      AUDIO_SETTINGS: this.AUDIO_SETTINGS,
      LISTEN_ONLY: this.LISTEN_ONLY,
      handleJoinListenOnly: this.props.handleJoinListenOnly,
    };

    const Submenu = this.submenus[key].componentName;
    return <Submenu {...props} />;
  }

  render() {
    return (
      <ModalBase overlayClassName={styles.overlay} className={styles.modal}>
        <div>
          {this.renderSubmenu(this.state.activeSubmenu)}
        </div>
      </ModalBase>
    );
  }
}
