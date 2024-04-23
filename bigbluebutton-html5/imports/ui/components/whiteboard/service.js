import Auth from '/imports/ui/services/auth';
import PollService from '/imports/ui/components/poll/service';
import { defineMessages } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';

const intlMessages = defineMessages({
  notifyNotAllowedChange: {
    id: 'app.whiteboard.annotations.notAllowed',
    description: 'Label shown in toast when the user make a change on a shape he doesnt have permission',
  },
  shapeNumberExceeded: {
    id: 'app.whiteboard.annotations.numberExceeded',
    description: 'Label shown in toast when the user tries to add more shapes than the limit',
  },
});

const annotationsQueue = [];
// How many packets we need to have to use annotationsBufferTimeMax
const annotationsMaxDelayQueueSize = 60;
// Minimum bufferTime
const annotationsBufferTimeMin = 30;
// Maximum bufferTime
const annotationsBufferTimeMax = 200;
// Time before running 'sendBulkAnnotations' again if user is offline
const annotationsRetryDelay = 1000;

let annotationsSenderIsRunning = false;

const proccessAnnotationsQueue = async (submitAnnotations) => {
  annotationsSenderIsRunning = true;
  const queueSize = annotationsQueue.length;

  if (!queueSize) {
    annotationsSenderIsRunning = false;
    return;
  }

  const annotations = annotationsQueue.splice(0, queueSize);

  try {
    const isAnnotationSent = await submitAnnotations(annotations);

    if (!isAnnotationSent) {
      // undo splice
      annotationsQueue.splice(0, 0, ...annotations);
      setTimeout(() => proccessAnnotationsQueue(submitAnnotations), annotationsRetryDelay);
    } else {
      // ask tiago
      const delayPerc = Math.min(
        annotationsMaxDelayQueueSize, queueSize,
      ) / annotationsMaxDelayQueueSize;
      const delayDelta = annotationsBufferTimeMax - annotationsBufferTimeMin;
      const delayTime = annotationsBufferTimeMin + delayDelta * delayPerc;
      setTimeout(() => proccessAnnotationsQueue(submitAnnotations), delayTime);
    }
  } catch (error) {
    annotationsQueue.splice(0, 0, ...annotations);
    setTimeout(() => proccessAnnotationsQueue(submitAnnotations), annotationsRetryDelay);
  }
};

const sendAnnotation = (annotation, submitAnnotations) => {
  // Prevent sending annotations while disconnected
  // TODO: Change this to add the annotation, but delay the send until we're
  // reconnected. With this it will miss things
  if (!Meteor.status().connected) return;

  const index = annotationsQueue.findIndex((ann) => ann.id === annotation.id);
  if (index !== -1) {
    annotationsQueue[index] = annotation;
  } else {
    annotationsQueue.push(annotation);
  }
  if (!annotationsSenderIsRunning) setTimeout(() => proccessAnnotationsQueue(submitAnnotations), annotationsBufferTimeMin);
};

const persistShape = async (shape, whiteboardId, isModerator, submitAnnotations) => {
  const annotation = {
    id: shape.id,
    annotationInfo: { ...shape, isModerator },
    wbId: whiteboardId,
    userId: Auth.userID,
  };

  sendAnnotation(annotation, submitAnnotations);
};

const initDefaultPages = (count = 1) => {
  const pages = {};
  const pageStates = {};
  let i = 0;
  while (i < count + 1) {
    pages[`${i}`] = {
      id: `${i}`,
      name: `Slide ${i}`,
      shapes: {},
      bindings: {},
    };
    pageStates[`${i}`] = {
      id: `${i}`,
      selectedIds: [],
      camera: {
        point: [0, 0],
        zoom: 1,
      },
    };
    i += 1;
  }
  return { pages, pageStates };
};

const notifyNotAllowedChange = (intl) => {
  if (intl) notify(intl.formatMessage(intlMessages.notifyNotAllowedChange), 'warning', 'whiteboard');
};

const notifyShapeNumberExceeded = (intl, limit) => {
  if (intl) notify(intl.formatMessage(intlMessages.shapeNumberExceeded, { 0: limit }), 'warning', 'whiteboard');
};

