package org.asteriskjava.fastagi;

import org.asteriskjava.fastagi.reply.AgiReply;

import java.util.List;
import java.util.ArrayList;
import java.io.Serializable;

/**
 * Contains the results of a speech recognition command.
 *
 * @see org.asteriskjava.fastagi.AgiChannel#speechRecognize(String, int)
 * @see org.asteriskjava.fastagi.AgiChannel#speechRecognize(String, int, int)
 * @see org.asteriskjava.fastagi.command.SpeechRecognizeCommand
 * @since 1.0.0
 */
public class SpeechRecognitionResult implements Serializable
{
    private static final long serialVersionUID = 0L;
    private final AgiReply agiReply;

    public SpeechRecognitionResult(AgiReply agiReply)
    {
        this.agiReply = agiReply;
    }

    /**
     * Checks whether a DTMF digit was recieved.
     *
     * @return <code>true</code> if a DTMF digit was received, <code>false</code> otherwise.
     * @see #getDigit()
     */
    public boolean isDtmf()
    {
        return "digit".equals(agiReply.getExtra());
    }

    /**
     * Checks whether speech was recognized.
     *
     * @return <code>true</code> if speech was recognized, <code>false</code> otherwise.
     * @see #getText()
     * @see #getScore()
     * @see #getGrammar()
     */
    public boolean isSpeech()
    {
        return "speech".equals(agiReply.getExtra());
    }

    /**
     * Checks whether a timeout was encountered and neither a DTMF digit was received nor speech was recognized.
     *
     * @return <code>true</code> a timeout was encountered, <code>false</code> otherwise.
     */
    public boolean isTimeout()
    {
        return "timeout".equals(agiReply.getExtra());
    }

    /**
     * Returns the DTMF digit that was received.
     *
     * @return the DTMF digit that was received or 0x0 if none was received.
     */
    public char getDigit()
    {
        final String digit = agiReply.getAttribute("digit");
        if (digit == null || digit.length() == 0)
        {
            return 0x0;
        }
        return digit.charAt(0);
    }

    /**
     * Returns the position where the prompt stopped playing because a DTMF digit was received or speech was
     * recognized (barge in).
     *
     * @return the position where the prompt stopped playing, 0 if it was played completely.
     */
    public int getEndpos()
    {
        return Integer.valueOf(agiReply.getAttribute("endpos"));
    }

    /**
     * Returns the confidence score for the first recognition result. This is an integer between 0 (lowest confidence)
     * and 1000 (highest confidence).
     *
     * @return the confidence score for the first recognition result or 0 if no speech was recognized.
     */
    public int getScore()
    {
        final String score0 = agiReply.getAttribute("score0");
        return score0 == null ? 0 : Integer.valueOf(score0);
    }

    /**
     * Returns the text for the first recognition result. This is the text that was recognized by the speech engine.
     *
     * @return the text for the first recognition result or <code>null</code> if no speech was recognized.
     */
    public String getText()
    {
        return agiReply.getAttribute("text0");
    }

    /**
     * Returns the grammar for the first recognition result. This is the grammar that was used by the speech engine.
     *
     * @return the grammar for the first recognition result or <code>null</code> if no speech was recognized.
     */
    public String getGrammar()
    {
        return agiReply.getAttribute("grammar0");
    }

    /**
     * Returns how many results have been recoginized. Usually there is only one result but if multiple rules in
     * the grammar match multiple results may be returned.
     *
     * @return the number of results recognized.
     */
    public int getNumberOfResults()
    {
        final String numberOfResults = agiReply.getAttribute("results");
        return numberOfResults == null ? 0 : Integer.valueOf(numberOfResults);
    }

    public List<SpeechResult> getAllResults()
    {
        final int numberOfResults = getNumberOfResults();
        final List<SpeechResult> results = new ArrayList<SpeechResult>(numberOfResults);

        for (int i = 0; i < numberOfResults; i++)
        {
            SpeechResult result = new SpeechResult(
                    Integer.valueOf(agiReply.getAttribute("score" + i)),
                    agiReply.getAttribute("text" + i),
                    agiReply.getAttribute("grammar" + i)
            );
            results.add(result);
        }

        return results;
    }

    public String toString()
    {
        final StringBuilder sb = new StringBuilder("SpeechRecognitionResult[");
        if (isDtmf())
        {
            sb.append("dtmf=true,");
            sb.append("digit=").append(getDigit()).append(",");
        }
        if (isSpeech())
        {
            sb.append("speech=true,");
            sb.append("score=").append(getScore()).append(",");
            sb.append("text='").append(getText()).append("',");
            sb.append("grammar='").append(getGrammar()).append("',");
        }
        if (isTimeout())
        {
            sb.append("timeout=true,");
        }

        if (getNumberOfResults() > 1)
        {
            sb.append("numberOfResults=").append(getNumberOfResults()).append(",");
            sb.append("allResults=").append(getAllResults()).append(",");
        }

        sb.append("endpos=").append(getEndpos()).append("]");
        return sb.toString();
    }

    /**
     * Container class for recognized speech.
     *
     * @see SpeechRecognitionResult#getAllResults()
     */
    public static class SpeechResult implements Serializable
    {
        private static final long serialVersionUID = 0L;
        private final int score;
        private final String text;
        private final String grammar;

        private SpeechResult(int score, String text, String grammar)
        {
            this.score = score;
            this.text = text;
            this.grammar = grammar;
        }

        /**
         * Returns the confidence score. This is an integer between 0 (lowest confidence)
         * and 1000 (highest confidence).
         *
         * @return the confidence score.
         */
        public int getScore()
        {
            return score;
        }

        /**
         * Returns the text. This is the text that was recognized by the speech engine.
         *
         * @return the text
         */
        public String getText()
        {
            return text;
        }

        /**
         * Returns the grammar. This is the grammar that was used by the speech engine.
         *
         * @return the grammar
         */
        public String getGrammar()
        {
            return grammar;
        }

        public String toString()
        {
            final StringBuilder sb = new StringBuilder("[");
            sb.append("score=").append(score).append(",");
            sb.append("text='").append(text).append("',");
            sb.append("grammar='").append(grammar).append("']");
            return sb.toString();
        }
    }
}
