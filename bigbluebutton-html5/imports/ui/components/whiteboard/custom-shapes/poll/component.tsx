import React from 'react';
import {
  HTMLContainer,
  Rectangle2d,
  ShapeUtil,
  TLOnResizeHandler,
  getDefaultColorTheme,
  resizeBox,
} from '@bigbluebutton/tldraw';
import { pollShapeMigrations } from './poll-shape-migrations';
import { pollShapeProps } from './poll-shape-props';
import { IPollShape } from './poll-shape-types';
import ChatPollContent from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/chat-message/message-content/poll-content/component';

export class PollShapeUtil extends ShapeUtil<IPollShape> {
  static override type = 'poll' as const;

  static override props = pollShapeProps;

  static override migrations = pollShapeMigrations;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override isAspectRatioLocked = (_shape: IPollShape) => false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canResize = (_shape: IPollShape) => true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  override canBind = (_shape: IPollShape) => true;

  getDefaultProps(): IPollShape['props'] {
    return {
      w: 300,
      h: 300,
      color: 'black',
      fill: 'white',
      question: '',
      numRespondents: 0,
      numResponders: 0,
      questionText: '',
      questionType: '',
      answers: [],
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getGeometry(shape: IPollShape) {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IPollShape) {
    const { bounds } = this.editor.getShapeGeometry(shape);
    const theme = getDefaultColorTheme({
      isDarkMode: this.editor.user.getIsDarkMode(),
    });

    const contentRef = React.useRef<HTMLDivElement>(null);
    const pollMetadata = JSON.stringify({
      id: shape.id,
      question: shape.props.question,
      numRespondents: shape.props.numRespondents,
      numResponders: shape.props.numResponders,
      questionText: shape.props.questionText,
      questionType: shape.props.questionType,
      answers: shape.props.answers,
    });

    const adjustedHeight = shape.props.questionText.length > 0 ? bounds.height - 75 : bounds.height;

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          border: '1px solid #8B9AA8',
          borderRadius: '4px',
          boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.20)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all',
          backgroundColor: theme[shape.props.color].semi,
          color: theme[shape.props.color].solid,
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${bounds.width}px`,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <ChatPollContent
            metadata={pollMetadata}
            height={adjustedHeight}
          />
        </div>
      </HTMLContainer>
    );
  }

  // eslint-disable-next-line class-methods-use-this
  indicator(shape: IPollShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }

  override onResize: TLOnResizeHandler<IPollShape> = (shape, info) => {
    return resizeBox(shape, info);
  }
}

export default PollShapeUtil;
