import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";

export async function run() {
  try {
    const dataInput = core.getInput("data");
    const secretsInput = core.getInput("secrets");
    const webhookUrl = core.getInput("webhook-url");
    const bearerToken = core.getInput("bearer-token");
  
    let data;
    
    try {
      data = JSON.parse(dataInput);
    } catch (error) {
      core.setFailed("Additional data is not a valid JSON string");
      return;
    }

    let secrets;

    try {
      secrets = JSON.parse(secretsInput);
    } catch (error) {
      core.setFailed("Secrets are not a valid JSON string");
      return;
    }

    const { owner, repo } = github.context.repo;
    const { eventName, ref, sha } = github.context;

    const payload = {
      branch: ref.replace("refs/heads/", ""),
      data,
      secrets,
      eventName,
      owner,
      repo,
      sha,
    };

    const response = await axios.post(webhookUrl, payload, {
      headers: {
      Authorization: `Bearer ${bearerToken}`,
      },
    });

  } catch (error: any) {
    console.error(error.response?.data ?? error.message);

    core.setFailed(error.message ?? "An error occurred");
  }
}

run();
