import React from 'react';
import PropTypes from 'prop-types';

const Slide = ({ name, image }) => (
  <li className="p-3">
    <a href="/#">
      {name}
      <img src={image} alt="" />
    </a>
  </li>
);

Slide.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default Slide;
