import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, defineMessages } from 'react-intl';
import Styled from './styles';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Chart from '/imports/ui/components/common/charts/pie-donut-chart/component';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';
import { makeCall } from '/imports/ui/services/api';
import Service from '/imports/ui/components/question-quiz/live-result/service';
import 'jspdf-autotable'
import QuestionQuizService from '/imports/ui/components/question-quiz/service'
import BBBMenu from "/imports/ui/components/common/menu/component";
import Button from '/imports/ui/components/common/button/component';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  usernames: PropTypes.object,
  questionQuizResultData: PropTypes.object,
};

const calYPaddingOfText = (text, pageMaxWidth, pdf) => {
  const { w: lineWidth, h: lineHeight } = pdf.getTextDimensions(text)
  const floatLines = lineWidth / pageMaxWidth
  let numOfLines = Number.isInteger(floatLines) ?
    floatLines : Math.floor(floatLines) + 1
  numOfLines = numOfLines < 2 ? numOfLines + 1 : numOfLines
  const Ypadding = (numOfLines * (lineHeight + 2))
  return Ypadding
}
const intlMessages = defineMessages({
  questionQuizStatsTitle: {
    id: 'app.questionQuiz.chat.stats.title',
    description: 'Quiz modal stats title label.',
  },
  questionQuizStatsButtonLabel: {
    id: 'app.questionQuiz.chat.quizOptions.label',
    description: 'Quiz more button label.',
  },
  questionQuizDownloadPdfButtonLabel: {
    id: 'app.questionQuiz.chat.stats.download.label',
    description: 'Quiz stats download button label.',
  },
  questionQuizStatsMenuButtonTitle: {
    id: 'app.questionQuiz.chat.viewStats.label',
    description: 'Quiz stats menu button title label.',
  },
  questionQuizStatsVotesLabel: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'Quiz stats votes title label.',
  },
  questionQuizTotalRespondentsLabel: {
    id: 'app.questionQuiz.responses.total.title',
    description: 'Quiz stats respondents total label.',
  },
  usersTitle: {
    id: 'app.poll.liveResult.usersTitle',
    description: 'heading label for poll users',
  },
  responsesTitle: {
    id: 'app.poll.liveResult.responsesTitle',
    description: 'heading label for poll responses',
  },
  questionQuizResultsColoumnTitle: {
    id: 'app.chat.questionQuizResult',
    description: 'Quiz results coloumn lable',
  },
  questionQuizCorrectLabel: {
    id: 'app.questionQuiz.correctOptionLabel',
    description: 'Quiz results correct lable',
  },
  questionQuizIncorrectLabel: {
    id: 'app.questionQuiz.incorrectOptionLabel',
    description: 'Quiz results incorrect lable',
  },
  notAttemptedQuizLabel: {
    id: 'app.questionQuiz.chat.notAttempted.label',
    description: 'Quiz results not attempted lable',
  },
  questionTitle: {
    id: 'playback.player.chat.message.poll.question',
    description: 'title of question'
  },
  optionsTitle: {
    id: 'playback.player.chat.message.poll.options',
    description: 'Title for quiz options'
  }
});


class QuestionQuizStats extends PureComponent {
  constructor(props) {
    super(props);
    this._isMounted = false;
    this.state = {
      isOpenStatsPreviewModal: false,
      quizResponses: [],
      quizResult: [],
    }
    this.setOpenPreviewModal = this.setOpenPreviewModal.bind(this);
    this.questionQuizStatsModal = this.questionQuizStatsModal.bind(this);
    this.renderMoreStatsBtn = this.renderMoreStatsBtn.bind(this);
    this.downloadQuizStatsPdf = this.downloadQuizStatsPdf.bind(this)
  }

  componentDidMount() {
    this.getQuizLiveResultResponses()
  }

