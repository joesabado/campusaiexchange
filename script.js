<<<<<<< HEAD
console.log('Script version: 2023-05-10-022');
=======
console.log('Script version: 2023-05-10-017');
>>>>>>> origin/main

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;
let isLoading = false;

<<<<<<< HEAD
async function fetchAllAirtableData() {
    let allRecords = [];
    let offset = null;
    let pageCount = 0;

    do {
        pageCount++;
        console.log(`Fetching page ${pageCount}...`);
        try {
            const data = await fetchAirtableData(offset);
            allRecords = allRecords.concat(data.records);
            offset = data.offset;
            console.log(`Fetched ${allRecords.length} records so far. Offset: ${offset}`);
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
        console.log(`Received ${data.records.length} records in this batch`);
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
=======
async function fetchAirtableData(offset = null) {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = offset ? `${baseUrl}?offset=${offset}` : baseUrl;

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
    return data;
>>>>>>> origin/main
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    updateInfo();
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading...</p>';

    loadInitialData();
    setupSearch();
<<<<<<< HEAD
    setupPagination();
=======
    window.addEventListener('scroll', handleScroll);
>>>>>>> origin/main
});

async function loadInitialData() {
    try {
<<<<<<< HEAD
        console.log('Starting to load initial data...');
        const records = await fetchAllAirtableData();
        console.log(`Total data received from ${tableName} table:`, records.length, 'items');
        allData = records;
=======
        const data = await fetchAirtableData();
        console.log(`Initial data received from ${tableName} table:`, data.records.length, 'items');
        allData = data.records;
>>>>>>> origin/main
        filteredData = allData;
        updateRecordCount(allData.length);
        displayData();
    } catch (error) {
        console.error('Error in initial data load:', error);
        document.getElementById('content').innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    }
}

async function loadMoreData() {
    if (isLoading || allData.length >= filteredData.length) return;

    isLoading = true;
    document.getElementById('loadingIndicator').style.display = 'block';

    try {
        const lastRecord = allData[allData.length - 1];
        const data = await fetchAirtableData(lastRecord.id);
        console.log(`Additional data received:`, data.records.length, 'items');
        allData = allData.concat(data.records);
        updateRecordCount(allData.length);
        displayData();
<<<<<<< HEAD
=======

        if (!data.offset) {
            window.removeEventListener('scroll', handleScroll);
        }
>>>>>>> origin/main
    } catch (error) {
        console.error('Error loading more data:', error);
    } finally {
        isLoading = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

<<<<<<< HEAD
=======
function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadMoreData();
    }
}

>>>>>>> origin/main
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
<<<<<<< HEAD
    console.log(`Displaying data for page ${currentPage}`);
    const contentDiv = document.getElementById('content');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    let html = '<ul>';
    pageData.forEach(item => {
=======
    console.log(`Displaying data, current total:`, allData.length);
    const contentDiv = document.getElementById('content');
    
    let html = '<ul>';
    allData.forEach(item => {
>>>>>>> origin/main
        html += `<li>
            <strong>${item.fields.Title}</strong><br>
            ${item.fields['Short Summary'] || 'No summary available'}<br>
            <a href="${item.fields.URL}" target="_blank">Link</a>
        </li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
<<<<<<< HEAD
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
=======
>>>>>>> origin/main
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
<<<<<<< HEAD
    currentPage = 1;
=======
>>>>>>> origin/main
    displayData();
    updateRecordCount(filteredData.length);
}
