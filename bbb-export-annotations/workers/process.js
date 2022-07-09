const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const { create } = require('xmlbuilder2', { encoding: 'utf-8' });
const { execSync } = require("child_process");
const { Worker, workerData, parentPort } = require('worker_threads');
const path = require('path');
const sanitize = require('sanitize-filename');
const { getStroke, getStrokePoints } = require('perfect-freehand');
const probe = require('probe-image-size');

const jobId = workerData;

const logger = new Logger('presAnn Process Worker');
logger.info("Processing PDF for job " + jobId);

const kickOffNotifierWorker = (jobType, filename) => {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./workers/notifier.js', { workerData: [jobType, jobId, filename] });
        worker.on('message', resolve);
        worker.on('error', reject);
        worker.on('exit', (code) => {
            if (code !== 0)
                reject(new Error(`PresAnn Notifier Worker stopped with exit code ${code}`));
        })
    })
}

// General utilities for rendering SVGs resembling Tldraw as much as possible
function align_to_pango(alignment) {
    switch (alignment) {
        case 'start': return 'left'
        case 'middle': return 'center'
        case 'end': return 'right'
        case 'justify': return 'justify'
        default: return 'left'
    }
}

function color_to_hex(color, isStickyNote = false, isFilled = false) {
    if (isStickyNote) { color = `sticky-${color}` }
    if (isFilled) { color = `fill-${color}` }

    switch (color) {
        case 'white': return '#1d1d1d'
        case 'fill-white': return '#fefefe'
        case 'sticky-white': return '#fddf8e'
        case 'lightGray': return '#c6cbd1'
        case 'fill-lightGray': return '#f1f2f3'
        case 'sticky-lightGray': return '#dde0e3'
        case 'gray': return '#788492'
        case 'fill-gray': return '#e3e5e7'
        case 'sticky-gray': return '#b3b9c1'
        case 'black': return '#1d1d1d'
        case 'fill-black': return '#d2d2d2'
        case 'sticky-black': return '#fddf8e'
        case 'green': return '#36b24d'
        case 'fill-green': return '#d7eddb'
        case 'sticky-green': return '#8ed29b'
        case 'cyan': return '#0e98ad'
        case 'fill-cyan': return '#d0e8ec'
        case 'sticky-cyan': return '#78c4d0'
        case 'blue': return '#1c7ed6'
        case 'fill-blue': return '#d2e4f4'
        case 'sticky-blue': return '#80b6e6'
        case 'indigo': return '#4263eb'
        case 'fill-indigo': return '#d9dff7'
        case 'sticky-indigo': return '#95a7f2'
        case 'violet': return '#7746f1'
        case 'fill-violet': return '#e2daf8'
        case 'sticky-violet': return '#b297f5'
        case 'red': return '#ff2133'
        case 'fill-red': return '#fbd3d6'
        case 'sticky-red': return '#fd838d'
        case 'orange': return '#ff9433'
        case 'fill-orange': return '#fbe8d6'
        case 'sticky-orange': return '#fdc28d'
        case 'yellow': return '#ffc936'
        case 'fill-yellow': return '#fbf1d7'
        case 'sticky-yellow': return '#fddf8e'

        default: return '#0d0d0d'
    }
}

function determine_dasharray(dash, gap = 0) {

    switch (dash) {
        case 'dashed': return `stroke-linecap:butt;stroke-dasharray:${gap};`
        case 'dotted': return `stroke-linecap:round;stroke-dasharray:${gap};`

        default: return 'stroke-linejoin:round;stroke-linecap:round;'
    }
}

function determine_font_from_family(family) {
    switch (family) {
        case 'script': return 'Caveat Brush'
        case 'sans': return 'Source Sans Pro'
        case 'serif': return 'Crimson Pro'
        // Temporary workaround due to typo in messages
        case 'erif': return 'Crimson Pro'
        case 'mono': return 'Source Code Pro'

        default: return 'Caveat Brush'
    }
}

