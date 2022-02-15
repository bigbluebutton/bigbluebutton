const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
const convert = require('xml-js');
const { create } = require('xmlbuilder2', { encoding: 'utf-8' });

const { workerData, parentPort } = require('worker_threads')

const jobId = workerData;

const logger = new Logger('presAnn Process Worker');
logger.info("Processing PDF for job " + jobId);

// Process the presentation pages and annotations into a PDF file

// 1. Get the job
let dropbox = `${config.shared.presAnnDropboxDir}/${jobId}`
let job = fs.readFileSync(`${dropbox}/job`);
let exportJob = JSON.parse(job);

// 2. Get the annotations
let annotations = fs.readFileSync(`${dropbox}/whiteboard`);
let whiteboard = JSON.parse(annotations);
let pages = JSON.parse(whiteboard.pages);

// 3. Convert annotations to SVG
for (let i = 0; i < pages.length; i++) {
    
    // Get the current slide (without annotations)
    let currentSlide = pages[i]
    var backgroundSlide = fs.readFileSync(`${dropbox}/slide${pages[i].page}.svg`).toString();
    
    // Read background slide in as JSON to determine dimensions
    // TODO: find a better way to get width and height of slide (e.g. as part of message)
    backgroundSlide = JSON.parse(convert.xml2json(backgroundSlide));

    // There's a bug with older versions of rsvg which defaults SVG output to pixels.
    // See: https://gitlab.gnome.org/GNOME/librsvg/-/issues/766
    var slideWidth = Number(backgroundSlide.elements[0].attributes.width.replace(/\D/g, ""))
    var slideHeight = Number(backgroundSlide.elements[0].attributes.height.replace(/\D/g, ""))

    // Create the SVG slide with the background image
    let svg = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    width: slideWidth,
                    height: slideHeight,
                    viewBox: `${currentSlide.xOffset} ${currentSlide.yOffset} ${slideWidth * currentSlide.widthRatio} ${slideHeight * currentSlide.heightRatio}`
                })
                .dtd({ 
                    pubID: '-//W3C//DTD SVG 1.1//EN',
                    sysID: 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'
                })
                .ele('image', {
                    'xlink:href': `file://${dropbox}/slide${pages[i].page}.svg`,
                    width: '100%',
                    height: '100%'
                });

    svg = svg.end({ prettyPrint: true });

    // Write annotated SVG file
    fs.writeFile(`${dropbox}/annotated-slide${pages[i].page}.svg`, svg, function(err) {
        if(err) { return logger.error(err); }
    });

    // 4. Overlay annotations onto slides
    
    // rsvg-convert annotated-slide2.svg -f pdf -o out.pdf
}


// Resulting PDF file is stored in the presentation dir
// rsvg-convert annotated-slide2.svg annotated-slide3.svg ... -f pdf -o out.pdf

// Launch Notifier Worker depending on job type

parentPort.postMessage({ message: workerData })
