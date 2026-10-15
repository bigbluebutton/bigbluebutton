import React from 'react';

function getAverageCharacterWidth(text: string, font: string, fontSize: number) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  ctx.font = `normal ${fontSize}px ${font}`;

  const textWidth = ctx.measureText(text).width;
  const averageAdvance = textWidth / text.length;

  return averageAdvance;
}

const TICK_SIZE = 6;
const ELLIPSIS = '...';

// The label as it fits an axis of the given width: cut, with an ellipsis, when too long.
const getAxisLabel = (value: string, width: number, fontSize: number) => {
  const averageCharWidth = getAverageCharacterWidth(value, 'Source Sans Pro', fontSize) ?? 6;
  const numberOfChars = Math.floor((width - TICK_SIZE) / averageCharWidth);
  if (value.length <= numberOfChars) return value;
  return `${value.substring(0, numberOfChars - ELLIPSIS.length)}${ELLIPSIS}`;
};

export const isAxisLabelCut = (
  value: string,
  width: number,
  fontSize: number,
) => getAxisLabel(value, width, fontSize) !== value;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizedAxisTick = (props: any) => {
  const { payload, ...restProps } = props;
  const { width, fontSize } = restProps;

  return (
    <g>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <text {...restProps}>
        {getAxisLabel(payload.value, width, fontSize)}
      </text>
    </g>
  );
};

export default CustomizedAxisTick;
