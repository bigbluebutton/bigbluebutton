import React, { Profiler, ProfilerOnRenderCallback } from 'react';
import { isTelemetryActive } from './config';
import { recordTelemetry, toEpochMs } from './recorder';

const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration, baseDuration, startTime) => {
  recordTelemetry({
    kind: 'render',
    id,
    phase,
    duration: actualDuration,
    baseDuration,
    ts: toEpochMs(startTime),
  });
};

interface ProfiledSubtreeProps {
  id: string;
  children: React.ReactNode;
}

// Measures the commit time of a subtree. With telemetry off it renders its children untouched.
// The decision is fixed before the app mounts, so the tree shape never changes at runtime.
// Production builds only call onRender when react-dom is aliased to react-dom/profiling.
const ProfiledSubtree: React.FC<ProfiledSubtreeProps> = ({ id, children }): React.ReactNode => {
  if (!isTelemetryActive()) return children;
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};

export default ProfiledSubtree;
