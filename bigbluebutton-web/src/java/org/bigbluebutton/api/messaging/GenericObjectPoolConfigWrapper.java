package org.bigbluebutton.api.messaging;

import org.apache.commons.pool.impl.GenericObjectPool;;

public class GenericObjectPoolConfigWrapper {
	
	private final GenericObjectPool.Config config;
 
    public GenericObjectPoolConfigWrapper() {
        this.config = new GenericObjectPool.Config();
    }
 
    public GenericObjectPool.Config getConfig() {
        return config;
    }
 
    public int getMaxIdle() {
        return this.config.maxIdle;
    }
 
    public void setMaxIdle(int maxIdle) {
        this.config.maxIdle = maxIdle;
    }
 
    public int getMinIdle() {
        return this.config.minIdle;
    }
 
    public void setMinIdle(int minIdle) {
        this.config.minIdle = minIdle;
    }
 
    public int getMaxActive() {
        return this.config.maxActive;
    }
 
    public void setMaxActive(int maxActive) {
        this.config.maxActive = maxActive;
    }
 
    public long getMaxWait() {
        return this.config.maxWait;
    }
 
    public void setMaxWait(long maxWait) {
        this.config.maxWait = maxWait;
    }
 
    public byte getWhenExhaustedAction() {
        return this.config.whenExhaustedAction;
    }
 
    public void setWhenExhaustedAction(byte whenExhaustedAction) {
        this.config.whenExhaustedAction = whenExhaustedAction;
    }
 
    public boolean isTestOnBorrow() {
        return this.config.testOnBorrow;
    }
 
    public void setTestOnBorrow(boolean testOnBorrow) {
        this.config.testOnBorrow = testOnBorrow;
    }
 
    public boolean isTestOnReturn() {
        return this.config.testOnReturn;
    }
 
    public void setTestOnReturn(boolean testOnReturn) {
        this.config.testOnReturn = testOnReturn;
    }
 
    public boolean isTestWhileIdle() {
        return this.config.testWhileIdle;
    }
 
    public void setTestWhileIdle(boolean testWhileIdle) {
        this.config.testWhileIdle = testWhileIdle;
    }
 
    public long getTimeBetweenEvictionRunsMillis() {
        return this.config.timeBetweenEvictionRunsMillis;
    }
 
    public void setTimeBetweenEvictionRunsMillis(
            long timeBetweenEvictionRunsMillis) {
        this.config.timeBetweenEvictionRunsMillis =
                timeBetweenEvictionRunsMillis;
    }
 
    public int getNumTestsPerEvictionRun() {
        return this.config.numTestsPerEvictionRun;
    }
 
    public void setNumTestsPerEvictionRun(int numTestsPerEvictionRun) {
        this.config.numTestsPerEvictionRun = numTestsPerEvictionRun;
    }
 
    public long getMinEvictableIdleTimeMillis() {
        return this.config.minEvictableIdleTimeMillis;
    }
 
    public void setMinEvictableIdleTimeMillis(long minEvictableIdleTimeMillis) {
        this.config.minEvictableIdleTimeMillis = minEvictableIdleTimeMillis;
    }

}

