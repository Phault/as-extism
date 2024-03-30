import assert from "node:assert";
import { exec } from "node:child_process";
import { Command, program } from "commander";
import { promisify } from "node:util";

const execAsync = promisify(exec);

type ProjectGraph = {
  projects: Array<{
    id: string;
    tasks: {
      [id: string]: {
        id: string;
      };
    };
  }>;
};

function execMoon(args: string[], options?: Parameters<typeof execAsync>[1]) {
  const command = ["moon", ...args].map((arg) => `'${arg}'`).join(" ");
  console.debug(`Running: ${command}`);
  return execAsync(command, { encoding: "utf-8", ...options });
}

async function moonQueryProjects({ id }: { id?: string | undefined }) {
  const { stdout } = await execMoon([
    "query",
    "projects",
    ...(id ? ["--id", id] : []),
    "--json",
  ]);

  const graph = JSON.parse(stdout) as ProjectGraph;
  return graph.projects;
}

function escapeRegExp(string: string) {
  // stolen from mdn
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

program
  .name("run-partial")
  .description("Run targets matching a pattern with wilcards.")
  .argument("<pattern>", "pattern for targets to run")
  .option("--dry", "output matching targets, but do not run them")
  .passThroughOptions(true)
  .addHelpText(
    "after",
    `
Examples:
  All tasks in a project (* could be omitted in this case):
    run-partial specific-project:*

  Tasks starting with "build-" in a project
    run-partial specific-project:build-*

  All tasks in all projects (identical to *:*, *: and :*):
    run-partial *

  Tasks ending with "-test" in all projects (identical to *:*-test):
    run-partial :*-test

  Tasks containing the word "test" in projects with prefix "my-" and suffix "-project":
    run-partial my-*-project:*test*
  `,
  )
  .action(
    async (
      targetPattern: string,
      options: { dry?: boolean },
      command: Command,
    ) => {
      const dry = Boolean(options.dry);

      if (!targetPattern) {
        program.error("Invalid target pattern provided");
      }

      const [rawProject, rawTask] = targetPattern.split(":");

      const [projectPattern, taskPattern] = [
        rawProject || "*",
        rawTask || "*",
      ].map((id) => {
        const convertedWildcards = escapeRegExp(id).replaceAll("\\*", ".*?");

        return {
          original: id,
          exact: id === convertedWildcards,
          pattern: new RegExp(`^${convertedWildcards}$`),
        };
      });

      assert(projectPattern);
      assert(taskPattern);

      const projects = await moonQueryProjects({
        // avoid pulling the whole graph when possible
        id: projectPattern.exact ? projectPattern.original : undefined,
      });

      const targets = projects
        .filter((project) => projectPattern.pattern.test(project.id))
        .flatMap((project) =>
          Object.values(project.tasks)
            .filter((task) => taskPattern.pattern.test(task.id))
            .map((task) => `${project.id}:${task.id}`),
        );

      if (dry) {
        console.log(targets);
      } else {
        const passThroughArgs = command.args.slice(1);
        const task = execMoon(["run", ...targets, ...passThroughArgs]);
        task.child.stdout?.pipe(process.stdout);
        task.child.stderr?.pipe(process.stderr);
        try {
          await task;
        } catch (e) {
          if (
            !(
              e instanceof Error &&
              "code" in e &&
              typeof e["code"] === "number"
            )
          ) {
            throw e;
          }

          // error is already written to stderr, so we just swallow it
          program.error("", { exitCode: e.code as number });
        }
      }
    },
  )
  .parse();