function rad_to_degree(angle) {
    return angle * (180 / Math.PI);
}

// Convert pixels to points
function to_pt(px) {
    return (px / config.process.pixelsPerInch) * config.process.pointsPerInch
}

// Convert points to pixels
function to_px(pt) {
    return (pt / config.process.pointsPerInch) * config.process.pixelsPerInch
}

function render_textbox(textColor, font, fontSize, textAlign, text, id, textBoxWidth = null) {
    
    fontSize = to_pt(fontSize) * config.process.textScaleFactor

    // Sticky notes need automatic line wrapping: take width into account
    // Texbox scaled by a constant factor to improve resolution at small scales
    let size = textBoxWidth ? `-size ${textBoxWidth * config.process.textScaleFactor}x` : ''

    let pangoText = `pango:"<span font_family='${font}' font='${fontSize}' color='${textColor}'>${text}</span>"`

    let justify = textAlign === 'justify'
    textAlign = justify ? 'left' : textAlign

    let commands = [
        'convert',
        '-encoding', `${config.process.whiteboardTextEncoding}`,
        '-density', config.process.pixelsPerInch,
        '-background', 'transparent',
        size,
        '-define', `pango:align=${textAlign}`,
        '-define', `pango:justify=${justify}`,
        '-define', 'pango:wrap=word-char',
        pangoText,
        path.join(dropbox, `text${id}.png`)
    ].join(' ')

    execSync(commands);
}

function get_gap(dash, size) {
    switch (dash) {
        case 'dashed':
            if (size == 'small') { return '8 8' }
            else if (size == 'medium') { return '14 14' }
            else { return '20 20' }
        case 'dotted':
            if (size == 'small') { return '0.1 8' }
            else if (size == 'medium') { return '0.1 14' }
            else { return '0.1 20' }

        default: return '0'
    }
}

function get_stroke_width(dash, size) {
    switch (size) {
        case 'small': if (dash === 'draw') { return 1 } else { return 4 };
        case 'medium': if (dash === 'draw') { return 1.75 } else { return 6.25 };
        case 'large': if (dash === 'draw') { return 2.5 } else { return 8.5 }

        default: return 1;
    }
}

function sortByKey(array, key, value) {
    return array.sort(function (a, b) {
        let [x, y] = [a[key][value], b[key][value]];
        return x - y;
    });
}

function text_size_to_px(size, scale = 1, isStickyNote = false) {
    if (isStickyNote) { size = `sticky-${size}` }

    switch (size) {
        case 'sticky-small': return 24
        case 'small': return 28 * scale
        case 'sticky-medium': return 36
        case 'medium': return 48 * scale
        case 'sticky-large': return 48
        case 'large': return 96 * scale

        default: return 28 * scale
    }
}

// Methods based on tldraw's utilities
function getPath(annotationPoints) {
    // Gets inner path of a stroke outline
    // For solid, dashed, and dotted types
    let stroke = getStrokePoints(annotationPoints).map((strokePoint) => strokePoint.point);

    let [max_x, max_y] = [0, 0];
    let path = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            if (!arr[i + 1]) return acc
            let [x1, y1] = arr[i + 1]
            if (x1 >= max_x) { max_x = x1 }
            if (y1 >= max_y) { max_y = y1 }
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
            return acc
        },

        ['M', ...stroke[0], 'Q']
    )

    path.join(' ');
    return [path, max_x, max_y];
}

function getOutlinePath(annotationPoints) {
    // Gets outline of a hand-drawn input, with pressure
    let stroke = getStroke(annotationPoints, {
        simulatePressure: true,
        size: 8,
    });

    let [max_x, max_y] = [0, 0];
    let path = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            let [x1, y1] = arr[(i + 1) % arr.length]
            if (x1 >= max_x) { max_x = x1 }
            if (y1 >= max_y) { max_y = y1 }
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
            return acc;
        },

        ['M', ...stroke[0], 'Q']
    );

    path.push('Z');
    path.join(' ');

    return [path, max_x, max_y];
}

