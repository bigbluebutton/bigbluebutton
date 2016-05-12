import React from 'react';

export default class DeskshareComponent extends React.Component {
  render() {
    return (
      <video style={{ position: 'absolute', left: '50%', right: '25%', zIndex: '1' }} controls/>
    );
  }
};
