import * as core from '@actions/core';
import * as github from '@actions/github';

const REVIEW_TRIGGER = 'please review';

async function run() {
  try {
    console.log("Running labeler!");
    if (!github.context.payload.pull_request) {
      console.log("No payload PR!");
      return;
    }

    const token = core.getInput('repo-token', {required: true});
    const client = new github.GitHub(token);
    const pullRequest = github.context.payload.pull_request;
    console.log("pullRequest.body");
    console.log(pullRequest.body);

    if(pullRequest.body.toLowerCase().includes(REVIEW_TRIGGER)) {
      await addLabels(client, pullRequest.number, ['Review']);
    } else {
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

run();