function circleFromThreePoints(A, B, C) {
    let [x1, y1] = A
    let [x2, y2] = B
    let [x3, y3] = C

    let a = x1 * (y2 - y3) - y1 * (x2 - x3) + x2 * y3 - x3 * y2

    let b =
        (x1 * x1 + y1 * y1) * (y3 - y2) +
        (x2 * x2 + y2 * y2) * (y1 - y3) +
        (x3 * x3 + y3 * y3) * (y2 - y1)

    let c =
        (x1 * x1 + y1 * y1) * (x2 - x3) +
        (x2 * x2 + y2 * y2) * (x3 - x1) +
        (x3 * x3 + y3 * y3) * (x1 - x2)

    let x = -b / (2 * a)
    let y = -c / (2 * a)

    return [x, y, Math.hypot(x - x1, y - y1)]
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
}

function getArcLength(C, r, A, B) {
    let sweep = getSweep(C, A, B);
    return r * (2 * Math.PI) * (sweep / (2 * Math.PI));
}

function getSweep(C, A, B) {

    // Get angle between two vectors in radians
    let a0 = Math.atan2(A[1] - C[1], A[0] - C[0]);
    let a1 = Math.atan2(B[1] - C[1], B[0] - C[0]);

    // Short distance between two angles
    let max = Math.PI * 2
    let da = (a1 - a0) % max

    return ((2 * da) % max) - da
}

function intersectCircleCircle(c1, r1, c2, r2) {

    let dx = c2[0] - c1[0];
    let dy = c2[1] - c1[1];

    let d = Math.sqrt(dx * dx + dy * dy);
    let x = (d * d - r2 * r2 + r1 * r1) / (2 * d);
    let y = Math.sqrt(r1 * r1 - x * x);

    dx /= d
    dy /= d

    return [[c1[0] + dx * x - dy * y, c1[1] + dy * x + dx * y],
    [c1[0] + dx * x + dy * y, c1[1] + dy * x - dx * y]]
}

function rotWith(A, C, r = 0) {
    // Rotate a vector A around another vector C by r radians
    if (r === 0) return A

    let s = Math.sin(r)
    let c = Math.cos(r)

    let px = A[0] - C[0]
    let py = A[1] - C[1]

    let nx = px * c - py * s
    let ny = px * s + py * c

    return [nx + C[0], ny + C[1]]
}

function nudge(A, B, d) {
    // Pushes a point A towards a point B by a given distance
    if (A[0] === B[0] && A[1] === B[1]) return A

    // B - A
    let sub = [B[0] - A[0], B[1] - A[1]];

    // Vector length
    let len = Math.hypot(sub[0], sub[1]);

    // Get unit vector
    let unit = [sub[0] / len, sub[1] / len];

    // Multiply by distance
    let mul = [unit[0] * d, unit[1] * d];

    return [A[0] + mul[0], A[1] + mul[1]]
}

function getCurvedArrowHeadPath(A, r1, C, r2, sweep) {
    const phi = (1 + Math.sqrt(5)) / 2;

    // Determine intersections between two circles
    let ints = intersectCircleCircle(A, r1 * (phi - 1), C, r2)

    if (!ints) {
        logger.info('Could not find an intersection for the arrow head.')
        return { left: A, right: A }
    }

    let int = sweep ? ints[0] : ints[1]
    let left = int ? nudge(rotWith(int, A, Math.PI / 6), A, r1 * -0.382) : A
    let right = int ? nudge(rotWith(int, A, -Math.PI / 6), A, r1 * -0.382) : A

    return `M ${left} L ${A} ${right}`
}

