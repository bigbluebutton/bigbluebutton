import Auth from '/imports/ui/services/auth';
import PollService from '/imports/ui/components/poll/service';
import { defineMessages } from 'react-intl';
import { DefaultColorThemePalette } from '@bigbluebutton/tldraw';
import { notify } from '/imports/ui/services/notification';
import caseInsensitiveReducer from '/imports/utils/caseInsensitiveReducer';
import { debounce } from '/imports/utils/debounce';
import { isValidShapeType } from './utils';
import { assetUrl } from '/imports/ui/services/url-builder';

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

  const index = annotationsQueue.findIndex((ann) => ann.id === annotation.id);
  if (index !== -1) {
    annotationsQueue[index] = annotation;
  } else {
    annotationsQueue.push(annotation);
  }
  if (!annotationsSenderIsRunning) {
    setTimeout(() => proccessAnnotationsQueue(submitAnnotations), annotationsBufferTimeMin);
  }
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
  if (intl) notify(intl.formatMessage(intlMessages.shapeNumberExceeded, { limit }), 'warning', 'whiteboard');
};

const toggleToolsAnimations = (activeAnim, anim, time, hasWBAccess = false) => {
  const handleOptionsDropdown = () => {
    const optionsDropdown = document.getElementById('WhiteboardOptionButton');
    if (optionsDropdown) {
      optionsDropdown.classList.remove(activeAnim);
      optionsDropdown.style.transition = `opacity ${time} ease-in-out`;
      optionsDropdown.classList.add(anim);
    }
  };

  if (hasWBAccess === false) {
    return handleOptionsDropdown();
  }

  const checkElementsAndRun = () => {
    const tlEls = document.querySelectorAll('.tlui-menu-zone, .tlui-toolbar__tools, .tlui-toolbar__extras, .tlui-style-panel__wrapper, .tlui-undo, .tlui-redo');
    if (tlEls.length) {
      tlEls?.forEach((el) => {
        el.classList.remove(activeAnim);
        // eslint-disable-next-line no-param-reassign
        el.style.transition = `opacity ${time} ease-in-out`;
        el.classList.add(anim);
      });
      handleOptionsDropdown();
    } else {
      // If the elements are not yet in the DOM, wait for 50ms and try again
      setTimeout(checkElementsAndRun, 300);
    }
  };

  return checkElementsAndRun();
};

