import styled from 'styled-components';
import {
  colorBlueLightest,
  colorBorder,
  colorGrayDark,
  colorGrayLight,
  colorGrayLighter,
  colorPrimary,
  colorWhite,
} from '/imports/ui/stylesheets/styled-components/palette';
import { fontSizeSmall } from '/imports/ui/stylesheets/styled-components/typography';

const THUMB_SIZE = '1.75rem';

// Sits on top of the input box and shares its border, so the box and the
// staged files read as one control.
const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.375rem 0.5rem;
  border: 1px solid ${colorBorder};
  border-bottom: none;
  border-radius: 0.75rem 0.75rem 0 0;
  background-color: ${colorBlueLightest};
  color: ${colorGrayLight};
  font-size: ${fontSizeSmall};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${colorGrayLighter};
  }
`;

const ThumbList = styled.ul`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  list-style: none;
`;

const ThumbItem = styled.li`
  flex-shrink: 0;
  line-height: 0;
`;

const Thumb = styled.img`
  width: ${THUMB_SIZE};
  height: ${THUMB_SIZE};
  border-radius: 0.25rem;
  object-fit: cover;
  display: block;
`;

const FileIcon = styled.span`
  width: ${THUMB_SIZE};
  height: ${THUMB_SIZE};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: ${colorPrimary};
`;

// A thumbnail that removes its file: the X shows on hover and keyboard focus.
const ThumbButton = styled.button`
  position: relative;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  cursor: pointer;
  line-height: 0;

  & > [data-remove-mark] {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    background-color: ${colorGrayDark};
    color: ${colorWhite};
  }

  &:hover > [data-remove-mark],
  &:focus-visible > [data-remove-mark] {
    display: flex;
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 1px;
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const MoreCount = styled.span`
  flex-shrink: 0;
  padding: 0 0.25rem;
  font-size: 1rem;
`;

const FileName = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

const Meta = styled.span`
  flex-shrink: 0;
  margin-left: auto;
  white-space: nowrap;

  [dir="rtl"] & {
    margin-left: 0;
    margin-right: auto;
  }
`;

const RemoveButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: 50%;
  background-color: ${colorGrayLight};
  color: ${colorBlueLightest};
  cursor: pointer;

  &:hover {
    background-color: ${colorGrayDark};
  }

  &:focus-visible {
    outline: 2px solid ${colorPrimary};
    outline-offset: 1px;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: .75;
  }
`;

export default {
  Bar,
  ThumbList,
  ThumbItem,
  Thumb,
  FileIcon,
  ThumbButton,
  MoreCount,
  FileName,
  Meta,
  RemoveButton,
};
