const {Worker} = require('worker_threads');
const path = require('path');

const WorkerTypes = Object.freeze({
  Collector: 'collector',
  Process: 'process',
  Notifier: 'notifier',
});

const kickOffWorker = (workerType, workerData) => {
  return new Promise((resolve, reject) => {
    const workerPath = path.join(__dirname, '..', '..', 'workers', `${workerType}.js`);
    const worker = new Worker(workerPath, {workerData});
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker '${workerType}' stopped with exit code ${code}`));
      }
    });
  });
};

module.exports = class WorkerStarter {
  constructor(workerData) {
    this.workerData = workerData;
  }

  collect = () => kickOffWorker(WorkerTypes.Collector, this.workerData);
  process = () => kickOffWorker(WorkerTypes.Process, this.workerData);
  notify = () => kickOffWorker(WorkerTypes.Notifier, this.workerData);
};
