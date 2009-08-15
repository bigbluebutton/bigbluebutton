package org.asteriskjava.fastagi;

import org.asteriskjava.util.DaemonThreadFactory;
import org.asteriskjava.util.Log;
import org.asteriskjava.util.LogFactory;

import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.SynchronousQueue;

/**
 * Abstract base class for FastAGI and AsyncAGI servers.
 *
 * @since 1.0.0
 */
public abstract class AbstractAgiServer
{
    private final Log logger = LogFactory.getLog(getClass());

    /**
     * The default thread pool size.
     */
    private static final int DEFAULT_POOL_SIZE = 10;

    /**
     * The default thread pool size.
     */
    private static final int DEFAULT_MAXIMUM_POOL_SIZE = 100;

    /**
     * The minimum number of worker threads in the thread pool.
     */
    private int poolSize = DEFAULT_POOL_SIZE;

    /**
     * The maximum number of worker threads in the thread pool. This equals the maximum number of
     * concurrent requests this AgiServer can serve.
     */
    private int maximumPoolSize = DEFAULT_MAXIMUM_POOL_SIZE;

    /**
     * The thread pool that contains the worker threads to process incoming requests.
     */
    private ThreadPoolExecutor pool;

    /**
     * The strategy to use for mapping AgiRequests to AgiScripts that serve them.
     */
    private MappingStrategy mappingStrategy;

    private volatile boolean die = false;

    /**
     * Sets the number of worker threads in the thread pool.
     * <p/>
     * This is the number of threads that are available even if they are idle.
     * <p/>
     * The default pool size is 10.
     *
     * @param poolSize the size of the worker thread pool.
     */
    public void setPoolSize(int poolSize)
    {
        this.poolSize = poolSize;
    }

    /**
     * Sets the maximum number of worker threads in the thread pool.
     * <p/>
     * This equals the maximum number of concurrent requests this AgiServer can serve.
     * <p/>
     * The default maximum pool size is 100.
     *
     * @param maximumPoolSize the maximum size of the worker thread pool.
     */
    public void setMaximumPoolSize(int maximumPoolSize)
    {
        this.maximumPoolSize = maximumPoolSize;
    }

    /**
     * Sets the strategy to use for mapping AgiRequests to AgiScripts that serve them.
     *
     * @param mappingStrategy the mapping strategy to use.
     */
    public void setMappingStrategy(MappingStrategy mappingStrategy)
    {
        this.mappingStrategy = mappingStrategy;
    }

    protected MappingStrategy getMappingStrategy()
    {
        return mappingStrategy;
    }

    protected boolean isDie()
    {
        return die;
    }

    protected synchronized void shutdown()
    {
        this.die = true;
        if (pool != null)
        {
            pool.shutdown();
        }
    }

    @Override
    protected void finalize() throws Throwable
    {
        super.finalize();

        this.die = true;
        if (pool != null)
        {
            pool.shutdown();
        }
    }

    protected void execute(Runnable command)
    {
        if (isDie())
        {
            logger.warn("AgiServer is shutting down: Refused to execute AgiScript");
            return;
        }
        getPool().execute(command);
    }

    private synchronized ThreadPoolExecutor getPool()
    {
        if (pool == null)
        {
            pool = createPool();
            logger.info("Thread pool started.");
        }

        return pool;
    }

    /**
     * Creates a new ThreadPoolExecutor to serve the AGI requests. The nature of this pool
     * defines how many concurrent requests can be handled. The default implementation
     * returns a dynamic thread pool defined by the poolSize and maximumPoolSize properties.<p>
     * You can override this method to change this behavior. For example you can use a cached
     * pool with
     * <pre>
     * return Executors.newCachedThreadPool(new DaemonThreadFactory());
     * </pre>
     *
     * @return the ThreadPoolExecutor to use for serving AGI requests.
     * @see #setPoolSize(int)
     * @see #setMaximumPoolSize(int)
     */
    protected ThreadPoolExecutor createPool()
    {
        return new ThreadPoolExecutor(
                poolSize,
                (maximumPoolSize < poolSize) ? poolSize : maximumPoolSize,
                50000L, TimeUnit.MILLISECONDS,
                new SynchronousQueue<Runnable>(),
                new DaemonThreadFactory()
        );
    }
}
