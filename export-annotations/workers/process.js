const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const convert = require('xml-js');
const { create } = require('xmlbuilder2', { encoding: 'utf-8' });
const { execSync } = require("child_process");
const { workerData, parentPort } = require('worker_threads')

const jobId = workerData;
const MAGIC_MYSTERY_NUMBER = 2;

const logger = new Logger('presAnn Process Worker');
logger.info("Processing PDF for job " + jobId);

function scale_shape(dimension, coord){
    return (coord / 100.0 * dimension);
}

function measure_length(string, fontSize) {
    // TODO: find faster way to measure string length
    if (string.length == 0) {
        return 0;
    }

    var output;
    output = execSync(`convert xc: -font ${config.process.font} -pointsize ${fontSize} -debug annotate -annotate 0 "${string}" null: 2>&1`, (error, stderr) => {
        if (error) {
            logger.error(`Error when measuring length of string ${string} with ImageMagick: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.error(`stderr when measuring lenght of string "${string}" with ImageMagick ${stderr}`);
            return;
        }
    })

    output = String(output).split(" ")
    const textWidth = (element) => element == 'width:';
    var index = output.findIndex(textWidth);

    return Number(output[index + 1].replace(/[^0-9]/g,''));
}

function overlay_ellipse(svg, annotation, w, h) {
    let shapeColor = Number(annotation.color).toString(16)
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

    path = `M${x1} ${hy}
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
    let shapeColor = Number(annotation.color).toString(16)

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
    let shapeColor = Number(annotation.color).toString(16)

    if (annotation.points.length < 2) {
        logger.info("Pencil doesn't have enough points")
        return;
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
        let path =  ""
        let dataPoints = annotation.points

        for(let i = 0; i < annotation.commands.length; i++) {
            switch(annotation.commands[i]){
                case 1: // MOVE TO
                    var x = scale_shape(w, dataPoints.shift())
                    var y = scale_shape(h, dataPoints.shift())
                    path = `${path} M${x} ${y}`
                    break;
                case 2: // LINE TO
                    var x = scale_shape(w, dataPoints.shift())
                    var y = scale_shape(h, dataPoints.shift())
                    path = `${path} L${x} ${y}`
                    break;
                case 4: // C_CURVE_TO
                    var cx1 = scale_shape(w, dataPoints.shift())
                    var cy1 = scale_shape(h, dataPoints.shift())
                    var cx2 = scale_shape(w, dataPoints.shift())
                    var cy2 = scale_shape(h, dataPoints.shift())
                    var x = scale_shape(w, dataPoints.shift())
                    var y = scale_shape(h, dataPoints.shift())
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

function overlay_poll(svg, annotation, w, h) {
    if (annotation.result.length == 0) {
        return;
    }

    let poll_x = scale_shape(w, annotation.points[0]);
    let poll_y = scale_shape(h, annotation.points[1]);
    let poll_width = Math.round(scale_shape(w, annotation.points[2]));
    let poll_height = Math.round(scale_shape(h, annotation.points[3]));
    let pollId = annotation.id.replace(/\//g, '');
    let pollSVG = `${dropbox}/poll-${pollId}.svg`
    let pollJSON = `${dropbox}/poll-${pollId}.json`

    // Rename 'numVotes' key to 'num_votes'
    let pollJSONContent = annotation.result.map(result => {
        result.num_votes = result.numVotes;
        delete result.numVotes;
        return result;
    });

    // Store the poll result in a JSON file
    fs.writeFileSync(pollJSON, JSON.stringify(pollJSONContent), function(err) {
        if(err) { return logger.error(err); }
    });

    // Create empty SVG poll
    fs.writeFileSync(pollSVG, '', function(err) {
        if(err) { return logger.error(err); }
    });

    // Render the poll SVG using gen_poll_svg script
    execSync(`${config.genPollSVG.path} -i ${pollJSON} -w ${poll_width} -h ${poll_height} -n ${annotation.numResponders} -o ${pollSVG}`, (error, stderr) => {
        if (error) {
            logger.error(`Poll generation failed with error: ${error.message}`);
            return;
        }
        if (stderr) {
            logger.error(`Poll generation failed with stderr: ${stderr}`);
            return;
        }
    });

    // Add poll image element
    svg.ele('image', {
        'xlink:href': `file://${pollSVG}`,
        x: poll_x,
        y: poll_y,
        width: poll_width,
        height: poll_height,
    })
}

function overlay_rectangle(svg, annotation, w, h) {
    let shapeColor = Number(annotation.color).toString(16)
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
    let shapeColor = Number(annotation.color).toString(16)
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

function overlay_text(svg, annotation, w, h) {
    let fontColor = Number(annotation.fontColor).toString(16)

    let textBoxWidth = scale_shape(w, annotation.textBoxWidth);
    let textBoxHeight = scale_shape(h, annotation.textBoxHeight);
    let textBox_x = scale_shape(w, annotation.x);
    let textBox_y = scale_shape(h, annotation.y);

    let fontSize = scale_shape(h, annotation.calcedFontSize)
    let lines = annotation.text.replace(/\r\n|\n\r|\n|\r/g,'\n').split('\n');

    let textBox = svg.ele('svg', {
        x: textBox_x,
        y: textBox_y,
        width: textBoxWidth,
        height: textBoxHeight
    });

    var yOffset = 1; // in em
    var wrappedLine = [];
    var wrappedLineLength = 0;

    for(let i = 0; i < lines.length; i++) {
        var lineLength = measure_length(lines[i], fontSize);
        
        if (lineLength < textBoxWidth) {
            // Line fits in text box. Can be displayed as-is
            textBox.ele('text', {
                style: `fill:#${fontColor};font-family:Arial;font-size:${fontSize}px`,
                dy: `${yOffset}em`,
            }).txt(lines[i]).up()

            yOffset += 1;
        }

        else {
            // Split line into words, keeping the whitespace
            words = lines[i].split(/(\s+)/);

            // Generate line breaks due to word wrapping
            for(let j = 0; j < words.length; j++) {
                wordLength = measure_length(words[j], fontSize);

                // If word fits in line, add it
                if (wrappedLineLength + wordLength <= textBoxWidth) {
                    wrappedLine.push(words[j])
                    wrappedLineLength += wordLength;

                } else if (wordLength > textBoxWidth) {
                    // If the word itself is wider than the textbox, place the characters individually
                    var chars = words[j].split('');
                    
                    for(let k = 0; k < chars.length; k++){
                        var charWidth = measure_length(chars[k], fontSize);

                        // If the character fits, add it
                        if (charWidth + wrappedLineLength <= textBoxWidth) {
                            wrappedLine.push(chars[k]);
                            wrappedLineLength += charWidth;
                        }

                        else {
                            // Line became too long due to the new character: add the characters that fit
                            var leftoverWord = chars.slice(k).join('');

                            textBox.ele('text', {
                                style: `fill:#${fontColor};font-family:Arial;font-size:${fontSize}px`,
                                dy: `${yOffset}em`,
                            }).txt(wrappedLine.join('')).up()

                            yOffset += 1;
                            wrappedLine = [leftoverWord];
                            wrappedLineLength = wordLength;
                            break;
                        }
                    }

                    // Add remaining part of the word on a new line
                    textBox.ele('text', {
                        style: `fill:#${fontColor};font-family:Arial;font-size:${fontSize}px`,
                        dy: `${yOffset}em`,
                    }).txt(wrappedLine.join('')).up()

                } else {
                    // If the line became too long, add the words that came previously
                    // and add a linebreak starting with the word that didn't fit
                    textBox.ele('text', {
                        style: `fill:#${fontColor};font-family:Arial;font-size:${fontSize}px`,
                        dy: `${yOffset}em`,
                    }).txt(wrappedLine.join('')).up()
                    
                    yOffset += 1;
                    wrappedLine = [words[j]]
                    wrappedLineLength = wordLength;
                }
            }

            // Add remaining text elements
            textBox.ele('text', {
                style: `fill:#${fontColor};font-family:Arial;font-size:${fontSize}px`,
                dy: `${yOffset}em`,
            }).txt(wrappedLine.join('')).up()
        }
    }
}

function overlay_line(svg, annotation, w, h) {
    let shapeColor = Number(annotation.color).toString(16)

    svg.ele('g', {
        style: `stroke:#${shapeColor};stroke-width:${scale_shape(w, annotation.thickness)};stroke-linecap:butt`
    }).ele('line', {
        x1: scale_shape(w, annotation.points[0]),
        y1: scale_shape(h, annotation.points[1]),
        x2: scale_shape(w, annotation.points[2]),
        y2: scale_shape(h, annotation.points[3]),
    }).up()
}

function overlay_annotations(svg, annotations, w, h) {
    for(let i = 0; i < annotations.length; i++) {        
        switch (annotations[i].annotationType) {
            case 'ellipse':
                overlay_ellipse(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'line':
                overlay_line(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'poll_result':
                overlay_poll(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'pencil':
                overlay_pencil(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'rectangle':
                overlay_rectangle(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'text':
                overlay_text(svg, annotations[i].annotationInfo, w, h);
                break;
            case 'triangle':
                overlay_triangle(svg, annotations[i].annotationInfo, w, h);
                break;
            default:
                logger.error(`Unknown annotation type ${annotations[i].annotationType}.`);
        }
    }
}

// Process the presentation pages and annotations into a PDF file

// 1. Get the job
const dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`
let job = fs.readFileSync(`${dropbox}/job`);
let exportJob = JSON.parse(job);

// 2. Get the annotations
let annotations = fs.readFileSync(`${dropbox}/whiteboard`);
let whiteboard = JSON.parse(annotations);
let pages = JSON.parse(whiteboard.pages);
let rsvgConvertInput = ""

// 3. Convert annotations to SVG
for (let i = 0; i < pages.length; i++) {
    
    // Get the current slide (without annotations)
    let currentSlide = pages[i]
    var backgroundSlide = fs.readFileSync(`${dropbox}/slide${pages[i].page}.svg`).toString();
    
    // Read background slide in as JSON to determine dimensions
    // TODO: find a better way to get width and height of slide (e.g. as part of message)
    backgroundSlide = JSON.parse(convert.xml2json(backgroundSlide));

    // There's a bug with older versions of rsvg which defaults SVG output to pixels.
    // So we ignore the units here as well.
    // See: https://gitlab.gnome.org/GNOME/librsvg/-/issues/766
    var slideWidth = Number(backgroundSlide.elements[0].attributes.width.replace(/\D/g, ""))
    var slideHeight = Number(backgroundSlide.elements[0].attributes.height.replace(/\D/g, ""))

    var panzoom_x = -currentSlide.xOffset * MAGIC_MYSTERY_NUMBER / 100.0 * slideWidth
    var panzoom_y = -currentSlide.yOffset * MAGIC_MYSTERY_NUMBER / 100.0 * slideHeight
    var panzoom_w = scale_shape(slideWidth, currentSlide.widthRatio)
    var panzoom_h = scale_shape(slideHeight, currentSlide.heightRatio)

    // Create the SVG slide with the background image
    let svg = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    width: slideWidth,
                    height: slideHeight,
                    viewBox: `${panzoom_x} ${panzoom_y} ${panzoom_w} ${panzoom_h}`
                })
                .dtd({ 
                    pubID: '-//W3C//DTD SVG 1.1//EN',
                    sysID: 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
                })
                .ele('image', {
                    'xlink:href': `file://${dropbox}/slide${pages[i].page}.svg`,
                    width: slideWidth,
                    height: slideHeight,
                })
                .up()
                .ele('g', {
                    class: 'canvas'
                });

    // 4. Overlay annotations onto slides
    // Based on /record-and-playback/presentation/scripts/publish/presentation.rb
    overlay_annotations(svg, pages[i].annotations, slideWidth, slideHeight)

    svg = svg.end({ prettyPrint: true });
    // Write annotated SVG file
    let file = `${dropbox}/annotated-slide${pages[i].page}.svg`
    fs.writeFileSync(file, svg, function(err) {
        if(err) { return logger.error(err); }
    });

    rsvgConvertInput += `${file} `
}

// Resulting PDF file is stored in the presentation dir
execSync(`rsvg-convert ${rsvgConvertInput} -f pdf -o ${exportJob.presLocation}/annotated_slides_${jobId}.pdf`, (error, stderr) => {
    if (error) {
        logger.error(`SVG to PDF export failed with error: ${error.message}`);
        return;
    }
    if (stderr) {
        logger.error(`SVG to PDF export failed with stderr: ${stderr}`);
        return;
    }
});

// Launch Notifier Worker depending on job type
logger.info(`Saved PDF at ${exportJob.presLocation}/annotated_slides_${jobId}.pdf`)

parentPort.postMessage({ message: workerData })
