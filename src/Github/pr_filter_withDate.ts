import axios from 'axios';
import { writeFileSync } from 'fs';
import { config } from 'dotenv';

// Load environment variables
config();

const username = 'trilogy-group';
const repo = 'alpha-coach-bot';
const token = "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";

async function fetchPullRequestComments(prNumber: any) {
  const commentsUrl = `https://api.github.com/repos/${username}/${repo}/pulls/${prNumber}/comments`;
  try {
    const response = await axios.get(commentsUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
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
      const url = `https://api.github.com/repos/${username}/${repo}/pulls?state=closed&per_page=100&page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const closedPullRequests = response.data;
      if (closedPullRequests.length === 0) break;

      allClosedPullRequests = allClosedPullRequests.concat(
        closedPullRequests.filter((pr: { closed_at: string | number | Date; }) => {
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

    writeFileSync('test-2.json', JSON.stringify(formattedComments, null, 2));
    console.log("Comments saved to closed-pr-comments.json");

  } catch (error) {
    console.error("Error fetching closed pull requests:", error);
  }
}

listPullRequestsAndComments();
