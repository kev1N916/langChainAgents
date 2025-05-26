import * as fs from 'fs';
import * as path from 'path';

/**
 * Loads instruction text from a file, or uses a default if the file is not found or readable.
 * @param filename - The relative filename of the instruction file.
 * @param defaultInstruction - The fallback instruction string.
 * @returns The instruction string loaded from the file or the default.
 */
function loadInstructionFromFile(filename: string, defaultInstruction: string = "Default instruction."): string {
    let instruction: string = defaultInstruction;

    try {
        const filepath: string = path.join(__dirname, filename);
        instruction = fs.readFileSync(filepath, 'utf-8');
        console.log(`Successfully loaded instruction from ${filename}`);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            console.warn(`WARNING: Instruction file not found: ${filename}. Using default.`);
        } else {
            console.error(`ERROR loading instruction file ${filename}: ${error.message}. Using default.`);
        }
    }

    return instruction;
}

export {loadInstructionFromFile}