package org.red5.app.sip.registration;

import java.util.Date;
import java.util.concurrent.Delayed;
import java.util.concurrent.TimeUnit;

import org.zoolu.sip.transaction.TransactionClient;

public class Request implements Delayed {
	   static final int REDIAL_PERIOD_IN_SECONDS = 10;
	   private long endOfDelay;
	   private boolean initialTransmission = true;
	   private final TransactionClient transaction;
	   private final Date requestTime;

	   public Request(TransactionClient transaction) {
	      this.transaction = transaction;
	      this.requestTime = new Date();
	   }

	   public long getDelay(TimeUnit timeUnit) {
	      if (initialTransmission)
	         return 0;
	      return timeUnit.convert(endOfDelay - System.currentTimeMillis(),
	                              TimeUnit.MILLISECONDS);
	   }

	   public int compareTo(Delayed delayed) {
		   Request request = (Request)delayed;
	      if (this.endOfDelay < request.endOfDelay)
	         return -1;
	      if (this.endOfDelay > request.endOfDelay)
	         return 1;
	      return this.requestTime.compareTo(request.requestTime);
	   }

	   public void setToResend() {
	      initialTransmission = false;
	      endOfDelay = System.currentTimeMillis() + REDIAL_PERIOD_IN_SECONDS
	                   * 1000L;
	   }

	   public TransactionClient getTransactionClient() {
	      return transaction;
	   }
}