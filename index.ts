import * as core from '@actions/core';
import * as github from '@actions/github';

const REVIEW_TRIGGER = 'please review';
const LINKED_ISSUES_REGEX = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #(\d+)/g;

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

    // const payloadString = JSON.stringify(payload, undefined, 2)
    // console.log(`The event payload: ${payloadString}`);

    console.log("Payload action: " + payload.action);
    console.log("Payload changes: " + payload.changes);
    console.log("Pull request body: " + pullRequest.body);
    
    getLinkedIssues(pullRequest.body)

    if(pullRequest.body.toLowerCase().includes(REVIEW_TRIGGER)) {
      console.log("Adding label: Review");
      await addLabels(client, pullRequest.number, ['Review']);
    } else {
      console.log("Adding label: bug");
      await addLabels(client, pullRequest.number, ['bug']);
    }
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

function getLinkedIssues(body: string) {
  console.log("Finding linked issues...");
  let match: string[];
  while (match = LINKED_ISSUES_REGEX.exec(body)) {
    console.log(match)
  }
  console.log("Finished looking for linked issues.");
};

run();