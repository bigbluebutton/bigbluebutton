import Logger from '../lib/utils/logger.js';
import fs from 'fs';
import {createSVGWindow} from 'svgdom';
import {SVG as svgCanvas, registerWindow} from '@svgdotjs/svg.js';
import cp from 'child_process';
import WorkerStarter from '../lib/utils/worker-starter.js';
import {workerData} from 'worker_threads';
import path from 'path';
import sanitize from 'sanitize-filename';
import redis from 'redis';
import {PresAnnStatusMsg} from '../lib/utils/message-builder.js';
import {sortByKey} from '../shapes/helpers.js';
import {Draw} from '../shapes/Draw.js';
import {Highlight} from '../shapes/Highlight.js';
import {Line} from '../shapes/Line.js';
import {Arrow} from '../shapes/Arrow.js';
import {TextShape} from '../shapes/TextShape.js';
import {StickyNote} from '../shapes/StickyNote.js';
import {createGeoObject} from '../shapes/geoFactory.js';
import {Frame} from '../shapes/Frame.js';
import {Poll} from '../shapes/Poll.js';

const jobId = workerData.jobId;
const logger = new Logger('presAnn Process Worker');
const config = JSON.parse(fs.readFileSync('./config/settings.json', 'utf8'));

logger.info('Processing PDF for job ' + jobId);

const dropbox = path.join(config.shared.presAnnDropboxDir, jobId);
const job = fs.readFileSync(path.join(dropbox, 'job'));
const exportJob = JSON.parse(job);
const statusUpdate = new PresAnnStatusMsg(exportJob,
    PresAnnStatusMsg.EXPORT_STATUSES.PROCESSING);

/**
 * Converts measured points to pixels, using the predefined points-per-inch
 * and pixels-per-inch ratios from the configuration.
 *
 * @function toPx
 * @param {number} pt - The measurement in points to be converted.
 * @return {number} The converted measurement in pixels.
 */
function toPx(pt) {
  return (pt / config.process.pointsPerInch) * config.process.pixelsPerInch;
}

/**
 * Creates a new drawing instance from the provided annotation
 * and then adds the resulting drawn element to the SVG.
 *
 * @function overlayDraw
 * @param {Object} svg - The SVG element to which the drawing will be added.
 * @param {Object} annotation - The annotation data used to create the drawing.
 * @return {void}
 */
function overlayDraw(svg, annotation) {
  const drawing = new Draw(annotation);
  const drawnDrawing = drawing.draw();

  svg.add(drawnDrawing);
}

/**
 * Creates a geometric object from the annotation and then adds
 * the rendered shape to the SVG.
 * @function overlayGeo
 * @param {Object} svg - SVG element to which the geometric shape will be added.
 * @param {Object} annotation - Annotation data used to create the geo shape.
 * @return {void}
 */
function overlayGeo(svg, annotation) {
  const geo = createGeoObject(annotation);
  const geoDrawn = geo.draw();
  svg.add(geoDrawn);
}

/**
 * Applies a highlight effect to an SVG element using the provided annotation.
 * Adjusts the annotation's opacity and draws the highlight.
 * @function overlayHighlight
 * @param {Object} svg - SVG element to which the highlight will be applied.
 * @param {Object} annotation - JSON annotation data.
 * @return {void}
 */
function overlayHighlight(svg, annotation) {
  // Adjust JSON properties
  annotation.opacity = 0.3;

  const highlight = new Highlight(annotation);
  const highlightDrawn = highlight.draw();
  svg.add(highlightDrawn);
}

/**
 * Adds a line to an SVG element based on the provided annotation.
 * It creates a line object from the annotation and then adds
 * the rendered line to the SVG.
 * @function overlayLine
 * @param {Object} svg - SVG element to which the line will be added.
 * @param {Object} annotation - JSON annotation data for the line.
 * @return {void}
 */
