function addTwoDigits(a: number, b: number): number {
    if (!Number.isInteger(a) || !Number.isInteger(b)) {
        throw new Error('Both arguments must be integers.');
    }
    if (a < 0 || a > 9 || b < 0 || b > 9) {
        throw new Error('Both arguments must be single digits (0-9).');
    }
    return a + b;
}

// Example usage
const result = addTwoDigits(5, 3);
console.log(result); // Output will be 8
// const pullRequestUrl = process.env.PULL_REQUEST_URL;
// console.log("Pull Request URL:", pullRequestUrl);

const prUrl = process.env.PR_URL;

if (prUrl) {
  console.log(`Received PR URL: ${prUrl}`);
  // Your logic here
} else {
  console.log("No PR URL provided.");
}
