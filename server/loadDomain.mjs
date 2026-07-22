import { readFile } from "node:fs/promises";
import ts from "typescript";

const root = new URL("../", import.meta.url);

export async function loadCalibrationDomain() {
  const version13 = JSON.parse(await readFile(new URL(
    "../Business DNA/calibrations/small-business-owner/v1.3.json",
    import.meta.url,
  ), "utf8"));
  const version14 = JSON.parse(await readFile(new URL(
    "../Business DNA/calibrations/small-business-owner/v1.4.json",
    import.meta.url,
  ), "utf8"));
  if (version14.extends !== "v1.3.json") throw new Error("Unsupported calibration base.");
  const canonical = {
    ...version13,
    ...version14,
    canonical_source: { ...version13.canonical_source, ...version14.canonical_source },
    participant_feedback: { ...version13.participant_feedback, ...version14.participant_feedback },
  };
  const evidenceUrl = new URL("../src/domain/calibrations/calibrationEvidencePackage.ts", import.meta.url);
  const evidenceModuleUrl = await transpileToDataUrl(evidenceUrl);
  const pipelineUrl = new URL("../src/domain/calibrations/aiModelGenerationPipeline.ts", import.meta.url);
  const pipelineSource = (await readFile(pipelineUrl, "utf8")).replaceAll(
    '"./calibrationEvidencePackage"',
    JSON.stringify(evidenceModuleUrl),
  );
  const pipeline = await transpileAndImport(pipelineUrl, pipelineSource);
  const generatorUrl = new URL(
    "../src/domain/calibrations/generateInitialBusinessModel.ts",
    import.meta.url,
  );
  let generatorSource = await readFile(generatorUrl, "utf8");
  generatorSource = generatorSource.replace(
    /import \{ smallBusinessOwnerCalibration \} from "\.\/smallBusinessOwnerCalibration";/,
    `const smallBusinessOwnerCalibration = ${JSON.stringify(canonical)};`,
  );
  const generator = await transpileAndImport(generatorUrl, generatorSource);
  return { canonical, pipeline, generator };
}

async function transpileAndImport(url, suppliedSource) {
  return import(await transpileToDataUrl(url, suppliedSource));
}

async function transpileToDataUrl(url, suppliedSource) {
  const source = suppliedSource ?? await readFile(url, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
      verbatimModuleSyntax: true,
    },
    fileName: url.pathname,
  }).outputText;
  return `data:text/javascript;base64,${Buffer.from(output).toString("base64")}`;
}

export const repositoryRoot = root;
