package org.bigbluebutton.web.services.callback;

import org.apache.http.HttpResponse;
import org.apache.http.HttpStatus;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.entity.ContentType;
import org.apache.http.impl.nio.client.CloseableHttpAsyncClient;
import org.apache.http.impl.nio.client.HttpAsyncClients;
import org.apache.http.nio.client.methods.HttpAsyncMethods;
import org.apache.http.nio.client.methods.ZeroCopyConsumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.File;
import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.concurrent.*;

public class CallbackUrlService {
	private static Logger log = LoggerFactory.getLogger(CallbackUrlService.class);

	private BlockingQueue<ICallbackEvent> receivedMessages = new LinkedBlockingQueue<ICallbackEvent>();

	private volatile boolean processMessage = false;
	private final int maxRedirects = 5;

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
							ICallbackEvent msg = receivedMessages.take();
							processMessage(msg);
						} catch (InterruptedException e) {
							log.warn("Error while taking received message from queue.");
						}
					}
				}
			};
			msgProcessorExec.execute(messageProcessor);
		} catch (Exception e) {
			log.error("Error subscribing to channels: " + e.getMessage());
		}
	}


	private void processMessage(final ICallbackEvent msg) {
		Runnable task = new Runnable() {
			public void run() {

				fetchCallbackUrl(msg.getCallbackUrl());
			}
		};

		runExec.execute(task);
	}

	public void handleMessage(ICallbackEvent message) {
		receivedMessages.add(message);
	}

	private String followRedirect(String redirectUrl, int redirectCount, String origUrl) {

		if (redirectCount > maxRedirects) {
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
		log.info("Calling callback url {}", callbackUrl);

		String finalUrl = followRedirect(callbackUrl, 0, callbackUrl);

		if (finalUrl == null) return false;

		boolean success = false;

		CloseableHttpAsyncClient httpclient = HttpAsyncClients.createDefault();
		try {
			httpclient.start();

			HttpGet request = new HttpGet(finalUrl);

			Future<HttpResponse> future = httpclient.execute(request, null);
			HttpResponse response = future.get();
			success = response.getStatusLine().getStatusCode() == 200;
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