// Methods to convert Akka message contents into SVG
function overlay_arrow(svg, annotation) {

    let [x, y] = annotation.point;
    let bend = annotation.bend;
    let decorations = annotation.decorations;

    let dash = annotation.style.dash;
    dash = (dash == 'draw') ? 'solid' : dash // Use 'solid' thickness

    let shapeColor = color_to_hex(annotation.style.color);
    let sw = get_stroke_width(dash, annotation.style.size);
    let gap = get_gap(dash, annotation.style.size);
    let stroke_dasharray = determine_dasharray(dash, gap);

    let [start_x, start_y] = annotation.handles.start.point;
    let [end_x, end_y] = annotation.handles.end.point;
    let [bend_x, bend_y] = annotation.handles.bend.point;

    let line = [];
    let arrowHead = [];
    let arrowDistance = distance(start_x, start_y, end_x, end_y);
    let arrowHeadLength = Math.min(arrowDistance / 3, 8 * sw);
    let isStraightLine = parseFloat(bend).toFixed(3) == 0;

    let angle = Math.atan2(end_y - start_y, end_x - start_x)

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
        let circle = circleFromThreePoints([start_x, start_y], [bend_x, bend_y], [end_x, end_y]);
        let center = [circle[0], circle[1]]
        let radius = circle[2]
        let length = getArcLength(center, radius, [start_x, start_y], [end_x, end_y]);

        line.push(`M ${start_x} ${start_y} A ${radius} ${radius} 0 0 ${length > 0 ? '1' : '0'} ${end_x} ${end_y}`);

        if (decorations.start)
            arrowHead.push(getCurvedArrowHeadPath([start_x, start_y], arrowHeadLength, center, radius, length < 0));
        else if (decorations.end) {
            arrowHead.push(getCurvedArrowHeadPath([end_x, end_y], arrowHeadLength, center, radius, length >= 0));
        }
    }

    // The arrowhead is purposely not styled (e.g., dashed / dotted)
    svg.ele('g', {
        style: `stroke:${shapeColor};stroke-width:${sw};fill:none;`,
        transform: `translate(${x} ${y})`
    }).ele('path', {
        'style': stroke_dasharray,
        d: line.join(' '),
    }).up()
        .ele('path', {
            d: arrowHead.join(' '),
        }).up();
}

function overlay_draw(svg, annotation) {
    let dash = annotation.style.dash;

    let [path, max_x, max_y] = (dash == 'draw') ? getOutlinePath(annotation.points) : getPath(annotation.points);

    if (!path.length) return;

    let shapeColor = color_to_hex(annotation.style.color);
    let rotation = rad_to_degree(annotation.rotation);
    let thickness = get_stroke_width(dash, annotation.style.size);
    let gap = get_gap(dash, annotation.style.size);

    let [x, y] = annotation.point;

    let stroke_dasharray = determine_dasharray(dash, gap);
    let fill = (dash === 'draw') ? shapeColor : 'none';

    let shapeFillColor = color_to_hex(`fill-${annotation.style.color}`)
    let shapeTransform = `translate(${x} ${y}), rotate(${rotation} ${max_x / 2} ${max_y / 2})`

    // Fill assuming solid, small pencil used when path start- and end points overlap
    let shapeIsFilled =
        annotation.style.isFilled &&
        annotation.points.length > 3
        && Math.round(distance(
            annotation.points[0][0],
            annotation.points[0][1],
            annotation.points[annotation.points.length - 1][0],
            annotation.points[annotation.points.length - 1][1]
        )) <= 2 * get_stroke_width('solid', 'small');

    if (shapeIsFilled) {
        svg.ele('path', {
            style: `fill:${shapeFillColor};`,
            d: getPath(annotation.points)[0] + 'Z',
            transform: shapeTransform
        }).up()
    }

    svg.ele('path', {
        style: `stroke:${shapeColor};stroke-width:${thickness};fill:${fill};${stroke_dasharray}`,
        d: path,
        transform: shapeTransform
    })
}

