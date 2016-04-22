import React from 'react';
import {Header} from '/imports/ui/main/Header.jsx';
import {Whiteboard} from '/imports/ui/whiteboard/Whiteboard.jsx';
import {Chat} from '/imports/ui/chat/Chat.jsx';

MainContainer = React.createClass({
  render() {
    return (
      <div id="testing">
        <Header />
          <div id="panels">
            <div className="shield"></div>
            <Whiteboard />
            <Chat />
          </div>
      </div>
    );
  }
});
