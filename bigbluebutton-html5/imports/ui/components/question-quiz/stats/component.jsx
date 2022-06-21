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
    const { intl } = this.props
    const pdf = new jsPDF('p', 'mm');
    //adding chart data page
    html2canvas(document.querySelector(".apexcharts-canvas")).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const headingText = intl.formatMessage(intlMessages.questionQuizStatsTitle)
      const pageHeadingX = (pdf.internal.pageSize.getWidth() - pdf.getTextWidth(headingText)) / 2
      const pageHeadingY = 15
      const pageFotterX = 213 - 20
      const pageFotterY = 316 - 30
      const statsImgX = 10
      const statsImgY = 30
      pdf.text(headingText, pageHeadingX, pageHeadingY)
      pdf.page = 1;
      pdf.text(pdf.page + '', pageFotterX, pageFotterY, null, null, "right");
      pdf.addImage(imgData, 'PNG', statsImgX, statsImgY);
      //adding table of responses data page
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
        pdf.save(`Chart_Stats_${today.toLocaleTimeString()}.pdf`);
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

            if (responses) {
              const response = responses.find(r => r.userId === user.userId);
              if (response) {
                const answerKeys = [];
                response.answerIds.forEach((answerId) => {
                  answerKeys.push(answers[answerId].key);
                });
                answer = answerKeys.join(', ');
              }
            }
            return {
              name: user.name,
              answer: answer,
            };
          })

          .sort(Service.sortUsers)
          .reduce((acc, user) => {
            const isCorrectAnswer = QuestionQuizService.isCorrectOption(user.answer)
            const correctOptSymbol = QuestionQuizService.CORRECT_OPTION_SYMBOL
            const resultColString = isCorrectAnswer ?
              intl.formatMessage(intlMessages.questionQuizCorrectLabel) :
              intl.formatMessage(intlMessages.questionQuizIncorrectLabel)
            let responseAnswer = user.answer ? user.answer.trim() : '-'
            responseAnswer = isCorrectAnswer ? responseAnswer.substring(0,
              responseAnswer.length - correctOptSymbol.length) : responseAnswer
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
        this.setState({ quizResponses: userAnswers, quizResult: resultArray})
      }
    })
  }

  questionQuizStatsModal() {
    const { isOpenStatsPreviewModal, quizResponses } = this.state
    const { questionQuizResultData, intl } = this.props
    if (isOpenStatsPreviewModal) {
      const options = [];
      const votesOfOptions = [];
      const question = questionQuizResultData?.questionText
      questionQuizResultData?.answers.forEach((opt) => {
        options.push(opt.key)
        votesOfOptions.push(opt.numVotes)
      })
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
                totalLabel={intl.formatMessage(intlMessages.questionQuizStatsVotesLabel)}
                labels={options} tooltipLabel={intl.formatMessage(intlMessages.questionQuizStatsVotesLabel)}
                titleText={question} chartId={parseInt(chartId)}
                isDownloadPdf={false} isDownloadPngCsvSvg={false} viewTotalCount={true}
                downloadPdfLabel={intl.formatMessage(intlMessages.questionQuizDownloadPdfButtonLabel)} />
              {quizResponses && (
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
