package org.bigbluebutton.web.services.callback;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.*;

import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.google.gson.Gson;

public class CallbackUrlService {
	private static Logger log = LoggerFactory.getLogger(CallbackUrlService.class);

	private BlockingQueue<DelayCallback> receivedMessages = new DelayQueue<DelayCallback>();

	private volatile boolean processMessage = false;
	private static final int MAX_REDIRECTS = 5;

	private final Executor msgProcessorExec = Executors.newSingleThreadExecutor();
	private final Executor runExec = Executors.newSingleThreadExecutor();

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

	private String followRedirect(String redirectUrl, int redirectCount, String origUrl) {

		if (redirectCount > MAX_REDIRECTS) {
			log.error("Max redirect reached for callback url=[{}]", origUrl);
			return null;
		}

		URL presUrl;
		try {
			presUrl = new URL(redirectUrl);
		} catch (MalformedURLException e) {
			log.error("Malformed callback url=[{}]", redirectUrl);
			return null;
		}

		HttpURLConnection conn;
		try {
			conn = (HttpURLConnection) presUrl.openConnection();
			conn.setReadTimeout(5000);
			conn.addRequestProperty("Accept-Language", "en-US,en;q=0.8");
			conn.addRequestProperty("User-Agent", "Mozilla");

			// normally, 3xx is redirect
			int status = conn.getResponseCode();
			if (status != HttpURLConnection.HTTP_OK) {
				if (status == HttpURLConnection.HTTP_MOVED_TEMP
								|| status == HttpURLConnection.HTTP_MOVED_PERM
								|| status == HttpURLConnection.HTTP_SEE_OTHER) {
					String newUrl = conn.getHeaderField("Location");
					return followRedirect(newUrl, redirectCount + 1, origUrl);
				} else {
					log.error("Invalid HTTP response=[{}] for callback url=[{}]", status, redirectUrl);
					return null;
				}
			} else {
				return redirectUrl;
			}
		} catch (IOException e) {
			log.error("IOException for callback url=[{}]", redirectUrl);
			return null;
		}
	}

	private boolean fetchCallbackUrl(final String callbackUrl) {
		// Do not handle redirects as we must expect that the passed
		// in callback url on meeting create must be working.
		//String finalUrl = followRedirect(callbackUrl, 0, callbackUrl);
		//log.info("Calling callback url {}", finalUrl);
		//if (finalUrl == null) return false;

		boolean success = false;

		CloseableHttpAsyncClient httpclient = HttpAsyncClients.createDefault();
		try {
			httpclient.start();

			HttpGet request = new HttpGet(callbackUrl);

			Future<HttpResponse> future = httpclient.execute(request, null);
			HttpResponse response = future.get();
			// Consider 2xx response code as success.
			success = (response.getStatusLine().getStatusCode() >= 200 && response.getStatusLine().getStatusCode() < 300);
		} catch (java.lang.InterruptedException ex) {
			log.error("Interrupted exception while calling url {}", callbackUrl);
		} catch (java.util.concurrent.ExecutionException ex) {
			log.error("ExecutionException exception while calling url {}", callbackUrl);
		} finally {
			try {
				httpclient.close();
			} catch (java.io.IOException ex) {
				log.error("IOException exception while closing http client for url {}", callbackUrl);
			}
		}

		return success;
	}
}
