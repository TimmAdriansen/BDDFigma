type FunctionMap = {
    [key: string]: (...args: any[]) => void;
};

interface Position {
    page: string,
    instance: InstanceNode,
    id: string,
    gridY: number;
}

const startOffset = { x: 50, y: 200 }; // Starting position for the first instance
const gridSpacing = { x: 20, y: 20 }; // Spacing between instances
const frameSize = { x: 1200, y: 900 };
let positions: Position[] = [];

async function button(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }

}

async function browserWindow(id: string): Promise<void> {
    resetPositionsArray(id);
    try {
        const frame = figma.createFrame();
        frame.name = id;
        frame.resize(frameSize.x, frameSize.y);
        const maxX = 1000;
        const maxY = 1000;
        frame.x = Math.floor(Math.random() * maxX);
        frame.y = Math.floor(Math.random() * maxY);
        figma.currentPage.appendChild(frame);

        const textNode = figma.createText();

        const font: FontName = { family: "Roboto", style: "Regular" };

        await figma.loadFontAsync(font);

        textNode.fontName = font;
        textNode.characters = id;
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

async function textField(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionInputField");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function searchBox(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionSearchField");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);
}


async function radioButton(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionRadioButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function toggleButton(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionToggle");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function checkBox(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionCheckbox");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function image(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionImage");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);
}

async function calendar(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionCalendar");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);
}

async function timePicker(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionTimePicker");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);
}

async function icon(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionIconButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceInGridFromSet(component, currentFrame, startOffset, gridSpacing, id);
}

const functionMap: FunctionMap = {
    "Button": button,
    "BrowserWindow": browserWindow,
    "TextField": textField,
    "SearchBox": searchBox,
    "RadioButton": radioButton,
    "ToggleButton": toggleButton,
    "CheckBox": checkBox,
    "Image": image,
    "Calendar": calendar,
    "TimePicker": timePicker,
    "Icon": icon

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

function findComponentSetByName(name: string): ComponentSetNode | null {
    return figma.root.findOne(node => node.type === "COMPONENT_SET" && node.name === name) as ComponentSetNode | null;
}

function findFrameByName(name: string): FrameNode | null {
    const frame = figma.currentPage.findOne(node => node.type === "FRAME" && node.name === name) as FrameNode | null;
    return frame;
}

function createInstanceInGridFromSet(componentSet: ComponentSetNode | null, targetFrame: FrameNode | null, startOffset: { x: number, y: number }, gridSpacing: { x: number, y: number }, id: string): InstanceNode | null {
    if (!componentSet) {
        console.error("Component set not found.");
        return null;
    }

    if (!targetFrame || targetFrame.type !== "FRAME") {
        console.error("Target frame is not a frame or not set.");
        return null;
    }

    if (positions.length != 0) {
        let previousInstancePositions = positions[positions.length - 1];
        if (previousInstancePositions.page != targetFrame.name) {
            resetPositionsArray(targetFrame.name);
        }
    }

    // Assuming you want to instantiate the default variant, or adjust this logic for a specific variant
    const componentToInstantiate = componentSet.defaultVariant;

    const instance = componentToInstantiate.createInstance();
    instance.name = targetFrame.name + ":" + id;

    if (positions.length == 0) {
        instance.x = startOffset.x;
        instance.y = startOffset.y;

        positions.push({
            page: targetFrame.name,
            instance: instance,
            id: id,
            gridY: 1
        });
        targetFrame.appendChild(instance);
        return instance;
    }

    let previousInstancePositions = positions[positions.length - 1];

    if (previousInstancePositions.instance.x + previousInstancePositions.instance.width + gridSpacing.x + componentToInstantiate.width > frameSize.x - startOffset.x) {
        let gridY = previousInstancePositions.gridY + 1;
        instance.x = startOffset.x;
        instance.y = startOffset.y * gridY;

        positions.push({
            page: targetFrame.name,
            instance: instance,
            id: id,
            gridY: gridY
        });
        targetFrame.appendChild(instance);
        return instance;
    }

    instance.x = previousInstancePositions.instance.x + previousInstancePositions.instance.width + gridSpacing.x;
    instance.y = startOffset.y * previousInstancePositions.gridY;

    positions.push({
        page: targetFrame.name,
        instance: instance,
        id: id,
        gridY: previousInstancePositions.gridY
    });

    targetFrame.appendChild(instance);

    return instance;
}

function resetPositionsArray(title: string) {
    positions = []
}



async function setTextOfInstance(instance: InstanceNode, text: string): Promise<void> {
    // Find the text node within the instance
    const textNode = instance.findOne(node => node.type === "TEXT" && node.name === "Label") as TextNode;

    if (textNode) {
        // Load the font for the text node before setting its characters
        await figma.loadFontAsync(textNode.fontName as FontName);

        // Now that the font is loaded, set the text
        textNode.characters = text;
    } else {
        console.error("No text node named 'Label' found within the instance.");
    }
}