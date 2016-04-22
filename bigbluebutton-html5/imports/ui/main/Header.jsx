import React from 'react';
import {Button} from '../shared/Button.jsx';

export let Header = React.createClass({
  mixins: [ReactMeteorData],
  getMeteorData() {
    let in_audio, whiteboard_title, in_listen_only, is_muted, is_talking;
    in_audio = BBB.amIInAudio();
    whiteboard_title = BBB.currentPresentationName() || 'No active presentation';
    in_listen_only = BBB.amIListenOnlyAudio();
    is_muted = BBB.amIMuted();
    is_talking = BBB.amITalking();
    return {
      is_talking: is_talking,
      is_muted: is_muted,
      in_listen_only: in_listen_only,
      whiteboard_title: whiteboard_title,
      in_audio: in_audio,
    };
  },

  handleLeaveAudioButton(event) {
    return exitVoiceCall(event);
  },

  handleMuteButton(event) {
    $('.tooltip').hide();
    return toggleMic(this);
  },

  handleToggleUserlistButton(event) {
    if (isLandscape() || isLandscapeMobile()) {
      return toggleUsersList();
    } else {
      if ($('.settingsMenu').hasClass('menuOut')) {
        toggleSettingsMenu();
      } else {
        toggleShield();
      }

      return toggleUserlistMenu();
    }
  },

  handleToggleMenuButton(event) {
    if ($('.userlistMenu').hasClass('menuOut')) {
      toggleUserlistMenu();
    } else {
      toggleShield();
    }

    $('.toggleMenuButton').blur();
    return toggleSettingsMenu();
  },

  handleSettingsButton(event) {
    return $('#settingsModal').foundation('reveal', 'open');
  },

  handleSignOutButton(event) {
    $('.signOutIcon').blur();
    return $('#logoutModal').foundation('reveal', 'open');
  },

  render() {
    return (
      <nav id="navbar" className="myNavbar top-bar" role="navigation">
        <Button onClick={this.handleToggleUserlistButton} btn_class=" toggleUserlistButton navbarButton" i_class="ion-navicon" rel="tooltip" title="Toggle Userlist" span={true} notification="all_chats" />
        {this.data.in_audio ?
          <div className="audioNavbarSection">
            {this.data.in_listen_only ?
              <Button onClick={this.handleLeaveAudioButton} btn_class=" navbarButton leaveAudioButton" i_class="icon fi-volume-none" rel="tooltip" title="Exit Audio" />
              : null }
            {this.data.is_muted ?
              <Button onClick={this.handleMuteButton} btn_class=" navbarButton muteIcon" i_class="ion-ios-mic-off" rel="tooltip" title="Unmute" />
            : null }
            {this.data.is_talking ?
              <Button onClick={this.handleMuteButton} btn_class=" navbarButton muteIcon" i_class="ion-ios-mic" rel="tooltip" title="Mute" />
            : <Button onClick={this.handleMuteButton} btn_class=" navbarButton muteIcon" i_class="ion-ios-mic-outline" rel="tooltip" title="Mute"/>
            }
          </div>
        : null }
        <span className="navbarTitle defaultTitle">
          {this.data.whiteboard_title}
        </span>

        <div className="rightNavbarSection">
          <Button onclick={this.handleSettingsButton} id="settingsIcon" btn_class=" settingsIcon navbarButton" i_class="ion-gear-b" rel="tooltip"
          title="BigBlueButton Settings" />
          <Button onclick={this.handleSignOutButton} id="logout" btn_class=" signOutIcon navbarButton" i_class="ion-log-out" rel="tooltip" title="Logout" />
        </div>
        <Button onClick={this.handleToggleMenuButton} btn_class=" toggleMenuButton navbarButton"
        i_class="ion-android-more-vertical" rel="tooltip" title="Toggle Menu" span={true} />
      </nav>
    );
  },
});
