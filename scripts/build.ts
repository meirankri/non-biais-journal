import dotenv from "dotenv";
dotenv.config();
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as ftp from "basic-ftp";

const execAsync = promisify(exec);

async function buildProject() {
  try {
    console.log("Starting yarn build...");
    const { stdout, stderr } = await execAsync("yarn build");
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log("Build completed successfully.");
  } catch (error) {
    console.error("Error during yarn build:", error);
    throw new Error("Build failed");
  }
}

async function moveOutToRoot() {
  const outDir = path.join(__dirname, "../out");
  const destinationDir = path.join(__dirname, "../");

  if (!fs.existsSync(outDir)) {
    throw new Error("Build output folder 'out' does not exist.");
  }

  try {
    console.log("Moving 'out' folder to root...");
    fs.renameSync(outDir, path.join(destinationDir, "out"));
    console.log("'out' folder moved successfully.");
  } catch (error) {
    console.error("Error while moving 'out' folder:", error);
    throw new Error("Failed to move 'out' folder");
  }
}

async function uploadToFTP() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log("Connecting to FTP server...");
    console.log(
      "FTP_HOST starts with:",
      process.env.FTP_HOST?.slice(0, 5) + "..."
    );
    console.log("FTP_USER length:", process.env.FTP_USER?.length);
    console.log("FTP_PASSWORD is set:", Boolean(process.env.FTP_PASSWORD));
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: false, // Activez si vous utilisez un serveur FTP sécurisé (FTPS)
      port: 21,
    });
    const remoteDirectory = "/non-biais";
    console.log(`Navigating to remote directory: ${remoteDirectory}`);
    await client.ensureDir(remoteDirectory); // Crée le répertoire s'il n'existe pas
    await client.clearWorkingDir(); // (Optionnel) Nettoie le répertoire distant

    // Téléverser le dossier local 'out'
    const localDirectory = "out"; // Chemin du dossier à téléverser
    console.log(`Uploading folder '${localDirectory}' to '${remoteDirectory}'`);
    await client.uploadFromDir(localDirectory);
  } catch (error) {
    console.error("FTP upload failed:", error);
    throw new Error("FTP upload failed");
  } finally {
    client.close();
  }
}

export async function build(): Promise<void> {
  try {
    // Build project
    // await buildProject();

    // Move 'out' folder to root
    await moveOutToRoot();

    // Upload 'out' folder via FTP
    await uploadToFTP();

    console.log("All tasks completed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

// Execute main function
build().catch(async (error) => {
  console.error(error);
  process.exit(1);
});
