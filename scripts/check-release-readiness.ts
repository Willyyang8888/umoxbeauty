import { getReleaseReadiness } from "../src/lib/release-readiness";

async function main() {
  const readiness = await getReleaseReadiness();

  console.log("Release readiness");
  console.log("=================");

  for (const check of readiness.checks) {
    console.log(`[${check.status.toUpperCase()}] ${check.label}: ${check.detail}`);
  }

  if (readiness.warnings.length > 0) {
    console.log("\nWarnings");
    console.log("--------");
    for (const warning of readiness.warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (readiness.blockers.length > 0) {
    console.log("\nBlockers");
    console.log("--------");
    for (const blocker of readiness.blockers) {
      console.log(`- ${blocker}`);
    }
    process.exit(1);
  }

  console.log("\nProduction gate: PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
