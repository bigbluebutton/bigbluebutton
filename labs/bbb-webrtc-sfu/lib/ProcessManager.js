/*
 * Lucas Fialho Zawacki
 * Paulo Renato Lanzarin
 * (C) Copyright 2017 Bigbluebutton
 *
 */

'use strict';

const cp = require('child_process');
const Logger = require('./utils/Logger');
const SCREENSHARE_PATH = './lib/screenshare/ScreenshareProcess';
const VIDEO_PATH = './lib/video/VideoProcess.js';
const AUDIO_PATH = './lib/audio/AudioProcess.js';

module.exports = class ProcessManager {
  constructor() {
    this.screensharePid;
    this.videoPid;
    this.screenshareProcess;
    this.videoProcess;
    this.audioProcess;
    this.processes = {};
    this.runningState = "RUNNING";
  }

  async start () {
    let screenshareProcess = this.startProcess(SCREENSHARE_PATH);
    let videoProcess = this.startProcess(VIDEO_PATH);
    let audioProcess = this.startProcess(AUDIO_PATH);


    this.processes[screenshareProcess.pid] = screenshareProcess;
    this.processes[videoProcess.pid] = videoProcess;
    this.processes[audioProcess.pid] = audioProcess;

    process.on('SIGTERM', async () => {
      await this.finishChildProcesses();
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      await this.finishChildProcesses();
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      Logger.error('[ProcessManager] Uncaught exception', error.stack);
      await this.finishChildProcesses();
      process.exit('1');
    });

    // Added this listener to identify unhandled promises, but we should start making
    // sense of those as we find them
    process.on('unhandledRejection', (reason, p) => {
      Logger.error('[ProcessManager] Unhandled Rejection at: Promise', p, 'reason:', reason);
    });
  }

  startProcess (processPath) {
    Logger.info("[ProcessManager] Starting process at path", processPath);
    let proc = cp.fork(processPath, {
      // Pass over all of the environment.
      env: process.ENV,
      // Share stdout/stderr, so we can hear the inevitable errors.
      silent: false
    });

    proc.path = processPath;

    proc.on('message', this.onMessage);
    proc.on('error', this.onError);

    // Tries to restart process on unsucessful exit
    proc.on('exit', (code, signal) => {
      let processId = proc.pid;
      if (this.runningState === 'RUNNING' && code === 1) {
        Logger.error('[ProcessManager] Received exit event from child process with PID', proc.pid, ' with code', code, '. Restarting it');
        this.restartProcess(processId);
      }
    });

    return proc;
  }

  restartProcess (pid) {
    let proc = this.processes[pid];
    if (proc) {
      let newProcess = this.startProcess(proc.path);
      this.processes[newProcess.pid] = newProcess;
      delete this.processes[pid];
    }
  }

  onMessage (message) {
    Logger.info('[ProcessManager] Received child message from', this.pid, message);
  }

  onError (e) {
    Logger.error('[ProcessManager] Received child error', this.pid, e);
  }

  onDisconnect (e) {
  }

  async finishChildProcesses () {
    this.runningState = "STOPPING";

    for (var proc in this.processes) {
      if (this.processes.hasOwnProperty(proc)) {
        let procObj = this.processes[proc];
        if (typeof procObj.exit === 'function' && !procObj.killed) {
          await procObj.exit()
        }
      }
    }

    this.runningState = "STOPPED";
  }
}