function overlay_ellipse(svg, annotation) {

    let dash = annotation.style.dash;
    dash = (dash == 'draw') ? 'solid' : dash // Use 'solid' thickness for draw type

    let [x, y] = annotation.point; // Ellipse center coordinates
    let [rx, ry] = annotation.radius;
    let isFilled = annotation.style.isFilled;

    let shapeColor = color_to_hex(annotation.style.color);
    let fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

    let rotation = rad_to_degree(annotation.rotation);
    let sw = get_stroke_width(dash, annotation.style.size);
    let gap = get_gap(dash, annotation.style.size);

    let stroke_dasharray = determine_dasharray(dash, gap);

    svg.ele('g', {
        style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
    }).ele('ellipse', {
        'cx': x + rx,
        'cy': y + ry,
        'rx': rx,
        'ry': ry,
        transform: `rotate(${rotation} ${x + rx} ${y + ry})`
    }).up()

    if (annotation.label) { overlay_shape_label(svg, annotation) }
}

function overlay_rectangle(svg, annotation) {

    let dash = annotation.style.dash;
    let rect_dash = (dash == 'draw') ? 'solid' : dash // Use 'solid' thickness for draw type

    let [x, y] = annotation.point;
    let [w, h] = annotation.size;
    let isFilled = annotation.style.isFilled;

    let shapeColor = color_to_hex(annotation.style.color);
    let fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

    let rotation = rad_to_degree(annotation.rotation);
    let sw = get_stroke_width(rect_dash, annotation.style.size);
    let gap = get_gap(dash, annotation.style.size);

    let stroke_dasharray = determine_dasharray(dash, gap);

    let rx = (dash == 'draw') ? Math.min(w / 4, sw * 2) : 0;
    let ry = (dash == 'draw') ? Math.min(h / 4, sw * 2) : 0;

    svg.ele('g', {
        style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
    }).ele('rect', {
        width: w,
        height: h,
        'rx': rx,
        'ry': ry,
        transform: `translate(${x} ${y}), rotate(${rotation} ${w / 2} ${h / 2})`
    }).up()

    if (annotation.label) { overlay_shape_label(svg, annotation) }
}

function overlay_shape_label(svg, annotation) {

    let fontColor = color_to_hex(annotation.style.color);
    let font = determine_font_from_family(annotation.style.font);
    let fontSize = text_size_to_px(annotation.style.size, annotation.style.scale);
    let textAlign = 'center';
    let text = annotation.label;
    let id = annotation.id;
    let rotation = rad_to_degree(annotation.rotation);

    let [shape_width, shape_height] = annotation.size
    let [shape_x, shape_y] = annotation.point;

    let x_offset = annotation.labelPoint[0]
    let y_offset = annotation.labelPoint[1]

    let label_center_x = shape_x + shape_width * x_offset
    let label_center_y = shape_y + shape_height * y_offset
    
    render_textbox(fontColor, font, fontSize, textAlign, text, id);

    let dimensions = probe.sync(fs.readFileSync(path.join(dropbox, `text${id}.png`)));
    let labelWidth = dimensions.width / config.process.textScaleFactor;
    let labelHeight = dimensions.height / config.process.textScaleFactor;
    
    svg.ele('g', {
        transform: `rotate(${rotation} ${label_center_x} ${label_center_y})`
    }).ele('image', {
        x: label_center_x - (labelWidth * x_offset),
        y: label_center_y - (labelHeight * y_offset),
        width: labelWidth,
        height: labelHeight,
        'xlink:href': `file://${dropbox}/text${id}.png`,
    }).up();
}

