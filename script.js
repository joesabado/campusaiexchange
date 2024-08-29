document.addEventListener('DOMContentLoaded', function() {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading...</p>';

    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            displayData(data);
        })
        .catch(error => {
            console.error('Error:', error);
            contentDiv.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
        });
});

function displayData(data) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Clear existing content

    if (!Array.isArray(data) || data.length === 0) {
        contentDiv.innerHTML = '<p>No data available</p>';
        return;
    }

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        // Assuming 'fields' exists in your data structure
        const fields = item.fields || {};
        
        itemDiv.innerHTML = `
            <h2 class="item-name">${fields.Title || 'Unnamed'}</h2>
            <p class="item-description">${fields.URL || 'No description'}</p>
            <p class="item-category">Category: ${fields.Url || 'Uncategorized'}</p>
        `;
        
        contentDiv.appendChild(itemDiv);
    });
}