const toggleToolsAnimations = (activeAnim, anim, time, hasWBAccess = false) => {
  const handleOptionsDropdown = () => {
    const optionsDropdown = document.getElementById('WhiteboardOptionButton');
    if (optionsDropdown) {
      optionsDropdown.classList.remove(activeAnim);
      optionsDropdown.style.transition = `opacity ${time} ease-in-out`;
      optionsDropdown.classList.add(anim);
    }
  }

  if (hasWBAccess === false) {
    return handleOptionsDropdown();
  }

  const checkElementsAndRun = () => {
    const tlEls = document.querySelectorAll('.tlui-menu-zone, .tlui-toolbar__tools, .tlui-toolbar__extras, .tlui-style-panel__wrapper');
    if (tlEls.length) {
      tlEls?.forEach(el => {
        el.classList.remove(activeAnim);
        el.style.transition = `opacity ${time} ease-in-out`;
        el.classList.add(anim);
      });
      handleOptionsDropdown();
    } else {
      // If the elements are not yet in the DOM, wait for 50ms and try again
      setTimeout(checkElementsAndRun, 300);
    }
  };

  checkElementsAndRun();
};

const formatAnnotations = (annotations, intl, curPageId, currentPresentationPage) => {
  const result = {};

  annotations.forEach((annotation) => {
    if (annotation.annotationInfo === '') return;

    let annotationInfo = JSON.parse(annotation.annotationInfo);

    if (annotationInfo.questionType) {
      // poll result, convert it to text and create tldraw shape
      if (!annotationInfo.props) {
        const { POLL_BAR_CHAR } = PollService;
        annotationInfo.answers = annotationInfo.answers.reduce(
          caseInsensitiveReducer, [],
        );
        let pollResult = PollService.getPollResultString(annotationInfo, intl)
          .split('<br/>').join('\n').replace(/(<([^>]+)>)/ig, '');

        const lines = pollResult.split('\n');
        const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '').length;

        // add empty spaces after last ∎ in each of the lines to make them all the same length
        pollResult = lines.map((line) => {
          if (!line.includes(POLL_BAR_CHAR) || line.length === longestLine) return line;

          const splitLine = line.split(`${POLL_BAR_CHAR} `);
          const spaces = ' '.repeat(longestLine - line.length);
          return `${splitLine[0]} ${spaces} ${splitLine[1]}`;
        }).join('\n');

        // Text measurement estimation
        const averageCharWidth = 14;
        const lineHeight = 32;

        const annotationWidth = longestLine * averageCharWidth; // Estimate width
        const annotationHeight = lines.length * lineHeight; // Estimate height

        const slideWidth = currentPresentationPage?.scaledWidth;
        const slideHeight = currentPresentationPage?.scaledHeight;
        const xPosition = slideWidth - annotationWidth;
        const yPosition = slideHeight - annotationHeight;

        annotationInfo = {
          x: xPosition,
          y: yPosition,
          isLocked: false,
          rotation: 0,
          typeName: 'shape',
          opacity: 1,
          parentId: `page:${curPageId}`,
          index: 'a1',
          id: `${annotationInfo.id}`,
          meta: {},
          type: 'geo',
          props: {
            url: '',
            text: `${pollResult}`,
            color: 'black',
            font: 'mono',
            fill: 'semi',
            dash: 'draw',
            w: annotationWidth,
            h: annotationHeight,
            size: 'm',
            growY: 0,
            align: 'middle',
            geo: 'rectangle',
            verticalAlign: 'middle',
            labelColor: 'black',
          },
        };
      } else {
        annotationInfo = {
          x: annotationInfo.x,
          isLocked: annotationInfo.isLocked,
          y: annotationInfo.y,
          rotation: annotationInfo.rotation,
          typeName: annotationInfo.typeName,
          opacity: annotationInfo.opacity,
          parentId: annotationInfo.parentId,
          index: annotationInfo.index,
          id: annotationInfo.id,
          meta: annotationInfo.meta,
          type: 'geo',
          props: {
            url: '',
            text: annotationInfo.props.text,
            color: annotationInfo.props.color,
            font: annotationInfo.props.font,
            fill: annotationInfo.props.fill,
            dash: annotationInfo.props.dash,
            h: annotationInfo.props.h,
            w: annotationInfo.props.w,
            size: annotationInfo.props.size,
            growY: 0,
            align: 'middle',
            geo: annotationInfo.props.geo,
            verticalAlign: 'middle',
            labelColor: annotationInfo.props.labelColor,
          },
        };
      }

      const cpg = parseInt(annotationInfo?.id?.split?.('/')?.[1], 10);
      if (cpg !== parseInt(curPageId, 10)) return;

      annotationInfo.questionType = false;
    }
    result[annotationInfo.id] = annotationInfo;
  });
  return result;
};

export {
  initDefaultPages,
  sendAnnotation,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
};
