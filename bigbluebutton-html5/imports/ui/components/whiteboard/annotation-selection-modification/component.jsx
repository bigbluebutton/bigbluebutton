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
  const { zoom, tool } = props;

  useEffect(() => {
    if (moveableRef.current) {
      moveableRef.current.updateRect();
    }
  }, [zoom]);

  function deselect(selection) {
    setMoveableTargets(moveableTargets.filter((selected) => !selection.includes(selected.id)));
  }

  useEffect(() => {
    setDeselectHandle(deselect);
  });

  return (
    <>
      <Moveable
        origin={false}
        rootContainer={document.body}
        edge={false}
        ref={moveableRef}
        target={moveableTargets}
      />
      <Selecto
        dragCondition={(_) => tool === 'selection'}
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
  //
  zoom: PropTypes.number.isRequired,
};

export default SelectionModification;
