import version13 from "../../../Business DNA/calibrations/small-business-owner/v1.3.json";
import version14Override from "../../../Business DNA/calibrations/small-business-owner/v1.4.json";
import { applyCalibrationOverride } from "./calibrationDefinition";

/**
 * The application-facing adapter for the sole authoritative Small Business
 * Owner Initial Calibration. UI components and prompts must consume this
 * definition instead of duplicating canonical wording.
 */
export const smallBusinessOwnerCalibrationVersion13 = version13;
export const smallBusinessOwnerCalibration = applyCalibrationOverride(
  version13,
  version14Override,
);

export function calibrationDefinitionForVersion(version: string) {
  return version === version13.version ? version13 : smallBusinessOwnerCalibration;
}

export const smallBusinessOwnerCalibrationIdentity = {
  calibrationId: smallBusinessOwnerCalibration.identifier,
  semanticVersion: smallBusinessOwnerCalibration.version,
  frozenSourceHash: smallBusinessOwnerCalibration.canonical_source.sha256,
};
