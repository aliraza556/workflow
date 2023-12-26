import axios from 'axios';
import { writeFileSync } from 'fs';

const username = 'trilogy-group'; // Replace with your GitHub username
const repo = 'alpha-coach-bot'; // Replace with your repository name
const token = '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'; // Replace with your GitHub personal access token

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

async function fetchAllClosedPullRequests(page = 1, allPullRequests = []) {
  const url = `https://api.github.com/repos/${username}/${repo}/pulls?state=closed&page=${page}`;

  const response = await axios.get(url, {
    headers: {
      'Authorization': `token ${token}`
    }
  });

  const pullRequests = response.data;
  if (pullRequests.length === 0) {
    return allPullRequests;
  } else {
    return fetchAllClosedPullRequests(page + 1, allPullRequests.concat(pullRequests));
  }
}

async function listPullRequestsAndComments() {
  try {
    const allClosedPullRequests = await fetchAllClosedPullRequests();

    const commentsPromises = allClosedPullRequests.map((pr: any) =>
      fetchPullRequestComments(pr.number));

    const commentsArrays = await Promise.all(commentsPromises);

    const comments = commentsArrays.flat();

    writeFileSync('closed-comments.json', JSON.stringify(comments, null, 2));
    console.log("Comments saved to closed-pr-comments.json");

  } catch (error) {
    console.error("Error fetching closed pull requests:", error);
  }
}

listPullRequestsAndComments();
