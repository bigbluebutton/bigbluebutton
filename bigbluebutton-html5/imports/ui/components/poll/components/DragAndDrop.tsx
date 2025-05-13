import React, { useEffect, useRef, useState } from 'react';
import Styled from '../styles';

interface DragAndDropPros {
  MAX_INPUT_CHARS: number;
  handlePollValuesText: (value: string) => void;
  [key: string]: unknown;
}

const DragAndDrop = React.forwardRef<HTMLTextAreaElement, DragAndDropPros>((props, ref) => {
  const { MAX_INPUT_CHARS, handlePollValuesText } = props;
  const [drag, setDrag] = useState(false);
  const [pollValueText, setPollValueText] = useState('');
  const dropRef = useRef<HTMLTextAreaElement | null>(null);
  const dragCounter = useRef(0);

  React.useImperativeHandle(ref, () => dropRef.current as HTMLTextAreaElement);

  useEffect(() => {
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragIn = (e: DragEvent) => {
      handleDrag(e);
      dragCounter.current += 1;
      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setDrag(true);
      }
    };

    const handleDragOut = (e: DragEvent) => {
      handleDrag(e);
      dragCounter.current -= 1;
      if (dragCounter.current > 0) return;
      setDrag(false);
    };

    const handleDrop = (e: DragEvent) => {
      handleDrag(e);
      setDrag(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        setPollValuesFromFile(e.dataTransfer.files[0]);
        dragCounter.current = 0;
      }
    };

    const div = dropRef.current;
    if (!div) return undefined;
    div.addEventListener('dragenter', handleDragIn);
    div.addEventListener('dragleave', handleDragOut);
    div.addEventListener('dragover', handleDrag);
    div.addEventListener('drop', handleDrop);

    return () => {
      div.removeEventListener('dragenter', handleDragIn);
      div.removeEventListener('dragleave', handleDragOut);
      div.removeEventListener('dragover', handleDrag);
      div.removeEventListener('drop', handleDrop);
    };
  }, []);

  const setPollValues = () => {
    if (pollValueText) {
      handlePollValuesText(pollValueText);
    }
  };

  const setPollValuesFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const result = e.target?.result;
      if (!result) return;
      const text = typeof result === 'string' ? result : String(result);
      setPollText(text);
      setPollValues();
    };
    reader.readAsText(file);
  };

  const setPollText = (pollText: string) => {
    const arr = pollText.split('\n');
    const text = arr.map((line) => (
      line.length > MAX_INPUT_CHARS ? line.substring(0, MAX_INPUT_CHARS) : line
    )).join('\n');
    setPollValueText(text);
  };

  const getCleanProps = () => {
    const cleanProps = { ...props };
    const propsToDelete = ['MAX_INPUT_CHARS', 'handlePollValuesText'] as const;

    propsToDelete.forEach((prop) => {
      delete cleanProps[prop as keyof typeof cleanProps];
    });

    return props as Omit<DragAndDropPros, typeof propsToDelete[number]>;
  };

  return (
    <Styled.DndTextArea
      ref={dropRef}
      active={drag}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...getCleanProps()}
    />
  );
});

export default DragAndDrop;
