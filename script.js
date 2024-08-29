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

// Pagination variables
let currentPage = 1;
const itemsPerPage = 10;

function displayData(data) {
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = ''; // Clear existing content

    if (!Array.isArray(data) || data.length === 0) {
        contentDiv.innerHTML = '<p>No data available</p>';
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPageData = data.slice(startIndex, endIndex);

    // Display current page data
    currentPageData.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'item';
        
        // Assuming 'fields' exists in your data structure
        const fields = item.fields || {};
        
        itemDiv.innerHTML = `
            <h2 class="item-name">${fields.Title || 'Unnamed'}</h2>
            <p class="item-description">${fields.URL || 'No description'}</p>
        `;
        
        contentDiv.appendChild(itemDiv);
    });

    // Add pagination controls
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.innerHTML = `
        <button id="prevPage" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
        <span>Page ${currentPage} of ${totalPages}</span>
        <button id="nextPage" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
    `;
    contentDiv.appendChild(paginationDiv);

    // Add event listeners for pagination buttons
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData(data);
        }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayData(data);
        }
    });
}
