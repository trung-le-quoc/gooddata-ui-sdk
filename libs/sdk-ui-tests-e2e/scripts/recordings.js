#!/usr/bin/env node
// (C) 2021 GoodData Corporation

const { execSync } = require("child_process");
const fs = require("fs");
const { WORKSPACE_ID } = require("../cypress/constants.ts");

function deleteRecordings(specFilter) {
    process.stdout.write("Deleting recordings\n");
    ensureRecordingsDirectory();
    deleteFilesInDir("./recordings/__files", specFilter);
    deleteFilesInDir("./recordings/mappings", specFilter);
}

function deleteFilesInDir(directory, specFilter) {
    if (specFilter && specFilter !== "" && specFilter.trim() !== "") {
        execSync(`rm -rf ${directory}/mapping-${specFilter}*`);
    } else {
        execSync(`rm -rf ${directory}/*`);
    }
}

function ensureRecordingsDirectory() {
    fs.mkdirSync("./recordings/mappings", { recursive: true });
}

function sanitizeCredentials() {
    try {
        const stdout = execSync("ls ./recordings/mappings/*").toString();
        if (stdout) {
            const testRecordings = stdout.split("\n");
            testRecordings.forEach((testRecordingFile) => {
                if (testRecordingFile === "") {
                    return;
                }
                const data = fs.readFileSync(testRecordingFile);
                const json = JSON.parse(data);

                if (json.mappings) {
                    json.mappings.forEach((mapping) => {
                        if (mapping && mapping.request && mapping.request.url === "/gdc/account/login") {
                            delete mapping.request.bodyPatterns;
                            delete mapping.response.headers["Set-Cookie"];
                        }
                    });
                }

                fs.writeFileSync(testRecordingFile, JSON.stringify(json, null, 2) + "\n");
            });
        }
    } catch (error) {
        process.stdout.write("error", error);
        process.stdout.write("Credentials not cleared\n");
    }
}

function recordingsPresent() {
    const recordingsLength = fs.readdirSync("./recordings/mappings").length;
    return recordingsLength !== 0;
}

function getRecordingsWorkspaceId() {
    return WORKSPACE_ID;
}

module.exports = {
    sanitizeCredentials,
    recordingsPresent,
    deleteRecordings,
    getRecordingsWorkspaceId,
};
