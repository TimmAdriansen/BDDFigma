import { WidgetReactions, WidgetStateReactions } from "./widgetReactions";

let widgetReactions = new WidgetReactions();
let widgetStateReactions = new WidgetStateReactions();

type FunctionMap = {
    [key: string]: (...args: any[]) => void;
};

interface Position {
    page: string,
    instance: InstanceNode,
    id: string,
    gridY: number;
}

let collection: VariableCollection;
let modeId: string;

const startOffset = { x: 50, y: 200 }; // Starting position for the first instance
const gridSpacing = { x: 20, y: 20 }; // Spacing between instances
const frameSize = { x: 1200, y: 900 };
let framePos = { x: 0, y: 0 };
let allPositions: Position[] = [];

async function button(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }

}

async function browserWindow(id: string, first: boolean): Promise<void> {
    //resetPositionsArray(id);

    if (first) {
        collection = figma.variables.createVariableCollection("new-collection")
        modeId = collection.modes[0].modeId
        framePos.x = 0;
        framePos.y = 0;
    }

    try {
        const frame = figma.createFrame();
        frame.name = id;
        frame.resize(frameSize.x, frameSize.y);
        const maxX = 1000;
        const maxY = 1000;
        frame.x = framePos.x + frameSize.x * 1.25;
        frame.y = framePos.y;
        framePos.x = frame.x;
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

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);


    let specificVariant = null;

    for (const variant of newComponent.children) {
        if (variant.type === "COMPONENT" && variant.name.includes("Default")) {
            specificVariant = variant;
        }
    }

    if (specificVariant) {

        let reactions = clone(specificVariant.reactions);

        let name = page + ":" + id + ":var:";

        const textVar = figma.variables.createVariable(name, collection.id, "STRING");

        let startString = "Type here";

        // Assuming getTypingReactions is a function that you have that configures reactions based on the text variable
        reactions = widgetReactions.getTypingReactions(textVar.id, startString, reactions);

        specificVariant.reactions = reactions;

        const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, specificVariant);

        if (newInstance) {
            const textNode = newInstance.findOne(child => child.name === 'Text' && child.type === 'TEXT') as TextNode;

            if (textNode) {
                textVar.setValueForMode(modeId, startString);
                textNode.setBoundVariable('characters', textVar.id);
            }

            //let reactions = clone(newInstance.reactions);

            // Assuming getTypingReactions is a function that you have that configures reactions based on the text variable
            //reactions = getTypingReactions(textVar.id, startString, reactions);

            //newInstance.reactions = reactions;

            await setTextOfInstance(newInstance, id);
        }
    }

    newComponent.remove();
}

async function searchBox(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionSearchField");

    let currentFrame: FrameNode | null = findFrameByName(page);

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);


    let specificVariant = null;

    for (const variant of newComponent.children) {
        if (variant.type === "COMPONENT" && variant.name.includes("Default")) {
            specificVariant = variant;
        }
    }

    if (specificVariant) {

        let reactions = clone(specificVariant.reactions);

        let name = page + ":" + id + ":var:";

        const textVar = figma.variables.createVariable(name, collection.id, "STRING");

        let startString = "Search here";

        reactions = widgetReactions.getTypingReactions(textVar.id, startString, reactions);

        specificVariant.reactions = reactions;

        const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, specificVariant);

        if (newInstance) {
            const textNode = newInstance.findOne(child => child.name === 'Text' && child.type === 'TEXT') as TextNode;

            if (textNode) {
                textVar.setValueForMode(modeId, startString);
                textNode.setBoundVariable('characters', textVar.id);
            }

            //let reactions = clone(newInstance.reactions);

            // Assuming getTypingReactions is a function that you have that configures reactions based on the text variable
            //reactions = getTypingReactions(textVar.id, startString, reactions);

            //newInstance.reactions = reactions;
        }
    }

    newComponent.remove();
}


async function radioButton(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionRadioButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function toggleButton(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionToggle");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function checkBox(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionCheckbox");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }
}

async function image(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionImage");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function calendar(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionCalendar");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function timePicker(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionTimePicker");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function icon(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionIconButton");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function fieldSet(page: string, id: string, widgets: any[]): Promise<void> {
    //console.log("fieldset:")
    //console.log(widgets);
}

