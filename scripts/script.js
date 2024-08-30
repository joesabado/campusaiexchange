console.log('Script version: 2023-05-12-003');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;
let isLoadingMore = false;

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

        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

async function fetchInitialData() {
    console.log('Fetching initial data...');
    const data = await fetchAirtableData();
    console.log('Initial data received:', data.records.length, 'items');
    return data;
}

async function fetchRemainingData(offset) {
    let allRecords = [];
    let currentOffset = offset;

    while (currentOffset) {
        console.log('Fetching more data...');
        const data = await fetchAirtableData(currentOffset);
        allRecords = allRecords.concat(data.records);
        currentOffset = data.offset;
        console.log(`Fetched ${allRecords.length} additional records so far.`);
    }

    console.log(`Total additional records fetched: ${allRecords.length}`);
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
    recordCountDiv.innerHTML = `<p>Total records: ${count}</p>`;
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

async function init() {
    try {
        console.log('Initializing...');
        document.getElementById('content').innerHTML = '<p>Loading initial data...</p>';
        const initialData = await fetchInitialData();
        allData = initialData.records;
        filteredData = allData;
        updateRecordCount(allData.length);
        displayData();
        setupSearch();
        setupPagination();

        // Fetch remaining data in the background
        if (initialData.offset) {
            document.getElementById('recordCount').innerHTML += ' (Loading more...)';
            const remainingData = await fetchRemainingData(initialData.offset);
            allData = allData.concat(remainingData);
            filteredData = allData;
            updateRecordCount(allData.length);
            updatePaginationInfo();
        }
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
