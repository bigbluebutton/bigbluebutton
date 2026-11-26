package org.bigbluebutton.presentation.imp;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.bigbluebutton.api.Util;
import org.bigbluebutton.api.domain.Meeting;
import org.bigbluebutton.api.service.ServiceUtils;
import org.bigbluebutton.api2.MsgBuilder;
import org.bigbluebutton.common2.domain.PresentationPageConvertedVO;
import org.bigbluebutton.common2.msgs.BbbCommonEnvCoreMsg;
import org.bigbluebutton.presentation.InsertPagesIntent;
import org.bigbluebutton.presentation.RejectedPresentationRegistry;
import org.bigbluebutton.presentation.SupportedFileTypes;
import org.bigbluebutton.presentation.UploadedPresentation;
import org.bigbluebutton.presentation.messages.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * The uploads that carry the pages of an insert into an existing presentation (the target). It is the only
 * piece that keeps them, maps their conversion messages, and moves their files. It never publishes nor
 * dispatches: it returns to the caller the messages to publish to bbb-apps-akka, which decides the order
 * of the pages and applies the insert.
 *
 * An upload produces at most one result for bbb-apps-akka: its pages (one message per page, then a Ready)
 * or a Failed. Whoever produces it first claims the upload (an atomic change of its state); every later
 * conversion message of that upload is dropped and never reaches the standard path.
 */
public class InsertPagesDeliveryService {
    private static final Logger log = LoggerFactory.getLogger(InsertPagesDeliveryService.class);

    public static final String STAGE_TRANSFER = "transfer";
    public static final String STAGE_CONVERSION = "conversion";

    public static final String ERROR_FAILED = "failed";
    public static final String ERROR_UNSUPPORTED_FILE = "unsupportedFile";
    public static final String ERROR_UNSUPPORTED_TARGET = "unsupportedTarget";

    private String presentationDir;
    private String pageTokenSecret = "";
    private RejectedPresentationRegistry rejectedPresentationRegistry;

    private final ConcurrentMap<String, Registered> uploads = new ConcurrentHashMap<>();

    private static final class Registered {
        final UploadedPresentation pres;
        final AtomicBoolean claimed = new AtomicBoolean(false);
        int pagesCompleted = 0;

        Registered(UploadedPresentation pres) {
            this.pres = pres;
        }
    }

    /** The outcome of startFromFile: accepted, with the Progress to publish; or refused (invalid file type). */
    public static final class Start {
        public final boolean accepted;
        public final UploadedPresentation pres;
        public final BbbCommonEnvCoreMsg progress;

        private Start(boolean accepted, UploadedPresentation pres, BbbCommonEnvCoreMsg progress) {
            this.accepted = accepted;
            this.pres = pres;
            this.progress = progress;
        }
    }

    /**
     * The single point where an insert starts from a file on disk (an uploaded file, or a generated blank
     * page). Builds the upload with its intent, registers it and checks the file type. Accepted, the caller
     * publishes the Progress and dispatches the conversion; refused (invalid type, which covers an empty
     * file and a name without extension), the caller reports the invalid type, which this service maps to a
     * failure. file may be null when nothing was received.
     */
    public Start startFromFile(String podId, String meetingId, String uploadPresentationId, String filename,
                               File file, String baseUrl, String authzToken, InsertPagesIntent intent,
                               String userId) {
        UploadedPresentation pres = new UploadedPresentation(podId, meetingId, uploadPresentationId, filename,
                baseUrl, false, authzToken, false, new ArrayList<>());
        pres.setInsertIntent(intent, userId);
        if (file != null) {
            pres.setUploadedFile(file);
        }
        uploads.put(uploadPresentationId, new Registered(pres));

        String extension = FilenameUtils.getExtension(filename);
        boolean valid = file != null && file.isFile() && file.length() > 0 && !extension.isEmpty()
                && SupportedFileTypes.isPresentationMimeTypeValid(file, extension);
        if (!valid) {
            log.warn("Insert of pages refused the file of upload [{}] in meeting [{}]: invalid type", uploadPresentationId, meetingId);
            return new Start(false, pres, null);
        }
        return new Start(true, pres, progress(pres, STAGE_CONVERSION, 0));
    }

    public boolean isRegistered(String uploadPresentationId) {
        return uploadPresentationId != null && uploads.containsKey(uploadPresentationId);
    }

    /**
     * Maps a conversion message: null when it is not of a registered upload (the standard path handles it);
     * otherwise the messages to publish instead, which are none once the upload has its result.
     */
    public List<BbbCommonEnvCoreMsg> outcomeFor(IDocConversionMsg msg) {
        String uploadPresentationId = uploadIdOf(msg);
        Registered registered = uploadPresentationId == null ? null : uploads.get(uploadPresentationId);
        if (registered == null) {
            return null;
        }
        if (registered.claimed.get()) {
            return Collections.emptyList();
        }
        if (msg instanceof DocPageCompletedProgress) {
            return deliver(registered);
        }
        if (isFailure(msg)) {
            return fail(registered, msg.getClass().getSimpleName());
        }
        if (msg instanceof DocPageGeneratedProgress) {
            Integer completed = ((DocPageGeneratedProgress) msg).pagesCompleted;
            synchronized (registered) {
                if (completed != null && completed > registered.pagesCompleted) {
                    registered.pagesCompleted = completed;
                }
            }
        }
        return Collections.singletonList(progress(registered.pres, STAGE_CONVERSION, registered.pagesCompleted));
    }

