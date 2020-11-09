import React from 'react';
import PropTypes from 'prop-types';

const Slide = ({ name, image }) => (
  <li className="p-3 bg-gray-200 hover:bg-gray-300">
    <a href="/#">
      {name}
      <img className="mx-auto" src={image} alt="" />
    </a>
  </li>
);

Slide.propTypes = {
  name: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default Slide;
