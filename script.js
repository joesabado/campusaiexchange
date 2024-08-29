let allData = [];
const itemsPerPage = 5;
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
            console.log(`Raw data received:`, JSON.stringify(data, null, 2));
            allData = data;
            console.log(`Processed allData:`, JSON.stringify(allData, null, 2));
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
    console.log(`Displaying data for page`, currentPage);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allData.slice(startIndex, endIndex);

    console.log('Page data:', JSON.stringify(pageData, null, 2));

    let html = '<ul>';
    pageData.forEach((item, index) => {
        console.log(`Item ${index}:`, JSON.stringify(item, null, 2));
        html += `<li>${item.title || 'No Title'} - ${item.url || 'No URL'}</li>`;
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
