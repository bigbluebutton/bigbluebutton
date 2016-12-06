import React from 'react';

export default class StreamVolume extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <label htmlFor='audioVolume'>Your audio stream volume</label><br />
        <input style={{ width: '90%' }} type='text' placeholder='volume bar placeholder'
          tabIndex='-1' /><br />
      </div>
    );
  }
};
