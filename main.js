
function pollServer(lastPolledTime = Date.now()) {
    const url = `http://localhost:3000/xmlRequest?lastPolled=${lastPolledTime}`;
    fetch(url)
        .then(response => {
            if (response.status === 204) {
                // No new data, immediately start a new poll
                pollServer(lastPolledTime);
            } else {
                return response.text();
            }
        })
        .then(data => {
            if (data) {
                //console.log('Data from server:', data);
                if (data !== '<empty><empty>') {
                    console.log('Data from server:', data);
                    parent.postMessage({ pluginMessage: { type: 'create-button' } }, '*')
                }
                // Update last polled time and start a new poll
                pollServer(Date.now());
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            // In case of error, you might want to retry after a delay
            setTimeout(() => pollServer(lastPolledTime), 500);
        });
}

// Start polling as soon as the script loads
pollServer();

document.getElementById('btn').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'newPage' } }, '*')
}

document.getElementById('sendWidget').onclick = () => {
    // Get the selected widget type from the dropdown
    const widgetType = document.getElementById('widgetSelector').value;

    // Post a message to the parent with the selected widget type
    parent.postMessage({ pluginMessage: { type: widgetType } }, '*');
}