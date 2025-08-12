import { Geo } from './Geo.js';

/**
 * Creates an SVG poll shape from Tldraw v2 JSON data.
 *
 * @class Poll
 * @extends {Geo}
 */
export class Poll extends Geo {
  /**
   * Draws a poll shape based on the instance properties.
   *
   * @method draw
   * @return {G} An SVG group element containing the drawn poll shape.
   *
 */
  constructor(poll) {
    super(poll);
    this.props = poll?.props;
    this.growY = 0;
  }

  getNiceAxisScale(values, maxTicks = 5) {
    const maxValue = Math.max(0, ...values);

    if (maxValue === 0) {
      return [0, 1, 2, 3, 4];
    }

    const roughStep = maxValue / (maxTicks - 1);
    const niceStep = Math.max(1, Math.round(this.getNiceNumber(roughStep)));

    const maxAxis = Math.ceil(maxValue / niceStep) * niceStep;

    const ticks = [];
    for (let v = 0; v <= maxAxis; v += niceStep) {
      const intV = Math.round(v);
      if (!ticks.includes(intV)) {
        ticks.push(intV);
      }
    }

    while (ticks.length < 4) {
      const lastTick = ticks[ticks.length - 1];
      ticks.push(lastTick + niceStep);
    }

    return ticks;
  }

  getNiceNumber(value) {
    const exponent = Math.floor(Math.log10(value));
    const fraction = value / Math.pow(10, exponent);

    let niceFraction;

    if (fraction <= 1) {
      niceFraction = 1;
    } else if (fraction <= 2) {
      niceFraction = 2;
    } else if (fraction <= 5) {
      niceFraction = 5;
    } else {
      niceFraction = 10;
    }

    return niceFraction * Math.pow(10, exponent);
  }

  breakTextIntoLines(text, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const testWidth = testLine.length * fontSize * 0.6;

      if (testWidth > maxWidth) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    lines.push(currentLine);
    return lines;
  };

  generatePollSvg(answers, width = 600, height = 300, questionText = '') {
    const isQuiz = answers.some(a => a.isCorrectAnswer);

    const labels = answers.map(a => a.key);
    const values = answers.map(a => a.numVotes);

    const titleFontSize = questionText ? 14 : 0;
    const titleSpacing = questionText ? 20 : 0;

    const barColor = '#0C57A7';

    const titleLines = this.breakTextIntoLines(questionText, titleFontSize, width);

    const padding = {
      top: 19 + ((titleFontSize + titleSpacing) * titleLines.length),
      right: 39,
      bottom: 29,
      left: width * 0.3 - 1
    };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const uniqueValues = Array.from(new Set(values.map(v => Math.round(v))));

    const expandedValues = this.getNiceAxisScale(uniqueValues);

    const maxDisplayValue = Math.max(...expandedValues, 1);

    const count = labels.length;
    const gap = 10;
    const barHeight = Math.floor((innerHeight - gap * (count - 1)) / count);
    const valueToWidth = v => Math.round((v / maxDisplayValue) * innerWidth);

    let bars = '';

    labels.forEach((label, i) => {
      const val = values[i];
      const w = valueToWidth(val);
      const x = padding.left;
      const y = padding.top + i * (barHeight + gap);

      // emoji does not work for now, using HTML entity
      const checkmark = "&#10004;";
      let displayText = (isQuiz && answers[i].isCorrectAnswer ? checkmark + ' ' : '') + label;

      if (displayText.length > 20) {
        displayText = displayText.slice(0, 20) + '...';
      }

      bars += `
        <rect x="${x}" y="${y}" width="${w}" height="${barHeight}" rx="4" ry="4" fill="${barColor}" />
        <text x="${x - 6}" y="${y + barHeight / 2 + 4}" font-size="12" text-anchor="end" fill="#333">${displayText}</text>
      `;
    });

    const gridMarkup = expandedValues.map(v => {
      const xPx = padding.left + Math.round((v / maxDisplayValue) * innerWidth);
      return `<line x1="${xPx}" x2="${xPx}" y1="${padding.top}" y2="${height - padding.bottom}" stroke="#e6e6e6" />`;
    }).join('');

    const xLabels = expandedValues.map(v => {
      const xPx = padding.left + Math.round((v / maxDisplayValue) * innerWidth);
      return `<text x="${xPx}" y="${height - padding.bottom + 14}" font-size="11" text-anchor="middle" fill="#666">${v}</text>`;
    }).join('');

    const titleMarkup = titleLines.map((line, i) => {
      return `<text x="${width / 2}" y="${20 + titleFontSize / 2 + i * titleFontSize}" font-size="${titleFontSize}" text-anchor="middle" fill="#000">${line}</text>`;
    }).join('');

    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width-2}" height="${height-2}" viewBox="0 0 ${width-2} ${height-2}">
      <rect width="100%" height="100%" fill="white" stroke="#888" stroke-width="1" />
      ${titleMarkup}
      <g>${gridMarkup}</g>
      <g>${xLabels}</g>
      <g>${bars}</g>
      </svg>
    `.trim();
  }

  draw() {
    const caseInsensitiveReducer = (acc, item) => {
      const index = acc.findIndex((ans) => ans.key.toLowerCase() === item.key.toLowerCase())
      if (index !== -1) {
        if (acc[index].numVotes >= item.numVotes) acc[index].numVotes += item.numVotes
        else {
          const tempVotes = acc[index].numVotes
          acc[index] = item
          acc[index].numVotes += tempVotes
        }
      } else {
        acc.push(item)
      }
      return acc
    }

    const answers = this.props?.answers.reduce(caseInsensitiveReducer, []);

    const rectGroup = this.shapeGroup;

    let pollQuestion = '';

    if (this.props?.questionText.trim() !== '') {
      pollQuestion = this.props.questionText.split('<br/>').join(' ');
    }

    const svg = this.generatePollSvg(answers, this.w, this.h + this.growY, pollQuestion);

    rectGroup.add(svg);

    return rectGroup;
  }
}
