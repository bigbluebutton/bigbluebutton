import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import Button from '/imports/ui/components/button/component';
import classNames from 'classnames';
import styles from './styles';
import DropdownContent from './DropdownContent';


export default class Dropdown extends Component {

  constructor(props) {
    super(props);
    this.state = { isMenuOpen: false, };
    this.showMenu = this.showMenu.bind(this);
    this.hideMenu = this.hideMenu.bind(this);
  }

  componentDidMount () {
    window.addEventListener( 'click', this.onWindowClick.bind(this) );
  }

  componentWillUnmount () {
    window.removeEventListener( 'click', this.onWindowClick.bind(this) );
  }

  showMenu() {
    this.setState({ isMenuOpen: !this.state.isMenuOpen, });
  }

  hideMenu() {
    this.setState({ isMenuOpen: false, });
  }

  onWindowClick(event) {
    const dropdown_element = ReactDOM.findDOMNode(this);

    if(event.target!== dropdown_element && !dropdown_element.contains(event.target)) {
      this.hideMenu();
    }
  }

  render() {
    const { styleName, icon, label } = this.props;
    return (
      <div>
        <Button className={styles.settingBtn}
                role='button'
                label={label}
                icon={icon}
                ghost={true}
                circle={true}
                hideLabel={true}
                onClick={this.showMenu}
                ref='menuBtn'/>
        { this.state.isMenuOpen ?
          <DropdownContent /> : null
        }
      </div>
    );
  }
}
