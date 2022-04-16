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

  const chocoProc = await execAsync(
    `choco feature enable -n=allowGlobalConfirmation`
  );

  const workers = cpus.map(() => new Worker(path.resolve("install.mjs")));

  process.on("exit", (code) => {
    if (code !== 0) {
      chocoProc.kill();
      workers.map((worker) => worker.terminate());
    }
  });
} else {
  const start = ((threadId - 1) / cpus.length) * apps.length;
  const end = (threadId / cpus.length) * apps.length;

  const tasks = [];
  const signals = [];

  for (const { name, source } of apps.slice(start, end)) {
    console.log(`Installing ${name}...`);

    const [primary] = source;
    const { signal } = new AbortController();
    const options = {
      encoding: "utf-8",
      signal,
    };
    signals.push(signal);

    switch (primary.Source) {
      case "chocolatey": {
        const task = await execAsync(`choco install ${primary.Id}`, options);

        if (task.stderr) {
          console.log(
            `
          Installation failed for ${name}
          `,
            task.stderr,
            "\n"
          );
        } else if (task.stdout && task.stdout.includes("installed")) {
          // console.log(`Installed ${name}`);
        }
        tasks.push(task);
        break;
      }
      case "winget": {
        const task = await execAsync(
          `winget install "${primary.Id}" --accept-package-agreements --silent`,
          options
        );

        if (task.stderr) {
          console.log(
            `
          Installation failed for ${name}
          `,
            task.stderr,
            "\n"
          );
        } else if (task.stdout && task.stdout.includes("installed")) {
          // console.log(`Installed ${name}`);
        }
        tasks.push(task);
        break;
      }
      case "npm": {
        const task = await execAsync(
          `npm install --global ${primary.Id}`,
          options
        );

        if (task.stderr) {
          console.log(
            `
          Installation failed for ${name}
          `,
            task.stderr,
            "\n"
          );
        } else if (task.stdout && task.stdout.includes("installed")) {
          // console.log(`Installed ${name}`);
        }
        tasks.push(task);
        break;
      }
      case "pip": {
        const task = await execAsync(
          `python -m pip install --upgrade ${primary.Id}`,
          options
        );

        if (task.stderr) {
          console.log(
            `
          Installation failed for ${name}
          `,
            task.stderr,
            "\n"
          );
        } else if (task.stdout && task.stdout.includes("installed")) {
          // console.log(`Installed ${name}`);
        }
        tasks.push(task);
        break;
      }
      case "fnm": {
        const task = await execAsync(`fnm install ${primary.Id}`, options);

        if (task.stderr) {
          console.log(
            `
          Installation failed for ${name}
          `,
            task.stderr,
            "\n"
          );
        } else if (task.stdout && task.stdout.includes("installed")) {
          // console.log(`Installed ${name}`);
        }
        tasks.push(task);
        break;
      }
      default: {
        break;
      }
    }
  }
  process.on("exit", (code) => {
    if (code !== 0) {
      signals.forEach((signal) => signal.abort());
      tasks.forEach((task) => task.kill());
    }
  });
}