    /**
     * The failure of a registered upload outside the conversion messages (an exception in the synchronous part
     * of the conversion, or in the blank page executor): the Failed to publish, none if the upload already has
     * its result, or null if it is not registered.
     */
    public List<BbbCommonEnvCoreMsg> failureFor(String uploadPresentationId, String detail) {
        Registered registered = uploadPresentationId == null ? null : uploads.get(uploadPresentationId);
        if (registered == null) {
            return null;
        }
        return fail(registered, detail);
    }

    /** Deletes, from the directory of the presentation, the files of pages delivered but not applied. */
    public void discard(String meetingId, String presentationId, List<String> pageIds) {
        File presDir = Util.getPresentationDir(presentationDir, meetingId, presentationId);
        if (presDir == null) {
            log.info("Nothing to discard: no directory for presentation [{}] in meeting [{}]", presentationId, meetingId);
            return;
        }
        for (String pageId : pageIds) {
            if (!PageArtifacts.isValidPageId(pageId)) {
                log.warn("Not discarding invalid page id [{}] of presentation [{}] in meeting [{}]", pageId, presentationId, meetingId);
                continue;
            }
            for (PageArtifacts.Type type : PageArtifacts.Type.values()) {
                FileUtils.deleteQuietly(type.file(presDir, pageId));
            }
        }
        log.info("Discarded {} page(s) of presentation [{}] in meeting [{}]", pageIds.size(), presentationId, meetingId);
    }

    /** The registrations of an ended meeting go away with it. */
    public void removeMeeting(String meetingId) {
        uploads.values().removeIf(r -> meetingId.equals(r.pres.getMeetingId()));
    }

    private List<BbbCommonEnvCoreMsg> fail(Registered registered, String detail) {
        if (!registered.claimed.compareAndSet(false, true)) {
            return Collections.emptyList();
        }
        UploadedPresentation pres = registered.pres;
        // Stops what is left of the conversion and deletes the upload directory later.
        markRejected(pres);
        log.warn("Insert of pages failed for upload [{}] in meeting [{}]: {}", pres.getId(), pres.getMeetingId(), detail);
        return Collections.singletonList(failed(pres, ERROR_FAILED, detail));
    }

    /**
     * Moves the files of the pages into the directory of the target and returns one message per page, then
     * the Ready. Fails without leaving anything in the target when the file has no page, a page has no PDF,
     * the target has no pages/ (an image presentation), or anything goes wrong after the first move. Does
     * nothing when the meeting ended.
     */
    private List<BbbCommonEnvCoreMsg> deliver(Registered registered) {
        if (!registered.claimed.compareAndSet(false, true)) {
            return Collections.emptyList();
        }
        UploadedPresentation pres = registered.pres;
        String meetingId = pres.getMeetingId();
        String targetId = pres.getInsertIntent().targetId();

        Meeting meeting = ServiceUtils.findMeetingFromMeetingID(meetingId);
        if (meeting == null || meeting.isForciblyEnded()) {
            log.info("Not delivering the pages of upload [{}]: meeting [{}] ended", pres.getId(), meetingId);
            return Collections.emptyList();
        }

        File uploadDir = pres.getUploadedFile().getParentFile();
        List<String> pageIds = pres.getPageIds();
        if (pageIds == null || pageIds.isEmpty()
                || pageIds.stream().anyMatch(id -> !PageArtifacts.Type.PDF.file(uploadDir, id).isFile())) {
            markRejected(pres);
            return Collections.singletonList(failed(pres, ERROR_UNSUPPORTED_FILE, "no page, or a page without its PDF"));
        }

        // Defense: the request already refuses a target without page PDFs.
        File targetDir = Util.getPresentationDir(presentationDir, meetingId, targetId);
        if (targetDir == null || !new File(targetDir, PageArtifacts.Type.PDF.directory).isDirectory()) {
            markRejected(pres);
            return Collections.singletonList(failed(pres, ERROR_UNSUPPORTED_TARGET, "the target has no page PDFs"));
        }

        List<File> moved = new ArrayList<>();
        try {
            for (String pageId : pageIds) {
                for (PageArtifacts.Type type : PageArtifacts.Type.values()) {
                    File source = type.file(uploadDir, pageId);
                    if (!source.isFile()) {
                        if (type == PageArtifacts.Type.PNG) continue;
                        throw new IOException("Missing " + type.directory + " file of page " + pageId);
                    }
                    File target = type.file(targetDir, pageId);
                    FileUtils.forceMkdirParent(target);
                    // No replace: an existing file is a collision and fails the delivery.
                    Files.move(source.toPath(), target.toPath());
                    moved.add(target);
                }
            }

            String presBaseUrl = pres.getBaseUrl() + "/" + meetingId + "/" + meetingId + "/" + targetId;
            String userId = pres.getRequesterUserId();
            List<BbbCommonEnvCoreMsg> messages = new ArrayList<>();
            for (int i = 0; i < pageIds.size(); i++) {
                PresentationPageConvertedVO page = MsgBuilder.generatePresentationPage(meetingId, meetingId, targetId,
                        presBaseUrl, targetDir.getAbsolutePath(), pageIds.get(i), i + 1, pageTokenSecret);
                // pres_page.content is text, which cannot hold U+0000.
                PresentationPageConvertedVO clean = page.copy(page.id(), page.num(), page.urls(),
                        page.content().replace("\u0000", ""), page.current(), page.width(), page.height(), page.pageToken());
                messages.add(MsgBuilder.buildPresentationInsertPagesPageSysMsg(meetingId, userId, pres.getPodId(),
                        pres.getId(), clean));
            }
            messages.add(MsgBuilder.buildPresentationInsertPagesReadySysMsg(meetingId, userId, pres.getPodId(), targetId,
                    pres.getId(), meeting.getMaxNumPages(), pageIds));

            markRejected(pres);
            log.info("Delivered {} page(s) of upload [{}] into presentation [{}] in meeting [{}]",
                    pageIds.size(), pres.getId(), targetId, meetingId);
            return messages;
        } catch (Exception e) {
            for (File file : moved) {
                FileUtils.deleteQuietly(file);
            }
            markRejected(pres);
            log.error("Failed to deliver the pages of upload [{}] into presentation [{}] in meeting [{}]",
                    pres.getId(), targetId, meetingId, e);
            return Collections.singletonList(failed(pres, ERROR_FAILED, "delivery failed: " + e.getMessage()));
        }
    }

