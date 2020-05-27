import * as core from '@actions/core';
import * as github from '@actions/github';

async function run() {
  try {
    console.log("Running!");

    console.log(`Hello FlightLogger}!`);
    const time = (new Date()).toTimeString();
    core.setOutput("time", time);

    const token = core.getInput('repo-token', {required: true});

    const prNumber = getPrNumber();
    if (!prNumber) {
      console.log('Could not get pull request number from context, exiting');
      return;
    }

    const client = new github.GitHub(token);
    const pullRequest = github.context.payload.pull_request;
    console.log("pullRequest.body");
    console.log(pullRequest.body);

    await addLabels(client, prNumber, ['bug']);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }

  function getPrNumber(): number | undefined {
    const pullRequest = github.context.payload.pull_request;
    if (!pullRequest) {
      return undefined;
    }
  
    return pullRequest.number;
  }
}


// async function getLabelGlobs(
//   client: github.GitHub,
//   configurationPath: string
// ): Promise<Map<string, string[]>> {
//   const configurationContent: string = await fetchContent(
//     client,
//     configurationPath
//   );

//   // loads (hopefully) a `{[label:string]: string | string[]}`, but is `any`:
//   const configObject: any = yaml.safeLoad(configurationContent);

//   // transform `any` => `Map<string,string[]>` or throw if yaml is malformed:
//   return getLabelGlobMapFromObject(configObject);
// }


// async function fetchContent(
//   client: github.GitHub,
//   repoPath: string
// ): Promise<string> {
//   const response: any = await client.repos.getContents({
//     owner: github.context.repo.owner,
//     repo: github.context.repo.repo,
//     path: repoPath,
//     ref: github.context.sha
//   });

//   return Buffer.from(response.data.content, response.data.encoding).toString();
// }

// function getLabelGlobMapFromObject(configObject: any): Map<string, string[]> {
//   const labelGlobs: Map<string, string[]> = new Map();
//   for (const label in configObject) {
//     if (typeof configObject[label] === 'string') {
//       labelGlobs.set(label, [configObject[label]]);
//     } else if (configObject[label] instanceof Array) {
//       labelGlobs.set(label, configObject[label]);
//     } else {
//       throw Error(
//         `found unexpected type for label ${label} (should be string or array of globs)`
//       );
//     }
//   }

//   return labelGlobs;
// }

// function checkGlobs(changedFiles: string[], globs: string[]): boolean {
//   for (const glob of globs) {
//     core.debug(` checking pattern ${glob}`);
//     const matcher = new Minimatch(glob);
//     for (const changedFile of changedFiles) {
//       core.debug(` - ${changedFile}`);
//       if (matcher.match(changedFile)) {
//         core.debug(` ${changedFile} matches`);
//         return true;
//       }
//     }
//   }
//   return false;
// }

async function addLabels(
  client: github.GitHub,
  prNumber: number,
  labels: string[]
) {
  await client.issues.addLabels({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    labels: labels
  });
}

run();