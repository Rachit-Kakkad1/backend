
import { detectSQLInjection } from '../security-engine/detectors/sqlInjection.js';
import { detectXSS } from '../security-engine/detectors/xss.js';
import { normalizeCode } from '../security-engine/normalizers/code.js';

console.log("Running Security Bypass Reproduction...");

let failures = 0;

// Case 1: SQL Injection Bypass via Object Literal (No spaces)
const sqlBypassCode = `
const userInput = "admin' --";
// The following object literal {db:1} matches the ":\\w+" regex
// causing the SQL injection on the next line to be ignored.
const config = {db:1}; 
const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
execute(query);
`;

const normalizedSql = normalizeCode(sqlBypassCode);
const sqlFindings = detectSQLInjection(normalizedSql);

if (sqlFindings.length === 0) {
    console.error("FAIL: SQL Injection bypassed by object literal presence!");
    failures++;
} else {
    console.log("PASS: SQL Injection detected despite object literal.");
}

// Case 2: XSS Bypass via Split Lines
const xssBypassCode = `
const user = req.query.user;

// Some lines of code to push context out of the 3-line window
// ...
// ...

res.send("<div>" + user + "</div>");
`;

const normalizedXss = normalizeCode(xssBypassCode);
const xssFindings = detectXSS(normalizedXss);

if (xssFindings.length === 0) {
    console.error("FAIL: XSS bypassed by splitting source and sink!");
    failures++;
} else {
    console.log("PASS: XSS detected despite split lines.");
}

if (failures > 0) {
    console.log(`\nTotal Failures: ${failures}`);
    process.exit(1);
} else {
    console.log("\nAll checks passed!");
    process.exit(0);
}
