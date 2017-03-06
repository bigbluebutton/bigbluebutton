import React, { Component, PropTypes } from 'react';
import styles from './styles.scss';
import { FormattedMessage, FormattedDate } from 'react-intl';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Button from '../../button/component';

export default class DefaultContent extends Component {
  handleClick() {
    console.log('dummy handler');
  }

  render() {
    return (
      <ReactCSSTransitionGroup
        transitionName={ {
          appear: styles.appear,
          appearActive: styles.appearActive,
        } }
        transitionAppear={true}
        transitionEnter={true}
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
                  defaultMessage="Welcome {name}! Your presentation will begin shortly..."
                  values={{ name: 'James Bond' }}
                />
                <br/>
                Today is {' '}<FormattedDate value={Date.now()} />
                <br/>
                Here is some button examples
                <br/>
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
                  ghost={true}
                />&nbsp;
                <Button
                  label={'Primary'}
                  onClick={this.handleClick}
                  color={'primary'}
                  ghost={true}
                />&nbsp;
                <Button
                  label={'Danger'}
                  onClick={this.handleClick}
                  color={'danger'}
                  ghost={true}
                />&nbsp;
                <Button
                  label={'Success'}
                  onClick={this.handleClick}
                  color={'success'}
                  ghost={true}
                />
              </p>
              <p>
                <Button
                  label={'With Icon'}
                  onClick={this.handleClick}
                  icon={'circle-add'}
                />&nbsp;
                <Button
                  label={'Ghost With Icon'}
                  onClick={this.handleClick}
                  color={'primary'}
                  icon={'circle-add'}
                  ghost={true}
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'danger'}
                  icon={'circle-add'}
                  ghost={true}
                  iconRight={true}
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'success'}
                  icon={'circle-add'}
                  iconRight={true}
                />
              </p>
              <p>
                <Button
                  label={'Medium'}
                  onClick={this.handleClick}
                  color={'primary'}
                  icon={'audio'}
                  ghost={true}
                  circle={true}
                />&nbsp;
                <Button
                  label={'Large'}
                  onClick={this.handleClick}
                  color={'danger'}
                  icon={'audio'}
                  size={'lg'}
                  ghost={true}
                  circle={true}
                /><br/>
                <Button
                  label={'Small'}
                  onClick={this.handleClick}
                  icon={'audio'}
                  size={'sm'}
                  circle={true}
                />&nbsp;
                <Button
                  label={'Icon Right'}
                  onClick={this.handleClick}
                  color={'success'}
                  icon={'audio'}
                  size={'sm'}
                  iconRight={true}
                  circle={true}
                />
              </p>
            </div>
          </div>
        </div>
      </ReactCSSTransitionGroup>
    );
  }
}
