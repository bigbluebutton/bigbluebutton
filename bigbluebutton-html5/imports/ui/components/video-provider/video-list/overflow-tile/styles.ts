import styled from 'styled-components';
import {
  colorWhite,
  webcamBackgroundColor,
  webcamPlaceholderBorder,
} from '/imports/ui/stylesheets/styled-components/palette';

const OverflowTileContainer = styled.div<{ isClickable: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 100%;
  background-color: ${webcamBackgroundColor};
  border-radius: 10px;
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  transition: opacity 0.2s ease;

  ${({ isClickable }) => isClickable && `
    &:hover {
      opacity: 0.8;
    }
  `}

  &::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    border: 2px solid ${webcamPlaceholderBorder};
    border-radius: 10px;
  }
`;

const OverflowTileContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  z-index: 1;
  gap: 0.75rem;
`;

const AvatarsContainer = styled.div<{ $count: number }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  width: ${({ $count }) => {
    if ($count === 1) return '50px';
    if ($count === 2) return '78px';
    return '106px';
  }};
`;

const AvatarWrapper = styled.div<{ $index: number }>`
  position: absolute;
  left: ${({ $index }) => $index * 28}px;
  z-index: ${({ $index }) => 3 - $index};
`;

const Avatar = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid ${webcamBackgroundColor};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const AvatarInitials = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${colorWhite};
  user-select: none;
`;

const OverflowText = styled.div`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colorWhite};
  text-align: center;
  user-select: none;
`;

export default {
  OverflowTileContainer,
  OverflowTileContent,
  AvatarsContainer,
  AvatarWrapper,
  Avatar,
  AvatarInitials,
  OverflowText,
};
