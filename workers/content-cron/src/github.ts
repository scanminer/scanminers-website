// workers/content-cron/src/github.ts

import type { Env } from './index';

// Helper to interact with GitHub REST API (minimal subset)
export class GitHubClient {
  private apiUrl = 'https://api.github.com';
  private headers: HeadersInit;
  private repo: string;

  constructor(env: Env) {
    this.repo = env.GH_REPO;
    this.headers = {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${env.GH_TOKEN}`,
      'User-Agent': 'Scanminers-Content-Worker',
      'Content-Type': 'application/json',
    } as HeadersInit;
  }

  private async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.apiUrl}/repos/${this.repo}${endpoint}`, {
      ...options,
      headers: this.headers,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API request failed: ${response.status} ${errorText}`);
    }
    return (await response.json()) as T;
  }

  async getMainBranchSha(): Promise<string> {
    const data = await this.request<{ object: { sha: string } }>(`/git/ref/heads/main`);
    return data.object.sha;
  }

  async createBranch(newBranchName: string, baseSha: string): Promise<void> {
    await this.request(`/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${newBranchName}`, sha: baseSha }),
    });
  }

  async branchExists(branchName: string): Promise<boolean> {
    try {
      await this.request(`/git/ref/heads/${branchName}`);
      return true;
    } catch (_) {
      return false;
    }
  }

  async createCommitAndPush(branchName: string, filePath: string, content: string, message: string): Promise<void> {
    // Base64 encode UTF-8 string (Cloudflare Workers support atob/btoa)
    const contentEncoded = btoa(unescape(encodeURIComponent(content)));
    await this.request(`/contents/${filePath}`, {
      method: 'PUT',
      body: JSON.stringify({ message, content: contentEncoded, branch: branchName }),
    });
  }

  async createPullRequest(branchName: string, title: string, body: string): Promise<string> {
    const data = await this.request<{ html_url: string }>(`/pulls`, {
      method: 'POST',
      body: JSON.stringify({ title, head: branchName, base: 'main', body }),
    });
    return data.html_url;
  }
}
