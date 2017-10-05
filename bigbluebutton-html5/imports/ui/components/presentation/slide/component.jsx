import React from 'react';
import PropTypes from 'prop-types';

const Slide = (props) => {
  const { imageUri, svgWidth, svgHeight } = props;

  return (
    <g>
      {imageUri ?
        // some pdfs lose a white background color during the conversion to svg
        // their background color is transparent
        // that's why we have a white rectangle covering the whole slide area by default
        <g>
          <rect
            x="1"
            y="1"
            width={svgWidth - 2}
            height={svgHeight - 2}
            fill="white"
          />
          <image
            x="0"
            y="0"
            width={svgWidth}
            height={svgHeight}
            xlinkHref={imageUri}
            strokeWidth="0.8"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          />
        </g>
        : null}
    </g>
  );
};

Slide.propTypes = {
  // Image Uri
  imageUri: PropTypes.string.isRequired,
  // Width of the slide (Svg coordinate system)
  svgWidth: PropTypes.number.isRequired,
  // Height of the slide (Svg coordinate system)
  svgHeight: PropTypes.number.isRequired,
};

export default Slide;
