import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import Button from '../../button/component';

export default class DefaultContent extends Component {
  handleClick() {
    console.log('dummy handler');
  }

  render() {
    return (
      <CSSTransitionGroup
        transitionName={{
          appear: styles.appear,
          appearActive: styles.appearActive,
        }}
        transitionAppear
        transitionEnter
        transitionLeave={false}
        transitionAppearTimeout={700}
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}
        className={styles.contentWrapper}
      >
        <div className={styles.contentRatio}>
          <div className={styles.content}>
            <div className={styles.defaultContent}>
              <p>
                <FormattedMessage
                  id="app.home.greeting"
                  description="Message to greet the user."
                  defaultMessage="Welcome {0}! Your presentation will begin shortly..."
                  values={{ 0: 'James Bond' }}
                />
                <br />
                Today is {' '}<FormattedDate value={Date.now()} />
                <br />
                Here is some button examples
                <br />
              </p>
              <p>
                <Button
                  label={'Small'}
                  onClick={this.handleClick}
                  size={'sm'}
                />&nbsp;
                <Button
                  label={'Medium'}
                  onClick={this.handleClick}
                />&nbsp;
                <Button
                  label={'Large'}
                  onClick={this.handleClick}
                  size={'lg'}
                />
              </p>
              <p>
                <Button
                  label={'Default'}
                  onClick={this.handleClick}
                />&nbsp;
                <Button
                  label={'Primary'}
                  onClick={this.handleClick}
                  color={'primary'}
                />&nbsp;
                <Button
                  label={'Danger'}
                  onClick={this.handleClick}
                  color={'danger'}
                />&nbsp;
                <Button
                  label={'Success'}
                  onClick={this.handleClick}
                  color={'success'}
                />
              </p>
              <p>
                <Button
                  label={'Default'}
                  onClick={this.handleClick}
                  ghost
                />&nbsp;
                <Button
                  label={'Primary'}
                  onClick={this.handleClick}
                  color={'primary'}
                  ghost
                />&nbsp;
                <Button
                  label={'Danger'}
                  onClick={this.handleClick}
                  color={'danger'}
                  ghost
                />&nbsp;
                <Button
                  label={'Success'}
                  onClick={this.handleClick}
                  color={'success'}
                  ghost
                />
              </p>
              <p>
                <Button
                  label={'With Icon'}
                  onClick={this.handleClick}
                  icon={'add'}
                />&nbsp;
                <Button
                  label={'Ghost With Icon'}
                  onClick={this.handleClick}
                  color={'primary'}
                  icon={'add'}
                  ghost
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'danger'}
                  icon={'add'}
                  ghost
                  iconRight
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'success'}
                  icon={'add'}
                  iconRight
                />
              </p>
              <p>
                <Button
                  label={'Medium'}
                  onClick={this.handleClick}
                  color={'primary'}
                  icon={'unmute'}
                  ghost
                  circle
                />&nbsp;
                <Button
                  label={'Large'}
                  onClick={this.handleClick}
                  color={'danger'}
                  icon={'unmute'}
                  size={'lg'}
                  ghost
                  circle
                /><br />
                <Button
                  label={'Small'}
                  onClick={this.handleClick}
                  icon={'unmute'}
                  size={'sm'}
                  circle
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'success'}
                  icon={'unmute'}
                  size={'sm'}
                  iconRight
                  circle
                />
              </p>
            </div>
          </div>
        </div>
      </CSSTransitionGroup>
    );
  }
}
