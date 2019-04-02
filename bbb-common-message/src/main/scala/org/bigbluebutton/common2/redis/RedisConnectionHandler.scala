package org.bigbluebutton.common2.redis

import io.lettuce.core.RedisClient
import io.lettuce.core.event.Event
import io.lettuce.core.event.EventBus
import io.lettuce.core.event.connection.{ ConnectionDeactivatedEvent, ConnectionActivatedEvent, ConnectedEvent, DisconnectedEvent }
import reactor.core.Disposable
import akka.event.LoggingAdapter

trait RedisConnectionHandler {

  def subscribeToEventBus(redis: RedisClient, log: LoggingAdapter) {
    val eventBus: EventBus = redis.getResources().eventBus();
    // @todo : unsubscribe when connection is closed
    val eventBusSubscription: Disposable = eventBus.get().subscribe(e => connectionStatusHandler(e, log))
  }

  def connectionStatusHandler(event: Event, log: LoggingAdapter) {
    if (event.isInstanceOf[ConnectedEvent]) {
      log.info("Connected to redis");
    } else if (event.isInstanceOf[ConnectionActivatedEvent]) {
      log.info("Connection to redis activated");
    } else if (event.isInstanceOf[DisconnectedEvent]) {
      log.info("Disconnected from redis");
    } else if (event.isInstanceOf[ConnectionDeactivatedEvent]) {
      log.info("Connection to redis deactivated");
    }
  }
}
