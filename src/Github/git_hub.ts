import axios from 'axios';
import { writeFileSync } from 'fs';

const username = 'trilogy-group';
const repo = 'alpha-coach-bot';
const token = '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';

async function fetchPullRequestComments(prNumber: number): Promise<any[]> {
  const commentsUrl = `https://api.github.com/repos/${username}/${repo}/pulls/${prNumber}/comments`;
  try {
    const response = await axios.get(commentsUrl, {
      headers: {
        'Authorization': `token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for PR #${prNumber}:`, error);
    return [];
  }
}

async function listPullRequestsAndComments() {
  const url = `https://api.github.com/repos/${username}/${repo}/pulls?state=closed`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `token ${token}`
      }
    });

    const closedPullRequests = response.data;

    const commentsPromises = closedPullRequests.map((pr: any) =>
      fetchPullRequestComments(pr.number));

    const commentsArrays = await Promise.all(commentsPromises);

    const comments = commentsArrays.flat();

    writeFileSync('closed-pr-comments.json', JSON.stringify(comments, null, 2));
    console.log("Comments saved to closed-pr-comments.json");

  } catch (error) {
    console.error("Error fetching closed pull requests:", error);
  }
}

listPullRequestsAndComments();
