import * as core from '@actions/core';
import * as github from '@actions/github';

const REVIEW_TRIGGER = 'please review';
const LINKED_ISSUES_REGEX = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #(\d+)/g;
const REGEX_MATCH_ID_INDEX = 2;

async function run() {
  try {
    console.log("Running labeler!");
    const payload = github.context.payload;
    if (!payload.pull_request) {
      console.log("No payload PR!");
      return;
    }
    const token = core.getInput('repo-token', {required: true});
    const client = new github.GitHub(token);
    const pullRequest = payload.pull_request;

    console.log("Payload action: " + payload.action);
    console.log("Payload changes: " + JSON.stringify(payload.changes, undefined, 2));
    
    console.log("\n-------------------------------------------------------");
    console.log("Pull request body:\n");
    console.log(pullRequest.body);
    console.log("-------------------------------------------------------\n");
    
    if(pullRequest.body.toLowerCase().includes(REVIEW_TRIGGER)) {
      console.log("Adding label: Review");
      await addLabels(client, pullRequest.number, ['Review']);
      const linkedIssues = getLinkedIssues(pullRequest.body);
      linkedIssues.forEach(async (value) => {
        await addLabels(client, value, ['Review']) 
      })
    } else {
      console.log("Adding label: bug");
      await addLabels(client, pullRequest.number, ['bug']);
    }

    // console.log("-------------------------------------------------------\n");
    // console.log("The event payload:");
    // const payloadString = JSON.stringify(payload, undefined, 2)
    // console.log(payloadString);
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

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

function getLinkedIssues(body: string): number[] {
  console.log("Finding linked issues...");
  let match: string[];
  let result: number[] = [];
  while (match = LINKED_ISSUES_REGEX.exec(body)) {
    console.log(match[REGEX_MATCH_ID_INDEX])
    result.push(Number(match[REGEX_MATCH_ID_INDEX]))
  }
  console.log("Finished looking for linked issues.");
  return result;
};

run();