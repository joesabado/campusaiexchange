console.log('Script version: 2023-05-10-001');

let allData = [];
const itemsPerPage = 5; // Changed to 5
let currentPage = 1;
const tableName = 'Contents';

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
            console.log(`Data received from ${tableName} table:`, data.length, 'items');
            allData = data;
            displayData();
            setupPagination();
        })
        .catch(error => {
            console.error('Error:', error);
            contentDiv.innerHTML = `<p class="error">Error loading data from ${tableName} table: ${error.message}</p>`;
        });

    // Display update indicators
    const bodyComments = document.body.childNodes;
    let lastUpdated = '';
    let randomNumber = '';
    for (let node of bodyComments) {
        if (node.nodeType === Node.COMMENT_NODE) {
            if (node.textContent.includes('Last updated:')) {
                lastUpdated = node.textContent.trim();
            } else if (node.textContent.includes('Random number:')) {
                randomNumber = node.textContent.trim();
            }
        }
    }
    const indicatorsDiv = document.createElement('div');
    indicatorsDiv.innerHTML = `
        <p>${lastUpdated}</p>
        <p>${randomNumber}</p>
    `;
    document.body.insertBefore(indicatorsDiv, document.body.firstChild);
});

function displayData() {
    console.log(`Displaying data from ${tableName} table for page`, currentPage);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allData.slice(startIndex, endIndex);

    let html = '<ul>';
    pageData.forEach(item => {
        html += `<li>${item.title} - ${item.url}</li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
    updatePaginationInfo();
}

function setupPagination() {
    console.log('Setting up pagination');
    const prevButtons = document.querySelectorAll('.prevPage');
    const nextButtons = document.querySelectorAll('.nextPage');

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Previous button clicked');
            if (currentPage > 1) {
                currentPage--;
                displayData();
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log('Next button clicked');
            if (currentPage < Math.ceil(allData.length / itemsPerPage)) {
                currentPage++;
                displayData();
            }
        });
    });
}

function updatePaginationInfo() {
    const currentPageSpans = document.querySelectorAll('.currentPage');
    const totalPages = Math.ceil(allData.length / itemsPerPage);
    currentPageSpans.forEach(span => {
        span.textContent = `Page ${currentPage} of ${totalPages}`;
    });
    console.log('Updated pagination info:', `Page ${currentPage} of ${totalPages}`);
}
