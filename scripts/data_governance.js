console.log('Data Governance Script version: 2023-05-13-003');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';
const viewName = 'Data Governance';

let allData = [];
let filteredData = [];
const itemsPerPage = 50;
let currentPage = 1;

async function fetchAirtableData(offset = null) {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = new URL(baseUrl);
    url.searchParams.append('view', viewName);
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
            console.error('Response not OK:', response.status, response.statusText, errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Data received:', data);
        return data;
    } catch (error) {
        console.error('Error in fetchAirtableData:', error);
        throw error;
    }
}

async function fetchAllData() {
    let allRecords = [];
    let offset = null;
    do {
        try {
            const data = await fetchAirtableData(offset);
            allRecords = allRecords.concat(data.records);
            offset = data.offset;
            console.log(`Fetched ${allRecords.length} records so far.`);
        } catch (error) {
            console.error('Error in fetchAllData:', error);
            throw error;
        }
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
        const title = item.fields.Title || 'No Title';
        const url = item.fields.URL || '#';
        const summary = item.fields['Short Summary'] || 'No summary available';
        
        html += `<li>
            <a href="${url}" target="_blank"><strong>${title}</strong></a><br>
            ${summary}<br>
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
    const searchForm = document.getElementById('searchForm');
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        performSearch();
    });
}

function performSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    filteredData = allData.filter(item => {
        const title = item.fields.Title ? item.fields.Title.toLowerCase() : '';
        const summary = item.fields['Short Summary'] ? item.fields['Short Summary'].toLowerCase() : '';
        
        return title.includes(searchTerm) || summary.includes(searchTerm);
    });
    
    currentPage = 1;
    displayData();
    updateRecordCount(filteredData.length);
}

async function init() {
    try {
        document.getElementById('content').innerHTML = '<p>Loading data...</p>';
        allData = await fetchAllData();
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

document.addEventListener('DOMContentLoaded', init);