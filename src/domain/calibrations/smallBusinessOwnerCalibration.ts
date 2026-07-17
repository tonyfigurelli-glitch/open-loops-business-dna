import definition from "../../../Business DNA/calibrations/small-business-owner/v1.3.json";

/**
 * The application-facing adapter for the sole authoritative Small Business
 * Owner Initial Calibration. UI components and prompts must consume this
 * definition instead of duplicating canonical wording.
 */
export const smallBusinessOwnerCalibration = definition;

export const smallBusinessOwnerCalibrationIdentity = {
  calibrationId: definition.identifier,
  semanticVersion: definition.version,
  frozenSourceHash: definition.canonical_source.sha256,
};
