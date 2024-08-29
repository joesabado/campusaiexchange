console.log('Script version: 2023-05-10-012');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
let filteredData = [];
const itemsPerPage = 5;
let currentPage = 1;

// Function to fetch data from Airtable
async function fetchAirtableData() {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=100&view=Grid%20view`;
    try {
        console.log('Fetching data from URL:', url);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data.records;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    updateInfo();
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading...</p>';

    fetchAirtableData()
        .then(data => {
            console.log(`Data received from ${tableName} table:`, data.length, 'items');
            allData = data;
            filteredData = allData;
            displayData();
            setupPagination();
            setupSearch();
        })
        .catch(error => {
            console.error('Error in main execution:', error);
            contentDiv.innerHTML = `<p class="error">Error loading data from ${tableName} table: ${error.message}</p>`;
        });
});

function updateInfo() {
    const updateInfoDiv = document.getElementById('updateInfo');
    const now = new Date();
    const timestamp = now.toISOString();
    const randomNumber = Math.floor(Math.random() * 1000000);
    updateInfoDiv.innerHTML = `
        <p>Last updated: ${timestamp}</p>
        <p>Random number: ${randomNumber}</p>
    `;
}

function displayData() {
    console.log(`Displaying data for page`, currentPage);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);

    let html = '<ul>';
    pageData.forEach(item => {
        html += `<li>
            <strong>${item.fields.Title}</strong><br>
            ${item.fields['Short Summary'] || 'No summary available'}<br>
            <a href="${item.fields.URL}" target="_blank">Link</a>
        </li>`;
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
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            currentPage++;
            displayData();
        }
    });
}

function updatePaginationInfo() {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
    console.log('Updated pagination info:', `Page ${currentPage} of ${totalPages}`);
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');

    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            performSearch();
        }
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    filteredData = allData.filter(item => {
        const title = item.fields.Title ? item.fields.Title.toLowerCase() : '';
        const summary = item.fields['Short Summary'] ? item.fields['Short Summary'].toLowerCase() : '';
        return title.includes(searchTerm) || summary.includes(searchTerm);
    });
    currentPage = 1;
    displayData();
}