    // The registry stops any conversion work left for the upload and deletes its directory afterwards.
    private void markRejected(UploadedPresentation pres) {
        if (rejectedPresentationRegistry != null) {
            rejectedPresentationRegistry.reject(pres.getMeetingId(), pres.getId());
        }
    }

    private BbbCommonEnvCoreMsg progress(UploadedPresentation pres, String stage, int pagesCompleted) {
        return MsgBuilder.buildPresentationInsertPagesProgressSysMsg(pres.getMeetingId(), pres.getRequesterUserId(),
                pres.getPodId(), pres.getId(), stage, pagesCompleted, pres.getNumberOfPages());
    }

    private BbbCommonEnvCoreMsg failed(UploadedPresentation pres, String errorKey, String detail) {
        return MsgBuilder.buildPresentationInsertPagesFailedSysMsg(pres.getMeetingId(), pres.getRequesterUserId(),
                pres.getPodId(), pres.getId(), errorKey, detail);
    }

    private static boolean isFailure(IDocConversionMsg msg) {
        return msg instanceof DocInvalidMimeType || msg instanceof UploadFileVirusMessage
                || msg instanceof UploadFileScanFailedMessage || msg instanceof OfficeToPdfConversionFailed
                || msg instanceof PdfConversionInvalid || msg instanceof DocPageCountFailed
                || msg instanceof DocPageCountExceeded || msg instanceof UploadFileTimedoutMessage
                || msg instanceof UploadFileTooLargeMessage || msg instanceof ConversionRateLimitExceeded;
    }

    /** The upload a conversion message is about: every conversion message carries it, under one of two names. */
    static String uploadIdOf(IDocConversionMsg msg) {
        if (msg instanceof DocConversionRequestReceived m) return m.presId;
        if (msg instanceof DocConversionStarted m) return m.presId;
        if (msg instanceof DocPageConversionStarted m) return m.presId;
        if (msg instanceof DocConversionProgress m) return m.presId;
        if (msg instanceof DocPageGeneratedProgress m) return m.presId;
        if (msg instanceof DocPageCompletedProgress m) return m.presId;
        if (msg instanceof DocInvalidMimeType m) return m.presId;
        if (msg instanceof DocPageCountFailed m) return m.presId;
        if (msg instanceof DocPageCountExceeded m) return m.presId;
        if (msg instanceof PdfConversionInvalid m) return m.presId;
        if (msg instanceof UploadFileTooLargeMessage m) return m.presentationId;
        if (msg instanceof UploadFileTimedoutMessage m) return m.presentationId;
        if (msg instanceof OfficeToPdfConversionFailed m) return m.presentationId;
        if (msg instanceof ConversionRateLimitExceeded m) return m.presentationId();
        if (msg instanceof UploadFileVirusMessage m) return m.presentationId();
        if (msg instanceof UploadFileScanFailedMessage m) return m.presentationId();
        return null;
    }

    public void setPresentationDir(String presentationDir) {
        this.presentationDir = presentationDir;
    }

    public void setPageTokenSecret(String pageTokenSecret) {
        this.pageTokenSecret = pageTokenSecret == null ? "" : pageTokenSecret;
    }

    public void setRejectedPresentationRegistry(RejectedPresentationRegistry rejectedPresentationRegistry) {
        this.rejectedPresentationRegistry = rejectedPresentationRegistry;
    }
}
