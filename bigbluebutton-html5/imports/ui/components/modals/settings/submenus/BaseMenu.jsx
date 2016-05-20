import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (<div>parent content</div>);
  }

  render() {
    return (
      <div>
        <h3 className="mediumFont">{this.props.title}</h3>
        <div className="smallFont">
          {this.getContent()}
        </div>
      </div>
    );
  }
};
