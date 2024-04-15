#!/usr/bin/env node

const { exec } = require("child_process");
const tar = require("tar");
const path = require("path");
const fs = require("fs");

// Define the package to fetch
const packageName = "@baselinejs/core@latest";

// Get the current directory
const currentDir = process.cwd();

// Get app name from the process.args
const appName = process.argv[2];
if (!appName) {
  console.error("Usage: npx @baselinejs/create-app <app-name>");
  process.exit(1);
}

// Function to execute shell commands
function executeCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(stderr);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

// Function to unpack the tarball
async function unpackTarball(tarballName, extractPath) {
  try {
    await tar.x({
      file: tarballName,
      C: extractPath,
      strip: 1, // Strip the leading directory component
    });
    console.log(`Extraction complete. Files are available in ${extractPath}`);
  } catch (error) {
    console.error(`Error extracting the tarball: ${error.message}`);
  }
}

// Main function to pack and extract the npm package
async function packAndExtract() {
  try {
    const appFolder = appName;

    // Check if directory exists to avoid clobbering
    if (fs.existsSync(path.join(currentDir, appFolder))) {
      throw new Error("Directory already exists");
    }

    // Fetch the tarball using npm pack
    console.log(`Fetching ${packageName} from npm...`);
    const tarballName = await executeCommand(`npm pack ${packageName}`);

    // Check if the tarball exists
    if (!fs.existsSync(tarballName)) {
      throw new Error("Tarball not found");
    }

    // Create a directory for extraction
    const extractPath = path.join(currentDir, appFolder);
    fs.mkdirSync(extractPath, { recursive: true });

    // Extract the tarball
    console.log(`Extracting ${tarballName} into ${extractPath}...`);
    await unpackTarball(tarballName, extractPath);

    // Optionally, remove the tarball after extraction
    fs.unlinkSync(tarballName);
  } catch (error) {
    console.error(`An error occurred: ${error}`);
  }
}

packAndExtract();
