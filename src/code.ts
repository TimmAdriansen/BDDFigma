import { pollServer } from "./serverFetcher"
import { callFunctionByName } from "./widgets";
// This plugin will open a window to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__);
pollServer();
/*figma.showUI(`<!DOCTYPE html>
<html>
  <body>
    <button id="btn">Click me</button>
    <script>
      document.getElementById('btn').onclick = () => {
        fetch('http://localhost:3000')
          .then(response => response.json())
          .then(data => {
            console.log('Data from server:', data);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      };
    </script>
  </body>
</html>`, { width: 240, height: 100 });*/

// Calls to "parent.postMessage" from within the HTML page will trigger this
// callback. The callback will be passed the "pluginMessage" property of the
// posted message.
figma.ui.onmessage = async (msg) => {
  // One way of distinguishing between different types of messages sent from
  // your HTML page is to use an object with a "type" property like this.
  if (msg.type === 'create-rectangles') {
    const nodes: SceneNode[] = [];
    for (let i = 0; i < msg.count; i++) {
      const rect = figma.createRectangle();
      rect.x = i * 150;
      rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0 } }];
      figma.currentPage.appendChild(rect);
      nodes.push(rect);
    }
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
  }

  if (msg.type === 'xml-drop') {
    console.log(msg.xmlContent);
  }

  /*if (msg.type === 'create-button') {
    const button = figma.createComponent();
    button.resize(100, 50);
    button.fills = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 } }];
    button.cornerRadius = 8;

    const textNode: TextNode = figma.createText(); // Create a new text node
    await setText(textNode, "Your text here");
    button.appendChild(textNode);

    figma.currentPage.appendChild(button);
    figma.currentPage.selection = [button];
    figma.viewport.scrollAndZoomIntoView([button]);
  }*/

  if (msg.type === 'widget-type') {
    const { widgetSpecificType, ...otherParams } = msg.params;
    await callFunctionByName(msg.params.widgetSpecificType)
  }

  if (msg.type === 'newPage') {
    // Create a new page in the Figma document
    const newPage = figma.createPage();

    // Set the name of the new page
    newPage.name = "New Page Name";

    // Optionally, you can switch to the newly created page by
    // setting it as the current page
    figma.currentPage = newPage;

    // Show a message in Figma to indicate that the new page has been created
    figma.notify("New page created successfully!");

  }

  // Make sure to close the plugin when you're done. Otherwise the plugin will
  // keep running, which shows the cancel button at the bottom of the screen.
  figma.closePlugin();
};