function overlay_sticky(svg, annotation) {

    let backgroundColor = color_to_hex(annotation.style.color, true);
    let fontSize = text_size_to_px(annotation.style.size, annotation.style.scale, true);
    let rotation = rad_to_degree(annotation.rotation);
    let font = determine_font_from_family(annotation.style.font);
    let textAlign = align_to_pango(annotation.style.textAlign);

    let [textBoxWidth, textBoxHeight] = annotation.size;
    let [textBox_x, textBox_y] = annotation.point;

    let textColor = "#0d0d0d" // For sticky notes
    let text = annotation.text
    let id = annotation.id;

    render_textbox(textColor, font, fontSize, textAlign, text, id, textBoxWidth);

    // Overlay transparent text image over empty sticky note
    svg.ele('g', {
        transform: `rotate(${rotation}, ${textBox_x + (textBoxWidth / 2)}, ${textBox_y + (textBoxHeight / 2)})`
    }).ele('rect', {
        x: textBox_x,
        y: textBox_y,
        width: textBoxWidth,
        height: textBoxHeight,
        fill: backgroundColor,
    }).up()
    .ele('image', {
        x: textBox_x,
        y: textBox_y,
        width: textBoxWidth,
        height: textBoxHeight,
        'xlink:href': `file://${dropbox}/text${id}.png`,
    }).up();
}

function overlay_triangle(svg, annotation) {

    let dash = annotation.style.dash;
    dash = (dash == 'draw') ? 'solid' : dash

    let [x, y] = annotation.point;
    let [w, h] = annotation.size;
    let isFilled = annotation.style.isFilled;

    let shapeColor = color_to_hex(annotation.style.color);
    let fillColor = isFilled ? color_to_hex(annotation.style.color, false, isFilled) : 'none';

    let rotation = rad_to_degree(annotation.rotation);
    let sw = get_stroke_width(dash, annotation.style.size);
    let gap = get_gap(dash, annotation.style.size);

    let stroke_dasharray = determine_dasharray(dash, gap);
    let points = `${w / 2} 0, ${w} ${h}, 0 ${h}, ${w / 2} 0`

    svg.ele('g', {
        style: `stroke:${shapeColor};stroke-width:${sw};fill:${fillColor};${stroke_dasharray}`,
    }).ele('polygon', {
        'points': points,
        transform: `translate(${x}, ${y}), rotate(${rotation} ${w / 2} ${h / 2})`
    }).up()

    if (annotation.label) { overlay_shape_label(svg, annotation) }
}

function overlay_text(svg, annotation) {

    let [textBoxWidth, textBoxHeight] = annotation.size;
    let fontColor = color_to_hex(annotation.style.color);
    let font = determine_font_from_family(annotation.style.font);
    let fontSize = text_size_to_px(annotation.style.size, annotation.style.scale);
    let textAlign = align_to_pango(annotation.style.textAlign);
    let text = annotation.text
    let id = annotation.id;

    let rotation = rad_to_degree(annotation.rotation);
    let [textBox_x, textBox_y] = annotation.point;

    render_textbox(fontColor, font, fontSize, textAlign, text, id);

    let rotation_x = textBox_x + (textBoxWidth / 2)
    let rotation_y = textBox_y + (textBoxHeight / 2)

    svg.ele('g', {
        transform: `rotate(${rotation} ${rotation_x} ${rotation_y})`
    }).ele('image', {
        x: textBox_x,
        y: textBox_y,
        width: textBoxWidth,
        height: textBoxHeight,
        'xlink:href': `file://${dropbox}/text${id}.png`,
    }).up();
}

