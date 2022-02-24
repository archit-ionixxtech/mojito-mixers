export declare const NBSP = "\u00A0";
/**
 * Capitalize first letter and enforce a dot at the end.
 */
export declare function formatSentence(str: string): string;
/**
 * Split a single string with line-breaks into an array of sentences.
 */
export declare function parseSentences(str: string): string[];
/**
 * Calculate how much time is left since <start> ms out of <total> ms and formats that as MM:SS.
 */
export declare function formatTimeLeft(start: number, total: number): string;
