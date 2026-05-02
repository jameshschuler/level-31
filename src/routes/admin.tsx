import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Upload } from "lucide-react";
import { uploadPlayerStepsCsv } from "#/features/steps/upload-player-steps.functions";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const uploadPlayerStepsCsvFn = useServerFn(uploadPlayerStepsCsv);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadPassword, setUploadPassword] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!csvFile || !uploadPassword.trim()) {
      setUploadMessage(
        "Please select a CSV file and enter the upload password.",
      );
      return;
    }

    setUploadMessage("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.set("csvFile", csvFile);
      formData.set("uploadPassword", uploadPassword);

      const result = await uploadPlayerStepsCsvFn({
        data: formData,
      });

      const unmatchedCount = result.unmatchedNames.length;
      setUploadMessage(
        `Imported ${result.importedPlayers} players across ${result.createdReports} report(s), with ${result.dailyRecords} daily records. Unmatched names: ${unmatchedCount}.`,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Upload failed. Check the CSV and try again.";
      setUploadMessage(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell mt-8 rounded-2xl p-6 sm:p-8">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl border border-[var(--line)] bg-[var(--card-bg)] p-2">
            <Upload className="h-5 w-5 text-[var(--lagoon-deep)]" />
          </div>
          <div>
            <p className="island-kicker mb-1">CSV Upload</p>
            <h2 className="m-0 text-xl font-semibold text-[var(--sea-ink)]">
              Import Player Step Report
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm text-[var(--sea-ink-soft)]">
            Upload Password
            <input
              type="password"
              value={uploadPassword}
              onChange={(event) => setUploadPassword(event.target.value)}
              className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-[var(--input-bg)] px-3 py-2 text-[var(--sea-ink)]"
              required
            />
          </label>

          <label className="block text-sm text-[var(--sea-ink-soft)]">
            CSV File
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  setCsvFile(file);
                }
              }}
              className="mt-2 block w-full rounded-xl border border-[var(--line)] bg-[var(--input-bg)] px-3 py-2 text-[var(--sea-ink)]"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {isUploading ? "Uploading..." : "Upload CSV"}
          </button>

          {uploadMessage ? (
            <p className="m-0 break-words text-sm text-[var(--sea-ink-soft)]">
              {uploadMessage}
            </p>
          ) : null}
        </form>
      </section>
    </main>
  );
}
