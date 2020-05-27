import * as core from '@actions/core';
import * as github from '@actions/github';
import { WebhookPayload } from '@actions/github/lib/interfaces';

const REVIEW_TRIGGER = 'please review';
const LINKED_ISSUES_REGEX = /(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #(\d+)/g;
const REGEX_MATCH_ID_INDEX = 2;
const PR_FOR_REVIEW_LABEL = "6: PR for review";

async function run() {
  try {
    console.log("Running labeler...");
    const payload = github.context.payload;
    if (!payload.pull_request) {
      console.log("No payload pull request. Exiting...");
      return;
    }
    const token = core.getInput('repo-token', {required: true});
    const client = new github.GitHub(token);
    const pullRequest = payload.pull_request;
    
    if(pullRequest.body.toLowerCase().includes(REVIEW_TRIGGER)) {
      console.log("Found review trigger. Added review label to PR and linked issues...");
      await addLabels(client, pullRequest.number, [PR_FOR_REVIEW_LABEL]);
      const linkedIssues = getLinkedIssues(pullRequest.body);
      linkedIssues.forEach(async (value) => {
        await addLabels(client, value, [PR_FOR_REVIEW_LABEL]) 
      })
    }

    logDebuggingInfo(payload);
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
  try {
    await client.issues.addLabels({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber,
      labels: labels
    });
  } catch (error) {
    console.log("addLabels error:" + error['name'])
  }
}

function getLinkedIssues(body: string): number[] {
  console.log("Finding linked issues...");
  let match: string[];
  let result: number[] = [];
  while (match = LINKED_ISSUES_REGEX.exec(body)) {
    console.log("Found issue: " + match[REGEX_MATCH_ID_INDEX])
    result.push(Number(match[REGEX_MATCH_ID_INDEX]))
  }
  console.log("Finished looking for linked issues.");
  return result;
};

function logDebuggingInfo(payload: WebhookPayload) {
  const pullRequest = payload.pull_request;
  console.log("Payload action: " + payload.action);
  console.log("Payload changes: " + JSON.stringify(payload.changes, undefined, 2));
  
  // console.log("\n-------------------------------------------------------");
  // console.log("Pull request body:\n");
  // console.log(pullRequest.body);
  // console.log("-------------------------------------------------------\n");

  // console.log("-------------------------------------------------------");
  // console.log("The event payload:\n");
  // const payloadString = JSON.stringify(payload, undefined, 2)
  // console.log(payloadString);
}

run();