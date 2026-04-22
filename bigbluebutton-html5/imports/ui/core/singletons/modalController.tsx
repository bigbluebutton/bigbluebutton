import React, { useCallback, useEffect, useRef } from 'react';
import { makeVar, useReactiveVar } from '@apollo/client';

export type ModalPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'normal'
  | 'low'
  | (string);

export const PRIORITY_WEIGHTS: Record<string, number> = {
  critical: 100,
  high: 75,
  medium: 60,
  normal: 50,
  low: 25,
};

export const DEFAULT_CONCURRENCY = 1;

type ModalRegistration = {
  id: string;
  uniqueId: string;
  priority: ModalPriority;
  desiredOpen: boolean;
  requestedAt: number;
  requestedSeq: number;
  actualOpen: boolean;
  position: number | null;
  queuedPosition: number | null;
  firstRegisterAt: number;
};

type ModalState = {
  byKey: Record<string, ModalRegistration>;
  openOrder: string[];
  concurrency: number;
};

const initialState: ModalState = {
  byKey: {},
  openOrder: [],
  concurrency: DEFAULT_CONCURRENCY,
};

const modalStateVar = makeVar<ModalState>(initialState);

function updateState(updater: (prev: ModalState) => ModalState): ModalState {
  const prev = modalStateVar();
  const next = updater(prev);
  modalStateVar(next);
  return next;
}

class ModalController {
  private requestSeq = 0;

  static buildUniqueId(id: string, firstRegisterAt: number, seq: number): string {
    return `${id}::${firstRegisterAt}::${seq}`;
  }

  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private weights: Record<string, number>) {}

  register(id: string, priority: ModalPriority = 'normal'): string {
    let createdUniqueId = '';
    updateState((prev) => {
      const now = Date.now();
      const seq = this.requestSeq + 1;
      const uniqueId = ModalController.buildUniqueId(id, now, seq);
      const reg: ModalRegistration = {
        id,
        uniqueId,
        priority,
        desiredOpen: false,
        requestedAt: 0,
        requestedSeq: 0,
        actualOpen: false,
        position: null,
        queuedPosition: null,
        firstRegisterAt: now,
      };
      createdUniqueId = uniqueId;
      return this.compute(prev, { byKey: { ...prev.byKey, [uniqueId]: reg } });
    });
    return createdUniqueId;
  }

  unregister(uniqueId: string): void {
    updateState((prev) => {
      if (!prev.byKey[uniqueId]) return prev;
      const rest = { ...prev.byKey };
      delete rest[uniqueId];
      return this.compute({ ...prev, byKey: rest });
    });
  }

  setDesiredOpen(uniqueId: string, desired: boolean): void {
    updateState((prev) => {
      const m = prev.byKey[uniqueId];
      if (!m) return prev;

      const isFirstOpenAsk = desired && !m.desiredOpen;
      const nextM: ModalRegistration = {
        ...m,
        desiredOpen: desired,
        requestedAt: isFirstOpenAsk ? Date.now() : m.requestedAt,
        requestedSeq: isFirstOpenAsk ? this.requestSeq + 1 : m.requestedSeq,
      };

      return this.compute(prev, { byKey: { ...prev.byKey, [uniqueId]: nextM } });
    });
  }

  setPriority(uniqueId: string, priority: ModalPriority): void {
    updateState((prev) => {
      const m = prev.byKey[uniqueId];
      if (!m) return prev;
      const nextM: ModalRegistration = { ...m, priority };
      return this.compute(prev, { byKey: { ...prev.byKey, [uniqueId]: nextM } });
    });
  }

  setConcurrency(n: number): void {
    updateState((prev) => this.compute(prev, { concurrency: Math.max(1, Math.floor(n)) }));
  }

  // eslint-disable-next-line class-methods-use-this
  get state(): ModalState {
    return modalStateVar();
  }

  private weightOf(p: ModalPriority): number {
    return this.weights[p] ?? 0;
  }

  private compute(prev: ModalState, overrides?: Partial<ModalState>): ModalState {
    const next: ModalState = {
      ...prev,
      ...(overrides || {}),
      byKey: { ...prev.byKey, ...(overrides?.byKey || {}) },
    };

    const all = Object.values(next.byKey);
    const candidates = all.filter((m) => m.desiredOpen);

    candidates.sort((a, b) => {
      const wa = this.weightOf(a.priority);
      const wb = this.weightOf(b.priority);
      if (wb !== wa) return wb - wa;
      if (a.requestedAt !== b.requestedAt) return a.requestedAt - b.requestedAt;
      return a.requestedSeq - b.requestedSeq;
    });

    const concurrency = Math.max(1, Math.floor(next.concurrency));
    const open = candidates.slice(0, concurrency);
    const openKeys = open.map((m) => m.uniqueId);

    const candidateIndex: Record<string, number> = {};
    candidates.forEach((m, idx) => {
      candidateIndex[m.uniqueId] = idx;
    });

    const newByKey: Record<string, ModalRegistration> = {};
    all.forEach((m) => {
      const isOpen = openKeys.includes(m.uniqueId);
      const stackIndex = isOpen ? openKeys.indexOf(m.uniqueId) : null;
      const qPos = m.desiredOpen ? (candidateIndex[m.uniqueId] ?? null) : null;

      newByKey[m.uniqueId] = {
        ...m,
        actualOpen: isOpen,
        position: m.desiredOpen ? ((isOpen && (stackIndex as number)) || (qPos as number)) : null,
        queuedPosition: qPos,
      };
    });

    return { ...next, byKey: newByKey, openOrder: openKeys };
  }
}

