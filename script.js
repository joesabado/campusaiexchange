console.log('Script version: 2023-05-10-010');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
const itemsPerPage = 5;
let currentPage = 1;

// Function to fetch data from Airtable
async function fetchAirtableData() {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}?maxRecords=10&view=Grid%20view`;
    try {
        console.log('Fetching data from URL:', url);
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });
        console.log('Response status:', response.status);
        console.log('Response headers:', JSON.stringify(Array.from(response.headers.entries())));
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        const data = await response.json();
        console.log('Data received:', JSON.stringify(data, null, 2));
        return data.records;
    } catch (error) {
        console.error('Fetch error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
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
            displayData();
            setupPagination();
        })
        .catch(error => {
            console.error('Error in main execution:', error);
            contentDiv.innerHTML = `<p class="error">Error loading data from ${tableName} table: ${error.name} - ${error.message}</p>`;
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
    console.log(`Displaying data from ${tableName} table for page`, currentPage);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = allData.slice(startIndex, endIndex);

    let html = '<ul>';
    pageData.forEach(item => {
        html += `<li>${item.fields.Title} - ${item.fields.URL}</li>`;
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
    console.log('Updated pagination info:', `Page ${currentPage} of ${totalPages}`);
}
