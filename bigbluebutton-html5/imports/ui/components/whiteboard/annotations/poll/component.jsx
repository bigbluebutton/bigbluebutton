import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PollService from '/imports/ui/components/poll/service';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './styles';

const intlMessages = defineMessages({
  pollResultAria: {
    id: 'app.whiteboard.annotations.pollResult',
    description: 'aria label used in poll result string',
  },
});

class PollDrawComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      // flag indicating whether we need to continue calculating the sizes or display the annotation
      prepareToDisplay: true,

      // outer (white) rectangle's coordinates and sizes (calculated in componentWillMount)
      outerRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },

      // inner rectangle's coordinates and sizes
      innerRect: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
      thickness: 0,
      backgroundColor: '#ffffff',

      // max line sizes
      maxLineWidth: 0,
      maxLineHeight: 0,

      // max widths of the keys (left) and percent (right) strings
      maxLeftWidth: 0,
      maxRightWidth: 0,

      // these parameters are used in calculations before and while displaying the final result
      maxNumVotes: 0,
      textArray: [],
      maxDigitWidth: 0,
      maxDigitHeight: 0,

      // start value used for font-size calculations
      calcFontSize: 50,
      currentLine: 0,
      lineToMeasure: [],
      fontSizeDirection: 1,
    };
  }

  componentWillMount() {
    // in this part we retrieve the props and perform initial calculations for the state
    // calculating only the parts which have to be done just once and don't require
    // rendering / rerendering the text objects

    const { annotation } = this.props;
    const { points, result } = annotation;
    const { slideWidth, slideHeight, intl } = this.props;

    // x1 and y1 - coordinates of the top left corner of the annotation
    // initial width and height are the width and height of the annotation
    // all the points are given as percentages of the slide
    const x1 = points[0];
    const y1 = points[1];
    const initialWidth = points[2];
    const initialHeight = points[3];

    // calculating the data for the outer rectangle
    // 0.001 is needed to accomodate bottom and right borders of the annotation
    const x = (x1 / 100) * slideWidth;
    const y = (y1 / 100) * slideHeight;
    const width = ((initialWidth - 0.001) / 100) * slideWidth;
    const height = ((initialHeight - 0.001) / 100) * slideHeight;

    let votesTotal = 0;
    let maxNumVotes = 0;
    const textArray = [];

    // counting the total number of votes, finding the biggest number of votes
    result.reduce((previousValue, currentValue) => {
      votesTotal = previousValue + currentValue.numVotes;
      if (maxNumVotes < currentValue.numVotes) {
        maxNumVotes = currentValue.numVotes;
      }

      return votesTotal;
    }, 0);

    // filling the textArray with data to display
    // adding value of the iterator to each line needed to create unique
    // keys while rendering at the end
    const arrayLength = result.length;
    for (let i = 0; i < arrayLength; i += 1) {
      const _tempArray = [];
      const _result = result[i];
      let isDefaultPoll;
      switch (_result.key.toLowerCase()) {
        case 'true':
        case 'false':
        case 'yes':
        case 'no':
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
          isDefaultPoll = true;
          break;
        default:
          isDefaultPoll = false;
          break;
      }

      if (isDefaultPoll) {
        _result.key = intl.formatMessage({ id: `app.poll.answer.${_result.key.toLowerCase()}` });
      }

      _tempArray.push(_result.key, `${_result.numVotes}`);
      if (votesTotal === 0) {
        _tempArray.push('0%');
        _tempArray.push(i);
      } else {
        const percResult = (_result.numVotes / votesTotal) * 100;
        _tempArray.push(`${Math.round(percResult)}%`);
        _tempArray.push(i);
      }

      textArray.push(_tempArray);
    }

    // calculating the data for the inner rectangle
    const innerWidth = width * 0.95;
    const innerHeight = height - (width * 0.05);
    const innerX = x + (width * 0.025);
    const innerY = y + (width * 0.025);
    const thickness = (width - innerWidth) / 10;

    // calculating the maximum possible width and height of the each line
    // 25% of the height goes to the padding
    const maxLineWidth = innerWidth / 3;
    const maxLineHeight = (innerHeight * 0.75) / textArray.length;

    const lineToMeasure = textArray[0];
    const { pollAnswerIds } = PollService;
    const messageIndex = lineToMeasure[0].toLowerCase();
    if (pollAnswerIds[messageIndex]) {
      lineToMeasure[0] = intl.formatMessage(pollAnswerIds[messageIndex]);
    }

    // saving all the initial calculations in the state
    this.setState({
      outerRect: {
        x,
        y,
        width,
        height,
      },
      innerRect: {
        x: innerX,
        y: innerY,
        width: innerWidth,
        height: innerHeight,
      },
      thickness,
      maxNumVotes,
      textArray,
      maxLineWidth,
      maxLineHeight,
      lineToMeasure,
    });
  }

  componentDidMount() {
    this.checkSizes();
  }

  // this might have to be changed if we want to reuse it for a presenter's poll popup
  shouldComponentUpdate() {
    const { prepareToDisplay } = this.state;
    return prepareToDisplay === true;
  }

  componentDidUpdate() {
    const { prepareToDisplay } = this.state;
    if (prepareToDisplay) {
      this.checkSizes();
    }
  }

  checkSizes() {
    let { maxLineHeight } = this.state;

    const {
      currentLine,
      maxLineWidth,
      fontSizeDirection,
      calcFontSize,
      textArray,
    } = this.state;

    const { annotation } = this.props;
    // increment the font size by 2 to prevent Maximum update depth exceeded
    const fontSizeIncrement = 2;

    // calculating the font size in this if / else block
    if (fontSizeDirection !== 0) {
      const key = `${annotation.id}_key_${currentLine}`;
      const votes = `${annotation.id}_votes_${currentLine}`;
      const percent = `${annotation.id}_percent_${currentLine}`;
      const keySizes = this[key].getBBox();
      const voteSizes = this[votes].getBBox();
      const percSizes = this[percent].getBBox();

      // first check if we can still increase the font-size
      if (fontSizeDirection === 1) {
        if ((keySizes.width < maxLineWidth && keySizes.height < maxLineHeight
          && voteSizes.width < maxLineWidth && voteSizes.height < maxLineHeight
          && percSizes.width < maxLineWidth && percSizes.height < maxLineHeight)
          && calcFontSize < 100) {
          return this.setState({
            calcFontSize: calcFontSize + fontSizeIncrement,
          });

          // we can't increase font-size anymore, start decreasing
        }
        return this.setState({
          fontSizeDirection: -1,
          calcFontSize: calcFontSize - fontSizeIncrement,
        });
      } if (fontSizeDirection === -1) {
        // check if the font-size is still bigger than allowed
        if ((keySizes.width > maxLineWidth || keySizes.height > maxLineHeight
          || voteSizes.width > maxLineWidth || voteSizes.height > maxLineHeight
          || percSizes.width > maxLineWidth || percSizes.height > maxLineHeight)
          && calcFontSize > 0) {
          return this.setState({
            calcFontSize: calcFontSize - fontSizeIncrement,
          });

          // font size is fine for the current line, switch to the next line
          // or finish with the font-size calculations if this we are at the end of the array
        }
        if (currentLine < textArray.length - 1) {
          return this.setState({
            currentLine: currentLine + 1,
            lineToMeasure: textArray[currentLine + 1],
          });
        }
        return this.setState({
          fontSizeDirection: 0,
          currentLine: 0,
          lineToMeasure: textArray[0],
        });
      }
    }

    // next block is executed when we finally found a proper font size

    // finding the biggest width and height of the left and right strings,
    // max real line height and max width value for 1 digit
    let maxLeftWidth = 0;
    let maxRightWidth = 0;
    maxLineHeight = 0;
    for (let i = 0; i < textArray.length; i += 1) {
      const key = `${annotation.id}_key_${i}`;
      const percent = `${annotation.id}_percent_${i}`;
      const keySizes = this[key].getBBox();
      const percSizes = this[percent].getBBox();

      if (keySizes.width > maxLeftWidth) {
        maxLeftWidth = keySizes.width;
      }

      if (percSizes.width > maxRightWidth) {
        maxRightWidth = percSizes.width;
      }

      if (keySizes.height > maxLineHeight) {
        maxLineHeight = keySizes.height;
      }

      if (percSizes.height > maxLineHeight) {
        maxLineHeight = percSizes.height;
      }
    }

    const digitRef = `${annotation.id}_digit`;
    const maxDigitWidth = this[digitRef].getBBox().width;
    const maxDigitHeight = this[digitRef].getBBox().height;

    return this.setState({
      maxLeftWidth,
      maxRightWidth,
      maxLineHeight,
      maxDigitWidth,
      maxDigitHeight,
      prepareToDisplay: false,
    });
  }

  renderPoll() {
    const {
      backgroundColor,
      calcFontSize,
      innerRect,
      maxDigitHeight,
      maxDigitWidth,
      maxLeftWidth,
      maxLineHeight,
      maxNumVotes,
      maxRightWidth,
      outerRect,
      textArray,
      thickness,
    } = this.state;

    const { annotation, intl } = this.props;

    const { pollAnswerIds } = PollService;

    const isRTL = document.documentElement.getAttribute('dir') === 'rtl';

    //* ********************************************************************************************
    //* *****************************************MAGIC NUMBER***************************************
    // There is no automatic vertical centering in SVG.
    // To center the text element we have to move it down by the half of its height.
    // But every text element has its own padding by default. The height we receive
    // by calling getBBox() includes padding, but the anchor point doesn't consider it.
    // This way the text element is moved down a little bit and we have to move it up a bit.
    // 1/6 of the maximum height of the digit seems to work fine.
    // Oleksandr Zhurbenko. June 22, 2016
    const magicNumber = maxDigitHeight / 6;

    // maximum height and width of the line bar
    const maxBarWidth = ((innerRect.width * 0.9)
      - maxLeftWidth) - maxRightWidth;
    const barHeight = (innerRect.height * 0.75) / textArray.length;

    // Horizontal padding
    const horizontalPadding = (innerRect.width * 0.1) / 4;

    // Vertical padding
    const verticalPadding = (innerRect.height * 0.25) / (textArray.length + 1);

    // Initial coordinates of the key column
    let yLeft = ((innerRect.y + verticalPadding) + (barHeight / 2)) - magicNumber;
    const xLeft = (innerRect.x + horizontalPadding) + 1;

    // Initial coordinates of the line bar column
    const xBar = (innerRect.x + maxLeftWidth) + (horizontalPadding * 2);
    let yBar = innerRect.y + verticalPadding;

    // Initial coordinates of the percentage column
    let yRight = ((innerRect.y + verticalPadding) + (barHeight / 2)) - magicNumber;
    const xRight = ((((innerRect.x + (horizontalPadding * 3))
      + maxLeftWidth) + maxRightWidth) + maxBarWidth + 1);

    let yNumVotes = (innerRect.y + verticalPadding) - magicNumber;
    const extendedTextArray = [];
    for (let i = 0; i < textArray.length; i += 1) {
      let barWidth;
      if (maxNumVotes === 0 || annotation.result[i].numVotes === 0) {
        barWidth = 1;
      } else {
        barWidth = (annotation.result[i].numVotes / maxNumVotes) * maxBarWidth;
      }

      let label = textArray[i][0];
      const formattedMessageIndex = label.toLowerCase();
      if (pollAnswerIds[formattedMessageIndex]) {
        label = intl.formatMessage(pollAnswerIds[formattedMessageIndex]);
      }

      // coordinates and color of the text inside the line bar
      // xNumVotesDefault and xNumVotesMovedRight are 2 different x coordinates for the text
      // since if the line bar is too small then we place the number to the right of the bar
      const xNumVotesDefault = (innerRect.x + maxLeftWidth) + (horizontalPadding * 2);
      const xNumVotesMovedRight = (xNumVotesDefault + (barWidth / 2)) + (maxDigitWidth / 2);

      let xNumVotes;
      let color;
      if (barWidth < maxDigitWidth + 8) {
        xNumVotes = xNumVotesMovedRight;
        color = '#333333';
      } else {
        xNumVotes = xNumVotesDefault;
        color = 'white';
      }

      extendedTextArray[i] = {
        key: `${annotation.id}_${textArray[i][3]}`,
        keyColumn: {
          keyString: label,
          xLeft,
          yLeft,
        },
        barColumn: {
          votesString: textArray[i][1],
          xBar,
          yBar,
          barWidth,
          barHeight,
          yNumVotes,
          xNumVotes,
          color,
          numVotes: annotation.result[i].numVotes,
        },
        percentColumn: {
          xRight,
          yRight,
          percentString: textArray[i][2],
        },
      };

      // changing the Y coordinate for all the objects
      yBar = yBar + barHeight + verticalPadding;
      yLeft = yLeft + barHeight + verticalPadding;
      yRight = yRight + barHeight + verticalPadding;
      yNumVotes = yNumVotes + barHeight + verticalPadding;
    }

    return (
      <g aria-hidden>
        <rect
          x={outerRect.x}
          y={outerRect.y}
          width={outerRect.width}
          height={outerRect.height}
          strokeWidth="0"
          fill={backgroundColor}
        />
        <rect
          x={innerRect.x}
          y={innerRect.y}
          width={innerRect.width}
          height={innerRect.height}
          stroke="#333333"
          fill={backgroundColor}
          strokeWidth={thickness}
        />
        <text
          x={innerRect.x}
          y={innerRect.y}
          fill="#333333"
          fontFamily="Arial"
          fontSize={calcFontSize}
          textAnchor={isRTL ? 'end' : 'start'}
        >
          {extendedTextArray.map(line => (
            <tspan
              x={line.keyColumn.xLeft}
              y={line.keyColumn.yLeft}
              dy={maxLineHeight / 2}
              key={`${line.key}_key`}
              className={styles.outline}
            >
              {line.keyColumn.keyString}
            </tspan>
          ))}
        </text>
        {extendedTextArray.map(line => (
          <rect
            key={`${line.key}_bar`}
            x={line.barColumn.xBar}
            y={line.barColumn.yBar}
            width={line.barColumn.barWidth}
            height={line.barColumn.barHeight}
            stroke="#333333"
            fill="#333333"
            strokeWidth={thickness - 1}
          />
        ))}
        <text
          x={innerRect.x}
          y={innerRect.y}
          fill="#333333"
          fontFamily="Arial"
          fontSize={calcFontSize}
          textAnchor={isRTL ? 'start' : 'end'}
        >
          {extendedTextArray.map(line => (
            <tspan
              x={line.percentColumn.xRight}
              y={line.percentColumn.yRight}
              dy={maxLineHeight / 2}
              key={`${line.key}_percent`}
              className={styles.outline}
            >
              {line.percentColumn.percentString}
            </tspan>
          ))}
        </text>
        <text
          x={innerRect.x}
          y={innerRect.y}
          fill="#333333"
          fontFamily="Arial"
          fontSize={calcFontSize}
          textAnchor={isRTL ? 'end' : 'start'}
        >
          {extendedTextArray.map(line => (
            <tspan
              x={line.barColumn.xNumVotes + (line.barColumn.barWidth / 2)}
              y={line.barColumn.yNumVotes + (line.barColumn.barHeight / 2)}
              dy={maxLineHeight / 2}
              key={`${line.key}_numVotes`}
              fill={line.barColumn.color}
              className={styles.outline}
            >
              {line.barColumn.numVotes}
            </tspan>
          ))}
        </text>
      </g>
    );
  }

  renderLine(line) {
    // this func just renders the strings for one line

    const { calcFontSize } = this.state;
    const { annotation } = this.props;

    return (
      <g key={`${annotation.id}_line_${line[3]}`}>
        <text
          fontFamily="Arial"
          fontSize={calcFontSize}
          ref={(ref) => { this[`${annotation.id}_key_${line[3]}`] = ref; }}
        >
          <tspan>
            {line[0]}
          </tspan>
        </text>
        <text
          fontFamily="Arial"
          fontSize={calcFontSize}
          ref={(ref) => { this[`${annotation.id}_votes_${line[3]}`] = ref; }}
        >
          <tspan>
            {line[1]}
          </tspan>
        </text>
        <text
          fontFamily="Arial"
          fontSize={calcFontSize}
          ref={(ref) => { this[`${annotation.id}_percent_${line[3]}`] = ref; }}
        >
          <tspan>
            {line[2]}
          </tspan>
        </text>
      </g>
    );
  }

  renderTestStrings() {
    const { annotation } = this.props;
    const {
      calcFontSize,
      fontSizeDirection,
      lineToMeasure,
      textArray,
    } = this.state;

    // check whether we need to render just one line, which means that
    // we are still calculating the font-size
    // or if we finished with the font-size and we need to render all the strings in order to
    // determine the maxHeight, maxWidth and maxDigitWidth
    if (fontSizeDirection !== 0) {
      return this.renderLine(lineToMeasure);
    }
    return (
      <g aria-hidden>
        {textArray.map(line => this.renderLine(line))}
        <text
          fontFamily="Arial"
          fontSize={calcFontSize}
          ref={(ref) => { this[`${annotation.id}_digit`] = ref; }}
        >
          <tspan>
            0
          </tspan>
        </text>
      </g>
    );
  }

  render() {
    const { intl } = this.props;
    const { prepareToDisplay, textArray } = this.state;

    let ariaResultLabel = `${intl.formatMessage(intlMessages.pollResultAria)}: `;
    textArray.map((t, idx) => {
      const pollLine = t.slice(0, -1);
      ariaResultLabel += `${idx > 0 ? ' |' : ''} ${pollLine.join(' | ')}`;
    });

    return (
      <g aria-label={ariaResultLabel}>
        {prepareToDisplay
          ? this.renderTestStrings()
          : this.renderPoll()
        }
      </g>
    );
  }
}

export default injectIntl(PollDrawComponent);

PollDrawComponent.propTypes = {
  intl: intlShape.isRequired,
  // Defines an annotation object, which contains all the basic info we need to draw a line
  annotation: PropTypes.shape({
    id: PropTypes.string.isRequired,
    points: PropTypes.arrayOf(PropTypes.number).isRequired,
    result: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        key: PropTypes.string.isRequired,
        numVotes: PropTypes.number.isRequired,
      }),
    ).isRequired,
  }).isRequired,
  // Defines the width of the slide (svg coordinate system), which needed in calculations
  slideWidth: PropTypes.number.isRequired,
  // Defines the height of the slide (svg coordinate system), which needed in calculations
  slideHeight: PropTypes.number.isRequired,
};
