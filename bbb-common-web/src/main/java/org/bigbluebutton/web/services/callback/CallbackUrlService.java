package org.bigbluebutton.web.services.callback;

import java.io.IOException;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.conn.DnsResolver;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.bigbluebutton.api.service.ValidatedUrl;
import org.bigbluebutton.api.service.impl.CallbackRedirectValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class CallbackUrlService {
	private static Logger log = LoggerFactory.getLogger(CallbackUrlService.class);

	private BlockingQueue<DelayCallback> receivedMessages = new DelayQueue<DelayCallback>();

	private volatile boolean processMessage = false;

	private static final int CALLBACK_TIMEOUT_MS = 10_000;

	private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
	private final Executor runExec = Executors.newSingleThreadExecutor();

	private CallbackRedirectValidatorService callbackRedirectValidator;

	public void stop() {
		log.info("Stopping callback url service.");
		processMessage = false;
	}

	public void start() {
		log.info("Starting callback url service.");

		try {
			processMessage = true;

			Runnable messageProcessor = new Runnable() {
				public void run() {
					while (processMessage) {
						try {
							DelayCallback msg = receivedMessages.take();
							processMessage(msg);
						} catch (InterruptedException e) {
							log.warn("Error while taking received message from queue.");
						}
					}
				}
			};
			msgProcessorExec.execute(messageProcessor);
		} catch (Exception e) {
			log.error("Error subscribing to channels: {}", e);
		}
	}


	private void processMessage(final DelayCallback msg) {
		Runnable task = new Runnable() {
			public void run() {
				MeetingEndedEvent event = (MeetingEndedEvent) msg.callbackEvent;
				if (fetchCallbackUrl(msg.callbackEvent.getCallbackUrl())) {
					Map<String, Object> logData = new HashMap<>();
					logData.put("meetingId", event.meetingid);
					logData.put("externalMeetingId", event.extMeetingid);
					logData.put("name",event.name);
					logData.put("callback", event.getCallbackUrl());
					logData.put("attempts", msg.numAttempts);
					logData.put("logCode", "callback_success");
					logData.put("description", "Callback successful.");

					Gson gson = new Gson();
					String logStr = gson.toJson(logData);

					log.info(" --analytics-- data={}", logStr);
				} else {
					schedRetryCallback(msg);
				}
			}
		};

		runExec.execute(task);
	}

	private void schedCallback(final DelayCallback msg, long delayInMillis, int numAttempt) {
		MeetingEndedEvent event = (MeetingEndedEvent) msg.callbackEvent;
		Map<String, Object> logData = new HashMap<>();
		logData.put("meetingId", event.meetingid);
		logData.put("externalMeetingId", event.extMeetingid);
		logData.put("name",event.name);
		logData.put("callback", event.getCallbackUrl());
		logData.put("attempts", msg.numAttempts);
		logData.put("retryInMs", delayInMillis);
		logData.put("logCode", "callback_failed_retry");
		logData.put("description", "Callback failed but retrying.");

		Gson gson = new Gson();
		String logStr = gson.toJson(logData);

		log.info(" --analytics-- data={}", logStr);

		DelayCallback dc = new DelayCallback(event, delayInMillis, numAttempt);
		receivedMessages.add(dc);
	}

	private void giveupCallback(final DelayCallback msg) {
		MeetingEndedEvent event = (MeetingEndedEvent) msg.callbackEvent;
		Map<String, Object> logData = new HashMap<>();
		logData.put("meetingId", event.meetingid);
		logData.put("externalMeetingId", event.extMeetingid);
		logData.put("name",event.name);
		logData.put("callback", event.getCallbackUrl());
		logData.put("attempts", msg.numAttempts);
		logData.put("logCode", "callback_failed_give_up");
		logData.put("description", "Callback failed and giving up.");

		Gson gson = new Gson();
		String logStr = gson.toJson(logData);

		log.info(" --analytics-- data={}", logStr);
	}
	private void schedRetryCallback(final DelayCallback msg) {
		MeetingEndedEvent event = (MeetingEndedEvent) msg.callbackEvent;

		switch (msg.numAttempts) {
			case 1:
				schedCallback(msg, 30_000 /** 30sec **/, 2);
				break;
			case 2:
				schedCallback(msg, 60_000 /** 1min **/, 3);
				break;
			case 3:
				schedCallback(msg, 120_000 /** 2min **/, 4);
				break;
			case 4:
				schedCallback(msg, 300_000 /** 5min **/, 5);
				break;
			default:
				giveupCallback(msg);
			}
	}

	public void handleMessage(ICallbackEvent message) {
		long delayInMillis = -1000 /**Send right away **/;
		int numAttempt = 1;
		DelayCallback dc = new DelayCallback(message, delayInMillis, numAttempt);
		receivedMessages.add(dc);
	}

	private boolean fetchCallbackUrl(final String callbackUrl) {
		ValidatedUrl validatedUrl = callbackRedirectValidator.validateUrl(callbackUrl);
		if (validatedUrl == null) {
			log.error("Callback URL [{}] failed security validation; blocking request.", callbackUrl);
			return false;
		}

		final String pinnedHost = validatedUrl.host();
		DnsResolver pinnedDnsResolver = host -> {
			if (host.equalsIgnoreCase(pinnedHost)) {
				return validatedUrl.resolvedAddresses();
			}
			throw new UnknownHostException("DNS resolution blocked for unpinned host: " + host);
		};

		RequestConfig requestConfig = RequestConfig.custom()
				.setRedirectsEnabled(false)
				.setConnectTimeout(CALLBACK_TIMEOUT_MS)
				.setSocketTimeout(CALLBACK_TIMEOUT_MS)
				.setConnectionRequestTimeout(CALLBACK_TIMEOUT_MS)
				.build();

		try (CloseableHttpClient httpClient = HttpClients.custom()
				.setDefaultRequestConfig(requestConfig)
				.setDnsResolver(pinnedDnsResolver)
				.build()) {

			HttpGet request = new HttpGet(validatedUrl.originalUrl());
			request.setHeader("Accept-Language", "en-US,en;q=0.8");
			request.setHeader("User-Agent", "Mozilla");

			try (CloseableHttpResponse response = httpClient.execute(request)) {
				int statusCode = response.getStatusLine().getStatusCode();
				return (statusCode >= 200 && statusCode < 300);
			}
		} catch (IOException e) {
			log.error("IOException while calling callback url [{}]", callbackUrl, e);
			return false;
		}
	}

	public void setCallbackRedirectValidator(CallbackRedirectValidatorService callbackRedirectValidator) {
		this.callbackRedirectValidator = callbackRedirectValidator;
	}
}
