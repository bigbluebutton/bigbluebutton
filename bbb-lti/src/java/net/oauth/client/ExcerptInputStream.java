package net.oauth.client;

import java.io.FilterInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/** A decorator that retains a copy of the first few bytes of data. */
public class ExcerptInputStream extends FilterInputStream
{
    /**
     * A marker that's appended to the excerpt if it's less than the complete
     * stream.
     */
    public static final byte[] ELLIPSIS = " ...".getBytes();

    public ExcerptInputStream(InputStream in)
    {
        super(in);
    }

    private static final int LIMIT = 1024;

    private byte[] excerpt = new byte[LIMIT + ELLIPSIS.length];

    private int taken = 0; // bytes received from in

    private int given = Integer.MAX_VALUE; // bytes delivered to callers

    @Override
    public void close() throws IOException
    {
        super.close();
        byte[] complete = new byte[taken];
        System.arraycopy(excerpt, 0, complete, 0, taken);
        excerpt = complete;
    }

    /** The first few bytes of data, plus ELLIPSIS if there are more bytes. */
    public byte[] getExcerpt() throws IOException
    {
        if (taken < excerpt.length) {
            final int mark = Math.min(given, taken);
            given = Integer.MAX_VALUE;
            while (taken < excerpt.length) {
                read(excerpt, taken, LIMIT - taken);
            }
            given = mark;
        }
        return excerpt;
    }

    @Override
    public int read(byte[] b, int offset, int length) throws IOException
    {
        int total = 0;
        if (given < taken) {
            final int e = Math.min(length, taken - given);
            System.arraycopy(excerpt, given, b, offset, e);
            total += e;
            given += e;
            if (given < taken) {
                return total;
            }
            given = Integer.MAX_VALUE;
            offset += e;
            length -= e;
        }
        final int r = super.read(b, offset, length);
        if (r > 0) {
            total += r;
            final int e = Math.min(r, LIMIT - taken);
            if (e >= 0) {
                System.arraycopy(b, offset, excerpt, taken, e);
                taken += e;
                if (taken >= LIMIT) {
                    System.arraycopy(ELLIPSIS, 0, excerpt, LIMIT, ELLIPSIS.length);
                    taken = excerpt.length;
                }
            }
        } else if (taken < excerpt.length) {
            byte[] complete = new byte[taken];
            System.arraycopy(excerpt, 0, complete, 0, taken);
            excerpt = complete;
        }
        return (total > 0) ? total : r;
    }

    @Override
    public int read(byte[] b) throws IOException
    {
        return read(b, 0, b.length);
    }

    @Override
    public int read() throws IOException
    {
        byte[] b = new byte[1];
        return (read(b) <= 0) ? -1 : unsigned(b[0]);
    }

    /** @return an excerpt from the data copied. */
    public static byte[] copyAll(InputStream from, OutputStream into) throws IOException
    {
        final ExcerptInputStream ex = new ExcerptInputStream(from);
        ex.copyAll(into);
        return ex.getExcerpt();
    }

    /** Copy all the data from this stream to the given output stream. */
    private void copyAll(OutputStream into) throws IOException
    {
        byte[] b = new byte[1024];
        for (int n; 0 < (n = read(b));) {
            into.write(b, 0, n);
        }
    }

    private static int unsigned(byte b)
    {
        return (b >= 0) ? b : ((int) b) + 256;
    }

}