  componentWillUnmount() {
    this._isMounted = false;
  }
  renderMoreStatsBtn() {
    const { intl } = this.props
    const opts = [{
      key: intl.formatMessage(intlMessages.questionQuizStatsButtonLabel),
      icon: 'multi_whiteboard',
      dataTest: "statsViewOption",
      label: intl.formatMessage(intlMessages.questionQuizStatsMenuButtonTitle),
      onClick: this.setOpenPreviewModal
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
              padding: 0,
              margin: 0,
              position: 'absolute',
              right: 0,
              top: -3
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
        triggerBtnStyles={{ height: 'fit-content' }}
      />
    );
  }

  downloadQuizStatsPdf() {
    const { quizResult } = this.state
    const { intl, questionQuizResultData } = this.props
    const question = questionQuizResultData?.questionText
    const options = questionQuizResultData?.answers
    const pdf = new jsPDF('p', 'mm');
    const { CORRECT_OPTION_SYMBOL, questionQuizAnswerIds } = QuestionQuizService
    const quizAnswerIdsArray = _.toArray(questionQuizAnswerIds);
    //adding chart data page
    html2canvas(document.querySelector(".apexcharts-canvas")).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const fontSize = 11
      const headingText = intl.formatMessage(intlMessages.questionQuizStatsTitle)
      const pageHeadingX = (pdf.internal.pageSize.getWidth() - pdf.getTextWidth(headingText)) / 2
      const pageHeadingY = 15
      const pageFotterX = 213 - 20
      const pageFotterY = 316 - 30
      const statsImgX = 10
      const statsImgY = 30
      const YspaceAfterText = 10
      const Xpadding = 10
      let Ypadding = 8
      const pageMaxWidth = 185
      // pdf.setFont('Source Sans Pro', 'normal')
      pdf.text(headingText, pageHeadingX, pageHeadingY)
      pdf.page = 1;
      pdf.setFontSize(fontSize)
      pdf.text(pdf.page + '', pageFotterX, pageFotterY, null, null, "right");
      //First page containing question and options
      Ypadding = statsImgY
      pdf.setFont(undefined, 'bold').text(intl.formatMessage(intlMessages.questionTitle), Xpadding,
      Ypadding).setFont(undefined, 'normal')
      Ypadding = Ypadding + YspaceAfterText
      pdf.text(question, Xpadding, Ypadding, { maxWidth: pageMaxWidth })
      Ypadding = Ypadding + calYPaddingOfText(question, pageMaxWidth, pdf)
      pdf.setFont(undefined, 'bold').text(intl.formatMessage(intlMessages.optionsTitle), Xpadding,
        Ypadding).setFont(undefined, 'normal')
      Ypadding = Ypadding + YspaceAfterText
      options.map((opt, index) => {
        let option = `${intl.formatMessage(quizAnswerIdsArray[index])}: ${opt.key}`
        const isCorrectOption = QuestionQuizService.isCorrectOption(option)
        option = isCorrectOption ? option.substring(0,
          option.length - CORRECT_OPTION_SYMBOL.length) + ' (' +
          intl.formatMessage(intlMessages.questionQuizCorrectLabel) + ')' : option
        pdf.text(option, Xpadding, Ypadding, { maxWidth: pageMaxWidth })
        Ypadding = calYPaddingOfText(option, pageMaxWidth, pdf) + Ypadding
      })

      //Second page for graphical stats
      pdf.addPage();
      pdf.page++;
      pdf.text(pdf.page + '', pageFotterX, pageFotterY, null, null, "right");
      pdf.addImage(imgData, 'PNG', statsImgX, statsImgY);

      //adding table of responses data pages
      html2canvas(document.querySelector("#quizResultStatsTable")).then((canvas) => {
        pdf.addPage();
        pdf.page++;
        pdf.text(pdf.page + '', pageFotterX, pageFotterY, null, null, "right");
        pdf.autoTable({
          head: [[intl.formatMessage(intlMessages.usersTitle),
          intl.formatMessage(intlMessages.responsesTitle),
          intl.formatMessage(intlMessages.questionQuizResultsColoumnTitle)]],
          body: quizResult,
        })
        const timeElapsed = Date.now();
        const today = new Date(timeElapsed);
        pdf.save(`${headingText.split(" ").join('-')}-${today.toLocaleTimeString()
          .replace("AM", "").replace("PM", "").trim()}.pdf`);
      });
    });
  }

  getQuizLiveResultResponses() {
    const { questionQuizResultData, usernames, intl } = this.props
    this._isMounted = true;
    const answers = questionQuizResultData?.answers
    const id = questionQuizResultData?.id
    makeCall('getQuestionQuizResponses', id).then((res) => {
      if (this._isMounted) {
        const responses = res
        const users = [];
        const resultArray = []
        Object.keys(usernames ? usernames : []).forEach(key => users.push(key));
        const userAnswers = [...users].map(id => usernames[id])
          .map((user) => {
            let answer = '';
            const answerIds = []
            if (responses) {
              const response = responses.find(r => r.userId === user.userId);
              if (response) {
                const answerKeys = [];
                response.answerIds.forEach((answerId) => {
                  answerKeys.push(answers[answerId].key);
                  answerIds.push(answerId)
                });
                answer = answerKeys.join(', ');
              }
            }
            return {
              name: user.name,
              answer: answer,
              answerIds: answerIds
            };
          })

          .sort(Service.sortUsers)
          .reduce((acc, user) => {
            const isCorrectAnswer = QuestionQuizService.isCorrectOption(user.answer)
            const { questionQuizAnswerIds } = QuestionQuizService
            const quizAnswerIdsArray = _.toArray(questionQuizAnswerIds);
            const resultColString = isCorrectAnswer ?
              intl.formatMessage(intlMessages.questionQuizCorrectLabel) :
              intl.formatMessage(intlMessages.questionQuizIncorrectLabel)
            const answerIds = []
            let responseAnswer = user.answerIds.forEach((id) => {
              answerIds.push(intl.formatMessage(quizAnswerIdsArray[id]))
            })
            responseAnswer = answerIds.length > 0 ? answerIds.join(',') : '-'
            resultArray.push([
              user.name,
              responseAnswer,
              user.answer ? resultColString :
                intl.formatMessage(intlMessages.notAttemptedQuizLabel)
            ])
            return ([
              ...acc,
              (
                <Styled.Trow isCorrect={isCorrectAnswer} key={_.uniqueId('quiz-stats-')}>
                  <Styled.ResultLeft>{user.name}</Styled.ResultLeft>
                  <Styled.ResultRight data-test="userAnswer">
                    {responseAnswer}
                  </Styled.ResultRight>
                  <Styled.FinalResult responseAnswer={user.answer}
                    isCorrect={isCorrectAnswer} data-test="quizResult">
                    {user.answer ? resultColString :
                      intl.formatMessage(intlMessages.notAttemptedQuizLabel)}
                  </Styled.FinalResult>
                </Styled.Trow>
              ),
            ]);
          }, []);
        this.setState({ quizResponses: userAnswers, quizResult: resultArray })
      }
    })
  }

  questionQuizStatsModal() {
    const { isOpenStatsPreviewModal, quizResponses } = this.state
    const { questionQuizResultData, intl } = this.props
    const { questionQuizAnswerIds } = QuestionQuizService
    const quizAnswerIdsArray = _.toArray(questionQuizAnswerIds);
    if (isOpenStatsPreviewModal) {
      const options = [];
      const votesOfOptions = [];
      const question = questionQuizResultData?.questionText
      const totalRespondents = questionQuizResultData?.numRespondents
      const totalResponders = questionQuizResultData?.numResponders
      const notAttemptedUsers = totalRespondents - totalResponders
      const correctText = intl.formatMessage(intlMessages.questionQuizCorrectLabel)
      questionQuizResultData?.answers.forEach((opt, i) => {
        options.push(`${intl.formatMessage(quizAnswerIdsArray[i])}: ${opt.key}`)
        votesOfOptions.push(opt.numVotes)
      })
      options.push(intl.formatMessage(intlMessages.notAttemptedQuizLabel))
      votesOfOptions.push(notAttemptedUsers)
      const isQuizId = questionQuizResultData?.id.split('/')
      const chartId = isQuizId?.length > 2 ? isQuizId[2] : isQuizId
      return (
        <div id="quizStatsContainer" >
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
              <Chart series={votesOfOptions} type='donut'
                totalLabel={intl.formatMessage(intlMessages.questionQuizTotalRespondentsLabel)}
                labels={options} tooltipLabel={intl.formatMessage(intlMessages.questionQuizStatsVotesLabel)}
                titleText={question} chartId={parseInt(chartId)}
                isDownloadPdf={false} isDownloadPngCsvSvg={false} viewTotalCount={true}
                downloadPdfLabel={intl.formatMessage(intlMessages.questionQuizDownloadPdfButtonLabel)}
                totalValue={totalRespondents}
                extra={{ correctText }} />
              {quizResponses.length > 0 && (
                <table data-test="quizResponsesTable" style={{ marginTop: 12, marginLeft: 10 }}>
                  <tbody id='quizResultStatsTable'>
                    <tr>
                      <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}
                      </Styled.THeading>
                      <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}
                      </Styled.THeading>
                      <Styled.THeading>{intl.formatMessage(intlMessages.questionQuizResultsColoumnTitle)}
                      </Styled.THeading>
                    </tr>
                    {quizResponses}
                  </tbody>
                </table>
              )
              }
              <Styled.DownloadStatsBtn
                data-test="downloadQuizStatsBtn"
                label={intl.formatMessage(intlMessages.questionQuizDownloadPdfButtonLabel)}
                color="primary"
                icon="download"
                style={{
                  maxWidth: '190px',
                  margin: '9px',
                }}
                onClick={this.downloadQuizStatsPdf}
              />
            </Styled.PreviewModalContainer>
          </Modal>
        </div>
      )
    }
  }

  setOpenPreviewModal() {
    this.setState({ isOpenStatsPreviewModal: true })
  }

  render() {
    return (
      <>
        {this.questionQuizStatsModal()}
        {this.renderMoreStatsBtn()}
      </>
    )
  }
}

QuestionQuizStats.propTypes = propTypes;

export default injectIntl(QuestionQuizStats);
