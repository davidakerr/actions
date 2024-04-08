import * as core from "@actions/core";
import * as github from "@actions/github";
import axios from "axios";
import { run } from "./index";

jest.mock("@actions/github", () => ({
  context: {
    repo: { owner: "owner", repo: "repo" },
    eventName: "push",
    ref: "refs/heads/main",
    sha: "abc123",
  },
}));

jest.mock("@actions/core");
jest.mock("axios");

beforeEach(() => {
  jest.resetAllMocks();
});

describe("run function", () => {
  it("should fail if data input is not valid JSON", async () => {
    (core.getInput as jest.Mock)
      .mockReturnValueOnce("invalid JSON") // data
      .mockReturnValueOnce("webhook-url") // webhookUrl
      .mockReturnValueOnce("bearer-token"); // bearerToken

    await run();

    expect(core.setFailed).toHaveBeenCalledWith(
      "Additional data is not a valid JSON string"
    );
  });

  it("should call axios with correct parameters if data input is valid JSON", async () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.post.mockResolvedValue({});

    (core.getInput as jest.Mock)
      .mockReturnValueOnce('{"key":"value"}') // data
      .mockReturnValueOnce("webhook-url") // webhookUrl
      .mockReturnValueOnce("bearer-token"); // bearerToken

    await run();

    expect(axios.post).toHaveBeenCalledWith(
      "webhook-url",
      {
        branch: "main",
        data: { key: "value" },
        eventName: "push",
        owner: "owner",
        repo: "repo",
        sha: "abc123",
      },
      { headers: { Authorization: "Bearer bearer-token" } }
    );
  });

  it("should set action as failed if axios post request fails", async () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.post.mockRejectedValue(new Error("Request failed"));

    (core.getInput as jest.Mock)
      .mockReturnValueOnce('{"key":"value"}') // data
      .mockReturnValueOnce("webhook-url") // webhookUrl
      .mockReturnValueOnce("bearer-token"); // bearerToken

    await run();

    expect(core.setFailed).toHaveBeenCalledWith("Request failed");
  });

  it("should not set action as failed if axios post request succeeds", async () => {
    const mockAxios = axios as jest.Mocked<typeof axios>;
    mockAxios.post.mockResolvedValue({});

    (core.getInput as jest.Mock)
      .mockReturnValueOnce('{"key":"value"}') // data
      .mockReturnValueOnce("webhook-url") // webhookUrl
      .mockReturnValueOnce("bearer-token"); // bearerToken

    (github.context.repo as any) = { owner: "owner", repo: "repo" };

    await run();

    expect(core.setFailed).not.toHaveBeenCalled();
  });
});
