// import Shapes from '/imports/api/shapes';
// import Logger from '/imports/startup/server/logger';
// import { check } from 'meteor/check';


// function addShape(shape) {
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//     console.log('$$$$$$$$$$$$  addAnnotation  $$$$$$$$$$$$$$')
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//     console.log(shape.id)
//     console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
//   try {
//     const { insertedId } = Shapes.upsert({ id: shape.id }, { ...shape });

//     if (insertedId) {
//       Logger.info(`Added shape=${JSON.stringify(shape)} meetingId=${meetingId}`);
//     }
//   } catch (err) {
//     Logger.error(`Adding shape to collection: ${err}`);
//   }
// }

import Shapes from '/imports/api/shapes';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';


export default function addShape(meetingId, shape) {
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
    console.log('$$$$$$$$$$$$  addAnnotation  $$$$$$$$$$$$$$')
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
    console.log(shape.id)
    console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$')
  try {
    const { insertedId } = Shapes.upsert({ meetingId, id: shape.id }, { ...shape });

    if (insertedId) {
      Logger.info(`Added shape=${JSON.stringify(shape)} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding shape to collection: ${err}`);
  }
} 