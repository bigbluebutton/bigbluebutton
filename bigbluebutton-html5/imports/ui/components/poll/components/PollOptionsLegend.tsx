import React from 'react';
import Styled from '../styles';

interface PollOptionsLegendProps {
  options: string[];
}

// The options in full, for a chart whose axis had to cut their labels.
const PollOptionsLegend: React.FC<PollOptionsLegendProps> = ({ options }) => (
  <Styled.OptionsLegend data-test="pollOptionsLegend">
    {options.map((option, index) => (
      // Options can repeat (typed answers differing only in case), so the index is the key.
      // eslint-disable-next-line react/no-array-index-key
      <li key={index}>{option}</li>
    ))}
  </Styled.OptionsLegend>
);

export default PollOptionsLegend;
