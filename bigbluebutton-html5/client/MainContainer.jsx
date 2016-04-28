import React from 'react';
import {Header} from '/imports/ui/main/Header.jsx';
import {Whiteboard} from '/imports/ui/whiteboard/Whiteboard.jsx';
import {ChatComponent} from '/imports/ui/chat/Chat.jsx';

MainContainer = React.createClass({
  handleShield() {
    $('.tooltip').hide();
    toggleShield();
    return closeMenus();
  },

  render() {
    return (
      <div id="testing">
        <Header />
          <div id="panels">
            <div onClick={this.handleShield} className="shield"></div>
            <Whiteboard />
            <ChatComponent />
          </div>
      </div>
    );
  },
});
