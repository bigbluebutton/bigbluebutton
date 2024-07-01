import { TLBaseShape, TLDefaultColorStyle } from '@bigbluebutton/tldraw';

export type IPollShape = TLBaseShape<
  'poll',
  {
    w: number,
    h: number,
    color: TLDefaultColorStyle,
    fill: string,
    question: string,
    numRespondents: number,
    numResponders: number,
    questionText: string,
    questionType: string,
    answers: Array<{
      id: number,
      key: string,
      numVotes: number,
    }>,
  }
>
