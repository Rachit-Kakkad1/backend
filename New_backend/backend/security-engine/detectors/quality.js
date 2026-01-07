/**
 * CODE QUALITY & SYNTAX DETECTOR
 * ==============================
 * Catches common typos, suspicious method calls, and debug leftovers.
 * Not strictly "security" but improves user trust in the analysis engine.
 */

export function detectCodeQualityIssues(input) {
    const content = input.content || input.raw || "";
    const issues = [];
    const lines = content.split("\n");

    // Helper to add issue
    const addIssue = (lineIndex, match, description, type = "Suspicious Code", inputSeverity = "Low") => {
        // Auto-escalate "Critical Security Risk" type to Critical severity
        const severity = type === "Critical Security Risk" ? "CRITICAL" : inputSeverity;

        issues.push({
            type,
            severity,
            description: `Line ${lineIndex + 1}: ${description}`,
            location: `Line ${lineIndex + 1}`,
            evidence: match,
        });
    };


    lines.forEach((line, index) => {
        // 1. Detect "console.wdwlog" or similar chaotic typos
        // Regex matches "console." followed by random-looking keys that aren't standard
        const consoleTypoRegex = /console\.(?!log|warn|error|info|table|dir|debug|trace|group|groupEnd|time|timeEnd|assert|clear|count)[a-zA-Z0-9_]+/;
        const consoleMatch = line.match(consoleTypoRegex);

        if (consoleMatch) {
            addIssue(index, consoleMatch[0], `Unknown console method detected: '${consoleMatch[0]}'. Did you mean 'console.log'?`);
        }

        // 1.5. Detect "eval()" (Critical Security Risk)
        // Matches "eval(" but ignores comments/strings ideally (regex limitation)
        if (/\beval\s*\(/.test(line)) {
            addIssue(index, "eval()", "Dangerous use of 'eval()'. This allows arbitrary code execution.", "Critical Security Risk"); // Override type
        }

        // 1.6. Detect "new Function()" (Critical Security Risk)
        if (/new\s+Function\s*\(/.test(line)) {
            addIssue(index, "new Function()", "Dynamic function creation is a security risk similar to verify.", "Critical Security Risk");
        }

        // 2. Detect "undefined" being used as a function
        if (line.includes("undefined(")) {
            addIssue(index, "undefined()", "Attempted to call 'undefined' as a function.", "Runtime Error Risk");
        }

        // 3. Detect "TODO" or "FIXME" comments (Information leak / Tech debt)
        if (/\/\/\s*(TODO|FIXME|HACK)/.test(line)) {
            addIssue(index, "TODO/FIXME", "Leftover developer comment detected. Review before deployment.", "Information Leak");
        }

        // 4. Detect "debugger" statements
        if (/debugger;?/.test(line)) {
            addIssue(index, "debugger", "Suspicious 'debugger' statement found in production code.");
        }
    });

    return issues;
}
