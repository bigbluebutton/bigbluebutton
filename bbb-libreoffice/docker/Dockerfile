FROM bigbluebutton/bbb-libreoffice:26.8.3.1-20261120-120000

COPY speaker-notes.py /usr/local/lib/bbb-soffice/speaker-notes.py
COPY convert-with-speaker-notes.sh /usr/local/bin/bbb-soffice-convert-with-speaker-notes
RUN chmod 0644 /usr/local/lib/bbb-soffice/speaker-notes.py \
 && chmod 0755 /usr/local/bin/bbb-soffice-convert-with-speaker-notes
