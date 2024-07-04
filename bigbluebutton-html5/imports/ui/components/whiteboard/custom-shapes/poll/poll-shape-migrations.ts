// @ts-nocheck

import { defineMigrations } from '@bigbluebutton/tldraw';

// Migrations for the custom poll shape (optional but very helpful)
export const pollShapeMigrations = defineMigrations({
  currentVersion: 1,
  migrators: {
    1: {
      // example, removing a property from the shape
      up(shape) {
        const migratedUpShape = { ...shape };
        delete migratedUpShape.somePropertyToRemove;
        return migratedUpShape;
      },
      down(shape) {
        const migratedDownShape = { ...shape };
        migratedDownShape.somePropertyToRemove = 'some value';
        return migratedDownShape;
      },
    },
  },
});

export default pollShapeMigrations;
