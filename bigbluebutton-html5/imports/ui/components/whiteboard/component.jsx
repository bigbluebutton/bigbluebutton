import * as React from "react";
import _ from "lodash";
import styled, { createGlobalStyle } from "styled-components";
import Cursors from "./cursors/container";
import { TldrawApp, Tldraw } from "@tldraw/tldraw";
import SlideCalcUtil, {HUNDRED_PERCENT} from '/imports/utils/slideCalcUtils';
import { Utils } from "@tldraw/core";
import Settings from '/imports/ui/services/settings';

function usePrevious(value) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

const findRemoved = (A, B) => {
  return A.filter((a) => {
    return !B.includes(a);
  });
};

// map different localeCodes from bbb to tldraw
const mapLanguage = (language) => {
  switch(language) {
    case 'fa-ir':
      return 'fa';
    case 'it-it':
      return 'it';
    case 'nb-no':
      return 'no';
    case 'pl-pl':
      return 'pl';
    case 'sv-se':
      return 'sv';
    case 'uk-ua':
      return 'uk';
    case 'zh-cn':
      return 'zh-ch';
    default:
      return language;
  }
}

const SMALL_HEIGHT = 435;
const SMALLEST_HEIGHT = 363;
const SMALL_WIDTH = 800;
const SMALLEST_WIDTH = 645;
const TOOLBAR_SMALL = 28;
const TOOLBAR_LARGE = 38;
const TOOLBAR_OFFSET = 0;

const TldrawGlobalStyle = createGlobalStyle`
  ${({ hideContextMenu }) => hideContextMenu && `
    #TD-ContextMenu {
      display: none;
    }
  `}
  #TD-PrimaryTools-Image {
    display: none;
  }

  #slide-background-shape div {
    pointer-events: none;
  }
`;

const EditableWBWrapper = styled.div`
  &, & > :first-child {
    cursor: inherit !important;
  }
`;

