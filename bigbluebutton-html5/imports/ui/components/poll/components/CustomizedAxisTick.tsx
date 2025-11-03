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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizedAxisTick = (props: any) => {
  const { payload, ...restProps } = props;
  const { width, fontSize } = restProps;
  const averageCharWidth = getAverageCharacterWidth(payload.value, 'Source Sans Pro', fontSize) ?? 6;
  const numberOfChars = Math.floor((width - TICK_SIZE) / averageCharWidth);
  const restValue = payload.value.substring(numberOfChars, payload.value.length);

  return (
    <g>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <text {...restProps}>
        {payload.value.substring(0, restValue.length > 0 ? numberOfChars - ELLIPSIS.length : numberOfChars)}
        {restValue.length > 0 && ELLIPSIS}
      </text>
    </g>
  );
};

export default CustomizedAxisTick;
