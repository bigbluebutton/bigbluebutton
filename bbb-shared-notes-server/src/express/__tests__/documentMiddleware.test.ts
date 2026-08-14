import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractMeetingId } from '../../hocuspocus/utils.js';

type MockRequest = {
  get: (header: string) => string | undefined;
  originalUrl: string;
  params: Record<string, string>;
};
type MockResponse = {
  sendStatus: ReturnType<typeof vi.fn>;
};

// Mirrors the middleware in src/express/index.ts
function runMiddleware(req: MockRequest, res: MockResponse, next: () => void) {
  const meetingIdHeader = req.get('meeting-id');
  if (!meetingIdHeader) {
    res.sendStatus(403);
    return;
  }
  const { documentName } = req.params;
  const meetingIdFromUrl = extractMeetingId(documentName);
  if (meetingIdHeader !== meetingIdFromUrl) {
    res.sendStatus(403);
    return;
  }
  next();
}

describe('document cross-meeting isolation middleware', () => {
  let next: ReturnType<typeof vi.fn>;
  let res: MockResponse;

  beforeEach(() => {
    next = vi.fn();
    res = { sendStatus: vi.fn().mockReturnThis() };
  });

  it('calls next() when Meeting-Id matches document meeting', () => {
    const req: MockRequest = {
      get: (h) => h === 'meeting-id' ? 'abc123' : undefined,
      originalUrl: '/api/documents/bn-document__abc123',
      params: { documentName: 'bn-document__abc123' },
    };
    runMiddleware(req, res, next);
    expect(next).toHaveBeenCalledOnce();
    expect(res.sendStatus).not.toHaveBeenCalled();
  });

  it('returns 403 when Meeting-Id does not match document meeting', () => {
    const req: MockRequest = {
      get: (h) => h === 'meeting-id' ? 'meeting-A' : undefined,
      originalUrl: '/api/documents/bn-document__meeting-B',
      params: { documentName: 'bn-document__meeting-B' },
    };
    runMiddleware(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 403 when Meeting-Id header is absent', () => {
    const req: MockRequest = {
      get: (_h) => undefined,
      originalUrl: '/api/documents/bn-document__abc123',
      params: { documentName: 'bn-document__abc123' },
    };
    runMiddleware(req, res, next);
    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });
});
