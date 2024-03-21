const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const {create} = require('xmlbuilder2', {encoding: 'utf-8'});
const cp = require('child_process');
const WorkerStarter = require('../lib/utils/worker-starter');
const {workerData} = require('worker_threads');
const path = require('path');
const sanitize = require('sanitize-filename');
const {getStrokePoints, getStrokeOutlinePoints} = require('perfect-freehand');
const probe = require('probe-image-size');
const redis = require('redis');
const {PresAnnStatusMsg} = require('../lib/utils/message-builder');

const jobId = workerData.jobId;
const logger = new Logger('presAnn Process Worker');
logger.info('Processing PDF for job ' + jobId);

const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);
const statusUpdate = new PresAnnStatusMsg(exportJob, PresAnnStatusMsg.EXPORT_STATUSES.PROCESSING);

// General utilities for rendering SVGs resembling Tldraw as much as possible
function align_to_pango(alignment) {
  switch (alignment) {
    case 'start': return 'left';
    case 'middle': return 'center';
    case 'end': return 'right';
    case 'justify': return 'justify';
    default: return 'left';
  }
}

function color_to_hex(color, isStickyNote = false, isFilled = false) {
  if (isStickyNote) {
    color = `sticky-${color}`;
  }
  if (isFilled) {
    color = `fill-${color}`;
  }

  switch (color) {
    case 'white': return '#1d1d1d';
    case 'fill-white': return '#fefefe';
    case 'sticky-white': return '#fddf8e';
    case 'lightGray': return '#c6cbd1';
    case 'fill-lightGray': return '#f1f2f3';
    case 'sticky-lightGray': return '#dde0e3';
    case 'gray': return '#788492';
    case 'fill-gray': return '#e3e5e7';
    case 'sticky-gray': return '#b3b9c1';
    case 'black': return '#1d1d1d';
    case 'fill-black': return '#d2d2d2';
    case 'sticky-black': return '#fddf8e';
    case 'green': return '#36b24d';
    case 'fill-green': return '#d7eddb';
    case 'sticky-green': return '#8ed29b';
    case 'cyan': return '#0e98ad';
    case 'fill-cyan': return '#d0e8ec';
    case 'sticky-cyan': return '#78c4d0';
    case 'blue': return '#1c7ed6';
    case 'fill-blue': return '#d2e4f4';
    case 'sticky-blue': return '#80b6e6';
    case 'indigo': return '#4263eb';
    case 'fill-indigo': return '#d9dff7';
    case 'sticky-indigo': return '#95a7f2';
    case 'violet': return '#7746f1';
    case 'fill-violet': return '#e2daf8';
    case 'sticky-violet': return '#b297f5';
    case 'red': return '#ff2133';
    case 'fill-red': return '#fbd3d6';
    case 'sticky-red': return '#fd838d';
    case 'orange': return '#ff9433';
    case 'fill-orange': return '#fbe8d6';
    case 'sticky-orange': return '#fdc28d';
    case 'yellow': return '#ffc936';
    case 'fill-yellow': return '#fbf1d7';
    case 'sticky-yellow': return '#fddf8e';

    default: return '#0d0d0d';
  }
}

function determine_dasharray(dash, gap = 0) {
  switch (dash) {
    case 'dashed': return `stroke-linecap:butt;stroke-dasharray:${gap};`;
    case 'dotted': return `stroke-linecap:round;stroke-dasharray:${gap};`;

    default: return 'stroke-linejoin:round;stroke-linecap:round;';
  }
}

function determine_font_from_family(family) {
  switch (family) {
    case 'script': return 'Caveat Brush';
    case 'sans': return 'Source Sans Pro';
    case 'serif': return 'Crimson Pro';
    // Temporary workaround due to typo in messages
    case 'erif': return 'Crimson Pro';
    case 'mono': return 'Source Code Pro';

    default: return 'Caveat Brush';
  }
}

function rad_to_degree(angle) {
  return angle * (180 / Math.PI) || 0;
}

// Convert pixels to points
function to_pt(px) {
  return (px / config.process.pixelsPerInch) * config.process.pointsPerInch;
}

