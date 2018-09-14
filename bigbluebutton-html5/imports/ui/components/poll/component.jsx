import React, { Component } from 'react';
import { Link } from 'react-router';
import Button from '/imports/ui/components/button/component';
import Icon from '/imports/ui/components/icon/component';
import { styles } from './styles.scss';

class Poll extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customPoll: false,
    };

    this.toggleCustomFields = this.toggleCustomFields.bind(this);
    this.yesno = this.yesno.bind(this);
  }

  toggleCustomFields() {
    if (this.state.customPoll) this.setState({ customPoll: false });
    if (!this.state.customPoll) this.setState({ customPoll: true });
  }

  yesno() {
    alert('yes /no');
  }

  render() {
    return (
      <div className={styles.pollmenu}>
        <header>
          <div>
            <Link
              to="/users"
              role="button"
              aria-label="hide poll menu"
            >
              <Icon iconName="left_arrow" /> <span>Polling</span>
            </Link>
          </div>
        </header>

        <div>Select a quick polling option to start your poll.</div>
        <div>
          <Button onClick={this.yesno}>Yes / No</Button><Button>True / False</Button>
          <Button>A/B</Button><Button>A/B/C</Button>
          <Button>A/B/C/D</Button><Button>A/B/C/D/E</Button>
        </div>
        <div>To create a custom poll, select the button below and input your options.</div>
        <Button onClick={this.toggleCustomFields}>Custom Poll</Button>
        {!this.state.customPoll ? null : (
          <div>
            <input />
            <input />
            <input />
            <input />
            <input />
            <Button>Start Custom Poll</Button>
          </div>
                    )
                }
      </div>
    );
  }
}

export default Poll;

// Poll.propTypes = {};
