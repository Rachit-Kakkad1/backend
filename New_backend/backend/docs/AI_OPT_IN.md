# AI Opt-In Requirements

- AI executes only when `useAI === true` is provided by the frontend.
- Risk score never triggers AI; it cannot enable AI implicitly.
- Mode selection:
  - `SECURITY_PLUS_AI` only when `useAI === true` and the frontend explicitly sent opt-in.
  - Otherwise `SECURITY_ONLY`.
- Security engine always runs first and is authoritative.
- AI is advisory-only and fail-closed. Errors block AI, not allow it.

## Implementation Highlights

- Decision: `decideAnalysisMode({ useAI })` ignores `riskScore`.
- Combined flow:
  - Run security engine.
  - Decide mode.
  - Gate AI by `useAI === true` and authoritative findings present.
- Final guard: `runAIAnalysis` throws if `useAI !== true` or findings are missing.
- Audit trail: JSONL logs under `backend/logs/ai_audit.log` record each decision and AI attempt.

## Tests

- Unit tests in `backend/tests/aiOptIn.test.mjs` verify:
  - AI disabled when `useAI` is false (even with high `riskScore`).
  - AI enabled when `useAI` is true and findings exist.

## Environment

- Local LLM defaults to `http://localhost:5050/v1/chat/completions`.
- Override via:
  - `LLM_HOST`, `LLM_PORT`, `LLM_PATH`, `LLM_MODEL`.
