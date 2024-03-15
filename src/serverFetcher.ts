import { callFunctionByName, setTextOfInstance, resetAllPositions, layoutPages} from "./widgets";


export function pollServer(lastPolledTime = Date.now()) {
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
                    //console.log('Data from server:', data);
                    loopData(data);
                    //parent.postMessage({ pluginMessage: { type: 'create-button' } }, '*')
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

interface BrowserWindow {
    page: string;
    widgets: any[];
}

async function loopData(data: string): Promise<void> {
    const targetPageName = "New Page";
    let targetPage = figma.root.children.find(page => page.name === targetPageName);

    if (targetPage) {
        figma.currentPage = targetPage;
        //console.log("Switched to page: " + targetPageName);
    }

    for (const node of figma.currentPage.children) {
        // Check if the node is a frame, component, or instance
        if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE') {
            // Remove the node
            node.remove();
        }
    }
    try {
        const jsonData = JSON.parse(data);
        for (const window of jsonData.BrowserWindows) {
            //await resetAllPositions();
            await callFunctionByName("BrowserWindow", [window.page]);
            //console.log(`Page: ${window.page}`);
            for (const widget of window.widgets) {
                await callFunctionByName(widget.widget, [window.page, widget.id]);
                //console.log(` Widget: Type - ${widget.widget}, ID - ${widget.id}`);
            }
            //await pushToAllPositions();
        }
        layoutPages(); // Call layoutPages after all the asynchronous operations have completed
        resetAllPositions();
    } catch (error) {
        console.error("Error parsing data:", error);
    }
}

