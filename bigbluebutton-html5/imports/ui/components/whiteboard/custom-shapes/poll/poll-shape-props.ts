import { DefaultColorStyle, ShapeProps, T } from '@bigbluebutton/tldraw';
import { ICardShape } from './poll-shape-types';

export const pollShapeProps: ShapeProps<ICardShape> = {
  w: T.number,
  h: T.number,
  color: DefaultColorStyle,
  fill: T.string,
  question: T.string,
  numRespondents: T.number,
  numResponders: T.number,
  questionText: T.string,
  questionType: T.string,
  answers: T.any,
};

export default pollShapeProps;
