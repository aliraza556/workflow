import { Octokit } from "@octokit/rest";
import { writeFileSync } from 'fs';


interface CommentsByPR {
    [key: string]: any;
}

const octokit = new Octokit({
    auth: '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'
});

const username = 'trilogy-group';
const repo = 'alpha-coach-bot';

async function fetchPullRequestComments(prNumber: number): Promise<any> {
    try {
        const { data } = await octokit.rest.pulls.listReviewComments({
            owner: username,
            repo: repo,
            pull_number: prNumber,
        });
        const comments = data.map(comment => ({
            id: comment.id,
            user: {
                login: comment.user.login
            },
            body: comment.body,
            updated_at: comment.updated_at
        }));

        comments.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        return {
            'comments-count': comments.length, // Add count here
            comments
        };
    } catch (error) {
        console.error(`Error fetching comments for PR #${prNumber}:`, error);
        return {
            'comments-count': 0,
            comments: []
        };
    }
}

async function fetchCommentsFromPullRequests(pullRequests: { number: number }[]): Promise<CommentsByPR> {
    const commentsByPR: CommentsByPR = {};

    for (const pr of pullRequests) {
        const { 'comments-count': bodyCount, comments } = await fetchPullRequestComments(pr.number);
        if (comments.length > 0) {
            commentsByPR[pr.number] = [ { 'comments-count': bodyCount }, ...comments ];
        }
    }

    return commentsByPR;
}

async function fetchCommentsByDate(startDate: string, endDate: string): Promise<CommentsByPR> {
    let page = 1;
    let allClosedPullRequests: { number: number }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

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
                if(pr.closed_at === null){
                    return false;
                }
                const closedAt = new Date(pr.closed_at);
                return closedAt >= start && closedAt <= end;
            });

            if (filteredPullRequests.length === 0) break;

            allClosedPullRequests = allClosedPullRequests.concat(filteredPullRequests.map(pr => ({ number: pr.number })));
            page++;
        }

        return await fetchCommentsFromPullRequests(allClosedPullRequests);
    } catch (error) {
        console.error("Error fetching closed pull requests:", error);
        return {};
    }
}

async function fetchLatestClosedPullRequests(count: number): Promise<{ number: number }[]> {
    try {
        const { data: closedPullRequests } = await octokit.rest.pulls.list({
            owner: username,
            repo: repo,
            state: 'closed',
            per_page: count,
            page: 1,
        });

        return closedPullRequests.map(pr => ({ number: pr.number }));
    } catch (error) {
        console.error("Error fetching latest closed pull requests:", error);
        return [];
    }
}

async function main() {

    const dateWiseComments = await fetchCommentsByDate('2023-11-15', '2023-12-02');
    writeFileSync('date-wise-comments.json', JSON.stringify(dateWiseComments, null, 2));
    console.log("Date-wise comments saved to date-wise-comments.json");

    const latest50PRs = await fetchLatestClosedPullRequests(50);
    const commentsForLatest50PRs = await fetchCommentsFromPullRequests(latest50PRs);
    writeFileSync('latest-50-pr-comments.json', JSON.stringify(commentsForLatest50PRs, null, 2));
    console.log("Comments for the latest 50 closed PRs saved to latest-50-pr-comments.json");
}

main();