// Singleton instance using static weights
export const controller = new ModalController(PRIORITY_WEIGHTS);

/**
 * useModalRegistration
 *
 * Hook to connect a React component (modal) with the ModalController.
 * Each hook call creates its own modal instance (even if `id` matches another instance).
 */
export function useModalRegistration({
  id,
  priority = 'normal',
}: {
  id: string;
  priority?: ModalPriority;
}): {
  isOpen: boolean;
  position: number | null;
  queuedPosition: number | null;
  id: string;
  uniqueId: string | null;
  open: () => void;
  close: () => void;
  setPriority: (p: ModalPriority) => void;
} {
  const uniqueRef = useRef<string | null>(null);

  useEffect(() => {
    const uniqueId = controller.register(id, priority);
    uniqueRef.current = uniqueId;
    return () => {
      if (uniqueRef.current) controller.unregister(uniqueRef.current);
      uniqueRef.current = null;
    };
  }, [id, priority]);

  const slice = useReactiveVar(modalStateVar);
  const uniqueId = uniqueRef.current;
  const my = uniqueId ? slice.byKey[uniqueId] : undefined;

  const open = useCallback(() => {
    if (uniqueRef.current) controller.setDesiredOpen(uniqueRef.current, true);
  }, []);

  const close = useCallback(() => {
    if (uniqueRef.current) controller.setDesiredOpen(uniqueRef.current, false);
  }, []);

  const setMyPriority = useCallback((p: ModalPriority) => {
    if (uniqueRef.current) controller.setPriority(uniqueRef.current, p);
  }, []);

  return {
    isOpen: Boolean(my?.actualOpen),
    position: my?.position ?? null,
    queuedPosition: my?.queuedPosition ?? null,
    id: my?.id ?? id,
    uniqueId: my?.uniqueId ?? null,
    open,
    close,
    setPriority: setMyPriority,
  } as const;
}

/**
 * ModalRegistration (render-prop component)
 * Allows usage in class components or JSX without hooks.
 */
type ModalRegistrationProps = {
  id: string;
  priority?: ModalPriority;
  children: (controls: ReturnType<typeof useModalRegistration>) => React.ReactNode;
};

export const ModalRegistration: React.FC<ModalRegistrationProps> = ({ id, priority, children }) => {
  const controls = useModalRegistration({ id, priority });
  return (
    <>
      {children(controls)}
    </>
  );
};

/**
 * withModalRegistration (HOC)
 * Wraps a component and injects modal controls as props.
 */
export function withModalRegistration<P extends object>(
  Wrapped: React.ComponentType<P & ReturnType<typeof useModalRegistration>>,
  id: string,
  priority: ModalPriority = 'normal',
) {
  return function ModalizedComponent(props: P) {
    const controls = useModalRegistration({ id, priority });
    return (
      // eslint-disable-next-line react/jsx-props-no-spreading
      <Wrapped {...{
        ...props,
        ...controls,
      }}
      />
    );
  };
}
