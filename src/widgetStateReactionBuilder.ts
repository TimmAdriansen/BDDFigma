export class WidgetStateReactionsBuilder {

    //expressions
    /*
    type ExpressionFunction =
  | 'ADDITION'
  | 'SUBTRACTION'
  | 'MULTIPLICATION'
  | 'DIVISION'
  | 'EQUALS'
  | 'NOT_EQUAL'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'AND'
  | 'OR'
  | 'VAR_MODE_LOOKUP'
  | 'NEGATE'
    */
    private collection: VariableCollection | null = null;

    constructor(collection: VariableCollection) {
        this.collection = collection;
    }


    buildAction(id: string, action: any, widget: string) {
        console.log("HERE:")
        console.log(id);
        //console.log(widget);
        //console.log(action)

        let eventCondition = action.conditions[action.conditions.length - 1];
        let eventID = eventCondition.params.id;
        //console.log(eventID);
        let eventWidget = findInstanceByName(eventID);
        let mainWidget = null;
        if (eventCondition.params.widget == "DropdownList" /*add more*/) {
            let baseName = ".Menu item Dropdown:"; //change if other type - actually no, just standardise names
            mainWidget = findInstanceByName(eventID);
            mainWidget?.setProperties({ 'Type': 'Open' }); //make sure name is the same in file aswell
            const textInputChild = mainWidget?.children.find(child => child.name === "Text Input") as InstanceNode; //make sure name is the same in file aswell
            eventWidget = textInputChild?.children.find(child => child.name === baseName+eventCondition.params.typeId) as InstanceNode;
        }
        if (eventCondition.params.widget == "Menu" /*add more*/) {
            let baseName = ".Menu item Dropdown:"; //change if other type - actually no, just standardise names
            mainWidget = findInstanceByName(eventID);
            eventWidget = mainWidget?.children.find(child => child.name === baseName+eventCondition.params.typeId) as InstanceNode;
        }
        //console.log(eventWidget);

        let commonStates = ['displayed', 'shown', 'available', 'enabled', 'disabled'];

        let mainAction = this.determineAction(id, action, widget);
        //console.log(id)
        //console.log(mainAction);
        let mainActions: Action[] = [];
        if (mainAction != null) {
            mainActions.push(mainAction);
        }
        //DETERMINE TRIGGER FIRST
        const trigger: Trigger = {
            type: 'ON_CLICK'
        };

        let expression;
        for (let index = 0; index < action.conditions.length; index++) {
            const element = action.conditions[index];
            if (!commonStates.includes(element.type) && index != action.conditions.length - 1) {
                if (this.collection) {
                    let variable = getVariableByName(this.collection, element.params.id + ":var:" + "value");
                    if (variable) {
                        let paramsValue = element.params.value;
                        let equalOrNot = null;
                        if (paramsValue == undefined) {
                            if (!element.negated) {
                                let returnValue = lookupWidgetState(element.params.widget, element.type, "x")
                                paramsValue = returnValue[0];
                                equalOrNot = returnValue[1];
                            } else {
                                let returnValue = lookupWidgetState(element.params.widget, "not " + element.type, "x")
                                paramsValue = returnValue[0];
                                equalOrNot = returnValue[1];
                            }
                            //DO SOMETHING 
                            //USE THE STATE CALL FUNCTION AND RETURN A VALUE 
                        }
                        if (paramsValue == "") {
                            paramsValue = handleNullValue(element.params.widget);
                        }
                        let expressionFunction: ExpressionFunction;
                        if (equalOrNot == "EQUALS" || equalOrNot == "NOT_EQUAL") {
                            expressionFunction = equalOrNot;
                        } else {
                            expressionFunction = (element.negated === false) ? "EQUALS" : "NOT_EQUAL";
                        }

                        let variableAlias = this.setVariableAlias(variable.id);
                        let firstVariableData = this.setVariableData(variable.resolvedType, "VARIABLE_ALIAS", variableAlias)
                        let secondVariableData = this.setVariableData(variable.resolvedType, variable.resolvedType, paramsValue)
                        let VariableDataArray: VariableData[] = [];
                        VariableDataArray.push(firstVariableData);
                        VariableDataArray.push(secondVariableData);
                        if (!expression) {
                            expression = this.setExpression(expressionFunction, VariableDataArray);
                        } else {
                            let newExpression = this.setExpression(expressionFunction, VariableDataArray);
                            expression = this.appendExpression(expression, newExpression);
                            //console.log(expression);
                        }
                        //console.log("expression: " + element.params.id);
                        //console.log(expression);
                        //break;
                        //this.setExpression(expressionFunction,)
                        //let value = this.setVariableData(variable.resolvedType, variable.resolvedType, paramsValue);
                        //setAction = this.setVariableAction(variable.id, value);
                    }
                }
            }
        }

        if (expression) {
            const elseActions: Action[] = [];
            //console.log(id);
            //console.log(action);
            let variableData = this.setVariableData("BOOLEAN", "EXPRESSION", expression);
            //we get the action by same method of doing either setNodeAction or setVariableAction
            //all we have to do here is to create the conditionData (which I think might have to be recursive as conditions just are added to the previous ones)
            let conditionalAction = this.setConditionalAction(this.setIfConditional(variableData, mainActions), this.setElseConditional(elseActions));
            //console.log(conditionalAction);
            mainActions = [];
            mainActions.push(conditionalAction);
            //return;
        }

        if (eventWidget) {
            let reactions = clone(eventWidget.reactions);
            let reaction: Reaction | null = getReactionOfTriggerType(reactions, trigger);
            if (reaction == null) {
                reaction = this.setReaction(mainActions, trigger)
                reactions.push(reaction);
            } else {
                if (mainAction) {
                    reaction.actions?.push(mainActions[0]);
                }
            }
            eventWidget.reactions = reactions;
        }

        //KINDA ANNOYING BUT LETS JUST KEEP IT LIKE THIS...
        if(mainWidget){
           // mainWidget?.setProperties({ 'Type': 'Closed' }); //make sure name is the same in file aswell
        }

        //for now lets ignore shown/displayed/etc

        //let isConditional = 

        //determine type node (navigation), condtional, setVariable
        //node and navigation can be inside conditional
        /*action.conditions.array.forEach((element: any) => {
            console.log(element);
        });*/
    }

    determineAction(id: string, action: any, widget: string) {
        let navigationStates = ['displayed', 'shown', 'available'];
        let setAction: Action | null = null;
        if (!navigationStates.includes(action.type)) {
            if (!action.negated) {
                if (this.collection) {
                    //WE NEED TO FIGURE OUT THE TYPE - BOOLEAN, STRING, FLOAT ETC.
                    //TEMPORARY FIX FOR PROOF OF CONCEPT
                    //WE NEED TO FIGURE OUT THE NAME OF THE VARIABLE - I DON'T THINK IT IS "VALUE" EVERYTIME - MAYBE IT IS?
                    //only works for setting a value not a state - state will be undefined as we just use .value
                    let variable = getVariableByName(this.collection, id + ":var:" + "value");
                    if (variable) {
                        let paramsValue = action.params.value;
                        if (paramsValue == undefined) {
                            //DO SOMETHING 
                            //USE THE STATE CALL FUNCTION AND RETURN A VALUE 
                        }
                        if (paramsValue == "") {
                            paramsValue = handleNullValue(widget);
                        }
                        if (variable.resolvedType == "BOOLEAN") paramsValue = !action.negated;
                        let value = this.setVariableData(variable.resolvedType, variable.resolvedType, paramsValue);
                        setAction = this.setVariableAction(variable.id, value);
                    }
                }
            } else {
                if (this.collection) {
                    //WE NEED TO FIGURE OUT THE TYPE - BOOLEAN, STRING, FLOAT ETC.
                    //TEMPORARY FIX FOR PROOF OF CONCEPT
                    //WE NEED TO FIGURE OUT THE NAME OF THE VARIABLE - I DON'T THINK IT IS "VALUE" EVERYTIME - MAYBE IT IS?
                    let variable = getVariableByName(this.collection, id + ":var:" + "value");
                    if (variable) {
                        let paramsValue = action.params.value;
                        if (paramsValue == undefined) {
                            //DO SOMETHING 
                            //USE THE STATE CALL FUNCTION AND RETURN A VALUE 
                        }
                        if (paramsValue == "") {
                            paramsValue = handleNullValue(widget);
                        }
                        if (variable.resolvedType == "BOOLEAN") {
                            paramsValue = !(paramsValue === "true");
                        }
                        let value = this.setVariableData(variable.resolvedType, variable.resolvedType, paramsValue);
                        setAction = this.setVariableAction(variable.id, value);
                    }
                }
            }
        } else {
            if (!action.negated) {
                if (widget == undefined) {
                    id = id.split(":")[0];
                    let instance = findFrameByName(figma.currentPage, id)
                    if (instance) {
                        setAction = this.setNodeAction(instance.id, "NAVIGATE");
                    }
                } else {
                    let instance = findFrameByName(figma.currentPage, id)
                    if (instance) {
                        setAction = this.setNodeAction(instance.id, "OVERLAY");
                    }
                }
            }
            //no else as if you don't want to navigate, just don't do it?
        }
        return setAction;
    }

    setNodeAction(destinationId: string, navType: Navigation) {
        const setNodeAction: Action =
        {
            type: 'NODE',
            navigation: navType,
            transition: null,
            destinationId: destinationId
        }

        return setNodeAction;
    }

    setVariableAction(variableId: string, value: VariableData) {
        const setVariableAction: Action =
        {
            type: 'SET_VARIABLE',
            variableId: variableId,
            variableValue: value,
        }
        return setVariableAction;
    }


    setConditionalAction(conditionalIfBlock: ConditionalBlock, conditionalElseBlock: ConditionalBlock) {
        const conditionalAction: Action =
        {
            type: 'CONDITIONAL',
            conditionalBlocks: [conditionalIfBlock, conditionalElseBlock]
        }
        return conditionalAction;
    }


    setVariableData(resolvedType: VariableResolvedDataType, type: VariableDataType, value: number | boolean | string | RGB | RGBA | VariableAlias | Expression) {
        const VariableData: VariableData =
        {
            resolvedType: resolvedType,
            type: type,
            value: value
        }
        return VariableData;
    }

    setVariableAlias(id: string) {
        const variableAlias: VariableAlias =
        {
            type: 'VARIABLE_ALIAS',
            id: id
        }
        return variableAlias;
    }

    setExpression(expressionFunction: ExpressionFunction, expressionArguments: VariableData[]) {
        const expression: Expression =
        {
            expressionFunction: expressionFunction,
            expressionArguments: expressionArguments
        }
        return expression;
    }

    setIfConditional(conditionData: VariableData, actions: Action[]) {
        const conditionalIfBlock: ConditionalBlock =
        {
            condition: conditionData,
            actions: actions
        }
        return conditionalIfBlock;
    }

    setElseConditional(actions: Action[]) {
        const conditionalElseBlock: ConditionalBlock =
        {
            actions: actions
        }
        return conditionalElseBlock;
    }

    setReaction(actions: Action[], trigger: Trigger) {
        //console.log(actions);
        const reaction: Reaction =
        {
            actions: actions,
            trigger: trigger
        }
        return reaction;
    }

    appendExpression(oldExpression: VariableValueWithExpression, newExpression: VariableValueWithExpression) {
        const expression: VariableValueWithExpression = {
            expressionArguments: [
                {
                    resolvedType: "BOOLEAN",
                    type: "EXPRESSION",
                    value: oldExpression
                },
                {
                    resolvedType: "BOOLEAN",
                    type: "EXPRESSION",
                    value: newExpression,
                }
            ],
            expressionFunction: "AND",
        }
        return expression;
    }

    setConditionData(expression: VariableValueWithExpression) {
        const conditionData: VariableData = {
            resolvedType: "BOOLEAN",
            type: "EXPRESSION",
            value: expression
        }
        return conditionData;
    }

    goToPage(reactions: any, pageID: string) {
        const reaction =
        {
            "action": {
                "type": "NODE",
                "destinationId": pageID,
                "navigation": "NAVIGATE",
                "transition": {
                    "type": "SMART_ANIMATE",
                    "easing": {
                        "type": "EASE_OUT"
                    },
                    "duration": 0.30000001192092896
                },
                "resetVideoPosition": false
            },
            "actions": [
                {
                    "type": "NODE",
                    "destinationId": pageID,
                    "navigation": "NAVIGATE",
                    "transition": {
                        "type": "SMART_ANIMATE",
                        "easing": {
                            "type": "EASE_OUT"
                        },
                        "duration": 0.30000001192092896
                    },
                    "resetVideoPosition": false
                }
            ],
            "trigger": {
                "type": "ON_CLICK"
            }
        }

        reactions.push(reaction);
        return reactions;
    }

    openOverlay(reactions: any, overlayID: string) {
        const reaction =
        {
            "action": {
                "type": "NODE",
                "destinationId": overlayID,
                "navigation": "OVERLAY",
                "transition": null,
                "resetVideoPosition": false
            },
            "actions": [
                {
                    "type": "NODE",
                    "destinationId": overlayID,
                    "navigation": "OVERLAY",
                    "transition": null,
                    "resetVideoPosition": false
                }
            ],
            "trigger": {
                "type": "ON_CLICK"
            }
        }

        reactions.push(reaction);
        return reactions;
    }
}

