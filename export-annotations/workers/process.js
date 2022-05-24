const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const sizeOf = require('image-size');
const { create } = require('xmlbuilder2', { encoding: 'utf-8' });
const { execSync } = require("child_process");
const { Worker, workerData, parentPort } = require('worker_threads');
const path = require('path');
const sanitize = require("sanitize-filename");
const twemoji = require("twemoji")

const jobId = workerData;
const MAGIC_MYSTERY_NUMBER = 2;

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

function color_to_hex(color, isStickyNote = false) {
    if(isStickyNote) { color = `sticky-${color}`}

    switch(color) {
        case 'white': return '#1d1d1d'
        case 'sticky-white': return '#fddf8e'
        case 'lightGray': return '#c6cbd1'
        case 'sticky-lightGray': return '#dde0e3'
        case 'gray': return '#788492'
        case 'sticky-gray': return '#b3b9c1'
        case 'black': return '#1d1d1d'
        case 'sticky-black': return '#fddf8e'
        case 'green': return '#36b24d'
        case 'sticky-green': return '#8ed29b'
        case 'cyan': return '#0e98ad'
        case 'sticky-cyan': return '#78c4d0'
        case 'blue': return '#1c7ed6'
        case 'sticky-blue': return '#80b6e6'
        case 'indigo': return '#4263eb'
        case 'sticky-indigo': return '#95a7f2'
        case 'violet': return '#7746f1'
        case 'sticky-violet': return '#b297f5'
        case 'red': return '#ff2133'
        case 'sticky-red': return '#fd838d'
        case 'orange': return '#ff9433'
        case 'sticky-orange': return '#fdc28d'
        case 'yellow': return '#ffc936'
        case 'sticky-yellow': return '#fddf8e'

        default: return color
    }
}

function align_to_css_property(alignment) {
    switch(alignment) {
        case 'start': return 'left'
        case 'middle': return 'center'
        case 'end': return 'right'
        default: return alignment
    }
}

function text_size_to_px(size, isStickyNote = false) {
    if(isStickyNote) { size = `sticky-${size}`}

    switch(size) {
        case 'sticky-small': return 24
        case 'small': return 28
        case 'sticky-medium': return 36
        case 'medium': return 48
        case 'sticky-large': return 48
        case 'large': return 96

        default: return 28
    }
}

function rad_to_degree(angle) {
    return angle * (180 / Math.PI)
}

function determine_font_from_family(family) {
    switch(family) {
        case 'script': return 'Caveat Brush'

        default: return family
    }
}

