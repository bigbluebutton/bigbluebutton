import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import fastdom from 'fastdom';
import { injectIntl, defineMessages } from 'react-intl';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import Styled from './styles';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Chart from "react-apexcharts";
import QuestionQuizService from '/imports/ui/components/question-quiz/service'
import {
  questioningsuccessDarkColorCode,
  colorGrayLighter
} from '/imports/ui/stylesheets/styled-components/palette';
import BBBMenu from "/imports/ui/components/common/menu/component";
import Button from '/imports/ui/components/common/button/component';

const propTypes = {
  text: PropTypes.string.isRequired,
  time: PropTypes.number.isRequired,
  lastReadMessageTime: PropTypes.number,
  questionQuizResultData: PropTypes.object,
  handleReadMessage: PropTypes.func.isRequired,
  scrollArea: PropTypes.instanceOf(Element),
  className: PropTypes.string.isRequired,
};

const defaultProps = {
  lastReadMessageTime: 0,
  scrollArea: undefined,
};

const MAX_QUESTION_LENGTH = 60
const MAX_OPTION_LENGTH = 15

const intlMessages = defineMessages({
  questionQuizStatsTitle: {
    id: 'app.questionQuiz.chat.stats.title',
    description: 'Quiz modal stats title label.',
  },
  questionQuizStatsButtonLabel: {
    id: 'app.questionQuiz.chat.quizOptions.label',
    description: 'Quiz more button label.',
  },
  questionQuizStatsMenuButtonTitle: {
    id: 'app.questionQuiz.chat.viewStats.label',
    description: 'Quiz stats menu button title label.',
  },
  questionQuizStatsVotesLabel: {
    id: 'app.questionQuiz.chat.stats.votes.label',
    description: 'Quiz stats votes title label.',
  },
});


const eventsToBeBound = [
  'scroll',
  'resize',
];

const isElementInViewport = (el) => {
  if (!el) return false;
  const rect = el.getBoundingClientRect();

  return (
    rect.top >= 0
    // This condition is for large messages that are bigger than client height
    || rect.top + rect.height >= 0
  );
};

class MessageChatItem extends PureComponent {
  constructor(props) {
    super(props);

    this.ticking = false;
    this.state = {
      isOpenStatsPreviewModal: false,
    }
    this.handleMessageInViewport = _.debounce(this.handleMessageInViewport.bind(this), 50);
    this.setOpenPreviewModal = this.setOpenPreviewModal.bind(this);
    this.questionQuizStatsModal = this.questionQuizStatsModal.bind(this);
    this.renderMoreStatsBtn = this.renderMoreStatsBtn.bind(this);
  }

  componentDidMount() {
    this.listenToUnreadMessages();
    this.questionQuizStatsModal()
  }

  componentDidUpdate(prevProps, prevState) {
    ChatLogger.debug('MessageChatItem::componentDidUpdate::props', { ...this.props }, { ...prevProps });
    ChatLogger.debug('MessageChatItem::componentDidUpdate::state', { ...this.state }, { ...prevState });
    this.listenToUnreadMessages();
  }

  componentWillUnmount() {
    // This was added 3 years ago, but never worked. Leaving it around in case someone returns
    // and decides it needs to be fixed like the one in listenToUnreadMessages()
    // if (!lastReadMessageTime > time) {
    //  return;
    // }
    ChatLogger.debug('MessageChatItem::componentWillUnmount', this.props);
    this.removeScrollListeners();
  }