function overlay_annotation(svg, currentAnnotation) {

    if (currentAnnotation.childIndex >= 1) {
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
}

function overlay_annotations(svg, currentSlideAnnotations) {

    // Sort annotations by lowest child index
    currentSlideAnnotations = sortByKey(currentSlideAnnotations, 'annotationInfo', 'childIndex');

    for (let annotation of currentSlideAnnotations) {

        switch (annotation.annotationInfo.type) {
            case 'group':
                // Get annotations that have this group as parent
                let children = annotation.annotationInfo.children;

                for (let childId of children) {
                    let childAnnotation = currentSlideAnnotations.find(ann => ann.id == childId);
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

// 1. Get the job
const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);
let job = fs.readFileSync(path.join(dropbox, 'job'));
let exportJob = JSON.parse(job);

// 2. Get the annotations
let annotations = fs.readFileSync(path.join(dropbox, 'whiteboard'));
let whiteboard = JSON.parse(annotations);
let pages = JSON.parse(whiteboard.pages);
let ghostScriptInput = ""

// 3. Convert annotations to SVG
for (let currentSlide of pages) {

    let backgroundImagePath = path.join(dropbox, `slide${currentSlide.page}`);
    let svgBackgroundSlide = path.join(exportJob.presLocation, 'svgs',  `slide${currentSlide.page}.svg`);
    let svgBackgroundExists = fs.existsSync(svgBackgroundSlide);
    let backgroundFormat = fs.existsSync(`${backgroundImagePath}.png`) ? 'png' : 'jpeg'

    // Output dimensions in pixels even if stated otherwise (pt)
    // CairoSVG didn't like attempts to read the dimensions from a stream
    // that would prevent loading file in memory
    // Ideally, use dimensions provided by tldraw's background image asset
    // (this is not yet always provided)
    let dimensions = svgBackgroundExists ? 
        probe.sync(fs.readFileSync(svgBackgroundSlide)) :
        probe.sync(fs.readFileSync(`${backgroundImagePath}.${backgroundFormat}`));

    let slideWidth = parseInt(dimensions.width, 10);
    let slideHeight = parseInt(dimensions.height, 10);

    // Create the SVG slide with the background image
    let svg = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            width: `${slideWidth}px`,
            height: `${slideHeight}px`,
        })
        .dtd({
            pubID: '-//W3C//DTD SVG 1.1//EN',
            sysID: 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
        })
        .ele('image', {
            'xlink:href': `file://${dropbox}/slide${currentSlide.page}.${backgroundFormat}`,
            width: `${slideWidth}px`,
            height: `${slideHeight}px`,
        })
        .up()
        .ele('g', {
            class: 'canvas'
        });

    // 4. Overlay annotations onto slides
    overlay_annotations(svg, currentSlide.annotations)

    svg = svg.end({ prettyPrint: true });
    
    // Write annotated SVG file
    let SVGfile = path.join(dropbox, `annotated-slide${currentSlide.page}.svg`)
    let PDFfile = path.join(dropbox, `annotated-slide${currentSlide.page}.pdf`)

    fs.writeFileSync(SVGfile, svg, function (err) {
        if (err) { return logger.error(err); }
    });

    // Dimensions converted back to a pixel size which,
    // when converted to points, will yield the desired
    // dimension in pixels when read without conversion

    // e.g. say Tldraw's canvas is 1920x1080 px.
    // The background SVG dimensions are set to 1920x1080 pt (incorrect unit).
    // So we read it in ignoring the unit as 1920x1080 px, making the position of the drawings match.
    // Now we assume we had 1920x1080pt and resize to 2560x1440 px so that the SVG generates with the original "wrong" size.

    let convertAnnotatedSlide = [
        'cairosvg',
        SVGfile,
        '--output-width', to_px(slideWidth),
        '--output-height', to_px(slideHeight),
        '-o', PDFfile
    ].join(' ');

    execSync(convertAnnotatedSlide);

    ghostScriptInput += `${PDFfile} `
}

// Create PDF output directory if it doesn't exist
let output_dir = path.join(exportJob.presLocation, 'pdfs', jobId);

if (!fs.existsSync(output_dir)) { fs.mkdirSync(output_dir, { recursive: true }); }

let filename = sanitize(exportJob.filename.replace(/\s/g, '_'));

let mergePDFs = [
    'gs',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    `-sOUTPUTFILE="${path.join(output_dir, `${filename}.pdf`)}"`,
    `-dBATCH`,
    ghostScriptInput,
].join(' ');

// Resulting PDF file is stored in the presentation dir
execSync(mergePDFs);

// Launch Notifier Worker depending on job type
logger.info(`Saved PDF at ${output_dir}/${jobId}/${filename}.pdf`);

kickOffNotifierWorker(exportJob.jobType, filename);

parentPort.postMessage({ message: workerData });