type NodeWithChildren = FrameNode | ComponentNode | InstanceNode | GroupNode;

function findInstanceByName(instanceName: string): InstanceNode | null {
    const page: PageNode = figma.currentPage; // Get the current page
    let foundInstance: InstanceNode | null = null;

    // Recursive function to search nodes
    function searchNodes(nodes: ReadonlyArray<SceneNode>) {
        for (const node of nodes) {
            if (node.type === 'INSTANCE' && node.name === instanceName) {
                foundInstance = node as InstanceNode;
                return; // Stop searching once we find the instance
            }
            if ('children' in node) {
                searchNodes((node as NodeWithChildren).children); // Recurse into children
                if (foundInstance) return; // If found in children, stop searching
            }
        }
    }

    // Start the search with all top-level nodes on the page
    searchNodes(page.children);

    return foundInstance;
}

function findFrameByName(page: PageNode, frameName: string): FrameNode | null {
    // Recursively search through the nodes
    function searchNodes(nodes: ReadonlyArray<SceneNode>): FrameNode | null {
        for (const node of nodes) {
            if (node.type === 'FRAME' && node.name === frameName) {
                return node;
            }
            if ('children' in node) {
                const foundNode = searchNodes(node.children);
                if (foundNode) {
                    return foundNode;
                }
            }
        }
        return null;
    }

    return searchNodes(page.children);
}

