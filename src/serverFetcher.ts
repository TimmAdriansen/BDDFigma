import { callFunctionByName, resetAllPositions, layoutPages, applyActions } from "./widgets";


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
                    console.log('Data from server:', data);
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


async function loopData(data: string): Promise<void> {
    const targetPageName = "New Page";
    let targetPage = figma.root.children.find(page => page.name === targetPageName);

    if (targetPage) {
        figma.currentPage = targetPage;
        //console.log("Switched to page: " + targetPageName);
    }

    //console.log(figma.currentPage.children);

    for (const node of figma.currentPage.children) {
        // Check if the node is a frame, component, or instance
        if (node.type === 'FRAME' || node.type === 'COMPONENT' || node.type === 'INSTANCE' || node.type === "COMPONENT_SET") {
            // Remove the node
            node.remove();
        }
    }

    const localCollections = figma.variables.getLocalVariableCollections();

    const collection = localCollections.find((c) => c.name === 'new-collection');

    collection?.remove();


    try {
        const jsonData = JSON.parse(data);
        let first = true;
        for (const window of jsonData.BrowserWindows) {
            //await resetAllPositions();
            await callFunctionByName("BrowserWindow", [window.page, first]);
            first = false;
            //console.log(`Page: ${window.page}`);
            for (const widget of window.widgets) {
                if (widget.widget === "FieldSet" || widget.widget === "DropdownList" || widget.widget === "ListBox" || widget.widget === "Menu" || widget.widget === "ModalWindow" || widget.widget === "WindowDialog") {
                    await callFunctionByName(widget.widget, [window.page, widget.id, widget.widgets]);
                } else {
                    await callFunctionByName(widget.widget, [window.page, widget.id]);
                }
                //console.log(` Widget: Type - ${widget.widget}, ID - ${widget.id}`);
            }
            //await pushToAllPositions();
        }
        layoutPages(); // Call layoutPages after all the asynchronous operations have completed
        resetAllPositions();
        //applyActions();
    } catch (error) {
        console.error("Error parsing data:", error);
    }
}

