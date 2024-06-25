import { callFunctionByName, resetAllPositions, layoutPages, getVariableCollection } from "./widgets";
import { WidgetStateReactionsBuilder } from "./widgetStateReactionBuilder";

let widgetStateReactionBuilder: WidgetStateReactionsBuilder | null = null;

let containerID = "";


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
                    if (data == "printAllActions") {
                        figma.currentPage.children.forEach(node => {
                            printNodeReactions(node);
                        });
                    } else if (data == "printSelectedActions") {
                        figma.currentPage.selection.forEach(node => {
                            printNodeReactions(node);
                        });
                    } else {
                        loopData(data);
                    }
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
                    await callFunctionByName(widget.widget, [window.page, widget.id, widget.widgets, widget.properties]);
                } else {
                    await callFunctionByName(widget.widget, [window.page, widget.id, widget.properties]);
                }
                //console.log(` Widget: Type - ${widget.widget}, ID - ${widget.id}`);
            }
            //await pushToAllPositions();
        }
        layoutPages(); // Call layoutPages after all the asynchronous operations have completed
        resetAllPositions();
        widgetStateReactionBuilder = new WidgetStateReactionsBuilder(getVariableCollection());

        for (const window of jsonData.BrowserWindows) {
            console.log(window.page);
            processWidgetActions(window.page, window);
        }
        //applyActions();
    } catch (error) {
        console.error("Error parsing data:", error);
    }
}

function processWidgetActions(page: string, widget: any) {
    // Check if the widget has actions and pass them to handleWidgetActions
    if (widget.actions && widget.actions.length > 0) {
        //handleWidgetActions(widget.actions);
        let id = page + ":" + containerID + widget.id
        widget.actions.forEach((action: any) => {
            if (widgetStateReactionBuilder != null) {
                widgetStateReactionBuilder.buildAction(id, action, widget.widget);
            }
        });
    }

    // Check if the widget has a nested list of widgets and recurse through them
    if (widget.widgets && widget.widgets.length > 0) {
        containerID = widget.id + ":"
        widget.widgets.forEach((nestedWidget: any) => processWidgetActions(page, nestedWidget));
    }
    containerID = "";
}

function printNodeReactions(node: any) {
    // Check if the node has a name and reactions are defined
    if (node.name && node.reactions && node.reactions.length > 0) {
        console.log(`Node Name: ${node.name}`);
        console.log('Reactions:', JSON.stringify(node.reactions, null, 2));
    }

    // Recursively call this function for each child node if they exist
    if ('children' in node) {
        for (const child of node.children) {
            printNodeReactions(child);
        }
    }
}