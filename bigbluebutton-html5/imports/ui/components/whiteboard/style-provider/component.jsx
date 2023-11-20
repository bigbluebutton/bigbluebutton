import * as React from "react";

export const ShapeStylesContext = React.createContext();

export const ShapeStylesProvider = ({ children }) => {
  const [currentShapeStyles, setCurrentShapeStyles] = React.useState({
    'align': "start",
    'color': "black",
    'dash': "draw",
    'fill': "none",
    'font': "draw",
    'labelColor': "black",
    'size': "m",
    'verticalAlign': "start",
  });

  return (
    <ShapeStylesContext.Provider value={{ currentShapeStyles, setCurrentShapeStyles }}>
      {children}
    </ShapeStylesContext.Provider>
  );
};
