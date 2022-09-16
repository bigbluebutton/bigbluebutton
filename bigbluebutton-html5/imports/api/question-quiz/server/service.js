const QUIZ_SETTINGS = Meteor.settings.public.questionQuiz;
const CORRECT_OPTION_SYMBOL = QUIZ_SETTINGS.correct_option_symbol;
const REPORTS_DISK_LOCATION = QUIZ_SETTINGS.reports_location;

const isCorrectOption = (opt) => {
  const trimmedOption = opt.trim();
  const trimmedOptLength = trimmedOption.length
  const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
  return (
    (trimmedOptLength > correctOptSymLength &&
    trimmedOption.substring(trimmedOptLength -
    correctOptSymLength) === CORRECT_OPTION_SYMBOL) || 
    (opt.isCorrect)
  )
}

const checkCorrectAnswers = (answers) => {
  answers.forEach((opt, i) => {
    const questionQuizAnswer = answers[i]
    questionQuizAnswer.isCorrect = false;
    if(isCorrectOption(opt.key)){
      questionQuizAnswer.key = questionQuizAnswer.key.substring(0, questionQuizAnswer.key.length - CORRECT_OPTION_SYMBOL.length)
      questionQuizAnswer.isCorrect = true;
    }
  })
  return answers;
}

const generatePrivateChatMessageOfQuestionResult = (messageData, isQuestionQuizPublished) => {
  const {userResponse, answers, messageLabels, question} = messageData
  const isUserNotAttemptedQuiz = userResponse.answerIds.length === 0
  const isUserResponseCorrect = !isUserNotAttemptedQuiz ? userResponse.isCorrect : null
  let correctOptionsStr = ''
  let count = 0
  let message = ''
  let userResponseKeys = ''
  !isUserNotAttemptedQuiz ? 
  userResponse.answerIds.forEach(ansId => userResponseKeys += `${answers[ansId].key}\n`)
  : null
  if(isQuestionQuizPublished){
    answers.map((ans) => {if (ans.isCorrect) correctOptionsStr += (`${count+=1}. ${ans.key}\n`)})
    message = messageLabels && `
      *${messageLabels.headerLabel} ${messageLabels.questionLabel}*
      ${question} \n\n *${messageLabels.correctOptLabel[0]?.toUpperCase() + 
      messageLabels.correctOptLabel.slice(1)} ${messageLabels.optionsLabel}* \n${correctOptionsStr}
      *${messageLabels.responseLabel}* \n${!isUserNotAttemptedQuiz ? userResponseKeys : 
      messageLabels.notAttemptedQuizLabel+'\n'} \n *${messageLabels.questionResultsLabel}*
      ${messageLabels.userAnswerLabel} ${!isUserNotAttemptedQuiz ? isUserResponseCorrect ? messageLabels.correctOptLabel : 
      messageLabels.incorrectOptLabel : messageLabels.notAttemptedQuizLabel}.
    `
  }
  else{
    answers.map((ans) => { correctOptionsStr += (`${count+=1}. ${ans.key}\n`)})
    message = messageLabels && `
      *${messageLabels.headerLabel} ${messageLabels.questionLabel}*
      ${question} \n\n *${messageLabels.optionsLabel}* \n${correctOptionsStr}
      *${messageLabels.statusLabel}* \n${messageLabels.cancelLabel}
    `
  }
  return message;
}

const quizPdfGenerationTemplate = (headerLabel ,questionLabel, optionLabel, correctLabel, question,
  options, chartImgBase64Data, resultTableHeaders, resultTableRows, isDocRightDirection) => {
    const checkIfCorrectOption = (opt) => {
      const trimmedOption = opt.trim();
      const trimmedOptLength = trimmedOption.length
      const correctOptSymLength = CORRECT_OPTION_SYMBOL.length
      return (
        (trimmedOptLength > correctOptSymLength &&
        trimmedOption.substring(trimmedOptLength -
        correctOptSymLength) === CORRECT_OPTION_SYMBOL) || 
        (opt.isCorrect)
      )
    }
    
    const renderOptionsList = () => {
      let optionsListHtmlStr = ""
      options.map((option, i) => {
        const isCorrectOption = checkIfCorrectOption(option)
        option = isCorrectOption ? option.substring(0,
            option.length - CORRECT_OPTION_SYMBOL.length) + ' (' +
            correctLabel + ')' : option
        optionsListHtmlStr = optionsListHtmlStr + (
            `<p key=${i + option.substring(0,10)+'..'} 
            style="font-weight:${isCorrectOption ? `600`:`normal`};">
            ${option}
            </p>`
        )
      })
      return optionsListHtmlStr;
    }

    const renderResultTable = () => {
      let resultTableHtmlStr = ""
      resultTableRows.map((rowData,i) => {
        resultTableHtmlStr = resultTableHtmlStr + (
            `<tr key=${i+rowData.userName}>
                <td>${rowData.userName}</td>
                <td>${rowData.responseAnswer}</td>
                <td>${rowData.result}</td>
            </tr>
            `
        )
      })
      return resultTableHtmlStr;
    }
    return (
      `
      <style>
          table {
              border-collapse: collapse;
              border-spacing: 0;
              width: 100%;
              border: 1px solid #ddd;
          }
          th {
              text-align: left;
              padding: 5px;
              background-color:#0f70d7;
              color:#ffffff
          }
          th, td {
              text-align: left;
              padding: 4px;
              font-size:14px;
          }
          tr:nth-child(even) {
              background-color: #f2f2f2;
          }
          .statsTable {
            margin-top:24px;
          }
          body {
              overflow: hidden; /* Hide scrollbars */
              margin: 8mm 8mm 2mm 8mm;
              font-family: Source Sans Pro, Arial, sans-serif;
              ${isDocRightDirection && 'text-align: right;'}
          }
          .mainHeaderText{
              min-width: 0;
              display: inline-block;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              margin: 0;
              font-weight: 500;
              text-align: center;
              align-self: flex-end;
              margin-bottom:2rem;
              width:100%;
              @media screen and (max-width: 480px) {
              font-size:12px;
              margin-bottom:1rem;
              }
          }
          .statsSubHeading{
              min-width: 0;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              flex: 1;
              margin: 0;
              font-weight: 500;
              text-align: flex-start;
              @media screen and (max-width: 480px) {
              font-size:11px;
              }
          }
          .pdfPage{
              page-break-after: always;
              width: 100%;
              height:100%;
              margin-top:8px;
              padding-top:7px;
          }
          .chartImg{
              object-fit: cover;
              width:90%;
              display: block;
              margin-left: auto;
              margin-right: auto;
              overflow: hidden;
              margin-top:20px;
          }
          p{
            font-size:13px;
          }
      </style>
      <div>
          <div class="pdfPage">
              <h3 class="mainHeaderText">
              ${headerLabel}
              </h3>
              <h4 class="statsSubHeading">
              ${questionLabel}
              </h4>
              <p>${question}</p>
              <h4 class="statsSubHeading">
              ${optionLabel}
              </h4>
              ${renderOptionsList()}
          </div>
          <div class="pdfPage">
              <img src=${chartImgBase64Data} class="chartImg"/>
          </div>
          <table class="statsTable">
              <tr>
                  <th>${resultTableHeaders.col1}</th>
                  <th>${resultTableHeaders.col2}</th>
                  <th>${resultTableHeaders.col3}</th>
              </tr>
              ${renderResultTable()}
          </table>
      </div>
      `
      )
  }

export default {
    checkCorrectAnswers,
    quizPdfGenerationTemplate,
    REPORTS_DISK_LOCATION,
    generatePrivateChatMessageOfQuestionResult
}