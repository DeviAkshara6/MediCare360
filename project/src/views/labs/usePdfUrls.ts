import { useEffect, useRef, useState } from 'react';
import { getPdfBlob } from '@/lib/api';

/**
 * Pre-fetches the PDF Blob from the backend for each record id that claims an attachment,
 * creates a stable object URL for it, and verifies the blob is a valid,
 * non-empty PDF. Object URLs are revoked on cleanup/refresh so we never
 * leak them or reuse expired ones.
 *
 * Returns a map of recordId -> { url, filename, size } for records whose
 * PDF was found and validated. Records whose PDF is missing/invalid are
 * simply absent from the map, so the UI can show "No report attached".
 */
export interface ReadyPdf {
  url: string;
  filename: string;
  size: number;
}

export function usePdfUrls(recordIds: string[]): {
  ready: Record<string, ReadyPdf>;
  loading: boolean;
  refresh: () => void;
} {
  const [ready, setReady] = useState<Record<string, ReadyPdf>>({});
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);
  // Keep track of object URLs we created so we can revoke them on cleanup
  // or when the set of records changes.
  const urlsRef = useRef<Map<string, string>>(new Map());

  // Revoke all currently-held object URLs.
  const revokeAll = () => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    // Revoke any URLs from the previous run before creating new ones.
    revokeAll();

    (async () => {
      const next: Record<string, ReadyPdf> = {};
      for (const id of recordIds) {
        try {
          const pdf = await getPdfBlob(id);
          if (!pdf) continue;
          const url = URL.createObjectURL(pdf.blob);
          urlsRef.current.set(id, url);
          next[id] = { url, filename: pdf.filename, size: pdf.blob.size };
        } catch (err) {
          console.error('Failed to load PDF for record', id, err);
        }
      }
      if (!cancelled) {
        setReady(next);
        setLoading(false);
      } else {
        // If we were cancelled, clean up the URLs we just made.
        revokeAll();
      }
    })();

    return () => {
      cancelled = true;
      revokeAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordIds.join(','), nonce]);

  const refresh = () => setNonce((n) => n + 1);

  return { ready, loading, refresh };
}
