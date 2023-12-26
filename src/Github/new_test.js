"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = require("@octokit/rest");
var fs_1 = require("fs");
var octokit = new rest_1.Octokit({
    auth: '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'
});
var username = 'trilogy-group';
var repo = 'alpha-coach-bot';
function fetchPullRequestComments(prNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var data, comments, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.rest.pulls.listReviewComments({
                            owner: username,
                            repo: repo,
                            pull_number: prNumber,
                        })];
                case 1:
                    data = (_a.sent()).data;
                    comments = data.map(function (comment) { return ({
                        id: comment.id,
                        user: {
                            login: comment.user.login
                        },
                        body: comment.body,
                        updated_at: comment.updated_at
                    }); });
                    // Sort the comments based on updated_at in descending order
                    comments.sort(function (a, b) { return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(); });
                    return [2 /*return*/, {
                            'comments-count': comments.length,
                            comments: comments
                        }];
                case 2:
                    error_1 = _a.sent();
                    console.error("Error fetching comments for PR #".concat(prNumber, ":"), error_1);
                    return [2 /*return*/, {
                            'comments-count': 0,
                            comments: []
                        }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function fetchCommentsFromPullRequests(pullRequests) {
    return __awaiter(this, void 0, void 0, function () {
        var commentsByPR, _i, pullRequests_1, pr, _a, bodyCount, comments;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commentsByPR = {};
                    _i = 0, pullRequests_1 = pullRequests;
                    _b.label = 1;
                case 1:
                    if (!(_i < pullRequests_1.length)) return [3 /*break*/, 4];
                    pr = pullRequests_1[_i];
                    return [4 /*yield*/, fetchPullRequestComments(pr.number)];
                case 2:
                    _a = _b.sent(), bodyCount = _a["comments-count"], comments = _a.comments;
                    if (comments.length > 0) {
                        commentsByPR[pr.number] = __spreadArray([{ 'comments-count': bodyCount }], comments, true);
                    }
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/, commentsByPR];
            }
        });
    });
}
function fetchCommentsByDate(startDate, endDate) {
    return __awaiter(this, void 0, void 0, function () {
        var page, allClosedPullRequests, start, end, closedPullRequests, filteredPullRequests, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    page = 1;
                    allClosedPullRequests = [];
                    start = new Date(startDate);
                    end = new Date(endDate);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    _a.label = 2;
                case 2:
                    if (!true) return [3 /*break*/, 4];
                    return [4 /*yield*/, octokit.rest.pulls.list({
                            owner: username,
                            repo: repo,
                            state: 'closed',
                            per_page: 100,
                            page: page,
                        })];
                case 3:
                    closedPullRequests = (_a.sent()).data;
                    if (closedPullRequests.length === 0)
                        return [3 /*break*/, 4];
                    filteredPullRequests = closedPullRequests.filter(function (pr) {
                        if (pr.closed_at === null) {
                            return false;
                        }
                        var closedAt = new Date(pr.closed_at);
                        return closedAt >= start && closedAt <= end;
                    });
                    if (filteredPullRequests.length === 0)
                        return [3 /*break*/, 4];
                    allClosedPullRequests = allClosedPullRequests.concat(filteredPullRequests.map(function (pr) { return ({ number: pr.number }); }));
                    page++;
                    return [3 /*break*/, 2];
                case 4: return [4 /*yield*/, fetchCommentsFromPullRequests(allClosedPullRequests)];
                case 5: return [2 /*return*/, _a.sent()];
                case 6:
                    error_2 = _a.sent();
                    console.error("Error fetching closed pull requests:", error_2);
                    return [2 /*return*/, {}];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function fetchLatestClosedPullRequests(count) {
    return __awaiter(this, void 0, void 0, function () {
        var closedPullRequests, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, octokit.rest.pulls.list({
                            owner: username,
                            repo: repo,
                            state: 'closed',
                            per_page: count,
                            page: 1,
                        })];
                case 1:
                    closedPullRequests = (_a.sent()).data;
                    return [2 /*return*/, closedPullRequests.map(function (pr) { return ({ number: pr.number }); })];
                case 2:
                    error_3 = _a.sent();
                    console.error("Error fetching latest closed pull requests:", error_3);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var dateWiseComments, latest50PRs, commentsForLatest50PRs;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetchCommentsByDate('2023-11-15', '2023-12-02')];
                case 1:
                    dateWiseComments = _a.sent();
                    (0, fs_1.writeFileSync)('date-wise-comments.json', JSON.stringify(dateWiseComments, null, 2));
                    console.log("Date-wise comments saved to date-wise-comments.json");
                    return [4 /*yield*/, fetchLatestClosedPullRequests(50)];
                case 2:
                    latest50PRs = _a.sent();
                    return [4 /*yield*/, fetchCommentsFromPullRequests(latest50PRs)];
                case 3:
                    commentsForLatest50PRs = _a.sent();
                    (0, fs_1.writeFileSync)('latest-50-pr-comments.json', JSON.stringify(commentsForLatest50PRs, null, 2));
                    console.log("Comments for the latest 50 closed PRs saved to latest-50-pr-comments.json");
                    return [2 /*return*/];
            }
        });
    });
}
main();
