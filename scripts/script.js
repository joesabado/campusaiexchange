console.log('Script version: 2023-05-12-007');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';
const latestViewName = 'Latest';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;
let isSearching = false;

async function fetchAirtableData(view = null, offset = null, maxRecords = null) {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = new URL(baseUrl);
    if (view) url.searchParams.append('view', view);
    if (offset) url.searchParams.append('offset', offset);
    if (maxRecords) url.searchParams.append('maxRecords', maxRecords);
    url.searchParams.append('sort[0][field]', 'Time Added');
    url.searchParams.append('sort[0][direction]', 'desc');

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

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function fetchInitialData() {
    console.log('Fetching initial data...');
    const data = await fetchAirtableData(latestViewName, null, 50);
    console.log('Initial data received:', data.records.length, 'items');
    return data.records.slice(0, 50); // Ensure we only return 50 records
}

async function fetchAllData() {
    let allRecords = [];
    let offset = null;
    do {
        const data = await fetchAirtableData(null, offset);
        allRecords = allRecords.concat(data.records);
        offset = data.offset;
        console.log(`Fetched ${allRecords.length} records so far.`);
    } while (offset);
    return allRecords;
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

function updateRecordCount(count) {
    const recordCountDiv = document.getElementById('recordCount');
    if (allData.length > count) {
        recordCountDiv.innerHTML = `<p>Displaying ${count} of ${allData.length} total records. Use search to access all records.</p>`;
    } else {
        recordCountDiv.innerHTML = `<p>Total records: ${count}</p>`;
    }
}

function setupPagination() {
    const prevButton = document.getElementById('prevPageTop');
    const nextButton = document.getElementById('nextPageTop');

    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayData();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < Math.ceil(filteredData.length / itemsPerPage)) {
            currentPage++;
            displayData();
        }
    });
}

function updatePaginationInfo() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const pageInfo = document.getElementById('currentPageTop');
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
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

async function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    console.log('Searching for:', searchTerm);
    
    if (!isSearching && searchTerm) {
        isSearching = true;
        document.getElementById('content').innerHTML = '<p>Searching...</p>';
        
        if (allData.length === 0) {
            console.log('Fetching all data for search...');
            allData = await fetchAllData();
        }
        
        filteredData = allData.filter(item => {
            const title = item.fields.Title ? item.fields.Title.toLowerCase() : '';
            const summary = item.fields['Short Summary'] ? item.fields['Short Summary'].toLowerCase() : '';
            
            return title.includes(searchTerm) || summary.includes(searchTerm);
        });
        
        console.log(`Search results: ${filteredData.length} items found`);
        currentPage = 1;
        displayData();
        updateRecordCount(filteredData.length);
        isSearching = false;
    } else if (!searchTerm) {
        filteredData = allData.slice(0, 50);
        currentPage = 1;
        displayData();
        updateRecordCount(filteredData.length);
    }
}

async function init() {
    try {
        console.log('Initializing...');
        document.getElementById('content').innerHTML = '<p>Loading initial data...</p>';
        allData = await fetchInitialData();
        filteredData = allData;
        updateRecordCount(allData.length);
        displayData();
        setupSearch();
        setupPagination();
    } catch (error) {
        console.error('Error in initialization:', error);
        document.getElementById('content').innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM content loaded');
    init();
});

function preventFormSubmission(event) {
    event.preventDefault();
}

document.querySelector('form')?.addEventListener('submit', preventFormSubmission);
