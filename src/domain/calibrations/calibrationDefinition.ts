export type CalibrationDefinition = typeof import("../../../Business DNA/calibrations/small-business-owner/v1.3.json");

type CalibrationOverride = Omit<Partial<CalibrationDefinition>, "participant_feedback"> & {
  extends: string;
  participant_feedback: Partial<CalibrationDefinition["participant_feedback"]> & {
    question_count: number;
  };
};

export function applyCalibrationOverride(
  base: CalibrationDefinition,
  override: CalibrationOverride,
): CalibrationDefinition {
  if (override.extends !== "v1.3.json") {
    throw new Error(`Unsupported calibration base: ${override.extends}`);
  }
  return {
    ...base,
    ...override,
    canonical_source: { ...base.canonical_source, ...override.canonical_source },
    participant_feedback: {
      ...base.participant_feedback,
      ...override.participant_feedback,
    },
  } as CalibrationDefinition;
}
