// Assuming you have a file called data.json in the public directory
fetch('date-wise-comments.json')
    .then(function (response) { return response.json(); })
    .then(function (data) {
    displayData(data);
})
    .catch(function (error) { return console.error('Error:', error); });
function displayData(data) {
    var container = document.getElementById('data-container');
    if (container) {
        Object.keys(data).forEach(function (key) {
            var section = document.createElement('div');
            section.innerHTML = "<h2>Section ".concat(key, "</h2>");
            data[key].forEach(function (item) {
                var commentDiv = document.createElement('div');
                commentDiv.innerHTML = "\n          <p>Comment ID: ".concat(item.id ? item.id : 'N/A', "</p>\n          <p>User: ").concat(item.user ? item.user.login : 'Anonymous', "</p>\n          <p>Body: ").concat(item.body ? item.body : 'No content', "</p>\n          <p>Updated at: ").concat(item.updated_at ? item.updated_at : 'Unknown', "</p>\n        ");
                section.appendChild(commentDiv);
            });
            container.appendChild(section);
        });
    }
}