// Convert points to pixels
function to_px(pt) {
  return (pt / config.process.pointsPerInch) * config.process.pixelsPerInch;
}

// Escape shell metacharacters based on MDN's page on regular expressions,
// the escape-string-regexp npm package, and Pango markup.
function escapeText(string) {
  return string
      .replace(/[~`!.*+?%^${}()|[\]\\/]/g, '\\$&')
      .replace(/&/g, '\\&amp;')
      .replace(/'/g, '\\&#39;')
      .replace(/"/g, '\\&quot;')
      .replace(/>/g, '\\&gt;')
      .replace(/</g, '\\&lt;');
}

function render_textbox(textColor, font, fontSize, textAlign, text, id, textBoxWidth = null) {
  fontSize = to_pt(fontSize) * config.process.textScaleFactor;
  text = escapeText(text);

  // Sticky notes need automatic line wrapping: take width into account
  // Texbox scaled by a constant factor to improve resolution at small scales
  const size = textBoxWidth ? ['-size', `${textBoxWidth * config.process.textScaleFactor}x`] : [];

  const pangoText = `pango:<span font_family='${font}' font='${fontSize}' color='${textColor}'>${text}</span>`;

  const justify = textAlign === 'justify';
  textAlign = justify ? 'left' : textAlign;

  const commands = [
    '-encoding', `${config.process.whiteboardTextEncoding}`,
    '-density', config.process.pixelsPerInch,
    '-background', 'transparent'].concat(size,
      [
        '-define', `pango:align=${textAlign}`,
        '-define', `pango:justify=${justify}`,
        '-define', 'pango:wrap=word-char',
        pangoText,
        path.join(dropbox, `text${id}.png`),
      ]);

  try {
    cp.spawnSync(config.shared.imagemagick, commands, {shell: false});
  } catch (error) {
    logger.error(`ImageMagick failed to render textbox in job ${jobId}: ${error.message}`);
    statusUpdate.setError();
  }
}

function get_gap(dash, size) {
  switch (dash) {
    case 'dashed':
      if (size == 'small') {
        return '8 8';
      } else if (size == 'medium') {
        return '14 14';
      } else {
        return '20 20';
      }
    case 'dotted':
      if (size == 'small') {
        return '0.1 8';
      } else if (size == 'medium') {
        return '0.1 14';
      } else {
        return '0.1 20';
      }

    default: return '0';
  }
}

function get_stroke_width(dash, size) {
  switch (size) {
    case 'small': if (dash === 'draw') {
      return 2;
    } else {
      return 4;
    }
    case 'medium': if (dash === 'draw') {
      return 3.5;
    } else {
      return 6.25;
    }
    case 'large': if (dash === 'draw') {
      return 5;
    } else {
      return 8.5;
    }

    default: return 1;
  }
}

function sortByKey(array, key, value) {
  return array.sort(function(a, b) {
    const [x, y] = [a[key][value], b[key][value]];
    return x - y;
  });
}

function text_size_to_px(size, scale = 1, isStickyNote = false) {
  if (isStickyNote) {
    size = `sticky-${size}`;
  }

  switch (size) {
    case 'sticky-small': return 24;
    case 'small': return 28 * scale;
    case 'sticky-medium': return 36;
    case 'medium': return 48 * scale;
    case 'sticky-large': return 48;
    case 'large': return 96 * scale;

    default: return 28 * scale;
  }
}

/**
 * Turns an array of points into a path of quadradic curves.
 * @param {Array} annotationPoints
 * @param {Boolean} closed - whether the path end and start should be connected (default)
 * @return {Array} - an SVG quadratic curve path
 */
function getSvgPath(annotationPoints, closed = true) {
  const svgPath = annotationPoints.reduce(
      (acc, [x0, y0], i, arr) => {
        if (!arr[i + 1]) return acc;
        const [x1, y1] = arr[i + 1];
        acc.push(x0.toFixed(2), y0.toFixed(2), ((x0 + x1) / 2).toFixed(2), ((y0 + y1) / 2).toFixed(2));
        return acc;
      },

      ['M', ...annotationPoints[0], 'Q'],
  );

  if (closed) svgPath.push('Z');
  return svgPath;
}

function circleFromThreePoints(A, B, C) {
  const [x1, y1] = A;
  const [x2, y2] = B;
  const [x3, y3] = C;

  const a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2;

  const b =
    (x1 * x1 + y1 * y1) * (y3 - y2) +
    (x2 * x2 + y2 * y2) * (y1 - y3) +
    (x3 * x3 + y3 * y3) * (y2 - y1);

  const c =
    (x1 * x1 + y1 * y1) * (x2 - x3) +
    (x2 * x2 + y2 * y2) * (x3 - x1) +
    (x3 * x3 + y3 * y3) * (x1 - x2);

  const x = -b / (2 * a);
  const y = -c / (2 * a);

  return [x, y, Math.hypot(x - x1, y - y1)];
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function getArcLength(C, r, A, B) {
  const sweep = getSweep(C, A, B);
  return r * (2 * Math.PI) * (sweep / (2 * Math.PI));
}

function getSweep(C, A, B) {
  // Get angle between two vectors in radians
  const a0 = Math.atan2(A[1] - C[1], A[0] - C[0]);
  const a1 = Math.atan2(B[1] - C[1], B[0] - C[0]);

  // Short distance between two angles
  const max = Math.PI * 2;
  const da = (a1 - a0) % max;

  return ((2 * da) % max) - da;
}

function intersectCircleCircle(c1, r1, c2, r2) {
  let dx = c2[0] - c1[0];
  let dy = c2[1] - c1[1];

  const d = Math.sqrt(dx * dx + dy * dy);
  const x = (d * d - r2 * r2 + r1 * r1) / (2 * d);
  const y = Math.sqrt(r1 * r1 - x * x);

  dx /= d;
  dy /= d;

  return [[c1[0] + dx * x - dy * y, c1[1] + dy * x + dx * y],
    [c1[0] + dx * x + dy * y, c1[1] + dy * x - dx * y]];
}

function rotWith(A, C, r = 0) {
  // Rotate a vector A around another vector C by r radians
  if (r === 0) return A;

  const s = Math.sin(r);
  const c = Math.cos(r);

  const px = A[0] - C[0];
  const py = A[1] - C[1];

  const nx = px * c - py * s;
  const ny = px * s + py * c;

  return [nx + C[0], ny + C[1]];
}

function nudge(A, B, d) {
  // Pushes a point A towards a point B by a given distance
  if (A[0] === B[0] && A[1] === B[1]) return A;

  // B - A
  const sub = [B[0] - A[0], B[1] - A[1]];

  // Vector length
  const len = Math.hypot(sub[0], sub[1]);

  // Get unit vector
  const unit = [sub[0] / len, sub[1] / len];

  // Multiply by distance
  const mul = [unit[0] * d, unit[1] * d];

  return [A[0] + mul[0], A[1] + mul[1]];
}

function getCurvedArrowHeadPath(A, r1, C, r2, sweep) {
  const phi = (1 + Math.sqrt(5)) / 2;

  // Determine intersections between two circles
  const ints = intersectCircleCircle(A, r1 * (phi - 1), C, r2);

  if (!ints) {
    logger.info('Could not find an intersection for the arrow head.');
    return {left: A, right: A};
  }

  const int = sweep ? ints[0] : ints[1];
  const left = int ? nudge(rotWith(int, A, Math.PI / 6), A, r1 * -0.382) : A;
  const right = int ? nudge(rotWith(int, A, -Math.PI / 6), A, r1 * -0.382) : A;

  return `M ${left} L ${A} ${right}`;
}

// Methods to convert Akka message contents into SVG
function overlay_arrow(svg, annotation) {
  const [x, y] = annotation.point;
  const bend = annotation.bend;
  const decorations = annotation.decorations;
  const hasLabel = annotation.label;
  const id = sanitize(annotation.id);

  let dash = annotation.style.dash;
  dash = (dash == 'draw') ? 'solid' : dash; // Use 'solid' thickness

  const shapeColor = color_to_hex(annotation.style.color);
  const sw = get_stroke_width(dash, annotation.style.size);
  const gap = get_gap(dash, annotation.style.size);
  const stroke_dasharray = determine_dasharray(dash, gap);

  const [start_x, start_y] = annotation.handles.start.point;
  const [end_x, end_y] = annotation.handles.end.point;
  const [bend_x, bend_y] = annotation.handles.bend.point;

  const line = [];
  const arrowHead = [];
  const arrowDistance = distance(start_x, start_y, end_x, end_y);
  const arrowHeadLength = Math.min(arrowDistance / 3, 8 * sw);
  const isStraightLine = parseFloat(bend).toFixed(3) == 0;

  const angle = Math.atan2(end_y - start_y, end_x - start_x);

  if (isStraightLine) {
    // Draws a straight line / arrow
    line.push(`M ${start_x} ${start_y} L ${end_x} ${end_y}`);

    if (decorations.start || decorations.end) {
      arrowHead.push(`M ${end_x} ${end_y}`);
      arrowHead.push(`L ${end_x + arrowHeadLength * Math.cos(angle + (7 / 6) * Math.PI)} ${end_y + arrowHeadLength * Math.sin(angle + (7 / 6) * Math.PI)}`);
      arrowHead.push(`M ${end_x} ${end_y}`);
      arrowHead.push(`L ${end_x + arrowHeadLength * Math.cos(angle + (5 / 6) * Math.PI)} ${end_y + arrowHeadLength * Math.sin(angle + (5 / 6) * Math.PI)}`);
    }
  } else {
    // Curved lines and arrows
    const circle = circleFromThreePoints([start_x, start_y], [bend_x, bend_y], [end_x, end_y]);
    const center = [circle[0], circle[1]];
    const radius = circle[2];
    const length = getArcLength(center, radius, [start_x, start_y], [end_x, end_y]);

    line.push(`M ${start_x} ${start_y} A ${radius} ${radius} 0 0 ${length > 0 ? '1' : '0'} ${end_x} ${end_y}`);

    if (decorations.start) {
      arrowHead.push(getCurvedArrowHeadPath([start_x, start_y], arrowHeadLength, center, radius, length < 0));
    } else if (decorations.end) {
      arrowHead.push(getCurvedArrowHeadPath([end_x, end_y], arrowHeadLength, center, radius, length >= 0));
    }
  }

  // The arrowhead is purposely not styled (e.g., dashed / dotted)
  svg.ele('g', {
    style: `stroke:${shapeColor};stroke-width:${sw};fill:none;`,
    transform: `translate(${x} ${y})`,
  }).ele('path', {
    'clip-path': hasLabel ? `url(#clip-${id})` : '',
    'style': stroke_dasharray,
    'd': line.join(' '),
  }).up()
      .ele('path', {
        d: arrowHead.join(' '),
      }).up();
  
  if (hasLabel) {
    if (!isStraightLine) {
      const [shape_width, shape_height] = annotation.size;
      const bendOffset = [bend_x - shape_width, bend_y - shape_height];
      annotation["bendOffset"] = bendOffset;
    }

    overlay_shape_label(svg, annotation);
  }
}

function overlay_draw(svg, annotation) {
  const shapePoints = annotation.points;
  const shapePointsLength = shapePoints.length;

  if (shapePointsLength < 2) return;

  const dash = annotation.style.dash;
  const isDashDraw = (dash == 'draw');

  const thickness = get_stroke_width(dash, annotation.style.size);
  const gap = get_gap(dash, annotation.style.size);
  const stroke_dasharray = determine_dasharray(dash, gap);

  const shapeColor = color_to_hex(annotation.style.color);
  const shapeFillColor = color_to_hex(`fill-${annotation.style.color}`);
  const fill = isDashDraw ? shapeColor : 'none';

  const rotation = rad_to_degree(annotation.rotation);
  const [x, y] = annotation.point;
  const [width, height] = annotation.size;
  const shapeTransform = `translate(${x} ${y}), rotate(${rotation} ${width / 2} ${height / 2})`;

  const simulatePressure = {
    easing: (t) => Math.sin((t * Math.PI) / 2),
    simulatePressure: true,
  };

  const realPressure = {
    easing: (t) => t * t,
    simulatePressure: false,
  };

  const options = {
    size: 1 + thickness * 1.5,
    thinning: 0.65,
    streamline: 0.65,
    smoothing: 0.65,
    ...(shapePoints[1][2] === 0.5 ? simulatePressure : realPressure),
    last: annotation.isComplete,
  };

  const strokePoints = getStrokePoints(shapePoints, options);

  // Fill when path start- and end points overlap
  const isShapeFilled =
        annotation.style.isFilled &&
        shapePointsLength > 3 &&
        Math.round(distance(
            shapePoints[0][0],
            shapePoints[0][1],
            shapePoints[shapePointsLength - 1][0],
            shapePoints[shapePointsLength - 1][1],
        )) <= 2 * thickness;

  if (isShapeFilled) {
    const shapeArea = strokePoints.map((strokePoint) => strokePoint.point);
    svg.ele('path', {
      style: `fill:${shapeFillColor};`,
      d: getSvgPath(shapeArea),
      transform: shapeTransform,
    }).up();
  }

  if (isDashDraw) {
    const strokeOutlinePoints = getStrokeOutlinePoints(strokePoints, options);
    const svgPath = getSvgPath(strokeOutlinePoints);

    svg.ele('path', {
      style: `fill:${fill};${stroke_dasharray}`,
      d: svgPath,
      transform: shapeTransform,
    });
  } else {
    const last = shapePoints[shapePointsLength - 1];

    // Avoid single dots from not being drawn
    if (strokePoints[0].point[0] == last[0] && strokePoints[0].point[1] == last[1]) {
      strokePoints.push({point: last});
    }

    const solidPath = strokePoints.map((strokePoint) => strokePoint.point);
    const svgPath = getSvgPath(solidPath, false);

    svg.ele('path', {
      style: `stroke:${shapeColor};stroke-width:${thickness};fill:${fill};${stroke_dasharray}`,
      d: svgPath,
      transform: shapeTransform,
    });
  }
}

function overlay_ellipse(svg, annotation) {
  let dash = annotation.style.dash;
  dash = (dash == 'draw') ? 'solid' : dash; // Use 'solid' thickness for draw type

  const [x, y] = annotation.point; // Ellipse center coordinates
  const [rx, ry] = annotation.radius;
  const isFilled = annotation.style.isFilled;

  const shapeColor = color_to_hex(annotation.style.color);
  const fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

  const rotation = rad_to_degree(annotation.rotation);
  const sw = get_stroke_width(dash, annotation.style.size);
  const gap = get_gap(dash, annotation.style.size);

  const stroke_dasharray = determine_dasharray(dash, gap);

  svg.ele('g', {
    style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
  }).ele('ellipse', {
    'cx': x + rx,
    'cy': y + ry,
    'rx': rx,
    'ry': ry,
    'transform': `rotate(${rotation} ${x + rx} ${y + ry})`,
  }).up();

  if (annotation.label) {
    overlay_shape_label(svg, annotation);
  }
}

function overlay_rectangle(svg, annotation) {
  const dash = annotation.style.dash;
  const rect_dash = (dash == 'draw') ? 'solid' : dash; // Use 'solid' thickness for draw type

  const [x, y] = annotation.point;
  const [w, h] = annotation.size;
  const isFilled = annotation.style.isFilled;

  const shapeColor = color_to_hex(annotation.style.color);
  const fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

  const rotation = rad_to_degree(annotation.rotation);
  const sw = get_stroke_width(rect_dash, annotation.style.size);
  const gap = get_gap(dash, annotation.style.size);

  const stroke_dasharray = determine_dasharray(dash, gap);

  const rx = (dash == 'draw') ? Math.min(w / 4, sw * 2) : 0;
  const ry = (dash == 'draw') ? Math.min(h / 4, sw * 2) : 0;

  svg.ele('g', {
    style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
  }).ele('rect', {
    'width': w,
    'height': h,
    'rx': rx,
    'ry': ry,
    'transform': `translate(${x} ${y}), rotate(${rotation} ${w / 2} ${h / 2})`,
  }).up();

  if (annotation.label) {
    overlay_shape_label(svg, annotation);
  }
}

function overlay_shape_label(svg, annotation) {
  const fontColor = color_to_hex(annotation.style.color);
  const font = determine_font_from_family(annotation.style.font);
  const fontSize = text_size_to_px(annotation.style.size, annotation.style.scale);
  const textAlign = 'center';
  const text = annotation.label;
  const id = sanitize(annotation.id);
  const rotation = rad_to_degree(annotation.rotation);

  const [shape_width, shape_height] = annotation.size;
  const [shape_x, shape_y] = annotation.point;

  const bendOffset = annotation.bendOffset;
  
  // Clip path for arrow and line labels (masking not supported in cairosvg)
  const hasClipPath = annotation.type === 'arrow';

  // Label position of curved arrows and lines not determined by labelPoint
  const [x_offset, y_offset] = annotation.labelPoint;

  const label_x = bendOffset ? (shape_x + shape_width + bendOffset[0]) : (shape_x + shape_width * x_offset)
  const label_y = bendOffset ? (shape_y + shape_height + bendOffset[1]) : (shape_y + shape_height * y_offset) 

  render_textbox(fontColor, font, fontSize, textAlign, text, id);
  const shape_label = path.join(dropbox, `text${id}.png`);

  if (fs.existsSync(shape_label)) {
    // Poll results must fit inside shape, unlike other rectangle labels.
    // Linewrapping handled by client.
    const ref = `file://${dropbox}/text${id}.png`;
    const transform = `rotate(${rotation} ${label_x} ${label_y})`
    const fitLabelToShape = annotation?.name?.startsWith('poll-result');

    let labelWidth = shape_width;
    let labelHeight = shape_height;

    if (!fitLabelToShape) {
      const dimensions = probe.sync(fs.readFileSync(shape_label));
      labelWidth = dimensions.width / config.process.textScaleFactor;
      labelHeight = dimensions.height / config.process.textScaleFactor;
    }

    if (hasClipPath) {
      // Clip path coordinates are relative to the shapes's position
      const [rel_x, rel_y] = [label_x - shape_x, label_y - shape_y];
      const [left_x, right_x] = [Math.round(rel_x - (labelWidth / 2)),  Math.round(rel_x + (labelWidth / 2))];
      const [top_y, bottom_y] = [Math.round(rel_y - (labelHeight / 2)), Math.round(rel_y + (labelHeight / 2))];
     
      svg.ele('defs')
        .ele('clipPath', { id: `clip-${id}` })
        .ele('rect', {
          x: 0, y: 0, width: left_x, height: '100%',
        }).up()
        .ele('rect', {
          x: right_x, y: 0, width: '100%', height: '100%',
        }).up()
        .ele('rect', {
          x: 0, y: 0, width: '100%', height: top_y,
        }).up()
        .ele('rect', {
          x: 0, y: bottom_y, width: '100%', height: '100%'
        }).up()
    }
        
    svg.ele('g', {
      transform: transform,
    }).ele('image', {
      'x': label_x - (labelWidth * x_offset),
      'y': label_y - (labelHeight * y_offset),
      'width': labelWidth,
      'height': labelHeight,
      'xlink:href': ref,
      }).up();
    }
}

function overlay_sticky(svg, annotation) {
  const backgroundColor = color_to_hex(annotation.style.color, true);
  const fontSize = text_size_to_px(annotation.style.size, annotation.style.scale, true);
  const rotation = rad_to_degree(annotation.rotation);
  const font = determine_font_from_family(annotation.style.font);
  const textAlign = align_to_pango(annotation.style.textAlign);

  const [textBoxWidth, textBoxHeight] = annotation.size;
  const [textBox_x, textBox_y] = annotation.point;

  const textColor = '#0d0d0d'; // For sticky notes
  const text = annotation.text;
  const id = sanitize(annotation.id);

  render_textbox(textColor, font, fontSize, textAlign, text, id, textBoxWidth);

  // Overlay transparent text image over empty sticky note
  svg.ele('g', {
    transform: `rotate(${rotation}, ${textBox_x + (textBoxWidth / 2)}, ${textBox_y + (textBoxHeight / 2)})`,
  }).ele('rect', {
    x: textBox_x,
    y: textBox_y,
    width: textBoxWidth,
    height: textBoxHeight,
    fill: backgroundColor,
  }).up()
      .ele('image', {
        'x': textBox_x,
        'y': textBox_y,
        'width': textBoxWidth,
        'height': textBoxHeight,
        'xlink:href': `file://${dropbox}/text${id}.png`,
      }).up();
}

function overlay_triangle(svg, annotation) {
  let dash = annotation.style.dash;
  dash = (dash == 'draw') ? 'solid' : dash;

  const [x, y] = annotation.point;
  const [w, h] = annotation.size;
  const isFilled = annotation.style.isFilled;

  const shapeColor = color_to_hex(annotation.style.color);
  const fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

  const rotation = rad_to_degree(annotation.rotation);
  const sw = get_stroke_width(dash, annotation.style.size);
  const gap = get_gap(dash, annotation.style.size);

  const stroke_dasharray = determine_dasharray(dash, gap);
  const points = `${w / 2} 0, ${w} ${h}, 0 ${h}, ${w / 2} 0`;

  svg.ele('g', {
    style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
  }).ele('polygon', {
    'points': points,
    'transform': `translate(${x}, ${y}), rotate(${rotation} ${w / 2} ${h / 2})`,
  }).up();

  if (annotation.label) {
    overlay_shape_label(svg, annotation);
  }
}

function overlay_text(svg, annotation) {
  const [textBoxWidth, textBoxHeight] = annotation.size;
  const fontColor = color_to_hex(annotation.style.color);
  const font = determine_font_from_family(annotation.style.font);
  const fontSize = text_size_to_px(annotation.style.size, annotation.style.scale);
  const textAlign = align_to_pango(annotation.style.textAlign);
  const text = annotation.text;
  const id = sanitize(annotation.id);

  const rotation = rad_to_degree(annotation.rotation);
  const [textBox_x, textBox_y] = annotation.point;

  render_textbox(fontColor, font, fontSize, textAlign, text, id);

  const rotation_x = textBox_x + (textBoxWidth / 2);
  const rotation_y = textBox_y + (textBoxHeight / 2);

  svg.ele('g', {
    transform: `rotate(${rotation} ${rotation_x} ${rotation_y})`,
  }).ele('image', {
    'x': textBox_x,
    'y': textBox_y,
    'width': textBoxWidth,
    'height': textBoxHeight,
    'xlink:href': `file://${dropbox}/text${id}.png`,
  }).up();
}

function overlay_annotation(svg, currentAnnotation) {
  switch (currentAnnotation.type) {
    case 'arrow':
      overlay_arrow(svg, currentAnnotation);
      break;
    case 'draw':
      overlay_draw(svg, currentAnnotation);
      break;
    case 'ellipse':
      overlay_ellipse(svg, currentAnnotation);
      break;
    case 'rectangle':
      overlay_rectangle(svg, currentAnnotation);
      break;
    case 'sticky':
      overlay_sticky(svg, currentAnnotation);
      break;
    case 'triangle':
      overlay_triangle(svg, currentAnnotation);
      break;
    case 'text':
      overlay_text(svg, currentAnnotation);
      break;
    default:
      logger.info(`Unknown annotation type ${currentAnnotation.type}.`);
  }
}

function overlay_annotations(svg, currentSlideAnnotations) {
  // Sort annotations by lowest child index
  currentSlideAnnotations = sortByKey(currentSlideAnnotations, 'annotationInfo', 'childIndex');

  for (const annotation of currentSlideAnnotations) {
    switch (annotation.annotationInfo.type) {
      case 'group':
        // Get annotations that have this group as parent
        for (const childId of annotation.annotationInfo.children) {
          const childAnnotation =
            currentSlideAnnotations.find((ann) => ann.id == childId);
          overlay_annotation(svg, childAnnotation.annotationInfo);
        }

        break;

      default:
        // Add individual annotations if they don't belong to a group
        if (annotation.annotationInfo.parentId % 1 === 0) {
          overlay_annotation(svg, annotation.annotationInfo);
        }
    }
  }
}

// Process the presentation pages and annotations into a PDF file
async function process_presentation_annotations() {
  const client = redis.createClient({
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  });

  await client.connect();

  client.on('error', (err) => logger.info('Redis Client Error', err));

  // Get the annotations
  const annotations = fs.readFileSync(path.join(dropbox, 'whiteboard'));
  const whiteboard = JSON.parse(annotations);
  const pages = JSON.parse(whiteboard.pages);
  const ghostScriptInput = [];

  // Convert annotations to SVG
  for (const currentSlide of pages) {
    const bgImagePath = path.join(dropbox, `slide${currentSlide.page}`);
    const svgBackgroundSlide = path.join(exportJob.presLocation,
        'svgs', `slide${currentSlide.page}.svg`);
    const svgBackgroundExists = fs.existsSync(svgBackgroundSlide);
    const backgroundFormat = fs.existsSync(`${bgImagePath}.png`) ? 'png' : 'jpeg';

    const dimensions = svgBackgroundExists ?
    probe.sync(fs.readFileSync(svgBackgroundSlide)) :
    probe.sync(fs.readFileSync(`${bgImagePath}.${backgroundFormat}`));

    const slideWidth = parseInt(dimensions.width, 10);
    const slideHeight = parseInt(dimensions.height, 10);

    const maxImageWidth = config.process.maxImageWidth;
    const maxImageHeight = config.process.maxImageHeight;
  
    const ratio = Math.min(maxImageWidth / slideWidth, maxImageHeight / slideHeight);
    const scaledWidth = slideWidth * ratio;
    const scaledHeight = slideHeight * ratio;

    // Create the SVG slide with the background image
    let svg = create({version: '1.0', encoding: 'UTF-8'})
        .ele('svg', {
          'xmlns': 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
          'width': `${scaledWidth}px`,
          'height': `${scaledHeight}px`,
        })
        .dtd({
          pubID: '-//W3C//DTD SVG 1.1//EN',
          sysID: 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd',
        })
        .ele('image', {
          'xlink:href': `file://${dropbox}/slide${currentSlide.page}.${backgroundFormat}`,
          'width': `${scaledWidth}px`,
          'height': `${scaledHeight}px`,
        })
        .up()
        .ele('g', {
          class: 'canvas',
        });

    // 4. Overlay annotations onto slides
    overlay_annotations(svg, currentSlide.annotations);

    svg = svg.end({prettyPrint: true});

    // Write annotated SVG file
    const SVGfile = path.join(dropbox, `annotated-slide${currentSlide.page}.svg`);
    const PDFfile = path.join(dropbox, `annotated-slide${currentSlide.page}.pdf`);

    fs.writeFileSync(SVGfile, svg, function(err) {
      if (err) {
        return logger.error(err);
      }
    });

    // Scale slide back to its original size
    const convertAnnotatedSlide = [
      SVGfile,
      '--output-width', to_px(slideWidth),
      '--output-height', to_px(slideHeight),
      '-o', PDFfile,
    ];

    try {
      cp.spawnSync(config.shared.cairosvg, convertAnnotatedSlide, {shell: false});
    } catch (error) {
      logger.error(`Processing slide ${currentSlide.page} failed for job ${jobId}: ${error.message}`);
      statusUpdate.setError();
    }

    await client.publish(config.redis.channels.publish, statusUpdate.build(currentSlide.page));
    ghostScriptInput.push(PDFfile);
  }

  // Create PDF output directory if it doesn't exist
  const outputDir = path.join(exportJob.presLocation, 'pdfs', jobId);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const filename_with_extension = `${sanitize(exportJob.filename.replace(/\s/g, '_'))}.pdf`;

  const mergePDFs = [
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    `-sOUTPUTFILE="${path.join(outputDir, filename_with_extension)}"`,
    `-dBATCH`].concat(ghostScriptInput);

  // Resulting PDF file is stored in the presentation dir
  try {
    cp.spawnSync(config.shared.ghostscript, mergePDFs, {shell: false});
  } catch (error) {
    return logger.error(`GhostScript failed to merge PDFs in job ${jobId}: ${error.message}`);
  }

  // Launch Notifier Worker depending on job type
  logger.info(`Saved PDF at ${outputDir}/${jobId}/${filename_with_extension}`);

  const notifier = new WorkerStarter({jobType: exportJob.jobType, jobId, filename: filename_with_extension});
  notifier.notify();
  await client.disconnect();
}

process_presentation_annotations();
