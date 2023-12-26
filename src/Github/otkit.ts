import { Octokit } from "@octokit/rest";
import { writeFileSync } from 'fs';

const octokit = new Octokit({
  auth: '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'
});

const username = 'trilogy-group';
const repo = 'alpha-coach-bot';

async function fetchPullRequestComments(prNumber: any) {
  try {
    const { data } = await octokit.rest.pulls.listReviewComments({
      owner: username,
      repo: repo,
      pull_number: prNumber,
    });
    return data;
  } catch (error) {
    console.error(`Error fetching comments for PR #${prNumber}:`, error);
    return [];
  }
}

async function listPullRequestsAndComments() {
  let page = 1;
  let allClosedPullRequests: any[] = [];
  const endDate = new Date('2023-12-02');
  const startDate = new Date('2023-11-15');

  try {
    while (true) {
      const { data: closedPullRequests } = await octokit.rest.pulls.list({
        owner: username,
        repo: repo,
        state: 'closed',
        per_page: 100,
        page: page,
      });

      if (closedPullRequests.length === 0) break;


      allClosedPullRequests = allClosedPullRequests.concat(
          closedPullRequests.filter(pr => {
            if (pr.closed_at === null) {
              return false; // Skip PRs with null closed_at date
            }
            const closedAt = new Date(pr.closed_at);
            return closedAt >= startDate && closedAt <= endDate;
          })
      );

      page++;
    }

    const commentsPromises = allClosedPullRequests.map(pr =>
      fetchPullRequestComments(pr.number));

    const commentsArrays = await Promise.all(commentsPromises);

    const formattedComments = commentsArrays.flat().map(comment => ({
      url: comment.url,
      id: comment.id,
      diff_hunk: comment.diff_hunk,
      user: {
        id: comment.user.id,
      },
      body: comment.body,
    }));

    writeFileSync('test-3.json', JSON.stringify(formattedComments, null, 2));
    console.log("Comments saved to test-3.json");

  } catch (error) {
    console.error("Error fetching closed pull requests:", error);
  }
}

listPullRequestsAndComments();
