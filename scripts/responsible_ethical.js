console.log('Data Governance Script version: 2023-05-15-002');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';
const viewName = 'Responsible and Ethical AI';

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

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching Airtable data:', error);
        throw error;
    }
}

async function fetchAllData() {
    let allRecords = [];
    let offset = null;

    do {
        const data = await fetchAirtableData(offset);
        allRecords = allRecords.concat(data.records);
        offset = data.offset;
    } while (offset);

    return allRecords;
}

function displayData() {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    const contentDiv = document.getElementById('content');
    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }
    
    let html = '<ul>';
    pageData.forEach((item, index) => {
        const title = item.fields.Title || 'No Title';
        const url = item.fields.URL || '#';
        const summary = item.fields['Short Summary'] || 'No summary available';
        
        html += `<li>
            <a href="${url}" target="_blank"><strong>${title}</strong></a><br>
            ${summary}
        </li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
    updatePaginationInfo();
}

function updateRecordCount(count) {
    const recordCountDiv = document.getElementById('recordCount');
    if (recordCountDiv) {
        recordCountDiv.textContent = `Total Records: ${count}`;
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
    const currentPageSpan = document.getElementById('currentPageTop');
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
}

async function init() {
    try {
        console.log('Initializing...');
        document.getElementById('content').innerHTML = '<p>Loading data...</p>';
        allData = await fetchAllData();
        filteredData = allData;
        updateRecordCount(allData.length);
        displayData();
        setupPagination();
    } catch (error) {
        console.error('Error in initialization:', error);
        document.getElementById('content').innerHTML = `<p class="error">Error loading data: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', init);