function overlayLine(svg, annotation) {
  const line = new Line(annotation);
  const lineDrawn = line.draw();
  svg.add(lineDrawn);
}

/**
 * Adds an arrow to an SVG element using the provided annotation data.
 * It constructs an arrow object and then appends the drawn arrow to the SVG.
 * @function overlayArrow
 * @param {Object} svg - The SVG element where the arrow will be added.
 * @param {Object} annotation - JSON annotation data for the arrow.
 * @return {void}
 */
function overlayArrow(svg, annotation) {
  const arrow = new Arrow(annotation);
  const arrowDrawn = arrow.draw();
  svg.add(arrowDrawn);
}

/**
 * Overlays a sticky note onto an SVG element based on the given annotation.
 * Creates a sticky note instance and then appends the rendered note to the SVG.
 * @function overlaySticky
 * @param {Object} svg - SVG element to which the sticky note will be added.
 * @param {Object} annotation - JSON annotation data for the sticky note.
 * @return {void}
 */
function overlaySticky(svg, annotation) {
  const stickyNote = new StickyNote(annotation);
  const stickyNoteDrawn = stickyNote.draw();
  svg.add(stickyNoteDrawn);
}

/**
 * Overlays text onto an SVG element using the provided annotation data.
 * Initializes a text shape object with the annotation and then adds
 * the rendered text to the SVG.
 * @function overlayText
 * @param {Object} svg - The SVG element where the text will be added.
 * @param {Object} annotation - JSON annotation data for the text.
 * @return {void}
 */
function overlayText(svg, annotation) {
  if (annotation?.props?.size == null || annotation?.props?.text?.length == 0) {
    return;
  }

  const text = new TextShape(annotation);
  const textDrawn = text.draw();
  svg.add(textDrawn);
}

/**
 * Adds a frame shape to the canvas.
 * @function overlayText
 * @param {Object} svg - The SVG element where the frame will be added.
 * @param {Object} annotation - JSON frame data.
 * @return {void}
 */
function overlayFrame(svg, annotation) {
  const frameShape = new Frame(annotation);
  const frame = frameShape.draw();
  svg.add(frame);
}

/**
 * Adds a poll shape to the canvas.
 * @function overlayPoll
 * @param {Object} svg - The SVG element where the poll will be added.
 * @param {Object} annotation - JSON poll data.
 * @return {void}
 */
function overlayPoll(svg, annotation) {
  const pollShape = new Poll(annotation);
  const poll = pollShape.draw();
  svg.add(poll);
}

/**
 * Determines the annotation type and overlays the corresponding shape
 * onto the SVG element. It delegates the rendering to the specific
 * overlay function based on the annotation type.
 * @function overlayAnnotation
 * @param {Object} svg - SVG element onto which the annotation will be overlaid.
 * @param {Object} annotation - JSON annotation data.
 * @return {void}
 */
export function overlayAnnotation(svg, annotation) {
  try {
    switch (annotation.type) {
      case 'draw':
        overlayDraw(svg, annotation);
        break;
      case 'geo':
        overlayGeo(svg, annotation);
        break;
      case 'highlight':
        overlayHighlight(svg, annotation);
        break;
      case 'line':
        overlayLine(svg, annotation);
        break;
      case 'arrow':
        overlayArrow(svg, annotation);
        break;
      case 'text':
        overlayText(svg, annotation);
        break;
      case 'note':
        overlaySticky(svg, annotation);
        break;
      case 'frame':
        overlayFrame(svg, annotation);
        break;
      case 'poll':
        overlayPoll(svg, annotation);
        break;
      default:
        logger.info(`Unknown annotation type ${annotation.type}.`);
        logger.info(annotation);
    }
  } catch (error) {
    logger.warn('Failed to overlay annotation',
        {failedAnnotation: annotation, error: error});
  }
}