async function dropDownList(page: string, id: string, widgets: any[]): Promise<void> {
    const component = findComponentSetByName("InteractionDropdown");
    let currentFrame: FrameNode | null = findFrameByName(page);

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);

    let openVariant = null;
    for (const variant of newComponent.children) {
        if (variant.name === "Type=Open" && "children" in variant) {
            openVariant = variant;
        }
    }

    let name = page + ":" + id + ":var:";

    const textVar = figma.variables.createVariable(name, collection.id, "STRING");

    if (openVariant && "children" in openVariant) {
        const containerVariant = openVariant as FrameNode | GroupNode | ComponentNode | InstanceNode;

        const textInputChild = containerVariant.children.find(child => child.name === "Text Input");


        if (textInputChild && "children" in textInputChild) {
            const MenuItem = textInputChild.children.find(child => child.name === ".Menu item Dropdown");

            let i = 0;

            for (const widget of widgets) {
                if (i == 0) {
                    if (MenuItem && "children" in MenuItem && ("reactions" in MenuItem)) {
                        const menuItemWithReactions = MenuItem as FrameNode | ComponentNode | InstanceNode;

                        let reactions = clone(menuItemWithReactions.reactions);

                        for (const reaction of reactions) {
                            for (let i = 0; i < reaction.actions.length; i++) {
                                // Checking if the current action is the one to replace
                                if (reaction.actions[i].type === "SET_VARIABLE") {
                                    // Replace the action with new details
                                    reaction.actions[i] = {
                                        type: "SET_VARIABLE",
                                        variableId: textVar.id, // Assuming 'textVar.id' holds the new variable ID you want to use
                                        variableValue: {
                                            value: widget.id, // Assuming 'widget.id' is the new value you want to set
                                            type: "STRING",
                                            resolvedType: "STRING"
                                        }
                                    };
                                }
                            }
                        }

                        menuItemWithReactions.reactions = reactions;

                        const textChild = MenuItem.children.find(child => child.type === "TEXT") as TextNode;

                        if (textChild) {
                            textChild.characters = widget.id;
                        }
                    }
                    i++
                    continue
                }
                const newMenu = MenuItem?.clone();

                if (newMenu && "children" in newMenu) {
                    textInputChild.appendChild(newMenu);

                    const newMenuItemWithReactions = newMenu as FrameNode | ComponentNode | InstanceNode;

                    let reactions = clone(newMenuItemWithReactions.reactions);

                    for (const reaction of reactions) {
                        for (let i = 0; i < reaction.actions.length; i++) {
                            // Checking if the current action is the one to replace
                            if (reaction.actions[i].type === "SET_VARIABLE") {
                                // Replace the action with new details
                                reaction.actions[i] = {
                                    type: "SET_VARIABLE",
                                    variableId: textVar.id, // Assuming 'textVar.id' holds the new variable ID you want to use
                                    variableValue: {
                                        value: widget.id, // Assuming 'widget.id' is the new value you want to set
                                        type: "STRING",
                                        resolvedType: "STRING"
                                    }
                                };
                            }
                        }
                    }

                    newMenuItemWithReactions.reactions = reactions;

                    const textChild = newMenu.children.find(child => child.type === "TEXT") as TextNode;

                    if (textChild) {
                        textChild.characters = widget.id;
                    }
                }
            }
        }
    }

    const newInstance = createInstanceFromSet(newComponent, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        const textNode = newInstance.findOne(child => child.name === 'Text' && child.type === 'TEXT') as TextNode;

        if (textNode) {
            textVar.setValueForMode(modeId, "Select option");
            textNode.setBoundVariable('characters', textVar.id);
        }
        await setTextOfInstance(newInstance, id);
    }

    newComponent.remove();
}

