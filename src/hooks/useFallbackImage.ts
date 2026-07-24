"use client";

import { useEffect, useState } from "react";

// Steps through `candidates` in order, advancing to the next one whenever
// the current URL fails to load (Alchemy's cached copy is occasionally
// broken even when it returns a URL for it). `resetKey` re-arms the
// cascade — pass something that identifies which image this is (e.g. a
// token id) so switching to a different piece starts over at candidate 0.
export function useFallbackImage(candidates: string[], resetKey: string) {
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Intentionally reset only on resetKey, not on `candidates` (a new
    // array reference every render would otherwise restart the cascade
    // mid-attempt).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIndex(0);
    setLoaded(false);
  }, [resetKey]);

  const hasCandidates = candidates.length > 0;
  const src = index < candidates.length ? candidates[index] : null;
  // Distinct from "never had an image to begin with" — this means we had
  // at least one candidate URL and every single one failed to load.
  const failed = hasCandidates && src === null;

  return {
    src,
    hasCandidates,
    failed,
    loaded,
    // Deferred a frame so a state update that lands before the "hidden"
    // frame has painted (possible for a cached image) can't collapse into
    // the animation library never seeing the 0 -> 1 change.
    onLoad: () => {
      requestAnimationFrame(() => setLoaded(true));
    },
    onError: () => setIndex((i) => i + 1),
  };
}
