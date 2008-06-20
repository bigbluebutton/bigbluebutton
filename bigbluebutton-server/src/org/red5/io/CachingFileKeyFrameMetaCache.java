package org.red5.io;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.red5.io.flv.IKeyFrameDataAnalyzer.KeyFrameMeta;

// TODO: Auto-generated Javadoc
/**
 * The Class CachingFileKeyFrameMetaCache.
 */
public class CachingFileKeyFrameMetaCache extends FileKeyFrameMetaCache {
	
	/** The in memory meta cache. */
	private Map<String, KeyFrameMeta> inMemoryMetaCache = new HashMap<String, KeyFrameMeta>();
	
	/** The rw lock. */
	private ReadWriteLock rwLock = new ReentrantReadWriteLock();
	
	/** The max cache entry. */
	private int maxCacheEntry = 500;
	
	/** The random. */
	private Random random = new Random();

	/**
	 * Sets the max cache entry.
	 * 
	 * @param maxCacheEntry the new max cache entry
	 */
	public void setMaxCacheEntry(int maxCacheEntry) {
		this.maxCacheEntry = maxCacheEntry;
	}

	/* (non-Javadoc)
	 * @see org.red5.io.FileKeyFrameMetaCache#loadKeyFrameMeta(java.io.File)
	 */
	@Override
	public KeyFrameMeta loadKeyFrameMeta(File file) {
		rwLock.readLock().lock();
		try {
			String canonicalPath = file.getCanonicalPath();
			if (!inMemoryMetaCache.containsKey(canonicalPath)) {
				rwLock.readLock().unlock();
				rwLock.writeLock().lock();
				try {
					if (inMemoryMetaCache.size() >= maxCacheEntry) {
						freeCachingMetadata();
					}
					KeyFrameMeta keyFrameMeta = super.loadKeyFrameMeta(file);
					if (keyFrameMeta != null) {
						inMemoryMetaCache.put(canonicalPath, keyFrameMeta);
					} else {
						return null;
    				}
    			} finally {
    				rwLock.writeLock().unlock();
    				rwLock.readLock().lock();
    			}
			}
			return inMemoryMetaCache.get(canonicalPath);
		} catch (IOException e) {
			return null;
		} finally {
			rwLock.readLock().unlock();
		}
	}

	/* (non-Javadoc)
	 * @see org.red5.io.FileKeyFrameMetaCache#saveKeyFrameMeta(java.io.File, org.red5.io.flv.IKeyFrameDataAnalyzer.KeyFrameMeta)
	 */
	@Override
	public void saveKeyFrameMeta(File file, KeyFrameMeta meta) {
		rwLock.writeLock().lock();
		try {
   			String canonicalPath = file.getCanonicalPath();
   			if (inMemoryMetaCache.containsKey(canonicalPath)) {
   				inMemoryMetaCache.remove(canonicalPath);
   			}
		} catch (IOException e) {
			// ignore the exception here, let super class to handle it.
		} finally {
			rwLock.writeLock().unlock();
		}
		super.saveKeyFrameMeta(file, meta);
	}

	/**
	 * Free caching metadata.
	 */
	private void freeCachingMetadata() {
		int cacheSize = inMemoryMetaCache.size();
		int randomIndex = random.nextInt(cacheSize);
		Map.Entry<String, KeyFrameMeta> entryToRemove = null;
		for (Map.Entry<String, KeyFrameMeta> cacheEntry : inMemoryMetaCache.entrySet()) {
			if (randomIndex == 0) {
				entryToRemove = cacheEntry;
				break;
			}
			randomIndex--;
		}
		inMemoryMetaCache.remove(entryToRemove.getKey());
	}
}
