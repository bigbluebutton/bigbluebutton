import React from 'react';
import Styled from './styles';

interface SubtitlesProps {
  label: string;
  toggleSubtitle: () => void;
  subtitlesOn: boolean;
}

const Subtitles: React.FC<SubtitlesProps> = ({
  label,
  toggleSubtitle,
  subtitlesOn,
}) => {
  return (
    <Styled.SubtitlesWrapper>
      <Styled.SubtitlesButton
        color={subtitlesOn ? 'primary' : 'default'}
        icon="closed_caption"
        onClick={() => toggleSubtitle()}
        label={label}
        hideLabel
      />
    </Styled.SubtitlesWrapper>
  );
};

export default Subtitles;
