import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

interface OverflowTileProps {
  overflowCount: number;
}

const intlMessages = defineMessages({
  overflowUsers: {
    id: 'app.video.overflowUsers',
    description: 'display +overflowCount users label',
  },
});

const OverflowTile: React.FC<OverflowTileProps> = ({ overflowCount }) => {
  const intl = useIntl();

  if (overflowCount <= 0) return null;

  return (
    <Styled.OverflowTileContainer data-test="overflowTile">
      <Styled.OverflowTileContent>
        <Styled.AvatarsContainer>
          {Array.from({ length: 3 }, (_, index) => (
            <Styled.AvatarWrapper key={index} $index={index}>
              <Styled.Avatar $color="#4a148c">
                <Styled.AvatarInitials>
                  Us
                </Styled.AvatarInitials>
              </Styled.Avatar>
            </Styled.AvatarWrapper>
          ))}
        </Styled.AvatarsContainer>
        <Styled.OverflowText>
          {intl.formatMessage(intlMessages.overflowUsers, { overflowCount })}
        </Styled.OverflowText>
      </Styled.OverflowTileContent>
    </Styled.OverflowTileContainer>
  );
};

export default OverflowTile;
