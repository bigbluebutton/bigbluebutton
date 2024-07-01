import React from 'react';
import Styled from './styles';

interface ExternalVideoPlayerProgressBarProps {
  loaded: number;
  played: number;
}

const ExternalVideoPlayerProgressBar: React.FC<ExternalVideoPlayerProgressBarProps> = ({
  loaded,
  played,
}) => {
  return (
    <Styled.ProgressBar>
      <Styled.Loaded
        style={{ width: `${(loaded * 100)}%` }}
      >
        <Styled.Played
          style={{ width: `${(played * 100) / loaded}%` }}
        />
      </Styled.Loaded>
    </Styled.ProgressBar>
  );
};

export default ExternalVideoPlayerProgressBar;
