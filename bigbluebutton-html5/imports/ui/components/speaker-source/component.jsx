import React from 'react';

export default class SpeakerSource extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <label htmlFor='speaker'>Speaker source</label><br />
        <select id='speaker' defaultValue='0'>
          <option value='0' disabled>Default</option>
          <option value='1' disabled>1</option>
          <option value='2' disabled>2</option>
          <option value='3' disabled>3</option>
        </select><br />
        <div id='micLabel' hidden>Select speaker source</div>
        <div id='micDesc' hidden>
          Chooses a speaker source from the dropdown menu.</div>
      </div>
    );
  }
};
