import React from 'react';
import { FormattedMessage } from 'react-intl';
import { TransitionGroup } from 'react-transition-group';
import Settings from '/imports/ui/services/settings';
import Styled from './styles';

export default (props) => {
  const { autoSwapLayout, hidePresentation } = props;
  const { animations } = Settings.application;

  return (
    <TransitionGroup>
      <Styled.Transition
        classNames="transition"
        appear
        enter={false}
        exit={false}
        timeout={{ enter: 400 }}
      >
        <Styled.Content animations={animations}>
          <Styled.DefaultContent hideContent={autoSwapLayout && hidePresentation}>
            <p>
              <FormattedMessage
                id="app.home.greeting"
                description="Message to greet the user."
                defaultMessage="Your presentation will begin shortly..."
              />
              <br />
            </p>
          </Styled.DefaultContent>
        </Styled.Content>
      </Styled.Transition>
    </TransitionGroup>
  );
};
