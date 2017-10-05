import React from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import VideoDock from './component';

const propTypes = {
  updateData: PropTypes.func.isRequired,
  children: PropTypes.node,
};

const defaultProps = {
  children: null,
};

const VideoDockContainer = props =>
  (
    <div>
      <VideoDock updateData={props.updateData}>
        {props.children}
      </VideoDock>
    </div>
  );

VideoDockContainer.propTypes = propTypes;
VideoDockContainer.defaultProps = defaultProps;

export default createContainer(() => {
  const data = {};
  return data;
}, VideoDockContainer);
