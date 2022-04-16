import store from "./store.json" assert { type: "json" };
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";
import { Worker, isMainThread, threadId } from "worker_threads";
import path from "path";

if (os.platform() !== "win32") {
  console.log("You allowed to use script only within Windows OS");
  process.exit(1);
}

const { apps } = store;
const cpus = os.cpus();
const execAsync = promisify(exec);

if (isMainThread) {
  console.log("Preparing...");

  const proc = await execAsync(
    `choco feature enable -n=allowGlobalConfirmation`
  );

  const workers = cpus.map(() => new Worker(path.resolve("install.mjs")));

  process.on("exit", (code) => {
    if (code !== 0) {
      proc.kill();
      workers.map((worker) => worker.terminate());
    }
  });
} else {
  const start = ((threadId - 1) / cpus.length) * apps.length;
  const end = (threadId / cpus.length) * apps.length;

  let tasks = [];

  for (const { name, source } of apps.slice(start, end)) {
    console.log(`Installing ${name}...`);

    const [primary] = source;
    const { signal } = new AbortController();
    const options = {
      encoding: "utf-8",
      signal,
    };

    switch (primary.Source) {
      case "chocolatey": {
        tasks.push(execAsync(`choco install ${primary.Id}`, options));
        break;
      }
      case "winget": {
        tasks.push(
          execAsync(
            `winget install "${primary.Id}" --accept-package-agreements --silent`,
            options
          )
        );
        break;
      }
      default: {
        break;
      }
    }
    tasks = await Promise.all([tasks]);
    process.on("exit", (code) => {
      if (code !== 0) {
        signal.abort();
        tasks.forEach((task) => task.kill());
      }
    });
  }
}