async function listBox(page: string, id: string, widgets: any[]): Promise<void> {
    const component = findComponentSetByName("InteractionListBox");
    let currentFrame: FrameNode | null = findFrameByName(page);

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);

    let openVariant = null;
    for (const variant of newComponent.children) {
        if (variant.name === "Type=Open Multi-select" && "children" in variant) {
            openVariant = variant;
        }
    }

    if (openVariant && "children" in openVariant) {
        const containerVariant = openVariant as FrameNode | GroupNode | ComponentNode | InstanceNode;

        const textInputChild = containerVariant.children.find(child => child.name === "Text Input");


        if (textInputChild && "children" in textInputChild) {
            const MenuItem = textInputChild.children.find(child => child.name === ".Multi-select menu item");

            let i = 0;

            for (const widget of widgets) {
                if (i == 0) {
                    if (MenuItem && "children" in MenuItem) {
                        const textChild = MenuItem.children.find(child => child.type === "TEXT") as TextNode;

                        if (textChild) {
                            textChild.characters = widget.id;
                        }
                    }
                    i++
                    continue
                }
                const newMenu = MenuItem?.clone();

                if (newMenu && "children" in newMenu) {
                    textInputChild.appendChild(newMenu);

                    const textChild = newMenu.children.find(child => child.type === "TEXT") as TextNode;

                    if (textChild) {
                        textChild.characters = widget.id;
                    }
                }
            }
        }
    }



    const newInstance = createInstanceFromSet(newComponent, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        await setTextOfInstance(newInstance, id);
    }

    newComponent.remove();
}

//EXAMPLE OF GO TO PAGE WORKING!
async function menu(page: string, id: string, widgets: any[]): Promise<void> {
    const component = findComponentSetByName("InteractionMenu");
    let currentFrame: FrameNode | null = findFrameByName(page);

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);

    if (newComponent && "children" in newComponent) {

        const containerVariant = newComponent.children[0] as FrameNode | GroupNode | ComponentNode | InstanceNode;
        if (containerVariant && "children" in containerVariant) {
            const menuItem = containerVariant.children[0] as FrameNode | GroupNode | ComponentNode | InstanceNode;

            let i = 0;

            for (const widget of widgets) {
                if (i == 0) {
                    const child = menuItem.children[0] as FrameNode | GroupNode | ComponentNode | InstanceNode;
                    const textChild = child.children.find(child => child.type === "TEXT") as TextNode;

                    if (textChild) {
                        //console.log("CHILD");
                        textChild.characters = widget.id;
                    }
                    i++
                    continue
                }

                const newMenu = menuItem?.clone();
                containerVariant.appendChild(newMenu);

                const child = newMenu.children[0] as FrameNode | GroupNode | ComponentNode | InstanceNode;
                const textChild = child.children.find(child => child.type === "TEXT") as TextNode;

                if (textChild) {
                    textChild.characters = widget.id;
                }

            }

            //example of using go to page
            /*let secondFrame: FrameNode | null = findFrameByName("New Window");
            if (secondFrame) {
                let reactions = clone(yeet.reactions);
                reactions = widgetStateReactions.goToPage(reactions, secondFrame.id)
                yeet.reactions = reactions;
            }*/
        }

    }


    const newInstance = createInstanceFromSet(newComponent, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
    }

    newComponent.remove();
}

async function accordion(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionAccordion");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function breadcrumb(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionBreadcrumb");

    let currentFrame: FrameNode | null = findFrameByName(page);

    const newInstance = createInstanceFromSet(component, currentFrame, startOffset, gridSpacing, id, null);
}

