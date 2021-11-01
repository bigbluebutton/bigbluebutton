import styled from 'styled-components';
import { colorPrimary } from '/imports/ui/stylesheets/styled-components/palette';
import { smallOnly } from '/imports/ui/stylesheets/styled-components/breakpoints';

const StarRating = styled.div`
  font-family: 'bbb-icons' !important;
  & > fieldset {
    border: none;
    display: inline-block;

    &:not(:checked) {
      & > input {
        position: absolute;
        top: -9999px;
        clip: rect(0,0,0,0);
      }

      & > label {
        float: right;
        width: 1em;
        padding: 0 .05em 0 .1rem;
        overflow: hidden;
        white-space: nowrap;
        cursor: pointer;
        font-size: 2.5rem;
        color: black;
        font-weight: 100;

        [dir="rtl"] & {
          padding: 0 .1rem 0 .05em;
        }

        @media ${smallOnly} {
          font-size: 2rem;
        }

        &:before {
          content: '\\e951';
        }

        &:hover,
        &:hover ~ label {
          color: ${colorPrimary};
          text-shadow: 0 0 3px ${colorPrimary};
          &:before {
            content: '\\e951';
          }
        }
      }
    }

    & > input:checked {
      & ~ label {
        &:before {
          content: '\\e952';
          color: ${colorPrimary};
        }
      }
    }

    & > label:active {
      position: relative;
      top: 2px;
    }
  }
`;

const Legend = styled.legend`
  font-family: Arial, sans-serif;
  font-weight: normal;
`;

export default {
  StarRating,
  Legend,
};
