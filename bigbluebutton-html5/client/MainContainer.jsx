import React from 'react';

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
