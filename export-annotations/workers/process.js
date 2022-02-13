const Logger = require('../lib/utils/logger');
const config = require('../config');
const fs = require('fs');
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
    let currentSlide = pages[i]

    // Create the SVG slide with the background image
    const svg = create({ version: '1.0', encoding: 'UTF-8' })
                .ele('svg', { 
                    xmlns: 'http://www.w3.org/2000/svg',
                    'xmlns:xlink': 'http://www.w3.org/1999/xlink',
                    viewBox: `${currentSlide.xOffset} ${currentSlide.yOffset} ${currentSlide.widthRatio}% ${currentSlide.heightRatio}%`
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

    const xml = svg.end({ prettyPrint: true });
    console.log(xml);

    // Write annotated SVG file
    fs.writeFile(`${dropbox}/annotated-slide${pages[i].page}.svg`, xml, function(err) {
        if(err) { return logger.error(err); }
    });
}

// 4. Overlay annotations onto slides

// Resulting PDF file is stored in the presentation dir

// Launch Notifier Worker depending on job type

parentPort.postMessage({ message: workerData })
