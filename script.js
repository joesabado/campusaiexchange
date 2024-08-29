console.log('Script version: 2023-05-10-017');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;
let isLoading = false;

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
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    updateInfo();
    const contentDiv = document.getElementById('content');
    contentDiv.innerHTML = '<p>Loading...</p>';

    loadInitialData();
    setupSearch();
    window.addEventListener('scroll', handleScroll);
});

async function loadInitialData() {
    try {
        const data = await fetchAirtableData();
        console.log(`Initial data received from ${tableName} table:`, data.records.length, 'items');
        allData = data.records;
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

        if (!data.offset) {
            window.removeEventListener('scroll', handleScroll);
        }
    } catch (error) {
        console.error('Error loading more data:', error);
    } finally {
        isLoading = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function handleScroll() {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 500) {
        loadMoreData();
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
    console.log(`Displaying data, current total:`, allData.length);
    const contentDiv = document.getElementById('content');
    
    let html = '<ul>';
    allData.forEach(item => {
        html += `<li>
            <strong>${item.fields.Title}</strong><br>
            ${item.fields['Short Summary'] || 'No summary available'}<br>
            <a href="${item.fields.URL}" target="_blank">Link</a>
        </li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
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
    displayData();
    updateRecordCount(filteredData.length);
}