/**
 * Overlays a collection of annotations onto an SVG element.
 * It sorts the annotations by their index before overlaying them to maintain
 * the stacking order.
 * @function overlayAnnotations
 * @param {Object} svg - SVG element onto which annotations will be overlaid.
 * @param {Array} slideAnnotations - Array of JSON annotation data objects.
 * @return {void}
 */
function overlayAnnotations(svg, slideAnnotations) {
  // Sort annotations by lowest child index
  slideAnnotations = sortByKey(slideAnnotations, 'annotationInfo', 'index');

  // Map to store frames and their children
  const frameMap = new Map();

  // First pass to identify frames and initialize them in the map
  slideAnnotations.forEach((ann) => {
    if (ann.annotationInfo.type === 'frame') {
      frameMap.set(
          ann.annotationInfo.id,
          {children: []});
    }
  });

  // Second pass to add children to the frames
  slideAnnotations.forEach((child) => {
    // Get the parent of this annotation
    const parentId = child.annotationInfo.parentId;

    // Check if the annotation is in a frame.
    if (frameMap.has(parentId)) {
      const frame = frameMap.get(parentId);
      frame.children.push(child.annotationInfo);
    }
  });

  for (const annotation of slideAnnotations) {
    switch (annotation.annotationInfo.type) {
      case 'group':
        // Get annotations that have this group as parent
        for (const childId of annotation.annotationInfo.children) {
          const childAnnotation =
          slideAnnotations.find((ann) => ann.id == childId);
          overlayAnnotation(svg, childAnnotation.annotationInfo);
        }

        break;

      case 'frame':
        const annotationId = annotation.annotationInfo.id;

        // Add children to this frame
        annotation.annotationInfo.children =
          frameMap.get(annotationId).children;

        // Intentionally fall through to default case
      default:
        const parentId = annotation.annotationInfo.parentId;
        // Don't render an annotation if it is contained in a frame.
        if (!frameMap.has(parentId)) {
          overlayAnnotation(svg, annotation.annotationInfo);
        }
    }
  }
}

/**
 * Processes presentation slides and associated annotations into
 * a single PDF file.
 * @async
 * @function processPresentationAnnotations
 * @return {Promise<void>} A promise that resolves when the process is complete.
 */
