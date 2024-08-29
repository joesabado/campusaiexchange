document.addEventListener('DOMContentLoaded', function() {
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            console.log(data);
            displayData(data);
        })
        .catch(error => console.error('Error:', error));
});

function displayData(data) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Clear existing content

    data.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        // Customize this part based on your Airtable data structure
        itemDiv.innerHTML = `
            <h2>${item.fields.Name}</h2>
            <p>${item.fields.Description}</p>
            <p>Category: ${item.fields.Category}</p>
        `;
        
        contentDiv.appendChild(itemDiv);
    });
}
