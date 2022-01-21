import Moveable from 'react-moveable';
import Selecto from 'react-selecto';
import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import SelectionService from '/imports/ui/components/whiteboard/annotation-selection-modification/service';
import { setDeselectHandle } from '/imports/ui/components/whiteboard/service';

function SelectionModification(props) {
  const moveableRef = React.useRef(null);
  const selectoRef = React.useRef(null);
  const [moveableTargets, setMoveableTargets] = React.useState([]);
  const { zoom, tool, userIsPresenter } = props;

  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [zoom, userIsPresenter]);

  function deselect(selection) {
    setMoveableTargets(moveableTargets.filter((selected) => !selection.includes(selected.id)));
  }

  function forwardEventOnSelectableToSelecto(eventToTarget) {
    if (selectoRef) {
      const newEvent = eventToTarget;

      let x = null;
      let y = null;

      switch (eventToTarget.type) {
        case 'mousedown':
          x = eventToTarget.clientX;
          y = eventToTarget.clientY;
          break;
        case 'touchstart':
          x = eventToTarget.touches[0].pageX;
          y = eventToTarget.touches[0].pageY;
          break;
        default:
          break;
      }

      if (!x || !y) return;

      const elements = document.elementsFromPoint(x, y)
        .filter((e) => e.classList.contains('selectable'));
      if (elements.length > 0) {
        [newEvent.target] = elements;
        selectoRef.current.clickTarget(newEvent, elements[0]);
      }
    }
  }

  useEffect(() => {
    setDeselectHandle(deselect);
  });

  useEffect(() => {
    const events = ['mousedown', 'touchstart'];
    events.forEach(
      (eventType) => window.addEventListener(eventType, forwardEventOnSelectableToSelecto),
    );
    // window.addEventListener('touchstart', forwardEventOnSelectableToSelecto);
    return () => {
      events.forEach(
        (eventType) => window.removeEventListener(eventType, forwardEventOnSelectableToSelecto),
      );
      // window.removeEventListener('touchstart', forwardEventOnSelectableToSelecto);
    };
  });

  return (
    <>
      {userIsPresenter ? (
        <Moveable
          origin={false}
          draggable={false}
          rootContainer={document.body}
          edge={false}
          ref={moveableRef}
          target={moveableTargets}
        />
      ) : null}
      <Selecto
        // disable selecto on other tools and if user is presenter
        dragCondition={() => tool === 'selection' && userIsPresenter}
        boundContainer="#slideSVG"
        ref={selectoRef}
        selectByClick
        selectableTargets={['.selectable']}
        onSelect={
          (e) => {
            setMoveableTargets(e.selected);
          }
        }
        onSelectEnd={(e) => {
          setMoveableTargets(e.selected);
          SelectionService.selectAnnotations(e.selected.map((target) => target.id));
        }}
      />
    </>
  );
}

SelectionModification.propTypes = {
  tool: PropTypes.string.isRequired,
  // for rerendering of selection rectangle on zoom
  zoom: PropTypes.number.isRequired,
  userIsPresenter: PropTypes.bool.isRequired,
};

export default SelectionModification;
