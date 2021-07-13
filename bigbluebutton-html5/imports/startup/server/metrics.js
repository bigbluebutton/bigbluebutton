/* eslint-disable no-prototype-builtins */

import fs from 'fs';
import path from 'path';
import { Meteor } from 'meteor/meteor';
import Logger from './logger';

const {
  metricsDumpIntervalMs,
  metricsFolderPath,
  removeMeetingOnEnd,
} = Meteor.settings.private.redis.metrics;

class Metrics {
  constructor() {
    this.metrics = {};
  }

  addEvent(meetingId, eventName, messageLength) {
    if (!this.metrics.hasOwnProperty(meetingId)) {
      this.metrics[meetingId] = {
        currentlyInQueue: {},
        wasInQueue: {},
      };
    }

    const { currentlyInQueue } = this.metrics[meetingId];

    if (!currentlyInQueue.hasOwnProperty(eventName)) {
      currentlyInQueue[eventName] = {
        count: 1,
        payloadSize: messageLength,
      };
    } else {
      currentlyInQueue[eventName].count += 1;
      currentlyInQueue[eventName].payloadSize += messageLength;
    }
  }

  processEvent(meetingId, eventName, size, processingStartTimestamp) {
    const currentProcessingTimestamp = Date.now();
    const processTime = currentProcessingTimestamp - processingStartTimestamp;

    this.addEvent(meetingId, eventName, size);

    if (!this.metrics[meetingId].wasInQueue.hasOwnProperty(eventName)) {
      this.metrics[meetingId].wasInQueue[eventName] = {
        count: 1,
        payloadSize: {
          min: size,
          max: size,
          last: size,
          total: size,
          avg: size,
        },
        processingTime: {
          min: processTime,
          max: processTime,
          last: processTime,
          total: processTime,
          avg: processTime,
        },
      };
      this.metrics[meetingId].currentlyInQueue[eventName].count -= 1;

      if (!this.metrics[meetingId].currentlyInQueue[eventName].count) {
        delete this.metrics[meetingId].currentlyInQueue[eventName];
      }
    } else {
      const { currentlyInQueue, wasInQueue } = this.metrics[meetingId];

      currentlyInQueue[eventName].count -= 1;

      if (!currentlyInQueue[eventName].count) {
        delete currentlyInQueue[eventName];
      }

      const { payloadSize, processingTime } = wasInQueue[eventName];

      wasInQueue[eventName].count += 1;

      payloadSize.last = size;
      payloadSize.total += size;

      if (payloadSize.min > size) payloadSize.min = size;
      if (payloadSize.max < size) payloadSize.max = size;

      payloadSize.avg = payloadSize.total / wasInQueue[eventName].count;

      if (processingTime.min > processTime) processingTime.min = processTime;
      if (processingTime.max < processTime) processingTime.max = processTime;

      processingTime.last = processTime;
      processingTime.total += processTime;
      processingTime.avg = processingTime.total / wasInQueue[eventName].count;
    }
  }

  setAnnotationQueueLength(meetingId, size) {
    this.metrics[meetingId].annotationQueueLength = size;
  }

  startDumpFile() {
    Meteor.setInterval(() => {
      try {
        const fileDate = new Date();
        const fullYear = fileDate.getFullYear();
        const month = (fileDate.getMonth() + 1).toString().padStart(2, '0');
        const day = fileDate.getDate().toString().padStart(2, '0');
        const hour = fileDate.getHours().toString().padStart(2, '0');
        const minutes = fileDate.getMinutes().toString().padStart(2, '0');
        const seconds = fileDate.getSeconds().toString().padStart(2, '0');

        const folderName = `${fullYear}${month}${day}_${hour}`;
        const fileName = `${folderName}${minutes}${seconds}_metrics.json`;

        const folderPath = path.join(metricsFolderPath, folderName);
        const fullFilePath = path.join(folderPath, fileName);

        if (!fs.existsSync(folderPath)) {
          Logger.debug(`Creating folder: ${folderPath}`);
          fs.mkdirSync(folderPath);
        }

        fs.writeFileSync(fullFilePath, JSON.stringify(this.metrics));

        Logger.info('Metric file successfully written');
      } catch (err) {
        Logger.error('Error on writing metrics to disk.', err);
      }
    }, metricsDumpIntervalMs);
  }

  removeMeeting(meetingId) {
    if (removeMeetingOnEnd) {
      Logger.info(`Removing meeting ${meetingId} from metrics`);
      delete this.metrics[meetingId];
    } else {
      Logger.info(`Skipping remove of meeting ${meetingId} from metrics`);
    }
  }
}

const metricsSingleton = new Metrics();

export default metricsSingleton;
