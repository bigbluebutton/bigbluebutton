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

const getTlTextPath = () => {
  const BASENAME = window.meetingClientSettings.public.app.basename;
  const TL_TEXT_PATHS = `${BASENAME}/fonts/tldraw`;
  return TL_TEXT_PATHS;
};

const getTlIconPath = () => {
  const BASENAME = window.meetingClientSettings.public.app.basename;
  const TL_ICON_PATHS = `${BASENAME}/svgs/tldraw`;
  return TL_ICON_PATHS;
};

const customEditorAssetUrls = {
  fonts: {
    draw: `${getTlTextPath()}/Shantell_Sans-Tldrawish.woff2`,
    serif: `${getTlTextPath()}/IBMPlexSerif-Medium.woff2`,
    sansSerif: `${getTlTextPath()}/IBMPlexSans-Medium.woff2`,
    monospace: `${getTlTextPath()}/IBMPlexMono-Medium.woff2`,
  },
};

const customAssetUrls = {
  icons: {
    'menu': `${getTlIconPath()}/menu.svg`,
    'undo': `${getTlIconPath()}/undo.svg`,
    'redo': `${getTlIconPath()}/redo.svg`,
    'trash': `${getTlIconPath()}/trash.svg`,
    'duplicate': `${getTlIconPath()}/duplicate.svg`,
    'unlock': `${getTlIconPath()}/unlock.svg`,
    'arrowhead-none': `${getTlIconPath()}/arrowhead-none.svg`,
    'arrowhead-arrow': `${getTlIconPath()}/arrowhead-arrow.svg`,
    'arrowhead-triangle': `${getTlIconPath()}/arrowhead-triangle.svg`,
    'arrowhead-square': `${getTlIconPath()}/arrowhead-square.svg`,
    'arrowhead-dot': `${getTlIconPath()}/arrowhead-dot.svg`,
    'arrowhead-diamond': `${getTlIconPath()}/arrowhead-diamond.svg`,
    'arrowhead-triangle-inverted': `${getTlIconPath()}/arrowhead-triangle-inverted.svg`,
    'arrowhead-bar': `${getTlIconPath()}/arrowhead-bar.svg`,
    'dots-horizontal': `${getTlIconPath()}/dots-horizontal.svg`,
    'dots-vertical': `${getTlIconPath()}/dots-vertical.svg`,
    'tool-pointer': `${getTlIconPath()}/tool-pointer.svg`,
    'tool-media': `${getTlIconPath()}/tool-media.svg`,
    'tool-hand': `${getTlIconPath()}/tool-hand.svg`,
    'tool-pencil': `${getTlIconPath()}/tool-pencil.svg`,
    'tool-eraser': `${getTlIconPath()}/tool-eraser.svg`,
    'tool-arrow': `${getTlIconPath()}/tool-arrow.svg`,
    'tool-text': `${getTlIconPath()}/tool-text.svg`,
    'tool-laser': `${getTlIconPath()}/tool-laser.svg`,
    'tool-note': `${getTlIconPath()}/tool-note.svg`,
    'tool-line': `${getTlIconPath()}/tool-line.svg`,
    'tool-highlight': `${getTlIconPath()}/tool-highlight.svg`,
    'tool-frame': `${getTlIconPath()}/tool-frame.svg`,
    'chevron-up': `${getTlIconPath()}/chevron-up.svg`,
    'chevron-down': `${getTlIconPath()}/chevron-down.svg`,
    'chevron-right': `${getTlIconPath()}/chevron-right.svg`,
    'blob': `${getTlIconPath()}/blob.svg`,
    'geo-rectangle': `${getTlIconPath()}/geo-rectangle.svg`,
    'geo-ellipse': `${getTlIconPath()}/geo-ellipse.svg`,
    'geo-diamond': `${getTlIconPath()}/geo-diamond.svg`,
    'geo-triangle': `${getTlIconPath()}/geo-triangle.svg`,
    'geo-trapezoid': `${getTlIconPath()}/geo-trapezoid.svg`,
    'geo-rhombus': `${getTlIconPath()}/geo-rhombus.svg`,
    'geo-rhombus-2': `${getTlIconPath()}/geo-rhombus-2.svg`,
    'geo-pentagon': `${getTlIconPath()}/geo-pentagon.svg`,
    'geo-octagon': `${getTlIconPath()}/geo-octagon.svg`,
    'geo-hexagon': `${getTlIconPath()}/geo-hexagon.svg`,
    'geo-cloud': `${getTlIconPath()}/geo-cloud.svg`,
    'geo-star': `${getTlIconPath()}/geo-star.svg`,
    'geo-oval': `${getTlIconPath()}/geo-oval.svg`,
    'geo-x-box': `${getTlIconPath()}/geo-x-box.svg`,
    'geo-check-box': `${getTlIconPath()}/geo-check-box.svg`,
    'geo-arrow-left': `${getTlIconPath()}/geo-arrow-left.svg`,
    'geo-arrow-up': `${getTlIconPath()}/geo-arrow-up.svg`,
    'geo-arrow-down': `${getTlIconPath()}/geo-arrow-down.svg`,
    'geo-arrow-right': `${getTlIconPath()}/geo-arrow-right.svg`,
    'geo-pentagon': `${getTlIconPath()}/geo-pentagon.svg`,
    'geo-octagon': `${getTlIconPath()}/geo-octagon.svg`,
    'geo-rhombus-2': `${getTlIconPath()}/geo-rhombus-2.svg`,
    'align-left': `${getTlIconPath()}/align-left.svg`,
    'align-top': `${getTlIconPath()}/align-top.svg`,
    'align-right': `${getTlIconPath()}/align-right.svg`,
    'align-center-horizontal': `${getTlIconPath()}/align-center-horizontal.svg`,
    'align-bottom': `${getTlIconPath()}/align-bottom.svg`,
    'align-center-vertical': `${getTlIconPath()}/align-center-vertical.svg`,
    'stretch-vertical': `${getTlIconPath()}/stretch-vertical.svg`,
    'stretch-horizontal': `${getTlIconPath()}/stretch-horizontal.svg`,
    'distribute-horizontal': `${getTlIconPath()}/distribute-horizontal.svg`,
    'distribute-vertical': `${getTlIconPath()}/distribute-vertical.svg`,
    'stack-horizontal': `${getTlIconPath()}/stack-horizontal.svg`,
    'stack-vertical': `${getTlIconPath()}/stack-vertical.svg`,
    'send-to-back': `${getTlIconPath()}/send-to-back.svg`,
    'send-backward': `${getTlIconPath()}/send-backward.svg`,
    'bring-forward': `${getTlIconPath()}/bring-forward.svg`,
    'bring-to-front': `${getTlIconPath()}/bring-to-front.svg`,
    'reset-zoom': `${getTlIconPath()}/reset-zoom.svg`,
    'rotate-cw': `${getTlIconPath()}/rotate-cw.svg`,
    'link': `${getTlIconPath()}/link.svg`,
    'group': `${getTlIconPath()}/group.svg`,
    'color': `${getTlIconPath()}/color.svg`,
    'fill-none': `${getTlIconPath()}/fill-none.svg`,
    'fill-semi': `${getTlIconPath()}/fill-semi.svg`,
    'fill-solid': `${getTlIconPath()}/fill-solid.svg`,
    'fill-pattern': `${getTlIconPath()}/fill-pattern.svg`,
    'dash-draw': `${getTlIconPath()}/dash-draw.svg`,
    'dash-dashed': `${getTlIconPath()}/dash-dashed.svg`,
    'dash-dotted': `${getTlIconPath()}/dash-dotted.svg`,
    'dash-solid': `${getTlIconPath()}/dash-solid.svg`,
    'size-small': `${getTlIconPath()}/size-small.svg`,
    'size-medium': `${getTlIconPath()}/size-medium.svg`,
    'size-large': `${getTlIconPath()}/size-large.svg`,
    'size-extra-large': `${getTlIconPath()}/size-extra-large.svg`,
    'font-draw': `${getTlIconPath()}/font-draw.svg`,
    'font-sans': `${getTlIconPath()}/font-sans.svg`,
    'font-serif': `${getTlIconPath()}/font-serif.svg`,
    'font-mono': `${getTlIconPath()}/font-mono.svg`,
    'text-align-left': `${getTlIconPath()}/text-align-left.svg`,
    'text-align-center': `${getTlIconPath()}/text-align-center.svg`,
    'text-align-right': `${getTlIconPath()}/text-align-right.svg`,
    'vertical-align-center': `${getTlIconPath()}/vertical-align-center.svg`,
    'vertical-align-start': `${getTlIconPath()}/vertical-align-start.svg`,
    'vertical-align-end': `${getTlIconPath()}/vertical-align-end.svg`,
  },
};

export {
  initDefaultPages,
  sendAnnotation,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
  customEditorAssetUrls,
  customAssetUrls,
};