async function processPresentationAnnotations() {
  const client = redis.createClient({
    password: config.redis.password,
    socket: {
        host: config.redis.host,
        port: config.redis.port
    }
  });

  await client.connect();

  client.on('error', (err) => logger.info('Redis Client Error', err));

  // Get the annotations
  const annotations = fs.readFileSync(path.join(dropbox, 'whiteboard'));
  const whiteboardJSON = JSON.parse(annotations);
  const pages = JSON.parse(whiteboardJSON.pages);
  const ghostScriptInput = [];

  for (const currentSlide of pages) {
    const bgImagePath = path.join(dropbox, `slide${currentSlide.page}`);
    const svgBackgroundSlide = path.join(
        exportJob.presLocation,
        'svgs',
        `slide${currentSlide.page}.svg`);

    let backgroundFormat = '';
    if (fs.existsSync(`${bgImagePath}.png`)) {
      backgroundFormat = 'png';
    } else if (fs.existsSync(`${bgImagePath}.jpg`)) {
      backgroundFormat = 'jpg';
    } else if (fs.existsSync(`${bgImagePath}.jpeg`)) {
      backgroundFormat = 'jpeg';
    } else if (fs.existsSync(svgBackgroundSlide)) {
      backgroundFormat = 'svg';
    } else {
      logger.error(`Skipping slide ${currentSlide.page} (${jobId}): unknown extension`);
      continue;
    }

    // Rescale slide width and height to match tldraw coordinates
    const slideWidth = currentSlide.width;
    const slideHeight = currentSlide.height;

    if (!slideWidth || !slideHeight) {
      logger.error(`Skipping slide ${currentSlide.page} (${jobId}): unknown dimensions`);
      continue;
    }

    const maxImageWidth = config.process.maxImageWidth;
    const maxImageHeight = config.process.maxImageHeight;

    const ratio = Math.min(maxImageWidth / slideWidth,
        maxImageHeight / slideHeight);
    const scaledWidth = slideWidth * ratio;
    const scaledHeight = slideHeight * ratio;

    // Create a window with a document and an SVG root node
    const window = createSVGWindow();
    const document = window.document;

    // Register window and document
    registerWindow(window, document);

    // Create the canvas (root SVG element)
    const canvas = svgCanvas(document.documentElement)
        .size(scaledWidth, scaledHeight)
        .attr({
          'xmlns': 'http://www.w3.org/2000/svg',
          'xmlns:xlink': 'http://www.w3.org/1999/xlink',
        });

    // Add the image element
    canvas
        .image(`file://${dropbox}/slide${currentSlide.page}.${backgroundFormat}`)
        .size(scaledWidth, scaledHeight);

    // Add a group element with class 'whiteboard'
    const whiteboard = canvas.group().attr({class: 'wb'});

    // 4. Overlay annotations onto slides
    overlayAnnotations(whiteboard, currentSlide.annotations);

    const svg = canvas.svg();

    // Write annotated SVG file
    const SVGfile = path.join(dropbox,
        `annotated-slide${currentSlide.page}.svg`);
    const PDFfile = path.join(dropbox,
        `annotated-slide${currentSlide.page}.pdf`);

    fs.writeFileSync(SVGfile, svg, function(err) {
      if (err) {
        return logger.error(err);
      }
    });

/**
 * Constructs the command arguments for converting an annotated slide from SVG to PDF format.
 * `cairoSVGUnsafeFlag` should be enabled (true) for CairoSVG versions >= 2.7.0
 * to allow external resources, such as presentation slides, to be loaded.
 *
 * @const {string[]} convertAnnotatedSlide - The command arguments for the conversion process.
 */
    const convertAnnotatedSlide = [
      SVGfile,
      '--output-width', toPx(slideWidth),
      '--output-height', toPx(slideHeight),
      ...(config.process.cairoSVGUnsafeFlag ? ['-u'] : []),
      '-o', PDFfile,
    ];

    try {
      cp.spawnSync(config.shared.cairosvg,
          convertAnnotatedSlide, {shell: false});
    } catch (error) {
      logger.error(`Processing slide ${currentSlide.page}
        failed for job ${jobId}: ${error.message}`);
      statusUpdate.setError();
    }

    await client.publish(config.redis.channels.publish,
        statusUpdate.build(currentSlide.page));
    ghostScriptInput.push(PDFfile);
  }

  const outputDir = path.join(exportJob.presLocation, 'pdfs', jobId);

  // Create PDF output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, {recursive: true});
  }

  const serverFilename = exportJob.serverSideFilename.replace(/\s/g, '_');
  const sanitizedServerFilename = sanitize(serverFilename);
  const serverFilenameWithExtension = `${sanitizedServerFilename}.pdf`;
  const mergePDFs = [
    '-dNOPAUSE',
    '-dAutoRotatePages=/None',
    '-sDEVICE=pdfwrite',
    `-sOUTPUTFILE="${path.join(outputDir, serverFilenameWithExtension)}"`,
    `-dBATCH`].concat(ghostScriptInput);

  // Resulting PDF file is stored in the presentation dir
  try {
    cp.spawnSync(config.shared.ghostscript, mergePDFs, {shell: false});
  } catch (error) {
    const errorMessage = 'GhostScript failed to merge PDFs in job' +
      `${jobId}: ${error.message}`;
    return logger.error(errorMessage);
  }

  // Launch Notifier Worker depending on job type
  logger.info('Saved PDF at ',
      `${outputDir}/${serverFilenameWithExtension}`);

  const notifier = new WorkerStarter({
    jobType: exportJob.jobType, jobId,
    serverSideFilename: serverFilenameWithExtension,
    filename: exportJob.filename});

  notifier.notify();
  await client.disconnect();
}

processPresentationAnnotations();
