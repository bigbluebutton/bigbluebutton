import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { injectIntl, defineMessages } from 'react-intl';
import Styled from './styles';
import Modal from '/imports/ui/components/common/modal/simple/component';
import Chart from '/imports/ui/components/common/charts/pie-donut-chart/component';
import html2canvas from 'html2canvas';
import { makeCall } from '/imports/ui/services/api';
import Service from '/imports/ui/components/question-quiz/live-result/service';
import QuestionQuizService from '/imports/ui/components/question-quiz/service'
import BBBMenu from "/imports/ui/components/common/menu/component";

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
    id: 'app.questionQuiz.question.label',
    description: 'title of question'
  },
  optionsTitle: {
    id: 'app.questionQuiz.options.label',
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
          <Styled.MoreStatsButton
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

  getFileFromUrl(dataurl, filename) {
    const link = document.createElement("a");
    link.href = `${dataurl}`
    link.download = filename;
    link.click(); 
  }

  downloadQuizStatsPdf() {
    const isDocRightDirection = (document.dir === "rtl")
    const { quizResult } = this.state
    const {intl, questionQuizResultData} = this.props
    const { questionQuizAnswerIds } = QuestionQuizService
    const options = []
    const question = questionQuizResultData?.questionText
    const headingText = intl.formatMessage(intlMessages.questionQuizStatsTitle)
    const questionTitle = intl.formatMessage(intlMessages.questionTitle)
    const optionsTitle = intl.formatMessage(intlMessages.optionsTitle)
    const correctText = intl.formatMessage(intlMessages.questionQuizCorrectLabel)
    const quizAnswerIdsArray = _.toArray(questionQuizAnswerIds);
    const quizId = questionQuizResultData?.id.split("/").pop()
    const questionShortened = question.substring(0, 15)
    const fileName = `${questionShortened}-${quizId}`
    questionQuizResultData?.answers.forEach((opt, i) => {
      options.push(`${intl.formatMessage(quizAnswerIdsArray[i])}: ${opt.key}`)
    })
    //here i am hiding the overflow to not show in pdf
    document.querySelector(".apexcharts-legend").style.overflow = 'hidden';
    html2canvas(document.querySelector(".apexcharts-canvas")).then((canvas) => {
      const chartImgData = canvas.toDataURL("image/png");
      //making the overflow visible again after downloading
      document.querySelector(".apexcharts-legend").style.overflow = 'auto';
      const statsTableData = {
        rows: quizResult,
        header:{
          col1: intl.formatMessage(intlMessages.usersTitle),
          col2: intl.formatMessage(intlMessages.responsesTitle),
          col3: intl.formatMessage(intlMessages.questionQuizResultsColoumnTitle)
        }
      }
      makeCall('generateQuestionQuizPdf',quizId, headingText ,questionTitle, optionsTitle,
      correctText, question, options, chartImgData, statsTableData, isDocRightDirection)
      .then((res) => {
        const url = res
        this.getFileFromUrl(url,fileName)
      })
    })
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
            resultArray.push({
              userName: user.name,
              responseAnswer,
              result: user.answer ? resultColString :
                intl.formatMessage(intlMessages.notAttemptedQuizLabel)
            })
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
    const percentageAnswerIds = []
    if (isOpenStatsPreviewModal) {
      const options = [];
      const votesOfOptions = [];
      const question = questionQuizResultData?.questionText
      const headingText = intl.formatMessage(intlMessages.questionQuizStatsTitle)
      const totalRespondents = questionQuizResultData?.numRespondents
      const totalResponders = questionQuizResultData?.numResponders
      const notAttemptedUsers = totalRespondents - totalResponders
      const correctText = intl.formatMessage(intlMessages.questionQuizCorrectLabel)
      questionQuizResultData?.answers.forEach((opt, i) => {
        options.push(`${intl.formatMessage(quizAnswerIdsArray[i])}: ${opt.key}`)
        percentageAnswerIds.push(intl.formatMessage(quizAnswerIdsArray[i]))
        votesOfOptions.push(opt.numVotes)
      })
      options.push(intl.formatMessage(intlMessages.notAttemptedQuizLabel))
      votesOfOptions.push(notAttemptedUsers)
      const isQuizId = questionQuizResultData?.id.split('/')
      const chartId = isQuizId?.length > 2 ? isQuizId[2] : isQuizId
      return (
        <div>
          <Modal
            isOpen={isOpenStatsPreviewModal}
            onRequestClose={() => {
              this.setState({
                isOpenStatsPreviewModal: false
              })
            }}
            hideBorder
            data-test="quizStatsModal"
            title={headingText}
          >
            <Styled.DownloadStatsBtn
              data-test="downloadQuizStatsBtn"
              label={intl.formatMessage(intlMessages.questionQuizDownloadPdfButtonLabel)}
              color="primary"
              icon="download"
              onClick={this.downloadQuizStatsPdf}
            />

            <Styled.PreviewModalContainer id="quizStatsContainer">
              <Chart series={votesOfOptions} type='donut'
                totalLabel={intl.formatMessage(intlMessages.questionQuizTotalRespondentsLabel)}
                labels={options} tooltipLabel={intl.formatMessage(intlMessages.questionQuizStatsVotesLabel)}
                titleText={question} chartId={parseInt(chartId)}
                isDownloadPdf={false} isDownloadPngCsvSvg={false} viewTotalCount={true}
                downloadPdfLabel={intl.formatMessage(intlMessages.questionQuizDownloadPdfButtonLabel)}
                totalValue={totalRespondents}
                extra={{ correctText, percentageIds: percentageAnswerIds }} />
              {quizResponses.length > 0 && (
                <table data-test="quizResponsesTable" style={{ margin: 11 }}>
                  <tbody id='quizResultStatsTable'>
                    <tr>
                      <Styled.THeading>{intl.formatMessage(intlMessages.usersTitle)}
                      </Styled.THeading>
                      <Styled.THeading>{intl.formatMessage(intlMessages.responsesTitle)}
                      </Styled.THeading>
                      <Styled.THeading>
                        {intl.formatMessage(intlMessages.questionQuizResultsColoumnTitle)}
                      </Styled.THeading>
                    </tr>
                    {quizResponses}
                  </tbody>
                </table>
              )
              }

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