  addScrollListeners() {
    const {
      scrollArea,
    } = this.props;

    if (scrollArea) {
      eventsToBeBound.forEach(
        e => scrollArea.addEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  handleMessageInViewport() {
    if (!this.ticking) {
      fastdom.measure(() => {
        const node = this.text;
        const {
          handleReadMessage,
          time,
          read,
        } = this.props;

        if (read) {
          this.removeScrollListeners();
          return;
        }

        if (isElementInViewport(node)) {
          handleReadMessage(time);
          this.removeScrollListeners();
        }

        this.ticking = false;
      });
    }

    this.ticking = true;
  }

  removeScrollListeners() {
    const {
      scrollArea,
      read,
    } = this.props;

    if (scrollArea && !read) {
      eventsToBeBound.forEach(
        e => scrollArea.removeEventListener(e, this.handleMessageInViewport),
      );
    }
  }

  renderMoreStatsBtn() {
    const {intl} = this.props
    const opts = [{
      key: intl.formatMessage(intlMessages.questionQuizStatsButtonLabel),
      icon: 'multi_whiteboard',
      dataTest: "quizMoreOptions",
      label: intl.formatMessage(intlMessages.questionQuizStatsMenuButtonTitle),
      onClick: () => {
        this.setOpenPreviewModal()
      }
    }]
    return (
        <BBBMenu
          trigger={
            <Button
              data-test="quizMoreOptionsMenu"
              icon="more"
              size="sm"
              ghost
              circle
              hideLabel
              color="dark"
              label={intl.formatMessage(intlMessages.questionQuizStatsButtonLabel)}
              aria-label={intl.formatMessage(intlMessages.questionQuizStatsButtonLabel)}
              onClick={() => null}
              style={{
                padding:0,
                margin:0,
              }}
            />
          }
          opts={{
            id: "quiz-default-dropdown-menu",
            keepMounted: true,
            transitionDuration: 0,
            elevation: 3,
            getContentAnchorEl: null,
            fullwidth: "true",
            anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
            transformorigin: { vertical: 'bottom', horizontal: 'left' },
          }}
          actions={opts}
          triggerBtnStyles={{height:'fit-content'}}
        />
    );
  }

  questionQuizStatsModal() {
    const { isOpenStatsPreviewModal } = this.state
    const { questionQuizResultData, intl } = this.props
    const options = [];
    const votesOfOptions = [];
    const question = questionQuizResultData?.questionText
    const labelsColors = []
    questionQuizResultData?.answers.forEach((opt) => {
      const isCorrectOpt = QuestionQuizService.isCorrectOption(opt.key)
      options.push(isCorrectOpt ?
        opt.key.trim().replace(QuestionQuizService.CORRECT_OPTION_SYMBOL, " (Correct)") : opt.key)
      votesOfOptions.push({
        y: opt.numVotes,
        x: intl.formatMessage(intlMessages.questionQuizStatsVotesLabel),
        fillColor: isCorrectOpt ?
          questioningsuccessDarkColorCode : colorGrayLighter,
      })
      labelsColors.push(isCorrectOpt ? questioningsuccessDarkColorCode : 'black')
    })
    const chartData = {
      series: [{
        name: intl.formatMessage(intlMessages.questionQuizStatsVotesLabel),
        data: votesOfOptions
      }],
      options: {
        chart: {
          height: 350,
          type: 'bar',
          events: {
            // click: function (chart, w, e) {
            //   console.log(chart, w, e)
            // }
          }
        },
        plotOptions: {
          bar: {
            columnWidth: '45%',
            distributed: true,
          }
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: false
        },
        xaxis: {
          categories: options,
          labels: {
            show: true,
            hideOverlappingLabels: false,
            formatter: function (value) {
              // if(value.length > 20)
              //   return `${value.substring(0,MAX_OPTION_LENGTH)}...`;
              return value
            },
            trim: true,
            style: {
              colors: labelsColors,
              // fontSize: '14px',
            }
          },
          title: {
            text: `Question: ${question?.length > MAX_QUESTION_LENGTH ? 
              question.substring(0, MAX_QUESTION_LENGTH)+'...' : question}`,
            trim: true,
            align: 'center',
            // margin: 3,
            // offsetX: 0,
            // offsetY: -330,
            offsetY: -5,
            floating: true,
            style: {
              whiteSpace:'nowrap',
              textOverflow:'ellipsis',
              overflow:'hidden',
              // fontSize: '15px',
              fontWeight: 'bold',
            },
          },
        },
        tooltip: {
          x: {
            formatter: function(val) {
              return val.length > MAX_OPTION_LENGTH ? 
              val.substring(0, MAX_OPTION_LENGTH) + '...' : val;
            },
            title: {
              formatter: function (seriesName) {
                return ''
              }
            }
          },
        },
        yaxis: [
          {
            labels: {
              formatter: function (val) {
                return val.toFixed(0);
              }
            },
          },
        ]
      },

    }
    return (

      <Modal
        isOpen={isOpenStatsPreviewModal}
        onRequestClose={() => {
          this.setState({
            isOpenStatsPreviewModal: false
          })
        }}
        hideBorder
        data-test="quizStatsModal"
        title={intl.formatMessage(intlMessages.questionQuizStatsTitle)}
      >
        <Styled.PreviewModalContainer>
          <Chart options={chartData.options} series={chartData.series} type="bar" height={350} />

        </Styled.PreviewModalContainer>
      </Modal>

    )
  }

  // depending on whether the message is in viewport or not,
  // either read it or attach a listener
  listenToUnreadMessages() {
    const {
      handleReadMessage,
      time,
      read,
    } = this.props;

    if (read) {
      return;
    }

    const node = this.text;

    fastdom.measure(() => {
      const {
        read: newRead,
      } = this.props;
      // this function is called after so we need to get the updated lastReadMessageTime

      if (newRead) {
        return;
      }

      if (isElementInViewport(node)) { // no need to listen, the message is already in viewport
        handleReadMessage(time);
      } else {
        this.addScrollListeners();
      }
    });
  }

  setOpenPreviewModal() {
    this.setState((prevState) => (
      { ...prevState, isOpenStatsPreviewModal: true}
    ))
  }

  render() {
    const {
      text,
      type,
      className,
      isSystemMessage,
      chatUserMessageItem,
      systemMessageType,
      color,
    } = this.props;
    ChatLogger.debug('MessageChatItem::render', this.props);
    if (type === 'poll') {
      return (
        <p
          className={className}
          style={{ borderLeft: `3px ${color} solid`, whiteSpace: 'pre-wrap' }}
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          data-test="chatPollMessageText"
        />
      );
    }
    else if (type === 'questionQuiz') {
      return (
        <div style={{ borderLeft: `3px ${color} solid`,display:'flex' }}>
          {this.questionQuizStatsModal()}
          <p
            className={className}
            style={{
              whiteSpace: 'pre-wrap',
              // borderBottomLeftRadius: 0, borderBottomRightRadius: 0
            }}
            ref={(ref) => { this.text = ref; }}
            dangerouslySetInnerHTML={{ __html: text }}
            data-test="chatQuizMessageText"
          />
                    {this.renderMoreStatsBtn()}
        </div>
      );
    } else {
      return (
        <p
          className={className}
          ref={(ref) => { this.text = ref; }}
          dangerouslySetInnerHTML={{ __html: text }}
          data-test={isSystemMessage ? systemMessageType : chatUserMessageItem ? 'chatUserMessageText' : ''}
        />
      );
    }
  }
}

MessageChatItem.propTypes = propTypes;
MessageChatItem.defaultProps = defaultProps;

export default injectIntl(MessageChatItem);