async function numericStepper(page: string, id: string): Promise<void> {
    const component = findComponentSetByName("InteractionNumericStepper");

    let currentFrame: FrameNode | null = findFrameByName(page);

    if (!component) {
        return;
    }

    let newComponent = component.clone()
    newComponent.name = "toDelete"

    newComponent.x = 100000000;
    newComponent.y = 100000000;

    figma.currentPage.appendChild(newComponent);

    let defaultVariant = null;
    for (const variant of newComponent.children) {
        if (variant.name === "Property 1=Default" && "children" in variant) {
            defaultVariant = variant;
        }
    }

    let nameFloat = page + ":" + id + ":var:" + "float";

    const floatVar = figma.variables.createVariable(nameFloat, collection.id, "FLOAT");

    let nameString = page + ":" + id + ":var:" + "string";

    const stringVar = figma.variables.createVariable(nameString, collection.id, "STRING");


    if (defaultVariant) {
        const minusButton = defaultVariant.children.find(child => child.name === "MinusButton");
        if (minusButton && ("reactions" in minusButton)) {
            let reactions = clone(minusButton.reactions);
            reactions = widgetReactions.numericStepperMinusReaction(floatVar.id, stringVar.id, reactions);
            minusButton.reactions = reactions;
        }
        const plusButton = defaultVariant.children.find(child => child.name === "PlusButton");
        if (plusButton && ("reactions" in plusButton)) {
            let reactions = clone(plusButton.reactions);
            //console.log(reactions);
            reactions = widgetReactions.numericStepperPlusReaction(floatVar.id, stringVar.id, reactions);
            plusButton.reactions = reactions;
        }
    }


    const newInstance = createInstanceFromSet(newComponent, currentFrame, startOffset, gridSpacing, id, null);

    if (newInstance) {
        const textNode = newInstance.findOne(child => child.name === 'value' && child.type === 'TEXT') as TextNode;
        //console.log(textNode);

        if (textNode) {
            stringVar.setValueForMode(modeId, "0");
            textNode.setBoundVariable('characters', stringVar.id);
        }
    }

    newComponent.remove();
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
    "Icon": icon,
    "FieldSet": fieldSet,
    "DropdownList": dropDownList,
    "ListBox": listBox,
    "Menu": menu,
    "Accordion": accordion,
    "Breadcrumb": breadcrumb,
    "NumericStepper": numericStepper

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

function findComponentSetByName(name: string): ComponentSetNode | null {
    return figma.root.findOne(node => node.type === "COMPONENT_SET" && node.name === name) as ComponentSetNode | null;
}

function findComponentByName(name: string): ComponentNode | null {
    return figma.root.findOne(node => node.type === "COMPONENT" && node.name === name) as ComponentNode | null;
}

function findFrameByName(name: string): FrameNode | null {
    const frame = figma.currentPage.findOne(node => node.type === "FRAME" && node.name === name) as FrameNode | null;
    return frame;
}

function createInstanceFromSet(componentSet: ComponentSetNode | null, targetFrame: FrameNode | null, startOffset: { x: number, y: number }, gridSpacing: { x: number, y: number }, id: string, variant: ComponentNode | null): InstanceNode | null {
    if (!componentSet) {
        console.error("Component set not found.");
        return null;
    }

    if (!targetFrame || targetFrame.type !== "FRAME") {
        console.error("Target frame is not a frame or not set.");
        return null;
    }


    let componentToInstantiate;

    if (variant != null) {
        componentToInstantiate = variant;
    } else {
        componentToInstantiate = componentSet.defaultVariant;
    }

    const instance = componentToInstantiate.createInstance();
    instance.name = targetFrame.name + ":" + id;
    instance.x = startOffset.x;
    instance.y = startOffset.y;

    allPositions.push({
        page: targetFrame.name,
        instance: instance,
        id: id,
        gridY: 1
    });

    targetFrame.appendChild(instance);

    return instance;
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

export function resetAllPositions() {
    allPositions = []
}

export function layoutPages() {

    const uniquePages: string[] = [...new Set(allPositions.map(position => position.page))]

    const pagesWithFilteredPositions: Record<string, Position[]> = {};

    uniquePages.forEach(givenPage => {
        pagesWithFilteredPositions[givenPage] = allPositions.filter(position => position.page === givenPage);
    });


    let currentPositions: Position[] = [];
    for (const positions of Object.values(pagesWithFilteredPositions)) {
        currentPositions = [];
        positions.forEach(pos => {
            if (currentPositions.length == 0) {
                pos.instance.x = startOffset.x;
                pos.instance.y = startOffset.y;

                currentPositions.push({
                    page: pos.page,
                    instance: pos.instance,
                    id: pos.id,
                    gridY: 1
                });
                return;
            }
            let previousInstancePositions = currentPositions[currentPositions.length - 1];

            if (previousInstancePositions.instance.x + previousInstancePositions.instance.width + gridSpacing.x + pos.instance.width > frameSize.x - startOffset.x) {
                let gridY = previousInstancePositions.gridY + 1;
                pos.instance.x = startOffset.x;
                pos.instance.y = startOffset.y * gridY;

                currentPositions.push({
                    page: pos.page,
                    instance: pos.instance,
                    id: pos.id,
                    gridY: gridY
                });
                return;
            }

            pos.instance.x = previousInstancePositions.instance.x + previousInstancePositions.instance.width + gridSpacing.x;
            pos.instance.y = startOffset.y * previousInstancePositions.gridY;

            currentPositions.push({
                page: pos.page,
                instance: pos.instance,
                id: pos.id,
                gridY: previousInstancePositions.gridY
            });

        })
    }
}

function clone(val: any) {
    return JSON.parse(JSON.stringify(val))
}