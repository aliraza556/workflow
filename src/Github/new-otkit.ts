import { Octokit } from "@octokit/rest";
import { writeFileSync } from 'fs';

const octokit = new Octokit({
    auth: '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' // Replace with your actual token
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

async function fetchCommentsByDate(startDate: string | number | Date, endDate: string | number | Date) {
    let page = 1;
    let allClosedPullRequests: any[] = [];
    startDate = new Date(startDate);
    endDate = new Date(endDate);

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

            const filteredPullRequests = closedPullRequests.filter(pr => {
                const closedAt = new Date(pr.closed_at);
                return closedAt >= startDate && closedAt <= endDate;
            });

            if (filteredPullRequests.length === 0) break;

            allClosedPullRequests = allClosedPullRequests.concat(filteredPullRequests);
            page++;
        }

        return await fetchCommentsFromPullRequests(allClosedPullRequests);
    } catch (error) {
        console.error("Error fetching closed pull requests:", error);
        return [];
    }
}

async function fetchLastNComments(n: number) {
    let page = 1;
    let allClosedPullRequests: any[] = [];

    try {
        while (allClosedPullRequests.length < n) {
            const { data: closedPullRequests } = await octokit.rest.pulls.list({
                owner: username,
                repo: repo,
                state: 'closed',
                per_page: 100,
                page: page,
            });

            if (closedPullRequests.length === 0) break;

            allClosedPullRequests = allClosedPullRequests.concat(closedPullRequests);
            page++;
        }

        allClosedPullRequests = allClosedPullRequests.slice(0, n);

        return await fetchCommentsFromPullRequests(allClosedPullRequests);
    } catch (error) {
        console.error("Error fetching closed pull requests:", error);
        return [];
    }
}

async function fetchCommentsFromPullRequests(pullRequests: any[]) {
    const commentsPromises = pullRequests.map(pr => fetchPullRequestComments(pr.number));
    const commentsArrays = await Promise.all(commentsPromises);
    const formattedComments = commentsArrays.flat().map(comment => ({
        id: comment.id,
        user: {
            login: comment.user.login,
        },
        body: comment.body,
    }));

    return formattedComments;
}

// Example usage
async function main() {
    const dateWiseComments = await fetchCommentsByDate('2023-11-15', '2023-12-02');
    writeFileSync('date-wise-comments.json', JSON.stringify(dateWiseComments, null, 2));
    console.log("Date-wise comments saved to date-wise-comments.json");

    const last50Comments = await fetchLastNComments(50);
    writeFileSync('last-50-comments.json', JSON.stringify(last50Comments, null, 2));
    console.log("Last 50 comments saved to last-50-comments.json");
}

main();
