import React, { Fragment } from 'react';
import Icon from '/imports/ui/components/icon/component';

const SlowConnection = (props) => {
  const { children, iconOnly } = props;

  return (
    <Fragment>
      <Icon iconName="network" />
      {!iconOnly ? (<span>{children}</span>) : null}
    </Fragment>
  );
};

export default SlowConnection;
