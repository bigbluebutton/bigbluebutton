import styled, { css } from 'styled-components';
import {
  colorOffWhite,
  colorWhite,
  colorPrimary,
  colorGray,
  colorGrayLighter,
  colorGrayLightest,
  toolbarButtonColor,
} from '/imports/ui/stylesheets/styled-components/palette';
import {
  borderSize,
  smPaddingY,
  whiteboardToolbarMargin,
} from '/imports/ui/stylesheets/styled-components/general';

const Trigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 0;
  background-color: ${colorOffWhite};
  color: ${toolbarButtonColor};
  font: inherit;
  white-space: nowrap;
  cursor: pointer;
  padding: 0.25rem ${smPaddingY} 0.25rem 0.5rem;
  margin: ${borderSize};
  margin-left: ${whiteboardToolbarMargin};
  border-radius: 4px;

  [dir="rtl"] & {
    margin: ${borderSize};
    margin-right: ${whiteboardToolbarMargin};
    padding: 0.25rem 0.5rem 0.25rem ${smPaddingY};
  }

  &:hover:not(:disabled),
  &[aria-expanded="true"] {
    background-color: #DCE4EC;
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px #cdd6e0, 0 0 0 3px ${colorPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TriggerTotal = styled.span`
  color: ${colorGrayLighter};
`;

const Caret = styled.span<{ $open: boolean }>`
  display: inline-block;
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 5px solid currentColor;
  transition: transform 120ms ease;
  ${({ $open }) => $open && css`transform: rotate(180deg);`}
`;

const Popover = styled.div`
  position: fixed;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background-color: ${colorWhite};
  border: 1px solid ${colorGrayLightest};
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(16, 33, 51, 0.22);
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0.85rem;
  border-bottom: 1px solid ${colorGrayLightest};
  color: ${colorGray};
  font-size: 0.9rem;
`;

const HeaderTitle = styled.span`
  font-weight: 600;
`;

const HeaderCount = styled.span`
  color: ${colorGrayLighter};
  font-size: 0.8rem;
`;

const Grid = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0.75rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(124px, 1fr));
  gap: 0.75rem;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

const Tile = styled.button<{ $current: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.3rem;
  width: 100%;
  padding: 4px;
  border: 2px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: ${colorGray};
  font: inherit;
  cursor: pointer;

  &:hover {
    background-color: ${colorOffWhite};
  }

  &:focus-visible {
    outline: none;
    border-color: ${colorGrayLighter};
    background-color: ${colorOffWhite};
  }

  ${({ $current }) => $current && css`
    border-color: ${colorPrimary};
    color: ${colorPrimary};

    &:focus-visible {
      border-color: ${colorPrimary};
    }
  `}
`;

const ThumbFrame = styled.span`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 10;
  background-color: ${colorOffWhite};
  border: 1px solid ${colorGrayLightest};
  border-radius: 3px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    background-color: ${colorWhite};
  }
`;

const ThumbPlaceholder = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colorGrayLighter};
`;

const TileLabel = styled.span`
  font-size: 0.8rem;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default {
  Trigger,
  TriggerTotal,
  Caret,
  Popover,
  Header,
  HeaderTitle,
  HeaderCount,
  Grid,
  Tile,
  ThumbFrame,
  ThumbPlaceholder,
  TileLabel,
};
