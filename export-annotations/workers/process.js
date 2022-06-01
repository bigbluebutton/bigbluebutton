const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const sizeOf = require('image-size');
const { create } = require('xmlbuilder2', { encoding: 'utf-8' });
const { execSync } = require("child_process");
const { Worker, workerData, parentPort } = require('worker_threads');
const path = require('path');
const sanitize = require("sanitize-filename");
const twemoji = require("twemoji");
const { getStroke, getStrokePoints } = require('perfect-freehand');

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

function align_to_css_property(alignment) {
    switch (alignment) {
        case 'start': return 'left'
        case 'middle': return 'center'
        case 'end': return 'right'
        default: return alignment
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

        default: return color
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
        case 'mono': return 'Source Code Pro'

        default: return family
    }
}

function rad_to_degree(angle) {
    return angle * (180 / Math.PI);
}

function render_HTMLTextBox(htmlFilePath, id, width, height) {
    let commands = [
        'wkhtmltoimage',
        '--format', 'png',
        '--encoding', `${config.process.whiteboardTextEncoding}`,
        '--transparent',
        '--crop-w', width,
        '--crop-h', height,
        '--log-level', 'none',
        '--quality', '100',
        htmlFilePath, path.join(dropbox, `text${id}.png`)
    ]

    execSync(commands.join(' '));
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
    // From steveruizok/perfect-freehand
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

    svg.ele('g', {
        style: `stroke:${shapeColor};stroke-width:${thickness};fill:${fill};${stroke_dasharray}`,
    }).ele('path', {
        d: path,
        transform: `translate(${x} ${y}), rotate(${rotation} ${max_x / 2} ${max_y / 2})`
    }).up()
}

function overlay_ellipse(svg, annotation) {

    let dash = annotation.style.dash;

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
}

function overlay_sticky(svg, annotation) {

    let backgroundColor = color_to_hex(annotation.style.color, true);
    let fontSize = text_size_to_px(annotation.style.size, annotation.style.scale, true);
    let rotation = rad_to_degree(annotation.rotation);
    let font = determine_font_from_family(annotation.style.font);
    let textAlign = align_to_css_property(annotation.style.textAlign);

    let [textBoxWidth, textBoxHeight] = annotation.size;
    let [textBox_x, textBox_y] = annotation.point;

    var html = twemoji.parse(
        `<!DOCTYPE html>
        <style>
            img.emoji { height: 1em; width: 1em; }
            p {
                width:${textBoxWidth}px;
                height:${textBoxHeight}px;
                color:#0d0d0d;
                word-wrap:break-word;
                font-family:${font};
                font-size:${fontSize}px;
                text-align:${textAlign};
                background-color:${backgroundColor};
            }
        </style>
        <html>
            <p>${annotation.text.split('\n').join('<br>')}</p>
        </html>`);

    var htmlFilePath = path.join(dropbox, `text${annotation.id}.html`)

    fs.writeFileSync(htmlFilePath, html, function (err) {
        if (err) logger.error(err);
    })

    render_HTMLTextBox(htmlFilePath, annotation.id, textBoxWidth, textBoxHeight)

    svg.ele('image', {
        'xlink:href': `file://${dropbox}/text${annotation.id}.png`,
        x: textBox_x,
        y: textBox_y,
        width: textBoxWidth,
        height: textBoxHeight,
        transform: `rotate(${rotation}, ${textBox_x + (textBoxWidth / 2)}, ${textBox_y + (textBoxHeight / 2)})`
    }).up();
}

function overlay_text(svg, annotation) {

    let fontColor = color_to_hex(annotation.style.color);
    let fontSize = text_size_to_px(annotation.style.size, annotation.style.scale);
    // let rotation = rad_to_degree(annotation.rotation);
    let font = determine_font_from_family(annotation.style.font);

    let [textBox_x, textBox_y] = annotation.point;
    let textNode = svg.ele('text', {
        'x': textBox_x,
        'y': textBox_y,
        'font-size': fontSize,
        'font-family': font,
        'fill': fontColor,
    });

    for (let line of annotation.text.split('\n')) {
        if (line === '\n') { line = '' }
        textNode.ele('tspan', { x: textBox_x, dy: '1em' }).txt(line).up()
    }
}

// function sortByKey(array, key, pos) {
//     return array.sort(function(a, b) {
//         let [x, y] = [a[key][pos], b[key][pos]]
//         return ((x < y) ? -1 : ((x > y) ? 1 : 0));
//     });
// }

function overlay_annotations(svg, currentSlideAnnotations, w, h) {


    // currentSlideAnnotations = sortByKey(currentSlideAnnotations, 'annotationInfo', 'childIndex');

    for (let annotation of currentSlideAnnotations) {
        console.log("===========================")
        console.log(annotation.annotationInfo.childIndex)
        console.log("===========================")
        switch (annotation.annotationInfo.type) {
            case 'draw':
                overlay_draw(svg, annotation.annotationInfo);
                break;
            case 'ellipse':
                overlay_ellipse(svg, annotation.annotationInfo);
                break;
            case 'rectangle':
                overlay_rectangle(svg, annotation.annotationInfo);
                break;
            case 'sticky':
                overlay_sticky(svg, annotation.annotationInfo);
                break;
            case 'text':
                overlay_text(svg, annotation.annotationInfo);
                break;
            default:
                logger.warn(`Unknown annotation type ${annotation.annotationInfo.type}.`);
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
    var dimensions = sizeOf(path.join(dropbox, `slide${currentSlide.page}.png`));
    var slideWidth = dimensions.width;
    var slideHeight = dimensions.height;

    // Create the SVG slide with the background image
    let svg = create({ version: '1.0', encoding: 'UTF-8' })
        .ele('svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            'xmlns:xlink': 'http://www.w3.org/1999/xlink',
            width: slideWidth,
            height: slideHeight,
        })
        .dtd({
            pubID: '-//W3C//DTD SVG 1.1//EN',
            sysID: 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
        })
        .ele('image', {
            'xlink:href': `file://${dropbox}/slide${currentSlide.page}.png`,
            width: slideWidth,
            height: slideHeight,
        })
        .up()
        .ele('g', {
            class: 'canvas'
        });

    // 4. Overlay annotations onto slides
    // Based on /record-and-playback/presentation/scripts/publish/presentation.rb
    overlay_annotations(svg, currentSlide.annotations, slideWidth, slideHeight)

    svg = svg.end({ prettyPrint: true });
    // Write annotated SVG file
    let SVGfile = path.join(dropbox, `annotated-slide${currentSlide.page}.svg`)
    let PDFfile = path.join(dropbox, `annotated-slide${currentSlide.page}.pdf`)

    fs.writeFileSync(SVGfile, svg, function (err) {
        if (err) { return logger.error(err); }
    });

    let convertAnnotatedSlide = [
        'cairosvg',
        SVGfile,
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
