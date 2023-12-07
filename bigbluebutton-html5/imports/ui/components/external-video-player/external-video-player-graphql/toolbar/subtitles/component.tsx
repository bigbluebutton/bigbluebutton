import React from 'react';
import Styled from './styles';

interface SubtitlesProps {
  label: string;
  toggleSubtitle: () => void;
}

const Subtitles: React.FC<SubtitlesProps> = ({
  label,
  toggleSubtitle,
}) => {
  return (
    <Styled.SubtitlesWrapper>
      <Styled.SubtitlesButton
        color="primary"
        icon="closed_caption"
        onClick={() => toggleSubtitle()}
        label={label}
        hideLabel
      />
    </Styled.SubtitlesWrapper>
  );
};

export default Subtitles;
