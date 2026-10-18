import { useMemo, useState } from 'react';
import {
  FlaskConical,
  Plus,
  Pencil,
  Trash2,
  Search,
  Eye,
  Building2,
  FileText,
  Calendar,
  UploadCloud,
  Download,
  ExternalLink,
  Paperclip,
  Loader2,
} from 'lucide-react';
import type { LabRecord } from '@/types';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import ErrorBanner from '@/components/ErrorBanner';
import { useToast } from '@/components/Toast';
import LabForm from './LabForm';
import { usePdfUrls } from './usePdfUrls';
import { api, getPdfBlob } from '@/lib/api';
import { formatDate, relativeDay } from '@/lib/dates';

interface LabsViewProps {
  labRecords: LabRecord[];
  onAdd: (record: LabRecord) => void;
  onUpdate: (record: LabRecord) => void;
  onDelete: (id: string) => void;
  openAddOnMount?: boolean;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LabsView({
  labRecords,
  onAdd,
  onUpdate,
  onDelete,
  openAddOnMount,
}: LabsViewProps) {
  const { notify } = useToast();
  const [modalOpen, setModalOpen] = useState(openAddOnMount ?? false);
  const [editing, setEditing] = useState<LabRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [pdfError, setPdfError] = useState('');

  // IDs that claim an attached PDF — drives pre-fetching of blob URLs.
  const pdfCandidateIds = useMemo(
    () => labRecords.filter((r) => r.pdfFilename).map((r) => r.id),
    [labRecords],
  );
  const { ready, loading: pdfsLoading, refresh: refreshPdfs } = usePdfUrls(pdfCandidateIds);

  const filtered = useMemo(() => {
    let list = [...labRecords];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.testName.toLowerCase().includes(q) ||
          r.labName.toLowerCase().includes(q) ||
          r.notes.toLowerCase().includes(q) ||
          (r.resultsSummary ?? '').toLowerCase().includes(q) ||
          (r.pdfFilename ?? '').toLowerCase().includes(q),
      );
    }
    return list.sort((a, b) => b.testDate.localeCompare(a.testDate));
  }, [labRecords, query]);

  // A record "has" a viewable PDF only when the backend returned a valid blob.
  const hasPdf = (r: LabRecord): boolean => !!ready[r.id];

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (r: LabRecord) => {
    setEditing(r);
    setModalOpen(true);
  };

  const handleSubmit = async (
    record: LabRecord,
    pdf: File | null,
    removePdf: boolean,
  ) => {
    try {
      const saved = editing ? await api.updateLab(record) : await api.createLab(record);
      const savedWithPdf = pdf ? await api.uploadLabPdf(saved.id, pdf) : saved;
      if (removePdf && !pdf) await api.deleteLabPdf(saved.id);
      setPdfError('');
      if (editing) notify('Lab record updated successfully.');
      else notify('Lab record added.');
      if (editing) onUpdate(savedWithPdf);
      else onAdd(savedWithPdf);
      setModalOpen(false);
      setEditing(null);
      // Re-fetch blob URLs so the newly attached (or removed) PDF is reflected.
      refreshPdfs();
    } catch (err) {
      console.error('Failed to save lab record with PDF:', err);
      setPdfError('Could not save the PDF attachment. Please try again.');
      notify('Failed to save the PDF attachment.', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteLab(deleteId);
    } catch (err) {
      console.error('Failed to delete lab record:', err);
      notify('Failed to delete the lab record.', 'error');
      return;
    }
    onDelete(deleteId);
    notify('Lab record deleted.', 'info');
    setDeleteId(null);
    refreshPdfs();
  };

  /**
   * View PDF — SYNCHRONOUS window.open using a pre-created object URL.
   * This is the core fix: the URL already exists when the user clicks, so the
   * browser treats the popup as user-initiated and navigates straight to the
   * PDF. No blank tab, no async-after-gesture, no revoked/expired URL.
   */
  const handleView = (id: string) => {
    const pdf = ready[id];
    if (!pdf) {
      if (pdfsLoading) {
        notify('Preparing the PDF for viewing — please try again in a moment.', 'info');
      } else {
        notify('No PDF report is attached to this record, or the file is missing.', 'error');
      }
      return;
    }
    const win = window.open(pdf.url, '_blank');
    if (!win) {
      notify(
        'Pop-up was blocked by your browser. Please allow pop-ups, or use the Download button instead.',
        'error',
      );
      return;
    }
    // Fallback: if the browser can't render the PDF inline, the new tab will
    // show nothing. Give the user a clear path to download as an alternative.
    win.addEventListener('error', () => {
      notify('The PDF could not be displayed in the new tab. Use Download instead.', 'error');
    });
  };

  /**
   * Download PDF — fetches the validated blob and triggers a download with
   * the original filename. The temporary object URL is revoked only after
   * the download has had time to start.
   */
  const handleDownload = async (id: string) => {
    try {
      const pdf = await getPdfBlob(id);
      if (!pdf) {
        notify('No PDF report is attached to this record, or the file is missing.', 'error');
        refreshPdfs();
        return;
      }
      const url = URL.createObjectURL(pdf.blob);
      const a = document.createElement('a');
      a.href = url;
      a.rel = 'noopener';
      a.download = pdf.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
    } catch (err) {
      console.error('Download failed:', err);
      const msg = err instanceof Error ? err.message : 'Could not download the PDF.';
      notify(msg, 'error');
      refreshPdfs();
    }
  };

  const deleteTarget = labRecords.find((r) => r.id === deleteId) ?? null;
  const viewTarget = labRecords.find((r) => r.id === viewId) ?? null;

  const pdfCount = Object.keys(ready).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratory Records"
        subtitle="Keep all your test reports and PDFs in one searchable place."
        icon={<FlaskConical size={22} />}
        action={
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} /> Add Lab Record
          </button>
        }
      />

      {/* Summary + search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Total records</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{labRecords.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">With results saved</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {labRecords.filter((r) => r.resultsSummary).length}
          </p>
        </div>
        <div className="card p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            PDFs attached
            {pdfsLoading && <Loader2 size={14} className="animate-spin text-slate-400" />}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{pdfCount}</p>
        </div>
      </div>

      {/* Upload banner / error */}
      {pdfError && (
        <ErrorBanner message={pdfError} onDismiss={() => setPdfError('')} />
      )}

      <div className="card flex items-center justify-between gap-3 p-4">
        <div className="relative w-full sm:max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="input-base pl-9"
            placeholder="Search by test, lab, notes, or filename..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="hidden text-sm text-slate-500 sm:block">
          {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
        </p>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FlaskConical size={28} />}
            title={labRecords.length === 0 ? 'No lab records yet' : 'No matches found'}
            description={
              labRecords.length === 0
                ? 'Add your first lab test report — with an optional PDF — to build your medical history.'
                : 'Try a different search term.'
            }
            action={
              labRecords.length === 0 ? (
                <button onClick={openAdd} className="btn-primary">
                  <Plus size={16} /> Add Lab Record
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-3">Test</th>
                  <th className="px-5 py-3">Laboratory</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Results</th>
                  <th className="px-5 py-3">Report</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <LabRow
                    key={r.id}
                    record={r}
                    hasPdf={hasPdf(r)}
                    onView={() => setViewId(r.id)}
                    onEdit={() => openEdit(r)}
                    onDelete={() => setDeleteId(r.id)}
                    onViewPdf={() => handleView(r.id)}
                    onDownloadPdf={() => handleDownload(r.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        title={editing ? 'Edit lab record' : 'Add lab record'}
        description={
          editing ? 'Update the details for this lab record.' : 'Save a new laboratory test report.'
        }
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
          setPdfError('');
        }}
        size="md"
      >
        <LabForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
            setPdfError('');
          }}
        />
      </Modal>

      {/* Report details viewer */}
      <Modal
        open={viewId !== null}
        title={viewTarget?.testName ?? 'Report details'}
        description={viewTarget ? `${viewTarget.labName} · ${formatDate(viewTarget.testDate)}` : ''}
        onClose={() => setViewId(null)}
        size="lg"
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            {viewTarget && hasPdf(viewTarget) ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleView(viewTarget.id)}
                  className="btn-secondary"
                  title="Open PDF in new tab"
                >
                  <ExternalLink size={15} /> View PDF
                </button>
                <button
                  onClick={() => handleDownload(viewTarget.id)}
                  className="btn-secondary"
                  title="Download PDF"
                >
                  <Download size={15} /> Download
                </button>
              </div>
            ) : (
              <span />
            )}
            <button onClick={() => setViewId(null)} className="btn-secondary">
              Close
            </button>
          </div>
        }
      >
        {viewTarget && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <DetailTile icon={<FlaskConical size={16} />} label="Test" value={viewTarget.testName} />
              <DetailTile icon={<Building2 size={16} />} label="Laboratory" value={viewTarget.labName} />
              <DetailTile
                icon={<Calendar size={16} />}
                label="Test date"
                value={`${formatDate(viewTarget.testDate)} (${relativeDay(viewTarget.testDate)})`}
              />
            </div>

            {/* PDF attachment block */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Paperclip size={15} /> Report PDF
              </h3>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                {hasPdf(viewTarget) ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <FileText size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {viewTarget.pdfFilename}
                      </p>
                      {viewTarget.pdfSize ? (
                        <p className="text-xs text-slate-400">
                          {formatSize(viewTarget.pdfSize)} · PDF
                        </p>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleView(viewTarget.id)}
                      className="btn-ghost text-brand-600 hover:bg-brand-50"
                    >
                      <ExternalLink size={15} /> Open
                    </button>
                    <button
                      onClick={() => handleDownload(viewTarget.id)}
                      className="btn-ghost text-teal-600 hover:bg-teal-50"
                    >
                      <Download size={15} /> Download
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No PDF report attached to this record.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={15} /> Results summary
              </h3>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-700">
                {viewTarget.resultsSummary ? (
                  <p className="whitespace-pre-line">{viewTarget.resultsSummary}</p>
                ) : (
                  <p className="text-slate-400">No results summary was saved for this record.</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileText size={15} /> Notes
              </h3>
              <div className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-700">
                {viewTarget.notes ? (
                  <p className="whitespace-pre-line">{viewTarget.notes}</p>
                ) : (
                  <p className="text-slate-400">No additional notes.</p>
                )}
              </div>
            </div>

            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              These records are for personal tracking only. Always consult your doctor to interpret
              lab results.
            </p>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete lab record?"
        message={
          deleteTarget ? (
            <>
              This will permanently remove the record for{' '}
              <strong>{deleteTarget.testName}</strong> from {deleteTarget.labName}
              {hasPdf(deleteTarget) ? ', including its attached PDF' : ''}.
            </>
          ) : (
            ''
          )
        }
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function LabRow({
  record,
  hasPdf,
  onView,
  onEdit,
  onDelete,
  onViewPdf,
  onDownloadPdf,
}: {
  record: LabRecord;
  hasPdf: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewPdf: () => void;
  onDownloadPdf: () => void;
}) {
  return (
    <tr className="transition hover:bg-slate-50/60">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-mint-50 text-mint-700">
            <FlaskConical size={16} />
          </span>
          <div>
            <p className="font-semibold text-slate-900">{record.testName}</p>
            <p className="max-w-[240px] truncate text-xs text-slate-500">{record.notes || 'No notes'}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Building2 size={14} className="text-slate-400" />
          <span>{record.labName}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <p className="font-medium text-slate-700">{formatDate(record.testDate)}</p>
        <p className="text-xs text-slate-400">{relativeDay(record.testDate)}</p>
      </td>
      <td className="px-5 py-4">
        {record.resultsSummary ? (
          <span className="chip bg-mint-100 text-mint-700">
            <FileText size={12} /> Saved
          </span>
        ) : (
          <span className="chip bg-slate-100 text-slate-500">No results</span>
        )}
      </td>
      <td className="px-5 py-4">
        {hasPdf ? (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <FileText size={14} />
            </span>
            <div className="min-w-0">
              <p className="max-w-[160px] truncate text-xs font-medium text-slate-700">
                {record.pdfFilename}
              </p>
              <div className="mt-0.5 flex items-center gap-2">
                <button
                  onClick={onViewPdf}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 transition hover:text-brand-700"
                >
                  <ExternalLink size={12} /> View
                </button>
                <span className="text-slate-300">·</span>
                <button
                  onClick={onDownloadPdf}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 transition hover:text-teal-700"
                >
                  <Download size={12} /> Download
                </button>
              </div>
            </div>
          </div>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
            <UploadCloud size={13} /> No report attached
          </span>
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-1">
          <button onClick={onView} className="btn-ghost text-teal-600 hover:bg-teal-50" title="View details">
            <Eye size={15} />
          </button>
          <button onClick={onEdit} className="btn-ghost text-brand-600 hover:bg-brand-50" title="Edit">
            <Pencil size={15} />
          </button>
          <button onClick={onDelete} className="btn-ghost text-rose-600 hover:bg-rose-50" title="Delete">
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function DetailTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}
