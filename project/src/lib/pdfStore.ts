/**
 * IndexedDB-backed storage for lab report PDF files.
 * Record details live in localStorage; the PDF blobs live here,
 * keyed by the same record id so they stay linked.
 */

const DB_NAME = 'medicare360';
const DB_VERSION = 1;
const STORE = 'labReports';
const PDF_MIME = 'application/pdf';

export interface StoredReport {
  id: string; // matches the LabRecord id
  filename: string;
  fileType: string;
  size: number;
  blob: Blob;
  uploadedAt: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => {
      const db = req.result;
      // If the store is somehow missing, fail loudly instead of crashing
      // every later request with a cryptic error.
      if (!db.objectStoreNames.contains(STORE)) {
        db.close();
        dbPromise = null;
        reject(new Error('Lab report storage is not initialized correctly.'));
        return;
      }
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(db: IDBDatabase, mode: IDBTransactionMode): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function saveReport(report: StoredReport): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, 'readwrite').put(report);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getReport(id: string): Promise<StoredReport | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').get(id);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteReport(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const req = tx(db, 'readwrite').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function hasReport(id: string): Promise<boolean> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = tx(db, 'readonly').count(id);
    req.onsuccess = () => resolve(req.result > 0);
    req.onerror = () => reject(req.error);
  });
}

export interface ValidatedPdf {
  blob: Blob; // always typed as application/pdf
  filename: string;
  size: number;
}

/**
 * Retrieves a stored report and validates it:
 *  - blob must exist and have non-zero size
 *  - blob is (re)wrapped with the application/pdf MIME type so the browser
 *    renders it inline instead of showing a blank page or forcing a download
 *    when the original File had an empty/wrong type.
 * Returns null if the report is missing or invalid (and cleans up bad entries).
 */
export async function getValidatedPdf(id: string): Promise<ValidatedPdf | null> {
  let report: StoredReport | null;
  try {
    report = await getReport(id);
  } catch (err) {
    console.error('Failed to read PDF from IndexedDB:', err);
    throw new Error('Could not read the PDF from storage.');
  }
  if (!report) return null;

  const rawBlob = report.blob;
  if (!rawBlob || rawBlob.size === 0) {
    // Corrupt/empty entry — remove it so the UI reflects reality.
    await deleteReport(id).catch(() => {});
    console.warn('Removed empty/corrupt PDF entry for record', id);
    return null;
  }

  const currentType = (rawBlob.type || report.fileType || '').toLowerCase();
  const blob =
    currentType === PDF_MIME ? rawBlob : new Blob([rawBlob], { type: PDF_MIME });

  return {
    blob,
    filename: report.filename || `lab-report-${id}.pdf`,
    size: rawBlob.size,
  };
}
