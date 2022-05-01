import store from "./store.json" assert { type: "json" };
import { exec } from "child_process";
import { promisify } from "util";
import os from "os";

if (os.platform() !== "win32") {
  console.log("You allowed to use script only within Windows OS");
  process.exit(1);
}

const { apps } = store;
const execAsync = promisify(exec);

const tasks = [];
const signals = [];

for (const { name, source } of apps) {
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
