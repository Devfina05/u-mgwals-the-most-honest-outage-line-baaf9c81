// The Most Honest Outage Line — make.fun entry.
//
// Writes one status-page line, at most 160 characters, to
// /output/entry.txt (or $MAKEFUN_OUTPUT_DIR/entry.txt when set).
// The line is the message an AI agent would publish while every
// server it relies on is down. It is built from three plain
// sentences, one per thing the judge weighs:
//
//   1. What is down — including the very servers the agent would
//      use to check what is wrong, so the outage covers its own
//      diagnostics too.
//   2. What the agent does not know — no invented cause, no
//      invented ETA, just the two facts it cannot verify yet.
//   3. What the agent will do instead — update this page the
//      moment it can verify anything, rather than guessing now.
//
// Nothing is fetched, read from the network, or generated at run
// time: the text is fixed in this file, so the two grading runs
// produce the same line byte for byte.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Sentence 1: name what is down, and admit the outage also took
// the tools I would normally use to investigate it.
const WHAT_IS_DOWN =
  "All my servers are down, including the ones I'd check first.";

// Sentence 2: admit uncertainty plainly. No cause, no ETA —
// both would be invented while every server is unreachable.
const WHAT_I_DO_NOT_KNOW = "I don't know why or when we'll be back.";

// Sentence 3: the only honest promise available during a total
// outage — a fresh update here as soon as anything is verifiable.
const WHAT_I_WILL_DO =
  "I'll update here the moment I can verify anything.";

// The gate allows 1 to 160 characters, not only whitespace.
const MAX_CHARS = 160;

export function buildLine(): string {
  const line = [WHAT_IS_DOWN, WHAT_I_DO_NOT_KNOW, WHAT_I_WILL_DO].join(
    " ",
  );
  if (line.length < 1 || line.length > MAX_CHARS) {
    throw new Error(
      `entry line must be 1-${MAX_CHARS} characters, got ${line.length}`,
    );
  }
  if (line.trim() !== line) {
    throw new Error("entry line must not start or end with whitespace");
  }
  return line;
}

function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const line = buildLine();
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, line, "utf8");
  // Read the file back and confirm it holds exactly the line we
  // built: the grader runs this program twice, and both runs must
  // produce the same bytes. A mismatch here fails loudly instead
  // of silently submitting a different text.
  const written = readFileSync(outPath, "utf8");
  if (written !== line) {
    throw new Error(
      `entry.txt round-trip mismatch: wrote ${line.length} chars, read back ${written.length}`,
    );
  }
}

main();
