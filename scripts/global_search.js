console.log('Global Search Script version: 2023-05-14-003');

const AIRTABLE_API_KEY = 'patbL8p7Pmy3Wpwlh.41d17501ee07102e1d63590b972f73de0736a3db992b5bd9a5f2482a9b666774';
const AIRTABLE_BASE_ID = 'apphtyz3OAaOMcBM5';
const tableName = 'Contents';

async function performGlobalSearch(searchTerm) {
    const baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
    const url = new URL(baseUrl);
    url.searchParams.append('filterByFormula', `OR(SEARCH("${searchTerm}", LOWER({Title})), SEARCH("${searchTerm}", LOWER({Short Summary})))`);

    try {
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
        console.error('Error in global search:', error);
        throw error;
    }
}

function displaySearchResults(results) {
    const contentDiv = document.getElementById('content');
    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }

    if (results.length === 0) {
        contentDiv.innerHTML = '<p>No results found</p>';
        return;
    }

    let html = '<ul>';
    results.forEach(item => {
        const title = item.fields.Title || 'No Title';
        const url = item.fields.URL || '#';
        const summary = item.fields['Short Summary'] || 'No summary available';
        
        html += `<li>
            <a href="${url}" target="_blank"><strong>${title}</strong></a>
            <p>${summary}</p>
        </li>`;
    });
    html += '</ul>';

    contentDiv.innerHTML = html;
}

function setupGlobalSearch() {
    console.log('Setting up global search...');
    const searchForm = document.getElementById('globalSearchForm');
    const searchInput = document.getElementById('globalSearchInput');

    if (!searchForm) {
        console.error('Global search form not found');
        return;
    }

    if (!searchInput) {
        console.error('Global search input not found');
        return;
    }

    console.log('Adding event listener to search form...');
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            try {
                const results = await performGlobalSearch(searchTerm);
                displaySearchResults(results);
            } catch (error) {
                console.error('Error performing global search:', error);
                document.getElementById('content').innerHTML = '<p>An error occurred while searching. Please try again.</p>';
            }
        }
    });
    console.log('Global search setup complete.');
}

// Export the setupGlobalSearch function
window.setupGlobalSearch = setupGlobalSearch;