import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { CalibrationDatabase } from "./database.mjs";

const [command, userId, outputPath] = process.argv.slice(2);
const databasePath = process.env.OPEN_LOOPS_DATABASE_PATH;
if (!databasePath) throw new Error("OPEN_LOOPS_DATABASE_PATH is required.");
const database = new CalibrationDatabase(databasePath);

try {
  if (command === "backup") {
    if (!userId) throw new Error("Usage: pilotOperations.mjs backup <destination-path>");
    await database.backupTo(resolve(userId));
    console.log(JSON.stringify({ backedUpTo: resolve(userId) }));
  } else if (command === "export-participant") {
    if (!userId || !outputPath) throw new Error("Usage: pilotOperations.mjs export-participant <user-id> <output-path>");
    const exported = database.exportParticipant(userId);
    await writeFile(resolve(outputPath), JSON.stringify(exported, null, 2), { mode: 0o600 });
    console.log(JSON.stringify({ exportedUserId: userId, outputPath: resolve(outputPath) }));
  } else if (command === "delete-participant") {
    if (!userId || process.env.OPEN_LOOPS_CONFIRM_DELETE !== userId) {
      throw new Error("Set OPEN_LOOPS_CONFIRM_DELETE to the exact user ID before deletion.");
    }
    console.log(JSON.stringify(database.deleteParticipant(userId)));
  } else {
    throw new Error("Commands: backup, export-participant, delete-participant");
  }
} finally {
  database.close();
}
