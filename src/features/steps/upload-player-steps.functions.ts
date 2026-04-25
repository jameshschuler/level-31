import { createServerFn } from "@tanstack/react-start";

type UploadPlayerStepsCsvInput = {
  csvText: string;
  sourceFileName?: string;
  uploadPassword: string;
};

export const uploadPlayerStepsCsv = createServerFn({ method: "POST" })
  .inputValidator(
    async (data: FormData): Promise<UploadPlayerStepsCsvInput> => {
      if (!(data instanceof FormData)) {
        throw new Error("Expected form data");
      }

      const fileValue = data.get("csvFile");
      const passwordValue = data.get("uploadPassword");

      if (!(fileValue instanceof File)) {
        throw new Error("CSV file is required");
      }

      if (typeof passwordValue !== "string" || !passwordValue.trim()) {
        throw new Error("Upload password is required");
      }

      const csvText = await fileValue.text();

      if (!csvText.trim()) {
        throw new Error("CSV file is empty");
      }

      return {
        csvText,
        sourceFileName: fileValue.name,
        uploadPassword: passwordValue,
      };
    },
  )
  .handler(async ({ data }) => {
    const { importPlayerStepsCsv } =
      await import("#/features/steps/upload-player-steps.server");
    return importPlayerStepsCsv(data);
  });
