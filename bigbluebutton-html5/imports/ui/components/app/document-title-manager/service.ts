export const DOCUMENT_TITLE_VIEW_CHANGED = 'bbb-document-title-view-changed';

type DocumentTitleView = {
  title: string;
  sequence: number;
};

const registeredTitleViews = new Map<string, DocumentTitleView>();
let sequence = 0;

const notifyDocumentTitleViewChanged = () => {
  window.dispatchEvent(new CustomEvent(DOCUMENT_TITLE_VIEW_CHANGED, {
    detail: {
      activeTitle: getActiveDocumentTitleView(),
    },
  }));
};

export const getActiveDocumentTitleView = (): string | null => {
  const views = Array.from(registeredTitleViews.values());
  if (views.length === 0) return null;

  views.sort((a, b) => b.sequence - a.sequence);
  return views[0].title;
};

export const registerDocumentTitleView = (id: string, title: string) => {
  if (!id || !title) return;

  const existingView = registeredTitleViews.get(id);
  registeredTitleViews.set(id, {
    title,
    sequence: existingView?.sequence || sequence + 1,
  });

  if (!existingView) sequence += 1;
  notifyDocumentTitleViewChanged();
};

export const unregisterDocumentTitleView = (id: string) => {
  if (!registeredTitleViews.delete(id)) return;
  notifyDocumentTitleViewChanged();
};

let idSequence = 0;

export const createDocumentTitleViewId = (prefix: string) => {
  idSequence += 1;
  return `${prefix}-${idSequence}`;
};