function scale_shape(dimension, coord) {
    return (coord / 100.0 * dimension);
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

function overlay_ellipse(svg, annotation, w, h) {
    let shapeColor = color_to_hex(annotation.color);
    let fill = annotation.fill ? `#${shapeColor}` : 'none';

    let x1 = scale_shape(w, annotation.points[0])
    let y1 = scale_shape(h, annotation.points[1])
    let x2 = scale_shape(w, annotation.points[2])
    let y2 = scale_shape(h, annotation.points[3])

    let width_r = Math.abs(x2 - x1) / 2
    let height_r = Math.abs(y2 - y1) / 2
    let hx = Math.abs(x1 + x2) / 2
    let hy = Math.abs(y1 + y2) / 2

    // Normalize the x,y coordinates
    if (x1 > x2) {
        [x1, x2] = [x2, x1]
    }

    if (y1 > y2) {
        [y1, y2] = [y2, y1]
    }

    let path = `M${x1} ${hy}
                A${width_r} ${height_r} 0 0 1 ${hx} ${y1}
                A${width_r} ${height_r} 0 0 1 ${x2} ${hy}
                A${width_r} ${height_r} 0 0 1 ${hx} ${y2}
                A${width_r} ${height_r} 0 0 1 ${x1} ${hy}
                Z`

    svg.ele('g', {
        style: `stroke:#${shapeColor};stroke-width:${scale_shape(w, annotation.thickness)};
                fill:${fill};stroke-linejoin:miter;stroke-miterlimit:8`
    }).ele('path', {
        d: path
    }).up()
}

function overlay_line(svg, annotation, w, h) {
    let shapeColor = color_to_hex(annotation.color);

    svg.ele('g', {
        style: `stroke:#${shapeColor};stroke-width:${scale_shape(w, annotation.thickness)};stroke-linecap:butt`
    }).ele('line', {
        x1: scale_shape(w, annotation.points[0]),
        y1: scale_shape(h, annotation.points[1]),
        x2: scale_shape(w, annotation.points[2]),
        y2: scale_shape(h, annotation.points[3]),
    }).up()
}

function overlay_pencil(svg, annotation, w, h) {
    let shapeColor = color_to_hex(annotation.color);

    if (annotation.points.length < 2) {
        logger.info("Pencil doesn't have enough points")
    }

    else if (annotation.points.length == 2) {
        svg.ele('g', {
            style: `stroke:none;fill:#${shapeColor}`,
        }).ele('circle', {
            cx: scale_shape(w, annotation.points[0]),
            cy: scale_shape(h, annotation.points[1]),
            r:  scale_shape(w, annotation.thickness) / 2
        }).up()
    }

    else {
        let x;
        let y;
        let path =  ""
        let dataPoints = annotation.points

        for(let command of annotation.commands) {
            switch(command){
                case 1: // MOVE TO
                    x = scale_shape(w, dataPoints.shift())
                    y = scale_shape(h, dataPoints.shift())
                    path = `${path} M${x} ${y}`
                    break;
                case 2: // LINE TO
                    x = scale_shape(w, dataPoints.shift())
                    y = scale_shape(h, dataPoints.shift())
                    path = `${path} L${x} ${y}`
                    break;
                case 4: // C_CURVE_TO
                    let cx1 = scale_shape(w, dataPoints.shift())
                    let cy1 = scale_shape(h, dataPoints.shift())
                    let cx2 = scale_shape(w, dataPoints.shift())
                    let cy2 = scale_shape(h, dataPoints.shift())
                    x = scale_shape(w, dataPoints.shift())
                    y = scale_shape(h, dataPoints.shift())
                    path = `${path} C${cx1} ${cy1},${cx2} ${cy2},${x} ${y}`
                    break;
                default:
                    logger.error(`Unknown pencil command: ${annotation.commands[i]}`)       
            }
        }

        svg.ele('g', {
            style: `stroke:#${shapeColor};stroke-linecap:round;stroke-linejoin:round;
            stroke-width:${scale_shape(w, annotation.thickness)};fill:none`
        }).ele('path', {
            d: path
        }).up()
    }
}

function overlay_rectangle(svg, annotation, w, h) {
    let shapeColor = color_to_hex(annotation.color);
    let fill = annotation.fill ? `#${shapeColor}` : 'none';
    
    let x1 = scale_shape(w, annotation.points[0])
    let y1 = scale_shape(h, annotation.points[1])
    let x2 = scale_shape(w, annotation.points[2])
    let y2 = scale_shape(h, annotation.points[3])

    let path = `M${x1} ${y1} L${x2} ${y1} L${x2} ${y2} L${x1} ${y2} Z`

    svg.ele('g', {
        style: `stroke:#${shapeColor};stroke-width:${scale_shape(w, annotation.thickness)};fill:${fill};stroke-linejoin:miter`
    }).ele('path', {
        d: path
    }).up()
}

function overlay_triangle(svg, annotation, w, h) {
    let shapeColor = color_to_hex(annotation.color);
    let fill = annotation.fill ? `#${shapeColor}` : 'none';
    
    let x1 = scale_shape(w, annotation.points[0])
    let y1 = scale_shape(h, annotation.points[1])
    let x2 = scale_shape(w, annotation.points[2])
    let y2 = scale_shape(h, annotation.points[3])

    let px = (x1 + x2) / 2

    let path = `M${px} ${y1} L${x2} ${y2} L${x1} ${y2} Z`

    svg.ele('g', {
        style: `stroke:#${shapeColor};stroke-width:${scale_shape(w, annotation.thickness)};fill:${fill};stroke-linejoin:miter;stroke-miterlimit:8`
    }).ele('path', {
        d: path
    }).up()
}

function overlay_text(svg, annotation) {

    logger.info(annotation);

    let fontColor = color_to_hex(annotation.style.color);
    let fontSize = text_size_to_px(annotation.style.size);
    let rotation = rad_to_degree(annotation.rotation);
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

function overlay_sticky(svg, annotation) {

    let backgroundColor = color_to_hex(annotation.style.color, true);
    let fontSize = text_size_to_px(annotation.style.size, true);
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

function overlay_annotations(svg, currentSlideAnnotations, w, h) {

    logger.info(currentSlideAnnotations)
    // Order slide annotations by z-index
    // currentSlideAnnotations.sort(function (a, b) {
    //     return a.annotationInfo.childIndex < b.annotationInfo.childIndex;
    // });
    // logger.info("SORTED!")
    // logger.info(currentSlideAnnotations)

    for(let annotation of currentSlideAnnotations) {        
        switch (annotation.annotationInfo.type) {
            // case 'ellipse':
            //     overlay_ellipse(svg, annotation.annotationInfo, w, h);
            //     break;
            // case 'line':
            //     overlay_line(svg, annotation.annotationInfo, w, h);
            //     break;
            // case 'pencil':
            //     overlay_pencil(svg, annotation.annotationInfo, w, h);
            //     break;
            // case 'rectangle':
            //     overlay_rectangle(svg, annotation.annotationInfo, w, h);
            //     break;
            case 'sticky':
                overlay_sticky(svg, annotation.annotationInfo);
                break;
            case 'text':
                overlay_text(svg, annotation.annotationInfo);
                break;
            // case 'triangle':
            //     overlay_triangle(svg, annotation.annotationInfo, w, h);
            //     break;
            default:
                logger.error(`Unknown annotation type ${annotation.annotationInfo.type}.`);
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

    fs.writeFileSync(SVGfile, svg, function(err) {
        if(err) { return logger.error(err); }
    });

    let convertAnnotatedSlide = [
        'cairosvg',
        SVGfile,
        '-o', PDFfile
    ].join(' ');

    execSync(convertAnnotatedSlide, (error, stderr) => {
        if (error) {
            return logger.error(`SVG to PDF export failed with error: ${error.message}`);
        }

        if (stderr) {
            return logger.error(`SVG to PDF export failed with stderr: ${stderr}`);
        }
    });

    ghostScriptInput += `${PDFfile} `
}

// Create PDF output directory if it doesn't exist
let output_dir = path.join(exportJob.presLocation, 'pdfs', jobId);

if (!fs.existsSync(output_dir)) { fs.mkdirSync(output_dir, { recursive: true }); }

let filename = sanitize(exportJob.filename.replace(/\s/g, '_'));

console.log(filename)

let mergePDFs = [
    'gs',
    '-dNOPAUSE',
    '-sDEVICE=pdfwrite',
    `-sOUTPUTFILE="${path.join(output_dir, `${filename}.pdf`)}"`,
    `-dBATCH`,
    ghostScriptInput,
    ].join(' ');

// Resulting PDF file is stored in the presentation dir
execSync(mergePDFs, (error, stderr) => {
    if (error) {
        return logger.error(`SVG to PDF export failed with error: ${error.message}`);
    }

    if (stderr) {
        return logger.error(`SVG to PDF export failed with stderr: ${stderr}`);
    }
});

// Launch Notifier Worker depending on job type
logger.info(`Saved PDF at ${output_dir}/${jobId}/${filename}.pdf`);

kickOffNotifierWorker(exportJob.jobType, filename);

parentPort.postMessage({ message: workerData })
