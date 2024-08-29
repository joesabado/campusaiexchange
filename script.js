console.log('Script version: 2023-05-10-026');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;
let isLoading = false;

async function testAirtableConnection() {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = new URL(baseUrl);
    url.searchParams.append('maxRecords', '1');

    console.log('Testing Airtable connection...');
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Airtable connection test successful. Sample data:', data);
        return true;
    } catch (error) {
        console.error('Airtable connection test failed:', error);
        return false;
    }
}

async function fetchAllAirtableData() {
    let allRecords = [];
    let offset = null;
    let pageCount = 0;

    do {
        pageCount++;
        console.log(`Fetching page ${pageCount}...`);
        try {
            const data = await fetchAirtableData(offset);
            if (data && data.records) {
                allRecords = allRecords.concat(data.records);
                offset = data.offset;
                console.log(`Fetched ${allRecords.length} records so far. Offset: ${offset}`);
            } else {
                console.error('Unexpected data structure:', data);
                break;
            }
        } catch (error) {
            console.error(`Error fetching page ${pageCount}:`, error);
            break;
        }
    } while (offset);

    console.log(`Total records fetched: ${allRecords.length}`);
    return allRecords;
}

async function fetchAirtableData(offset = null) {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = new URL(baseUrl);
    url.searchParams.append('pageSize', '100');
    if (offset) {
        url.searchParams.append('offset', offset);
    }

    console.log('Fetching data from URL:', url.toString());
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log(`Received ${data.records ? data.records.length : 0} records in this batch`);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    updateInfo();
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Testing connection...</p>';

    testConnection();
});

async function testConnection() {
    const connectionSuccessful = await testAirtableConnection();
    if (connectionSuccessful) {
        loadInitialData();
        setupSearch();
        setupPagination();
    } else {
        document.getElementById('content').innerHTML = '<p class="error">Failed to connect to Airtable. Please check your API key and base ID.</p>';
    }
}

async function loadInitialData() {
    try {
        console.log('Starting to load initial data...');
        const records = await fetchAllAirtableData();
        console.log(`Total data received from ${tableName} table:`, records.length, 'items');
        allData = records;
        filteredData = allData;
        updateRecordCount(allData.length);
        displayData();
    } catch (error) {
        console.error('Error in initial data load:', error);
        document.getElementById('content').innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    }
}

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

function updateRecordCount(count) {
    const recordCountDiv = document.getElementById('recordCount');
    recordCountDiv.innerHTML = `<p>Total records: ${count}</p>`;
}

function displayData() {
    console.log(`Displaying data for page ${currentPage}`);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    console.log(`Displaying records ${startIndex + 1} to ${endIndex} of ${filteredData.length}`);
    
    if (pageData.length === 0) {
        contentDiv.innerHTML = '<p>No data to display</p>';
        return;
    }
    
    let html = '<ul>';
    pageData.forEach((item, index) => {
        console.log(`Processing item ${startIndex + index + 1}:`, item);
        html += `<li>
            <strong>${item.fields.Title || 'No Title'}</strong><br>
            ${item.fields['Short Summary'] || 'No summary available'}<br>
            <a href="${item.fields.URL || '#'}" target="_blank">Link</a>
        </li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
    updatePaginationInfo();
}

function setupPagination() {
    const prevButtons = document.querySelectorAll('#prevPageTop, #prevPageBottom');
    const nextButtons = document.querySelectorAll('#nextPageTop, #nextPageBottom');

    prevButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayData();
            }
        });
    });

    nextButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
                currentPage++;
                displayData();
            }
        });
    });
}

function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pageInfos = document.querySelectorAll('#currentPageTop, #currentPageBottom');
    pageInfos.forEach(span => {
        span.textContent = `Page ${currentPage} of ${totalPages}`;
    });
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
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('Searching for:', searchTerm);
    
    filteredData = allData.filter(item => {
        const title = item.fields.Title ? item.fields.Title.toLowerCase() : '';
        const summary = item.fields['Short Summary'] ? item.fields['Short Summary'].toLowerCase() : '';
        
        return title.includes(searchTerm) || summary.includes(searchTerm);
    });
    
    console.log(`Search results: ${filteredData.length} items found`);
    currentPage = 1;
    displayData();
    updateRecordCount(filteredData.length);
}
