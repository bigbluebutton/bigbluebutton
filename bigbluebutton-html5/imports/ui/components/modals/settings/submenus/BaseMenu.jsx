import React from 'react';
import Modal from 'react-modal';
import Icon from '/imports/ui/components/icon/component';
import Button from '/imports/ui/components/button/component';
import styles from './styles';

export default class BaseMenu extends React.Component {
  constructor(props) {
    super(props);
  }

  getContent() {
    return (<div>parent content</div>);
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <h3 className={styles.submenuTitle}>{this.props.title}</h3>
        <div className={styles.submenuContent}>
          {this.getContent()}
        </div>
      </div>
    );
  }
};
