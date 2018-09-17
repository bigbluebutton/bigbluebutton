/**
 * BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
 * <p>
 * Copyright (c) 2012 BigBlueButton Inc. and by respective authors (see below).
 * <p>
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 * <p>
 * BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 * <p>
 * You should have received a copy of the GNU Lesser General Public License along
 * with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
 */

package org.bigbluebutton.web.services;

import java.util.concurrent.BlockingQueue;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.bigbluebutton.api.messaging.MessageListener;
import org.bigbluebutton.api.messaging.messages.IMessage;
import org.bigbluebutton.api.messaging.messages.KeepAliveReply;
import org.bigbluebutton.api2.IBbbWebApiGWApp;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class KeepAliveService implements MessageListener {
  private static Logger log = LoggerFactory.getLogger(KeepAliveService.class);
  private static final String KEEP_ALIVE_REQUEST = "KEEP_ALIVE_REQUEST";
  private IBbbWebApiGWApp gw;
  private long runEvery = 10000;
  private static int maxLives = 5;
  private KeepAliveTask task = new KeepAliveTask();
  private volatile boolean processMessages = false;

  volatile boolean available = true;

  private static final Executor msgSenderExec = Executors.newFixedThreadPool(1);
  private static final Executor runExec = Executors.newFixedThreadPool(1);

  private ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(1);

  private BlockingQueue<KeepAliveMessage> messages = new LinkedBlockingQueue<KeepAliveMessage>();

  private Long lastKeepAliveMessage = 0L;

  private static final String SYSTEM = "BbbWeb";

  public void start() {
    scheduledThreadPool.scheduleWithFixedDelay(task, 5000, runEvery, TimeUnit.MILLISECONDS);
    processKeepAliveMessage();
  }

  public void stop() {
    processMessages = false;
    scheduledThreadPool.shutdownNow();
  }

  public void setRunEvery(long v) {
    runEvery = v * 1000;
  }

  public void setGw(IBbbWebApiGWApp gw) {
    this.gw = gw;
  }

  class KeepAliveTask implements Runnable {
    public void run() {
      KeepAlivePing ping = new KeepAlivePing();
      queueMessage(ping);
    }
  }

  public boolean isDown() {
    return !available;
  }

  private void queueMessage(KeepAliveMessage msg) {
    messages.add(msg);
  }

  private void processKeepAliveMessage() {
    processMessages = true;
    Runnable sender = new Runnable() {
      public void run() {
        while (processMessages) {
          KeepAliveMessage message;
          try {
            message = messages.take();
            processMessage(message);
          } catch (InterruptedException e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
          } catch (Exception e) {
            log.error("Catching exception [{}]", e.toString());
          }
        }
      }
    };
    msgSenderExec.execute(sender);
  }

  private void processMessage(final KeepAliveMessage msg) {
    Runnable task = new Runnable() {
      public void run() {
        if (msg instanceof KeepAlivePing) {
          processPing((KeepAlivePing) msg);
        } else if (msg instanceof KeepAlivePong) {
          processPong((KeepAlivePong) msg);
        }
      }
    };

    runExec.execute(task);
  }

  private void processPing(KeepAlivePing msg) {
    gw.sendKeepAlive(SYSTEM, System.currentTimeMillis());
    Boolean akkaAppsIsAvailable = available;

    if (lastKeepAliveMessage != 0 && (System.currentTimeMillis() - lastKeepAliveMessage > 30000)) {
      if (akkaAppsIsAvailable) {
        log.error("BBB Web pubsub error!");
        // BBB-Apps has gone down. Mark it as unavailable. (ralam - april 29, 2014)
        available = false;
      }
    }
  }

  private void processPong(KeepAlivePong msg) {
    if (lastKeepAliveMessage != 0 && !available) {
      log.error("BBB Web pubsub recovered!");
    }

    lastKeepAliveMessage = System.currentTimeMillis();
    available = true;
  }

  private void handleKeepAliveReply(String system, Long timestamp) {
    if (SYSTEM.equals(system)) {
      KeepAlivePong pong = new KeepAlivePong(system, timestamp);
      queueMessage(pong);
    }
  }

  @Override
  public void handle(IMessage message) {
    if (message instanceof KeepAliveReply) {
      KeepAliveReply msg = (KeepAliveReply) message;
      handleKeepAliveReply(msg.system, msg.timestamp);
    }
  }
}
