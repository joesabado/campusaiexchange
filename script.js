let currentPage = 1;
const itemsPerPage = 5; // Changed from 10 to 5
let allData = [];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
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
            console.log('Data loaded:', data.length, 'items');
            allData = data;
            displayData();
            setupPagination();
        })
        .catch(error => {
            console.error('Error:', error);
            contentDiv.innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
        });
});

function displayData() {
    console.log('Displaying data for page', currentPage);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allData.slice(startIndex, endIndex);

    let html = '<ul>';
    pageData.forEach(item => {
        html += `<li>${item.title} - ${item.description}</li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
    updatePaginationInfo();
}

function setupPagination() {
    console.log('Setting up pagination');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');

    prevButton.addEventListener('click', () => {
        console.log('Previous button clicked');
        if (currentPage > 1) {
            currentPage--;
            displayData();
        }
    });

    nextButton.addEventListener('click', () => {
        console.log('Next button clicked');
        if (currentPage < Math.ceil(allData.length / itemsPerPage)) {
            currentPage++;
            displayData();
        }
    });
}

function updatePaginationInfo() {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    console.log('Updated pagination info:', currentPageSpan.textContent);
}
