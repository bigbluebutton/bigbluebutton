import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QuestionQuizService from '/imports/ui/components/question-quiz/service'
import Chart from "react-apexcharts";
import Styled from './styles';
import html2canvas from 'html2canvas';
import './style'

const propTypes = {
  series: PropTypes.array.isRequired,
  height: PropTypes.number,
  type: PropTypes.string,
  totalLabel: PropTypes.string,
  MAX_OPTION_LENGTH: PropTypes.number,
  legendColors: PropTypes.array,
  labels: PropTypes.array.isRequired,
  tooltipLabel: PropTypes.string,
  titleText: PropTypes.string,
  MAX_TITLE_LENGTH: PropTypes.number,
  chartId: PropTypes.number,
  isDownloadPdf: PropTypes.bool,
  isDownloadPngCsvSvg: PropTypes.bool,
  viewTotalCount: PropTypes.bool,
  downloadPdfLabel: PropTypes.string,
  totalValue: PropTypes.number,
  chartColors: PropTypes.array,
  extra: PropTypes.object
};

const defaultProps = {
  height: 450,
  type: 'donut',
  totalLabel: '',
  MAX_OPTION_LENGTH: 30,
  legendColors: [],
  tooltipLabel: '',
  titleText: '',
  MAX_TITLE_LENGTH: 70,
  chartId: Date.now(),
  isDownloadPdf:false,
  isDownloadPngCsvSvg:false,
  viewTotalCount:true,
  downloadPdfLabel:'',
  chartColors: ['#008FFB','#775dd0','#ff4560',
  '#feb019', '#00e396','#ab814f'],
  extra: null,
  totalValue:null
};

export default class PieChart extends PureComponent {
  constructor(props) {
    super(props);
    this.downloadQuizStatsPdf = this.downloadQuizStatsPdf.bind(this)
    this.getFormattedLegendText = this.getFormattedLegendText.bind(this)
  }

  componentDidMount() {
    const titleSelector = document.querySelector(".apexcharts-title-text")
    if(titleSelector && document.dir === "rtl"){
      titleSelector.style.direction = 'initial';
    }
  }

  downloadQuizStatsPdf() {
    const {chartId} = this.props
    html2canvas(document.querySelector(".apexcharts-canvas")).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const img = document.createElement('a');
      img.href = imgData;
      img.download = `${chartId}.png`;
      img.click();
    });
  }

  getFormattedLegendText(value, optionLength) {
    const {extra} = this.props
    if(!extra?.correctText){
      return value.substring(0, optionLength)+ '...'
    }
    const trimmedVal = value.trim()
    const isCorrectOpt = QuestionQuizService.isCorrectOption(trimmedVal)
    const correctOptSymbol = QuestionQuizService.CORRECT_OPTION_SYMBOL
    const newVal = isCorrectOpt ? trimmedVal.substring(0,
    trimmedVal.length - correctOptSymbol.length): trimmedVal
    const shortenedText = newVal.length > optionLength ?
      newVal.substring(0, optionLength) + '...' : newVal
    return isCorrectOpt ? shortenedText + ` (${extra.correctText})` : shortenedText
  }

  render() {
    const { series, height, type, totalLabel, MAX_OPTION_LENGTH,
      legendColors, labels, tooltipLabel, titleText, MAX_TITLE_LENGTH,
      chartId, isDownloadPdf, isDownloadPngCsvSvg, viewTotalCount, 
      downloadPdfLabel, totalValue, chartColors, extra } = this.props
    const pieChartData = {
      series: series,
      pie: {
        size: 300
      },
      plotOptions: {
        pie: {
          expandOnClick: false,
          customScale: 1,
          // offsetY: -20,
          donut: {
            size: '65%',
            background: 'transparent',
            labels: {
              show: viewTotalCount,
              total: {
                show: viewTotalCount,
                showAlways: viewTotalCount,
                label: totalLabel,
                fontWeight: 'bold',
                formatter: function (obj) {
                  return totalValue ? totalValue : obj?.globals?.total;
               }
              }
            }
          }
        },
      },
      legend: {
        onItemClick: {
          toggleDataSeries: false
        },
        formatter: (value) => {
          return this.getFormattedLegendText(value, MAX_OPTION_LENGTH)
        },
        show: true,
        showForSingleSeries: true,
        showForNullSeries: true,
        showForZeroSeries: true,
        position: 'bottom',
        horizontalAlign: 'left',
        fontSize: '14px',
        floating: false,
        itemMargin: {
          horizontal: 3,
          vertical: 2
        },
        labels: {
          colors: legendColors,
          useSeriesColors: false
        }
        // offsetY: 50
      },
      colors: chartColors,
      labels: labels,
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#111']
        },
        background: {
          enabled: true,
          foreColor: '#fff',
          borderWidth: 0,

        },
        formatter: function (val,opts){
          const percentageIds = extra?.percentageIds
          const roundOffVal = val.toFixed(2)
          const index = opts.seriesIndex
          const MAX_LABEL_LENGTH = 3
          if(percentageIds?.length > 0)
          return (`${percentageIds[index] ? 
          percentageIds[index] : 
          labels[index].length > MAX_LABEL_LENGTH ? 
          labels[index].substring(0,MAX_LABEL_LENGTH)+'...':
          labels[index]}: ${roundOffVal}%`)
          else
          return `${roundOffVal}%`
        }
      },
      grid: {
        padding: {
          top: 8,
          bottom: 8
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `${tooltipLabel}: ${val}`
          },
          title: {
            formatter: function (seriesName) {
              return ''
            }
          }
        }
      },
      title: {
        text: `${titleText?.length > MAX_TITLE_LENGTH ?
          titleText.substring(0, MAX_TITLE_LENGTH) + '...' : titleText}`,
        offsetY: -5,
        style: {
          fontWeight: 'normal',
        }
      },
      chart: {
        id: `${chartId}`,
        width: 480,
        type: type,
        sparkline: {
          enabled: true
        },
        toolbar: {
          show: true,
          tools: {
            download: isDownloadPngCsvSvg
          },
        },
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            itemMargin: {
              horizontal: 0,
              vertical: 0
            },
            offsetY: 0,
            formatter: (value) => {
              return this.getFormattedLegendText(value, MAX_OPTION_LENGTH - 40)
            },
          },
          title: {
            text: [`${titleText?.length > MAX_TITLE_LENGTH - 25 ?
              titleText.substring(0, MAX_TITLE_LENGTH - 25) + '...' : titleText}`]
          }
        },
      },
      {
        breakpoint: 574,
        options: {
          legend: {
            position: 'bottom',
            formatter: (value) => {
              return this.getFormattedLegendText(value, MAX_OPTION_LENGTH - 20)
            },
          },
          title: {
            text: [`${titleText?.length > MAX_TITLE_LENGTH ?
              titleText.substring(0, MAX_TITLE_LENGTH) + '...' : titleText}`]
          }
        }
      }]
    };
    return (
      <div>
        <Chart options={pieChartData} series={pieChartData.series}
        type={type} height={parseInt(height)} />
        <Styled.DownloadStatsBtn
          data-test="downloadStatsBtn"
          label={downloadPdfLabel}
          color="primary"
          icon="download"
          style={{
            maxWidth: '190px',
            margin: '9px',
            display:`${isDownloadPdf ? 'block':'none'}`
          }}
          onClick={this.downloadQuizStatsPdf}
        />
      </div>
    )
  }
}

PieChart.propTypes = propTypes;
PieChart.defaultProps = defaultProps;