function getVariableByName(collection: VariableCollection, variableName: string): Variable | null {

    for (const variableId of collection.variableIds) {
        let variable = figma.variables.getVariableById(variableId);
        if (variable) {
            if (variable.name === variableName) {
                return variable;
            }
        }
    }

    return null;
}


function clone(val: any) {
    return JSON.parse(JSON.stringify(val))
}

function getReactionOfTriggerType(reactions: Reaction[], trigger: Trigger) {
    let returnReaction: Reaction | null = null;

    for (let element of reactions) {
        if (element.trigger?.type === trigger.type) {
            //console.log(element);
            returnReaction = element;
            break;
        }
    }

    return returnReaction;
}

const defaultWidgetValues: Record<string, string> = {
    "SearchBox": "Search here",
    "TextField": "Type here",
    "TextArea": "Type here",
    "DropdownList": "Select option",
    "ListBox": "Pick items"
};

function handleNullValue(widget: string) {
    return defaultWidgetValues[widget] || "";
}

function handleValue(param: string): string {
    return `with ${param}`;
}


type StateGroup = {
    states: string[];
    values: any[];
    extraValues: string[];
};

type WidgetStateMapping = {
    [key: string]: StateGroup[];
};

const widgetStateMapping: WidgetStateMapping = {
    Field: [],
    FieldSet: [],
    Text: [],
    Label: [],
    ProgressBar: [],
    Tooltip: [],
    CheckBox: [
        { states: ['checked', 'unchecked', 'picked', 'selected', 'chosen', 'not checked', 'not unchecked', 'not picked', 'not selected', 'not chosen'], values: [true, false, true, true, true, false, true, false, false, false], extraValues: ['Additional Value 1', 'Additional Value 2', 'Additional Value 3', 'Additional Value 4', 'Additional Value 5', 'Additional Value 6', 'Additional Value 7', 'Additional Value 8', 'Additional Value 9', 'Additional Value 10'] },
    ],
    ListBox: [
        { states: ['picked', 'selected', 'chosen', 'not picked', 'not selected', 'not chosen'], values: ['ListBox picked', 'ListBox selected', 'ListBox chosen', 'ListBox not picked', 'ListBox not selected', 'ListBox not chosen'], extraValues: ['Additional Value 11', 'Additional Value 12', 'Additional Value 13', 'Additional Value 14', 'Additional Value 15', 'Additional Value 16'] },
    ],
    RadioButton: [
        { states: ['picked', 'selected', 'chosen', 'not picked', 'not selected', 'not chosen'], values: [true, true, true, false, false, false], extraValues: ['Additional Value 17', 'Additional Value 18', 'Additional Value 19', 'Additional Value 20', 'Additional Value 21', 'Additional Value 22'] },
    ],
    Button: [
        { states: ['clicked', 'submitted', 'not clicked', 'not submitted'], values: ['Button clicked', 'Button submitted', 'Button not clicked', 'Button not submitted'], extraValues: ['Additional Value 23', 'Additional Value 24', 'Additional Value 25', 'Additional Value 26'] },
    ],
    Calendar: [
        { states: ['selected', 'chosen', 'picked', 'set', 'not selected', 'not chosen', 'not picked', 'not set'], values: ['Calendar selected', 'Calendar chosen', 'Calendar picked', 'Calendar set', 'Calendar not selected', 'Calendar not chosen', 'Calendar not picked', 'Calendar not set'], extraValues: ['Additional Value 27', 'Additional Value 28', 'Additional Value 29', 'Additional Value 30', 'Additional Value 31', 'Additional Value 32', 'Additional Value 33', 'Additional Value 34'] },
    ],
    TimePicker: [
        { states: ['selected', 'chosen', 'picked', 'set', 'not selected', 'not chosen', 'not picked', 'not set'], values: ['TimePicker selected', 'TimePicker chosen', 'TimePicker picked', 'TimePicker set', 'TimePicker not selected', 'TimePicker not chosen', 'TimePicker not picked', 'TimePicker not set'], extraValues: ['Additional Value 35', 'Additional Value 36', 'Additional Value 37', 'Additional Value 38', 'Additional Value 39', 'Additional Value 40', 'Additional Value 41', 'Additional Value 42'] },
    ],
    Link: [
        { states: ['selected', 'chosen', 'clicked', 'not selected', 'not chosen', 'not clicked'], values: ['Link selected', 'Link chosen', 'Link clicked', 'Link not selected', 'Link not chosen', 'Link not clicked'], extraValues: ['Additional Value 43', 'Additional Value 44', 'Additional Value 45', 'Additional Value 46', 'Additional Value 47', 'Additional Value 48'] },
    ],
    DropdownList: [
        { states: ['selected', 'chosen', 'picked', 'not selected', 'not chosen', 'not picked'], values: [(param: string) => param, (param: string) => param, (param: string) => param, (param: string) => param, (param: string) => param, (param: string) => param], extraValues: ['EQUALS', 'EQUALS', 'EQUALS', 'NOT_EQUAL', 'NOT_EQUAL', 'NOT_EQUAL'] },
    ],
    Menu: [
        { states: ['clicked', 'selected', 'not clicked', 'not selected'], values: ['Menu clicked', 'Menu selected', 'Menu not clicked', 'Menu not selected'], extraValues: ['Additional Value 55', 'Additional Value 56', 'Additional Value 57', 'Additional Value 58'] },
    ],
    MenuItem: [
        { states: ['clicked', 'selected', 'not clicked', 'not selected'], values: ['MenuItem clicked', 'MenuItem selected', 'MenuItem not clicked', 'MenuItem not selected'], extraValues: ['Additional Value 59', 'Additional Value 60', 'Additional Value 61', 'Additional Value 62'] },
    ],
    Grid: [
        { states: ['clicked', 'selected', 'typed', 'compared', 'not clicked', 'not selected', 'not typed', 'not compared'], values: [(param: string) => handleValue(param), 'Grid selected', 'Grid typed', 'Grid compared', 'Grid not clicked', 'Grid not selected', 'Grid not typed', 'Grid not compared'], extraValues: ['Additional Value 63', 'Additional Value 64', 'Additional Value 65', 'Additional Value 66', 'Additional Value 67', 'Additional Value 68', 'Additional Value 69', 'Additional Value 70'] },
    ],
    TextField: [
        { states: ['typed', 'set', 'filled', 'not typed', 'not set', 'not filled'], values: [handleNullValue("TextField"), handleNullValue("TextField"), handleNullValue("TextField"), handleNullValue("TextField"), handleNullValue("TextField"), handleNullValue("TextField")], extraValues: ['NOT_EQUAL', 'NOT_EQUAL', 'NOT_EQUAL', 'EQUALS', 'EQUALS', 'EQUALS'] },
    ],
    TextArea: [
        { states: ['typed', 'set', 'filled', 'not typed', 'not set', 'not filled'], values: [handleNullValue("TextArea"), handleNullValue("TextArea"), handleNullValue("TextArea"), handleNullValue("TextArea"), handleNullValue("TextArea"), handleNullValue("TextArea")], extraValues: ['NOT_EQUAL', 'NOT_EQUAL', 'NOT_EQUAL', 'EQUALS', 'EQUALS', 'EQUALS'] },
    ],
    BrowserWindow: [
        { states: ['displayed', 'shown', 'available', 'not displayed', 'not shown', 'not available'], values: ['BrowserWindow displayed', 'BrowserWindow shown', 'BrowserWindow available', 'BrowserWindow not displayed', 'BrowserWindow not shown', 'BrowserWindow not available'], extraValues: ['Additional Value 83', 'Additional Value 84', 'Additional Value 85', 'Additional Value 86', 'Additional Value 87', 'Additional Value 88'] },
    ],
    Autocomplete: [
        { states: ['set', 'filled', 'not set', 'not filled'], values: ['Autocomplete set', 'Autocomplete filled', 'Autocomplete not set', 'Autocomplete not filled'], extraValues: ['Additional Value 89', 'Additional Value 90', 'Additional Value 91', 'Additional Value 92'] },
    ],
    Tree: [
        { states: ['clicked', 'selected', 'not clicked', 'not selected'], values: ['Tree clicked', 'Tree selected', 'Tree not clicked', 'Tree not selected'], extraValues: ['Additional Value 93', 'Additional Value 94', 'Additional Value 95', 'Additional Value 96'] },
    ],
    WindowDialog: [
        { states: ['confirmed', 'canceled', 'closed', 'displayed', 'shown', 'available', 'not confirmed', 'not canceled', 'not closed', 'not displayed', 'not shown', 'not available'], values: ['WindowDialog confirmed', 'WindowDialog canceled', 'WindowDialog closed', 'WindowDialog displayed', 'WindowDialog shown', 'WindowDialog available', 'WindowDialog not confirmed', 'WindowDialog not canceled', 'WindowDialog not closed', 'WindowDialog not displayed', 'WindowDialog not shown', 'WindowDialog not available'], extraValues: ['Additional Value 97', 'Additional Value 98', 'Additional Value 99', 'Additional Value 100', 'Additional Value 101', 'Additional Value 102', 'Additional Value 103', 'Additional Value 104', 'Additional Value 105', 'Additional Value 106', 'Additional Value 107', 'Additional Value 108'] },
    ],
    ModalWindow: [
        { states: ['confirmed', 'canceled', 'closed', 'displayed', 'shown', 'available', 'not confirmed', 'not canceled', 'not closed', 'not displayed', 'not shown', 'not available'], values: ['ModalWindow confirmed', 'ModalWindow canceled', 'ModalWindow closed', 'ModalWindow displayed', 'ModalWindow shown', 'ModalWindow available', 'ModalWindow not confirmed', 'ModalWindow not canceled', 'ModalWindow not closed', 'ModalWindow not displayed', 'ModalWindow not shown', 'ModalWindow not available'], extraValues: ['Additional Value 109', 'Additional Value 110', 'Additional Value 111', 'Additional Value 112', 'Additional Value 113', 'Additional Value 114', 'Additional Value 115', 'Additional Value 116', 'Additional Value 117', 'Additional Value 118', 'Additional Value 119', 'Additional Value 120'] },
    ],
    Accordion: [
        { states: ['clicked', 'shown', 'hidden', 'not clicked', 'not shown', 'not hidden'], values: ['Accordion clicked', 'Accordion shown', 'Accordion hidden', 'Accordion not clicked', 'Accordion not shown', 'Accordion not hidden'], extraValues: ['Additional Value 121', 'Additional Value 122', 'Additional Value 123', 'Additional Value 124', 'Additional Value 125', 'Additional Value 126'] },
    ],
    TabBar: [
        { states: ['clicked', 'selected', 'not clicked', 'not selected'], values: ['TabBar clicked', 'TabBar selected', 'TabBar not clicked', 'TabBar not selected'], extraValues: ['Additional Value 127', 'Additional Value 128', 'Additional Value 129', 'Additional Value 130'] },
    ],
    Notification: [
        { states: ['clicked', 'open', 'closed', 'displayed', 'shown', 'available', 'not clicked', 'not open', 'not closed', 'not displayed', 'not shown', 'not available'], values: ['Notification clicked', 'Notification open', 'Notification closed', 'Notification displayed', 'Notification shown', 'Notification available', 'Notification not clicked', 'Notification not open', 'Notification not closed', 'Notification not displayed', 'Notification not shown', 'Notification not available'], extraValues: ['Additional Value 131', 'Additional Value 132', 'Additional Value 133', 'Additional Value 134', 'Additional Value 135', 'Additional Value 136', 'Additional Value 137', 'Additional Value 138', 'Additional Value 139', 'Additional Value 140', 'Additional Value 141', 'Additional Value 142'] },
    ],
    NumericStepper: [
        { states: ['typed', 'set', 'filled', 'increased', 'decreased', 'not typed', 'not set', 'not filled', 'not increased', 'not decreased'], values: ['NumericStepper typed', 'NumericStepper set', 'NumericStepper filled', 'NumericStepper increased', 'NumericStepper decreased', 'NumericStepper not typed', 'NumericStepper not set', 'NumericStepper not filled', 'NumericStepper not increased', 'NumericStepper not decreased'], extraValues: ['Additional Value 143', 'Additional Value 144', 'Additional Value 145', 'Additional Value 146', 'Additional Value 147', 'Additional Value 148', 'Additional Value 149', 'Additional Value 150', 'Additional Value 151', 'Additional Value 152'] },
    ],
    ToggleButton: [
        { states: ['switched', 'not switched'], values: ['ToggleButton switched', 'ToggleButton not switched'], extraValues: ['Additional Value 153', 'Additional Value 154'] },
    ],
    Breadcrumb: [
        { states: ['selected', 'chosen', 'clicked', 'not selected', 'not chosen', 'not clicked'], values: ['Breadcrumb selected', 'Breadcrumb chosen', 'Breadcrumb clicked', 'Breadcrumb not selected', 'Breadcrumb not chosen', 'Breadcrumb not clicked'], extraValues: ['Additional Value 155', 'Additional Value 156', 'Additional Value 157', 'Additional Value 158', 'Additional Value 159', 'Additional Value 160'] },
    ],
    Icon: [
        { states: ['clicked', 'not clicked'], values: ['Icon clicked', 'Icon not clicked'], extraValues: ['Additional Value 161', 'Additional Value 162'] },
    ],
    Image: [
        { states: ['clicked', 'not clicked'], values: ['Image clicked', 'Image not clicked'], extraValues: ['Additional Value 163', 'Additional Value 164'] },
    ],
    ImageCarousel: [
        { states: ['selected', 'chosen', 'clicked', 'scrolled', 'not selected', 'not chosen', 'not clicked', 'not scrolled'], values: ['ImageCarousel selected', 'ImageCarousel chosen', 'ImageCarousel clicked', 'ImageCarousel scrolled', 'ImageCarousel not selected', 'ImageCarousel not chosen', 'ImageCarousel not clicked', 'ImageCarousel not scrolled'], extraValues: ['Additional Value 165', 'Additional Value 166', 'Additional Value 167', 'Additional Value 168', 'Additional Value 169', 'Additional Value 170', 'Additional Value 171', 'Additional Value 172'] },
    ],
    Pagination: [],
    SearchBox: [
        { states: ['typed', 'set', 'filled', 'not typed', 'not set', 'not filled'], values: ['SearchBox typed', 'SearchBox set', 'SearchBox filled', 'SearchBox not typed', 'SearchBox not set', 'SearchBox not filled'], extraValues: ['Additional Value 173', 'Additional Value 174', 'Additional Value 175', 'Additional Value 176', 'Additional Value 177', 'Additional Value 178'] },
    ],
    Slider: [
        { states: ['set', 'adjusted', 'not set', 'not adjusted'], values: ['Slider set', 'Slider adjusted', 'Slider not set', 'Slider not adjusted'], extraValues: ['Additional Value 179', 'Additional Value 180', 'Additional Value 181', 'Additional Value 182'] },
    ],
    Scrollbar: [
        { states: ['scrolled to the right', 'scrolled to the left', 'scrolled up', 'scrolled down', 'not scrolled to the right', 'not scrolled to the left', 'not scrolled up', 'not scrolled down'], values: ['Scrollbar scrolled to the right', 'Scrollbar scrolled to the left', 'Scrollbar scrolled up', 'Scrollbar scrolled down', 'Scrollbar not scrolled to the right', 'Scrollbar not scrolled to the left', 'Scrollbar not scrolled up', 'Scrollbar not scrolled down'], extraValues: ['Additional Value 183', 'Additional Value 184', 'Additional Value 185', 'Additional Value 186', 'Additional Value 187', 'Additional Value 188', 'Additional Value 189', 'Additional Value 190'] },
    ],
    Splitter: [
        { states: ['dragged to the right', 'dragged to the left', 'dragged up', 'dragged down', 'not dragged to the right', 'not dragged to the left', 'not dragged up', 'not dragged down'], values: ['Splitter dragged to the right', 'Splitter dragged to the left', 'Splitter dragged up', 'Splitter dragged down', 'Splitter not dragged to the right', 'Splitter not dragged to the left', 'Splitter not dragged up', 'Splitter not dragged down'], extraValues: ['Additional Value 191', 'Additional Value 192', 'Additional Value 193', 'Additional Value 194', 'Additional Value 195', 'Additional Value 196', 'Additional Value 197', 'Additional Value 198'] },
    ],
    TagCloud: [
        { states: ['selected', 'chosen', 'picked', 'clicked', 'not selected', 'not chosen', 'not picked', 'not clicked'], values: ['TagCloud selected', 'TagCloud chosen', 'TagCloud picked', 'TagCloud clicked', 'TagCloud not selected', 'TagCloud not chosen', 'TagCloud not picked', 'TagCloud not clicked'], extraValues: ['Additional Value 199', 'Additional Value 200', 'Additional Value 201', 'Additional Value 202', 'Additional Value 203', 'Additional Value 204', 'Additional Value 205', 'Additional Value 206'] },
    ],
    Map: [
        { states: ['zoomed', 'switched', 'not zoomed', 'not switched'], values: ['Map zoomed', 'Map switched', 'Map not zoomed', 'Map not switched'], extraValues: ['Additional Value 207', 'Additional Value 208', 'Additional Value 209', 'Additional Value 210'] },
    ],
    VideoPlayer: [
        { states: ['played', 'paused', 'fast forwarded', 'rewound', 'toggled', 'exited', 'turned up', 'turned down', 'not played', 'not paused', 'not fast forwarded', 'not rewound', 'not toggled', 'not exited', 'not turned up', 'not turned down'], values: ['VideoPlayer played', 'VideoPlayer paused', 'VideoPlayer fast forwarded', 'VideoPlayer rewound', 'VideoPlayer toggled', 'VideoPlayer exited', 'VideoPlayer turned up', 'VideoPlayer turned down', 'VideoPlayer not played', 'VideoPlayer not paused', 'VideoPlayer not fast forwarded', 'VideoPlayer not rewound', 'VideoPlayer not toggled', 'VideoPlayer not exited', 'VideoPlayer not turned up', 'VideoPlayer not turned down'], extraValues: ['Additional Value 211', 'Additional Value 212', 'Additional Value 213', 'Additional Value 214', 'Additional Value 215', 'Additional Value 216', 'Additional Value 217', 'Additional Value 218', 'Additional Value 219', 'Additional Value 220', 'Additional Value 221', 'Additional Value 222', 'Additional Value 223', 'Additional Value 224', 'Additional Value 225', 'Additional Value 226'] },
    ],
};

function lookupWidgetState(widget: string, state: string, param: string): [string, string | null] {
    if (!widgetStateMapping[widget]) {
        return [`Widget ${widget} does not exist.`, null];
    }

    const widgetStates = widgetStateMapping[widget];
    for (let group of widgetStates) {
        if (group.states.includes(state)) {
            const index = group.states.indexOf(state);
            const value = typeof group.values[index] === 'function'
                ? (group.values[index] as (widget: string, state: string, param: string) => string)(widget, state, param)
                : group.values[index];
            return [value, group.extraValues[index]];
        }
    }

    return [`The state ${state} is not applicable to the widget ${widget}.`, null];
}