const formatAnnotations = (annotations, intl, curPageId, currentPresentationPage) => {
  const result = {};

  annotations.forEach((annotation) => {
    if (!annotation.annotationInfo) return;

    let { annotationInfo } = annotation;

    if (annotationInfo.questionType) {
      // poll result, convert it to text and create tldraw shape
      if (!annotationInfo.props) {
        annotationInfo.answers = annotationInfo.answers.reduce(
          caseInsensitiveReducer, [],
        );
        const pollResult = PollService.getPollResultString(annotationInfo, intl)
          .split('<br/>').join('\n').replace(/(<([^>]+)>)/ig, '');

        const lines = pollResult.split('\n');
        const longestLine = lines.reduce((a, b) => (a.length > b.length ? a : b), '').length;

        // Text measurement estimation
        const averageCharWidth = 14;
        const lineHeight = 32;
        const padding = 2;

        const annotationWidth = longestLine * averageCharWidth;
        const annotationHeight = lines.length * lineHeight;

        const slideWidth = currentPresentationPage?.scaledWidth;
        const slideHeight = currentPresentationPage?.scaledHeight;
        const xPosition = slideWidth - annotationWidth - padding;
        const yPosition = slideHeight - annotationHeight - padding;

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
          type: 'poll',
          props: {
            color: 'black',
            fill: 'semi',
            w: annotationWidth,
            h: annotationHeight,
            answers: annotationInfo.answers,
            numRespondents: annotationInfo.numRespondents,
            numResponders: annotationInfo.numResponders,
            questionText: annotationInfo.questionText,
            questionType: annotationInfo.questionType,
            question: annotationInfo.question || '',
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
          type: 'poll',
          props: {
            color: 'black',
            fill: 'semi',
            h: annotationInfo.props.h,
            w: annotationInfo.props.w,
            answers: annotationInfo.answers,
            numRespondents: annotationInfo.numRespondents,
            numResponders: annotationInfo.numResponders,
            questionText: annotationInfo.questionText,
            questionType: annotationInfo.questionType,
            question: annotationInfo.question || '',
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

const getCustomEditorAssetUrls = () => ({
  fonts: {
    draw: assetUrl('fonts/tldraw/Shantell_Sans-Tldrawish.woff2'),
    serif: assetUrl('fonts/tldraw/IBMPlexSerif-Medium.woff2'),
    sansSerif: assetUrl('fonts/tldraw/IBMPlexSans-Medium.woff2'),
    monospace: assetUrl('fonts/tldraw/IBMPlexMono-Medium.woff2'),
  },
});

const getCustomAssetUrls = () => {
  const icon = (name) => assetUrl(`svgs/tldraw/${name}`);
  const { locales } = window.meetingClientSettings.public.whiteboard;
  const availableTranslations = (locales && locales.length > 0)
    ? Object.fromEntries(locales.map((locale) => [locale, assetUrl(`tldraw/translations/${locale}.json`)]))
    : {};

  return {
    icons: {
      menu: icon('menu.svg'),
      undo: icon('undo.svg'),
      redo: icon('redo.svg'),
      trash: icon('trash.svg'),
      'tool-delete-selected-items': icon('trash.svg'),
      duplicate: icon('duplicate.svg'),
      unlock: icon('unlock.svg'),
      'arrowhead-none': icon('arrowhead-none.svg'),
      'arrowhead-arrow': icon('arrowhead-arrow.svg'),
      'arrowhead-triangle': icon('arrowhead-triangle.svg'),
      'arrowhead-square': icon('arrowhead-square.svg'),
      'arrowhead-dot': icon('arrowhead-dot.svg'),
      'arrowhead-diamond': icon('arrowhead-diamond.svg'),
      'arrowhead-triangle-inverted': icon('arrowhead-triangle-inverted.svg'),
      'arrowhead-bar': icon('arrowhead-bar.svg'),
      'dots-horizontal': icon('dots-horizontal.svg'),
      'dots-vertical': icon('dots-vertical.svg'),
      'tool-pointer': icon('tool-pointer.svg'),
      'tool-media': icon('tool-media.svg'),
      'tool-hand': icon('tool-hand.svg'),
      'tool-pencil': icon('tool-pencil.svg'),
      'tool-eraser': icon('tool-eraser.svg'),
      'tool-arrow': icon('tool-arrow.svg'),
      'tool-text': icon('tool-text.svg'),
      'tool-laser': icon('tool-laser.svg'),
      'tool-note': icon('tool-note.svg'),
      'tool-line': icon('tool-line.svg'),
      'tool-highlight': icon('tool-highlight.svg'),
      'tool-frame': icon('tool-frame.svg'),
      'chevron-up': icon('chevron-up.svg'),
      'chevron-down': icon('chevron-down.svg'),
      'chevron-right': icon('chevron-right.svg'),
      blob: icon('blob.svg'),
      'geo-rectangle': icon('geo-rectangle.svg'),
      'geo-ellipse': icon('geo-ellipse.svg'),
      'geo-diamond': icon('geo-diamond.svg'),
      'geo-triangle': icon('geo-triangle.svg'),
      'geo-trapezoid': icon('geo-trapezoid.svg'),
      'geo-rhombus': icon('geo-rhombus.svg'),
      'geo-rhombus-2': icon('geo-rhombus-2.svg'),
      'geo-pentagon': icon('geo-pentagon.svg'),
      'geo-octagon': icon('geo-octagon.svg'),
      'geo-hexagon': icon('geo-hexagon.svg'),
      'geo-cloud': icon('geo-cloud.svg'),
      'geo-star': icon('geo-star.svg'),
      'geo-oval': icon('geo-oval.svg'),
      'geo-x-box': icon('geo-x-box.svg'),
      'geo-check-box': icon('geo-check-box.svg'),
      'geo-arrow-left': icon('geo-arrow-left.svg'),
      'geo-arrow-up': icon('geo-arrow-up.svg'),
      'geo-arrow-down': icon('geo-arrow-down.svg'),
      'geo-arrow-right': icon('geo-arrow-right.svg'),
      'align-left': icon('align-left.svg'),
      'align-top': icon('align-top.svg'),
      'arrow-left': icon('arrow-left.svg'),
      'align-right': icon('align-right.svg'),
      'align-center-horizontal': icon('align-center-horizontal.svg'),
      'align-bottom': icon('align-bottom.svg'),
      'align-center-vertical': icon('align-center-vertical.svg'),
      'stretch-vertical': icon('stretch-vertical.svg'),
      'stretch-horizontal': icon('stretch-horizontal.svg'),
      'distribute-horizontal': icon('distribute-horizontal.svg'),
      'distribute-vertical': icon('distribute-vertical.svg'),
      'stack-horizontal': icon('stack-horizontal.svg'),
      'stack-vertical': icon('stack-vertical.svg'),
      'send-to-back': icon('send-to-back.svg'),
      'send-backward': icon('send-backward.svg'),
      'bring-forward': icon('bring-forward.svg'),
      'bring-to-front': icon('bring-to-front.svg'),
      'reset-zoom': icon('reset-zoom.svg'),
      'rotate-cw': icon('rotate-cw.svg'),
      link: icon('link.svg'),
      group: icon('group.svg'),
      color: icon('color.svg'),
      'fill-none': icon('fill-none.svg'),
      'fill-semi': icon('fill-semi.svg'),
      'fill-solid': icon('fill-solid.svg'),
      'fill-pattern': icon('fill-pattern.svg'),
      'dash-draw': icon('dash-draw.svg'),
      'dash-dashed': icon('dash-dashed.svg'),
      'dash-dotted': icon('dash-dotted.svg'),
      'dash-solid': icon('dash-solid.svg'),
      'size-small': icon('size-small.svg'),
      'size-medium': icon('size-medium.svg'),
      'size-large': icon('size-large.svg'),
      'size-extra-large': icon('size-extra-large.svg'),
      'font-draw': icon('font-draw.svg'),
      'font-sans': icon('font-sans.svg'),
      'font-serif': icon('font-serif.svg'),
      'font-mono': icon('font-mono.svg'),
      'text-align-left': icon('text-align-left.svg'),
      'text-align-center': icon('text-align-center.svg'),
      'text-align-right': icon('text-align-right.svg'),
      'vertical-align-center': icon('vertical-align-center.svg'),
      'vertical-align-start': icon('vertical-align-start.svg'),
      'vertical-align-end': icon('vertical-align-end.svg'),
    },
    translations: availableTranslations,
  };
};

const sanitizeShape = (shape) => {
  const { isModerator, questionType, ...rest } = shape;
  return {
    ...rest,
  };
};

const debouncedUpdateShapes = debounce((
  shapes, tlEditorRef, presentationIdRef, pageChanged, assets, bgShape, currentUserId,
) => {
  if (shapes && Object.keys(shapes).length > 0) {
    tlEditorRef.current?.store.mergeRemoteChanges(() => {
      const editingShape = tlEditorRef.current?.getEditingShape();
      const remoteShapesArray = Object.values(shapes).reduce((acc, shape) => {
        const remoteVersion = Number(shape.meta?.version ?? 0);
        const localVersion = Number(editingShape?.meta?.version ?? 0);
        const echoAuthor = shape.meta?.updatedBy ?? shape.meta?.createdBy;
        const isOwnActiveFrame = Boolean(currentUserId)
          && editingShape?.id === shape.id
          && editingShape.type === 'frame'
          && shape.type === 'frame'
          && shape.props?.name !== undefined
          && echoAuthor === currentUserId;

        // store.put replaces the whole local record. Ignore older self echoes so
        // they cannot roll back keystrokes or any other newer local frame fields.
        if (isOwnActiveFrame && remoteVersion < localVersion) {
          return acc;
        }

        const shouldPreserveActiveFrameName = isOwnActiveFrame
          && editingShape.props.name !== shape.props.name;

        // Preserve the locally controlled name for current or newer self echoes
        // while still reconciling the rest of the server record.
        const shapeToMerge = shouldPreserveActiveFrameName
          ? {
            ...shape,
            props: {
              ...shape.props,
              name: editingShape.props.name,
            },
          }
          : shape;

        if (
          (shape.meta?.presentationId === presentationIdRef.current
          || shape?.whiteboardId?.includes(presentationIdRef.current))
          && isValidShapeType(shape)
        ) {
          acc.push(sanitizeShape(shapeToMerge));
        }
        return acc;
      }, []);

      if (pageChanged) {
        tlEditorRef.current?.store.put(assets);
        tlEditorRef.current?.store.put(bgShape);
      }

      tlEditorRef.current?.store.put(remoteShapesArray);
    });
  }
}, 175);

const setupColorThemePaletteOverrides = () => {
  // Override the default color theme to use our custom palette with more vibrant yellow highlights
  DefaultColorThemePalette.lightMode.black.highlight = {
    srgb: '#FFFF00',
    p3: 'color(display-p3 1 1 0)',
  };
  DefaultColorThemePalette.darkMode.black.highlight = {
    srgb: '#FFFF00',
    p3: 'color(display-p3 1 1 0)',
  };
  // Override the default yellow color to be a more vibrant yellow
  DefaultColorThemePalette.lightMode.yellow = {
    solid: '#FFFF00',
    highlight: {
      srgb: '#FFFF00',
      p3: 'color(display-p3 1 1 0)',
    },
  };
  DefaultColorThemePalette.darkMode.yellow = {
    solid: '#FFFF00',
    highlight: {
      srgb: '#FFFF00',
      p3: 'color(display-p3 1 1 0)',
    },
  };
};

export {
  initDefaultPages,
  sendAnnotation,
  persistShape,
  notifyNotAllowedChange,
  notifyShapeNumberExceeded,
  toggleToolsAnimations,
  formatAnnotations,
  getCustomEditorAssetUrls,
  getCustomAssetUrls,
  debouncedUpdateShapes,
  sanitizeShape,
  setupColorThemePaletteOverrides,
};
