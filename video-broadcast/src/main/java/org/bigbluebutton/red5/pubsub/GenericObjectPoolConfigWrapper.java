/**
* BigBlueButton open source conferencing system - http://www.bigbluebutton.org/
* 
* Copyright (c) 2015 BigBlueButton Inc. and by respective authors (see below).
*
* This program is free software; you can redistribute it and/or modify it under the
* terms of the GNU Lesser General Public License as published by the Free Software
* Foundation; either version 3.0 of the License, or (at your option) any later
* version.
* 
* BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
* WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
* PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License along
* with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*
*/
package org.bigbluebutton.red5.pubsub;

import org.apache.commons.pool.impl.GenericObjectPool;

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
 
    public long getSoftMinEvictableIdleTimeMillis() {
        return this.config.softMinEvictableIdleTimeMillis;
    }
 
    public void setSoftMinEvictableIdleTimeMillis(
            long softMinEvictableIdleTimeMillis) {
        this.config.softMinEvictableIdleTimeMillis =
                softMinEvictableIdleTimeMillis;
    }
 
    public boolean isLifo() {
        return this.config.lifo;
    }
 
    public void setLifo(boolean lifo) {
        this.config.lifo = lifo;
    }
}
