import React, { Component } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { styles } from './styles.scss';
import Button from '../../button/component';

export default class DefaultContent extends Component {
  static handleClick() {
    console.log('dummy handler');
  }

  render() {
    return (
      <TransitionGroup>
        <CSSTransition
          classNames={{
            appear: styles.appear,
            appearActive: styles.appearActive,
          }}
          appear
          enter={false}
          exit={false}
          timeout={{ enter: 400 }}
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
                    label="Small"
                    onClick={DefaultContent.handleClick}
                    size="sm"
                  />&nbsp;
                  <Button
                    label="Medium"
                    onClick={DefaultContent.handleClick}
                  />&nbsp;
                  <Button
                    label="Large"
                    onClick={DefaultContent.handleClick}
                    size="lg"
                  />
                </p>
                <p>
                  <Button
                    label="Default"
                    onClick={DefaultContent.handleClick}
                  />&nbsp;
                  <Button
                    label="Primary"
                    onClick={DefaultContent.handleClick}
                    color="primary"
                  />&nbsp;
                  <Button
                    label="Danger"
                    onClick={DefaultContent.handleClick}
                    color="danger"
                  />&nbsp;
                  <Button
                    label="Success"
                    onClick={DefaultContent.handleClick}
                    color="success"
                  />
                </p>
                <p>
                  <Button
                    label="Default"
                    onClick={DefaultContent.handleClick}
                    ghost
                  />&nbsp;
                  <Button
                    label="Primary"
                    onClick={DefaultContent.handleClick}
                    color="primary"
                    ghost
                  />&nbsp;
                  <Button
                    label="Danger"
                    onClick={DefaultContent.handleClick}
                    color="danger"
                    ghost
                  />&nbsp;
                  <Button
                    label="Success"
                    onClick={DefaultContent.handleClick}
                    color="success"
                    ghost
                  />
                </p>
                <p>
                  <Button
                    label="With Icon"
                    onClick={DefaultContent.handleClick}
                    icon="add"
                  />&nbsp;
                  <Button
                    label="Ghost With Icon"
                    onClick={DefaultContent.handleClick}
                    color="primary"
                    icon="add"
                    ghost
                  />&nbsp;
                  <Button
                    label="Icon Right"
                    onClick={DefaultContent.handleClick}
                    color="danger"
                    icon="add"
                    ghost
                    iconRight
                  />&nbsp;
                  <Button
                    label="Icon Right"
                    onClick={DefaultContent.handleClick}
                    color="success"
                    icon="add"
                    iconRight
                  />
                </p>
                <p>
                  <Button
                    label="Medium"
                    onClick={DefaultContent.handleClick}
                    color="primary"
                    icon="unmute"
                    ghost
                    circle
                  />&nbsp;
                  <Button
                    label="Large"
                    onClick={DefaultContent.handleClick}
                    color="danger"
                    icon="unmute"
                    size="lg"
                    ghost
                    circle
                  /><br />
                  <Button
                    label="Small"
                    onClick={DefaultContent.handleClick}
                    icon="unmute"
                    size="sm"
                    circle
                  />&nbsp;
                  <Button
                    label="Icon Right"
                    onClick={DefaultContent.handleClick}
                    color="success"
                    icon="unmute"
                    size="sm"
                    iconRight
                    circle
                  />
                </p>
              </div>
            </div>
          </div>
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
