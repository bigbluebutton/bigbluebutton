import React from 'react';
import Styled from './styles';

const STATS = {
  critical: {
    bars: 1,
  },
  danger: {
    bars: 2,
  },
  warning: {
    bars: 3,
  },
  normal: {
    bars: 4,
  },
};

const Icon = ({ level, grayscale }) => (
  <>
    <Styled.SignalBars level={level} grayscale={grayscale}>
      <Styled.FirstBar />
      <Styled.SecondBar active={STATS[level].bars >= 2} />
      <Styled.ThirdBar active={STATS[level].bars >= 3} />
      <Styled.FourthBar active={STATS[level].bars >= 4} />
    </Styled.SignalBars>
  </>
);

export default Icon;
