type FunctionMap = {
    [key: string]: (...args: any[]) => void;
};

const startOffset = { x: 50, y: 200 }; // Starting position for the first instance
const gridSpacing = { x: 20, y: 20 }; // Spacing between instances

async function button(page: string, title: string): Promise<void> {
    const component = findComponentByName("Size=Regular, Type=Primary, State=Default");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGrid(component, currentFrame, startOffset, gridSpacing);

    if (newInstance) {
        await setTextOfInstance(newInstance, title);
    }

}

async function browserWindow(title: string): Promise<void> {

    try {
        const frame = figma.createFrame();
        frame.name = title;
        frame.resize(1200, 900);
        const maxX = 1000;
        const maxY = 1000;
        frame.x = Math.floor(Math.random() * maxX);
        frame.y = Math.floor(Math.random() * maxY);
        figma.currentPage.appendChild(frame);

        const textNode = figma.createText();

        const font: FontName = { family: "Roboto", style: "Regular" };

        await figma.loadFontAsync(font);

        textNode.fontName = font;
        textNode.characters = title;
        textNode.fontSize = 42;

        await figma.loadFontAsync(textNode.fontName as FontName);

        const textWidth = textNode.width;
        const frameWidth = frame.width;
        const positionX = (frameWidth - textWidth) / 2;
        const positionY = 50;

        textNode.x = positionX;
        textNode.y = positionY;

        frame.appendChild(textNode);


    } catch (error) {
        console.error("Failed to create frame:", error);

        // Check if the error has a message property
        if (typeof error === "object" && error !== null && "message" in error) {
            figma.notify(`Failed to create frame: ${(error as Error).message}`);
        } else {
            // If the error does not have a message, or if it's not an object
            figma.notify(`Failed to create frame: Unknown error`);
        }
    }

}

const functionMap: FunctionMap = {
    "Button": button,
    "BrowserWindow": browserWindow
};

export async function callFunctionByName(functionName: string, params: any[] = []): Promise<void> {
    if (functionMap[functionName]) {
        await functionMap[functionName](...params);
    } else {
        console.log("Function not found for:", functionName);
    }
}

//callFunctionByName("button");
//callFunctionByName("page", ["My Page", "http://example.com"]);


export async function setText(node: TextNode, text: string): Promise<void> {
    // Ensure the node is a text node and has a fontName property
    if (node.fontName === figma.mixed) {
        console.error("The text node has mixed fonts and cannot be set directly.");
        return;
    }

    // Load the font for the text node
    const font: FontName = node.fontName as FontName;
    await figma.loadFontAsync(font);

    // Now that the font is loaded, set the text
    node.characters = text;
}

function findComponentByName(name: string): ComponentNode | null {
    const components = figma.root.findAll(node => node.type === "COMPONENT" && node.name === name) as ComponentNode[];
    return components.length > 0 ? components[0] : null;
}

function findFrameByName(name: string): FrameNode | null {
    const frame = figma.currentPage.findOne(node => node.type === "FRAME" && node.name === name) as FrameNode | null;
    return frame;
}

function createInstanceInGrid(component: ComponentNode | null, targetFrame: FrameNode | null, startOffset: { x: number, y: number }, gridSpacing: { x: number, y: number }): InstanceNode | null {
    if (!component) {
        console.error("Component not found.");
        return null;
    }

    if (!targetFrame || targetFrame.type !== "FRAME") {
        console.error("Target frame is not a frame or not set.");
        return null;
    }

    // Calculate the position for the new instance
    let maxX = startOffset.x;
    let maxY = startOffset.y;
    let newRow = false;

    targetFrame.children.forEach(child => {
        if (child.type === "INSTANCE" && child.mainComponent === component) {
            maxX = Math.max(maxX, child.x + child.width + gridSpacing.x);

            // Check if we need to start a new row
            if (maxX + component.width + gridSpacing.x > targetFrame.width) {
                maxX = startOffset.x;
                newRow = true;
            }

            if (newRow) {
                maxY = Math.max(maxY, child.y + child.height + gridSpacing.y);
                newRow = false;
            }
        }
    });

    // Create the instance and set its position
    const instance = component.createInstance();
    instance.x = maxX;
    instance.y = maxY;

    targetFrame.appendChild(instance);

    return instance;
}

async function setTextOfInstance(instance: InstanceNode, text: string): Promise<void> {
    // Find the text node within the instance
    const textNodes = instance.findAll(node => node.type === "TEXT") as TextNode[];
    if (textNodes.length > 0) {
        // Assuming you want to change the text of the first text node found within the component
        const textNode = textNodes[0];

        // Load the font for the text node before setting its characters
        await figma.loadFontAsync(textNode.fontName as FontName);

        // Now that the font is loaded, set the text
        textNode.characters = text;
    } else {
        console.error("No text node found within the instance.");
    }
}