export default function Whiteboard(props) {
  const {
    isPresenter,
    isModerator,
    removeShapes,
    initDefaultPages,
    persistShape,
    notifyNotAllowedChange,
    shapes,
    assets,
    currentUser,
    curPres,
    whiteboardId,
    podId,
    zoomSlide,
    skipToSlide,
    slidePosition,
    curPageId,
    presentationWidth,
    presentationHeight,
    isViewersCursorLocked,
    zoomChanger,
    isMultiUserActive,
    isRTL,
    fitToWidth,
    zoomValue,
    isPanning,
    intl,
    svgUri,
    maxStickyNoteLength,
  } = props;

  const { pages, pageStates } = initDefaultPages(curPres?.pages.length || 1);
  const rDocument = React.useRef({
    name: "test",
    version: TldrawApp.version,
    id: whiteboardId,
    pages,
    pageStates,
    bindings: {},
    assets: {},
  });
  const [tldrawAPI, setTLDrawAPI] = React.useState(null);
  const [history, setHistory] = React.useState(null);
  const [forcePanning, setForcePanning] = React.useState(false);
  const [zoom, setZoom] = React.useState(HUNDRED_PERCENT);
  const [isMounting, setIsMounting] = React.useState(true);
  const prevShapes = usePrevious(shapes);
  const prevSlidePosition = usePrevious(slidePosition);
  const prevFitToWidth = usePrevious(fitToWidth);
  const prevSvgUri = usePrevious(svgUri);
  const language = mapLanguage(Settings?.application?.locale?.toLowerCase() || 'en');
  const [currentTool, setCurrentTool] = React.useState(null);

  const calculateZoom = (width, height) => {
    let zoom = fitToWidth 
      ? presentationWidth / width
      : Math.min(
          (presentationWidth) / width,
          (presentationHeight) / height
        );

    return zoom;
  }

  const hasShapeAccess = (id) => {
    const owner = shapes[id]?.userId;
    const isBackgroundShape = id?.includes('slide-background');
    const hasShapeAccess = !isBackgroundShape && ((owner && owner === currentUser?.userId) || !owner || isPresenter || isModerator);
    return hasShapeAccess;
  }

  const sendShapeChanges= (app, changedShapes, redo = false) => {
    const invalidChange = Object.keys(changedShapes)
                                .find(id => !hasShapeAccess(id));
    if (invalidChange) {
      notifyNotAllowedChange(intl);
      // undo last command without persisting to not generate the onUndo/onRedo callback
      if (!redo) {
        const command = app.stack[app.pointer];
        app.pointer--;
        return app.applyPatch(command.before, `undo`);
      } else {
        app.pointer++
        const command = app.stack[app.pointer]
        return app.applyPatch(command.after, 'redo');
      }
    };
    let deletedShapes = [];
    Object.entries(changedShapes)
          .forEach(([id, shape]) => {
            if (!shape) deletedShapes.push(id);
            else {
              //checks to find any bindings assosiated with the changed shapes.
              //If any, they may need to be updated as well.
              const pageBindings = app.page.bindings;
              if (pageBindings) {
                Object.entries(pageBindings).map(([k,b]) => {
                  if (b.toId.includes(id)) {
                    const boundShape = app.getShape(b.fromId);
                    if (shapes[b.fromId] && !_.isEqual(boundShape, shapes[b.fromId])) {
                      const shapeBounds = app.getShapeBounds(b.fromId);
                      boundShape.size = [shapeBounds.width, shapeBounds.height];
                      persistShape(boundShape, whiteboardId)
                    }
                  }
                })
              }
              if (!shape.id) {
                // check it already exists (otherwise we need the full shape)
                if (!shapes[id]) {
                  shape = app.getShape(id);
                }
                shape.id = id;
              }
              const shapeBounds = app.getShapeBounds(id);
              const size = [shapeBounds.width, shapeBounds.height];
              if (!shapes[id] || (shapes[id] && !_.isEqual(shapes[id].size, size))) {
                shape.size = size;
              }
              if (!shapes[id] || (shapes[id] && !shapes[id].userId)) shape.userId = currentUser?.userId;
              persistShape(shape, whiteboardId);
            }
          });
    removeShapes(deletedShapes, whiteboardId);
  }

  React.useEffect(() => {
    props.setTldrawIsMounting(true);
  }, []);

  const doc = React.useMemo(() => {
    const currentDoc = rDocument.current;

    let next = { ...currentDoc };

    let changed = false;

    if (next.pageStates[curPageId] && !_.isEqual(prevShapes, shapes)) {
      const editingShape = tldrawAPI?.getShape(tldrawAPI?.getPageState()?.editingId);

      if (editingShape) {
        shapes[editingShape?.id] = editingShape;
      }
      // set shapes as locked for those who aren't allowed to edit it
      Object.entries(shapes).forEach(([shapeId, shape]) => {
        if (!shape.isLocked && !hasShapeAccess(shapeId)) {
          shape.isLocked = true;
        }
      });

      const removed = prevShapes && findRemoved(Object.keys(prevShapes),Object.keys((shapes)))
      if (removed && removed.length > 0) {
        tldrawAPI?.patchState(
          {
            document: {
              pageStates: {
                [curPageId]: {
                  selectedIds: tldrawAPI?.selectedIds?.filter(id => !removed.includes(id)) || [],
                },
              },
              pages: {
                [curPageId]: {
                  shapes: Object.fromEntries(removed.map((id) => [id, undefined])),
                },
              },
            },
          },
        );
      }
      next.pages[curPageId].shapes = shapes;
      changed = true;
    }

    if (curPageId && (!next.assets[`slide-background-asset-${curPageId}`]) || (svgUri && !_.isEqual(prevSvgUri, svgUri))) {
      next.assets[`slide-background-asset-${curPageId}`] = assets[`slide-background-asset-${curPageId}`]
      tldrawAPI?.patchState(
        {
          document: {
            assets: assets
          },
        },
      );
      changed = true;
    }

    if (changed && tldrawAPI) {
      // merge patch manually (this improves performance and reduce side effects on fast updates)
      const patch = {
        document: {
          pages: {
            [curPageId]: { shapes: shapes }
          },
        },
      };
      const prevState = tldrawAPI._state;
      const nextState = Utils.deepMerge(tldrawAPI._state, patch);
      const final = tldrawAPI.cleanup(nextState, prevState, patch, '');
      tldrawAPI._state = final;
      tldrawAPI?.forceUpdate();
    }

    // move poll result text to bottom right
    if (next.pages[curPageId]) {
      const pollResults = Object.entries(next.pages[curPageId].shapes)
                                .filter(([id, shape]) => shape.name?.includes("poll-result"))
      for (const [id, shape] of pollResults) {
        if (_.isEqual(shape.point, [0, 0])) {
          const shapeBounds = tldrawAPI?.getShapeBounds(id);
          if (shapeBounds) {
            shape.point = [
              slidePosition.width - shapeBounds.width,
              slidePosition.height - shapeBounds.height
            ]
            shape.size = [shapeBounds.width, shapeBounds.height]
            isPresenter && persistShape(shape, whiteboardId);
          }
        }
      };
    }

    return currentDoc;
  }, [shapes, tldrawAPI, curPageId, slidePosition]);

  // when presentationSizes change, update tldraw camera
  React.useEffect(() => {
    if (curPageId && slidePosition && tldrawAPI && presentationWidth > 0 && presentationHeight > 0) {
      if (prevFitToWidth !== null && fitToWidth !== prevFitToWidth) {
        const zoom = calculateZoom(slidePosition.width, slidePosition.height)
        tldrawAPI?.setCamera([0, 0], zoom);
        const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);
        setZoom(HUNDRED_PERCENT);
        zoomChanger(HUNDRED_PERCENT);
        zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
      } else {
        const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
        if (fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // wee need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
            tldrawAPI.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
          }, 50);
        } else {
          const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom);
        }
      }
    }
  }, [presentationWidth, presentationHeight, curPageId, document?.documentElement?.dir]);

  React.useEffect(() => {
    if (presentationWidth > 0 && presentationHeight > 0) {
      const cameraZoom = tldrawAPI?.getPageState()?.camera?.zoom;
      const newzoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight);
      if (cameraZoom && cameraZoom === 1) {
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom);
      } else if (isMounting) {
        setIsMounting(false);
        props.setTldrawIsMounting(false);
        const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
        const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
        // case where the presenter had fit-to-width enabled and he reloads the page
        if (!fitToWidth && currentAspectRatio !== previousAspectRatio) {
          // wee need this to ensure tldraw updates the viewport size after re-mounting
          setTimeout(() => {
            tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom, 'zoomed');
          }, 50);
        } else {
          tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], newzoom);
        }
      }
    }
  }, [tldrawAPI?.getPageState()?.camera, presentationWidth, presentationHeight]);

  // change tldraw page when presentation page changes
  React.useEffect(() => {
    if (tldrawAPI && curPageId) {
      tldrawAPI.changePage(curPageId);
      let zoom = prevSlidePosition
        ? calculateZoom(prevSlidePosition.viewBoxWidth, prevSlidePosition.viewBoxHeight)
        : calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed_previous_page');
    }
  }, [curPageId]);

  // change tldraw camera when slidePosition changes
  React.useEffect(() => {
    if (tldrawAPI && !isPresenter && curPageId && slidePosition) {
      const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom, 'zoomed');
    }
  }, [curPageId, slidePosition]);

  // update zoom according to toolbar
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition && zoom !== zoomValue) {
      const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
      const zoomCamera = (zoomFitSlide * zoomValue) / HUNDRED_PERCENT;
      setTimeout(() => {
        tldrawAPI?.zoomTo(zoomCamera);
      }, 50);
    }
  }, [zoomValue]);

  // update zoom when presenter changes if the aspectRatio has changed
  React.useEffect(() => {
    if (tldrawAPI && isPresenter && curPageId && slidePosition && !isMounting) {
      const currentAspectRatio =  Math.round((presentationWidth / presentationHeight) * 100) / 100;
      const previousAspectRatio = Math.round((slidePosition.viewBoxWidth / slidePosition.viewBoxHeight) * 100) / 100;
      if (previousAspectRatio !== currentAspectRatio) {
        if (fitToWidth) {
          const zoom = calculateZoom(slidePosition.width, slidePosition.height)
          tldrawAPI?.setCamera([0, 0], zoom);
          const viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);
          zoomSlide(parseInt(curPageId), podId, HUNDRED_PERCENT, viewedRegionH, 0, 0);
          setZoom(HUNDRED_PERCENT);
          zoomChanger(HUNDRED_PERCENT);
        } else if (!isMounting) {
          let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(tldrawAPI?.viewport.height, slidePosition.width);
          let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);
          const camera = tldrawAPI?.getPageState()?.camera;
          const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
          if (!fitToWidth && camera.zoom === zoomFitSlide) {
            viewedRegionW = HUNDRED_PERCENT;
            viewedRegionH = HUNDRED_PERCENT;
          }
          zoomSlide(parseInt(curPageId), podId, viewedRegionW, viewedRegionH, camera.point[0], camera.point[1]);
          const zoomToolbar = Math.round((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide * 100) / 100;
          if (zoom !== zoomToolbar) {
            setZoom(zoomToolbar);
            zoomChanger(zoomToolbar);
          }
        }
      }
    }
  }, [isPresenter]);

  const hasWBAccess = props?.hasMultiUserAccess(props.whiteboardId, props.currentUser.userId);

  React.useEffect(() => {
    if (hasWBAccess || isPresenter) {
      tldrawAPI?.setSetting('dockPosition', isRTL ? 'left' : 'right');
      const tdToolsDots = document.getElementById("TD-Tools-Dots");
      const tdDelete = document.getElementById("TD-Delete");
      const tdPrimaryTools = document.getElementById("TD-PrimaryTools");
      const tdTools = document.getElementById("TD-Tools");

      if (tdToolsDots && tdDelete && tdPrimaryTools) {
        const size = ((props.height < SMALL_HEIGHT) || (props.width < SMALL_WIDTH))
          ? TOOLBAR_SMALL : TOOLBAR_LARGE;
        tdToolsDots.style.height = `${size}px`;
        tdToolsDots.style.width = `${size}px`;
        const delButton = tdDelete.getElementsByTagName('button')[0];
        delButton.style.height = `${size}px`;
        delButton.style.width = `${size}px`;
        const primaryBtns = tdPrimaryTools?.getElementsByTagName('button');
        for (let item of primaryBtns) {
          item.style.height = `${size}px`;
          item.style.width = `${size}px`;
        }
      }
      if (((props.height < SMALLEST_HEIGHT) || (props.width < SMALLEST_WIDTH)) && tdTools) {
        tldrawAPI?.setSetting('dockPosition', 'bottom');
        tdTools.parentElement.style.bottom = `${TOOLBAR_OFFSET}px`;
      }
      // removes tldraw native help menu button
      tdTools?.parentElement?.nextSibling?.remove();
      // removes image tool from the tldraw toolbar
      document.getElementById("TD-PrimaryTools-Image").style.display = 'none';
    }

    if (tldrawAPI) {
      tldrawAPI.isForcePanning = isPanning;
    }
  });

  React.useEffect(() => {
    if (tldrawAPI) {
      tldrawAPI.isForcePanning = isPanning;
    }
  }, [isPanning]);

  React.useEffect(() => {
    tldrawAPI?.setSetting('language', language);
  }, [language]);

  // Reset zoom to default when current presentation changes.
  React.useEffect(() => {
    if (isPresenter && slidePosition && tldrawAPI) {
      const zoom = calculateZoom(slidePosition.width, slidePosition.height);
      tldrawAPI.zoomTo(zoom);
    }
  }, [curPres?.id]);

  const onMount = (app) => {
    const menu = document.getElementById("TD-Styles")?.parentElement;
    if (menu) {
      const MENU_OFFSET = `48px`;
      menu.style.position = `relative`;
      if (isRTL) {
        menu.style.left = MENU_OFFSET;
      } else {
        menu.style.right = MENU_OFFSET;
      }

      [...menu.children]
        .sort((a,b)=> a?.id>b?.id?-1:1)
        .forEach(n=> menu.appendChild(n));
    }
    app.setSetting('language', language);
    app?.setSetting('isDarkMode', false);
    app?.patchState(
      {
        appState: {
          currentStyle: {
            textAlign: isRTL ? "end" : "start",
          },
        },
      }
    );

    setTLDrawAPI(app);
    props.setTldrawAPI(app);
    // disable for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      app.onPan = () => {};
      app.setSelectedIds = () => {};
      app.setHoveredId = () => {};
    }

    if (curPageId) {
      app.changePage(curPageId);
      setIsMounting(true);
    }

    if (history) {
      app.replaceHistory(history);
    }
  };

  const onPatch = (e, t, reason) => {
    // don't allow select others shapes for editing if don't have permission
    if (reason && reason.includes("set_editing_id")) {
      if (!hasShapeAccess(e.pageState.editingId)) {
        e.pageState.editingId = null;
      }
    }
    // don't allow hover others shapes for editing if don't have permission
    if (reason && reason.includes("set_hovered_id")) {
      if (!hasShapeAccess(e.pageState.hoveredId)) {
        e.pageState.hoveredId = null;
      }
    }
    // don't allow select others shapes if don't have permission
    if (reason && reason.includes("selected")) {
      const validIds = [];
      e.pageState.selectedIds.forEach(id => hasShapeAccess(id) && validIds.push(id));
      e.pageState.selectedIds = validIds;
      e.patchState(
        {
          document: {
            pageStates: {
              [e.getPage()?.id]: {
                selectedIds: validIds,
              },
            },
          },
        }
      );
    }
    // don't allow selecting others shapes with ctrl (brush)
    if (e?.session?.type === "brush" && e?.session?.status === "brushing") {
      const validIds = [];
      e.pageState.selectedIds.forEach(id => hasShapeAccess(id) && validIds.push(id));
      e.pageState.selectedIds = validIds;
      if (!validIds.find(id => id === e.pageState.hoveredId)) {
        e.pageState.hoveredId = undefined;
      }
    }

    if (reason && isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
      const camera = tldrawAPI.getPageState()?.camera;

      // limit bounds
      if (tldrawAPI?.viewport.maxX > slidePosition.width) {
        camera.point[0] = camera.point[0] + (tldrawAPI?.viewport.maxX - slidePosition.width);
      }
      if (tldrawAPI?.viewport.maxY > slidePosition.height) {
        camera.point[1] = camera.point[1] + (tldrawAPI?.viewport.maxY - slidePosition.height);
      }
      if (camera.point[0] > 0 || tldrawAPI?.viewport.minX < 0) {
        camera.point[0] = 0;
      }
      if (camera.point[1] > 0 || tldrawAPI?.viewport.minY < 0) {
        camera.point[1] = 0;
      }
      const zoomFitSlide = calculateZoom(slidePosition.width, slidePosition.height);
      if (camera.zoom < zoomFitSlide) {
        camera.zoom = zoomFitSlide;
      }
      
      tldrawAPI?.setCamera([camera.point[0], camera.point[1]], camera.zoom);

      const zoomToolbar = Math.round((HUNDRED_PERCENT * camera.zoom) / zoomFitSlide * 100) / 100;
      if (zoom !== zoomToolbar) {
        setZoom(zoomToolbar);
        isPresenter && zoomChanger(zoomToolbar);
      }

      let viewedRegionW = SlideCalcUtil.calcViewedRegionWidth(tldrawAPI?.viewport.height, slidePosition.width);
      let viewedRegionH = SlideCalcUtil.calcViewedRegionHeight(tldrawAPI?.viewport.width, slidePosition.height);

      if (!fitToWidth && camera.zoom === zoomFitSlide) {
        viewedRegionW = HUNDRED_PERCENT;
        viewedRegionH = HUNDRED_PERCENT;
      }

      zoomSlide(parseInt(curPageId), podId, viewedRegionW, viewedRegionH, camera.point[0], camera.point[1]);
    }
    //don't allow non-presenters to pan&zoom
    if (slidePosition && reason && !isPresenter && (reason.includes("zoomed") || reason.includes("panned"))) {
      const zoom = calculateZoom(slidePosition.viewBoxWidth, slidePosition.viewBoxHeight)
      tldrawAPI?.setCamera([slidePosition.x, slidePosition.y], zoom);
    }
    // disable select for non presenter that doesn't have multi user access
    if (!hasWBAccess && !isPresenter) {
      if (e?.getPageState()?.brush || e?.selectedIds?.length !== 0) {
        e.patchState(
          {
            document: {
              pageStates: {
                [e?.currentPageId]: {
                  selectedIds: [],
                  brush: null,
                },
              },
            },
          },
        );
      }
    }

    if (reason && reason === 'patched_shapes' && e?.session?.type === 'edit') {
      const patchedShape = e?.getShape(e?.getPageState()?.editingId);

      if (e?.session?.initialShape?.type === 'sticky' && patchedShape?.text?.length > maxStickyNoteLength) {
        patchedShape.text = patchedShape.text.substring(0, maxStickyNoteLength);
      }

      if (e?.session?.initialShape?.type === 'text' && !shapes[patchedShape.id]) {
        patchedShape.userId = currentUser?.userId;
        persistShape(patchedShape, whiteboardId);
      } else {
        const diff = {
          id: patchedShape.id,
          point: patchedShape.point,
          text: patchedShape.text,
        };
        persistShape(diff, whiteboardId);
      }
    }

    if (reason && reason.includes('selected_tool')) {
      const tool = reason.split(':')[1];

      setCurrentTool(tool);
    }
  };

  const onUndo = (app) => {
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer+1];
    const changedShapes = lastCommand?.before?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(app, changedShapes, true);
    }
  };

  const onRedo = (app) => { 
    if (app.currentPageId !== curPageId) {
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
      return;
    }
    const lastCommand = app.stack[app.pointer];
    const changedShapes = lastCommand?.after?.document?.pages[app.currentPageId]?.shapes;
    if (changedShapes) {
      sendShapeChanges(app, changedShapes);
    }
  };

  const onCommand = (app, command, reason) => {
    setHistory(app.history);
    const changedShapes = command.after?.document?.pages[app.currentPageId]?.shapes;
    if (!isMounting && app.currentPageId !== curPageId) {
      // can happen then the "move to page action" is called, or using undo after changing a page
      const newWhiteboardId = curPres.pages.find(page => page.num === Number.parseInt(app.currentPageId)).id;
      //remove from previous page and persist on new
      changedShapes && removeShapes(Object.keys(changedShapes), whiteboardId);
      changedShapes && Object.entries(changedShapes)
                             .forEach(([id, shape]) => {
                               const shapeBounds = app.getShapeBounds(id);
                               shape.size = [shapeBounds.width, shapeBounds.height];
                               persistShape(shape, newWhiteboardId);
                             });
      if (isPresenter) {
        // change slide for others
        skipToSlide(Number.parseInt(app.currentPageId), podId)
      } else {
        // ignore, stay on same page
        app.changePage(curPageId);
      }
    }
    else if (changedShapes) {
      sendShapeChanges(app, changedShapes);
    }
  };

  const onPaste = (e) => {
    // disable file pasting
    const clipboardData = e.clipboardData || window.clipboardData;
    const { types } = clipboardData;
    const hasFiles = types && types.indexOf && types.indexOf('Files') !== -1;

    if (hasFiles) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const webcams = document.getElementById('cameraDock');
  const dockPos = webcams?.getAttribute("data-position");
  const editableWB = (
    <EditableWBWrapper onPaste={onPaste}>
      <Tldraw
        key={`wb-${isRTL}-${dockPos}-${forcePanning}`}
        document={doc}
        // disable the ability to drag and drop files onto the whiteboard
        // until we handle saving of assets in akka.
        disableAssets={true}
        // Disable automatic focus. Users were losing focus on shared notes
        // and chat on presentation mount.
        autofocus={false}
        onMount={onMount}
        showPages={false}
        showZoom={false}
        showUI={curPres ? (isPresenter || hasWBAccess) : true}
        showMenu={curPres ? false : true}
        showMultiplayerMenu={false}
        readOnly={false}
        onPatch={onPatch}
        onUndo={onUndo}
        onRedo={onRedo}
        onCommand={onCommand}
      />
    </EditableWBWrapper>
  );

  const readOnlyWB = (
    <Tldraw
      key={`wb-readOnly`}
      document={doc}
      onMount={onMount}
      // disable the ability to drag and drop files onto the whiteboard
      // until we handle saving of assets in akka.
      disableAssets={true}
      // Disable automatic focus. Users were losing focus on shared notes
      // and chat on presentation mount.
      autofocus={false}
      showPages={false}
      showZoom={false}
      showUI={false}
      showMenu={false}
      showMultiplayerMenu={false}
      readOnly={true}
      onPatch={onPatch}
    />
  );

  return (
    <>
      <Cursors
        tldrawAPI={tldrawAPI}
        currentUser={currentUser}
        hasMultiUserAccess={props?.hasMultiUserAccess}
        whiteboardId={whiteboardId}
        isViewersCursorLocked={isViewersCursorLocked}
        isMultiUserActive={isMultiUserActive}
        isPanning={isPanning}
        currentTool={currentTool}
      >
        {hasWBAccess || isPresenter ? editableWB : readOnlyWB}
        <TldrawGlobalStyle 
          hideContextMenu={!hasWBAccess && !isPresenter} 
        />
      </Cursors>
    </>
  );
}
