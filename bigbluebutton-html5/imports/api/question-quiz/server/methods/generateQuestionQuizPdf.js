import pdf from 'html-pdf';
import fs from 'fs';
import Logger from '/imports/startup/server/logger';
import Service from '/imports/api/question-quiz/server/service'
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function generateQuestionQuizPdf(quizId, headerLabel, questionLabel, optionLabel, correctLabel, question,
  options, chartImgBase64Data, statsTableData, isDocRightDirection) {

  try {
    check(quizId, String);
    check(headerLabel, String);
    check(questionLabel, String);
    check(optionLabel, String);
    check(correctLabel, String);
    check(question, String);
    check(options, Array);
    check(chartImgBase64Data, String);
    check(isDocRightDirection, Boolean);
    const { header, rows } = statsTableData
    check(header, Object);
    check(rows, Array);
    const {requesterUserId} = extractCredentials(this.userId);
    const REPORTS_DISK_LOCATION = Service.REPORTS_DISK_LOCATION
    const clientFolderDir = `resources/reports/question-quiz/${requesterUserId}`
    const fileName = `/${quizId}.pdf`
    const fileLocation =`${REPORTS_DISK_LOCATION}/${clientFolderDir}`
    const html = Service.quizPdfGenerationTemplate(headerLabel, questionLabel, optionLabel, correctLabel, question,
      options, chartImgBase64Data, header, rows, isDocRightDirection)
    const pdfOptions = {
      format: 'A4',
      paginationOffset: 1,
      "footer": {
        "height": "2cm",
        "contents": {
          default: '<span style="color: #444;">{{page}}</span>', // fallback value
        }
      },
      "zoomFactor": "0",
    };
    const promise = new Promise((resolve, reject) => {
      const filePath = fileLocation+fileName
      if(fs.existsSync(filePath)){
        Logger.info(`Existing questioning report fetched from: ${filePath}`)
        resolve(clientFolderDir+fileName)
      }
      else{
        pdf.create(html, pdfOptions).toBuffer(function(err, buffer){
          fs.mkdir(fileLocation, { recursive: true }, (err) => {
            if (err) reject(err);
              fs.createWriteStream(filePath).write(buffer)
              Logger.info(`New Questioning report added in directory: ${filePath}`)
              resolve(clientFolderDir+fileName)
          })
        });
      }

    })
    const reslovedPromiseValue = promise.await()
    return reslovedPromiseValue;

  } catch (err) {
    Logger.error(`Question quiz pdf not generated,  ${err.stack}`);
  }
}