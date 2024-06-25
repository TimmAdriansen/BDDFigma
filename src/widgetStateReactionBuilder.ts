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
        console.log(id);
        //console.log(widget);
        //console.log(action)

        let eventCondition = action.conditions[action.conditions.length - 1];
        let eventID = eventCondition.params.id;
        //console.log(eventID);
        const eventWidget = findInstanceByName(eventID);
        //console.log(eventWidget);


        let isConditional = false;
        let commonStates = ['displayed', 'shown', 'available', 'enabled', 'disabled'];

        for (let index = 0; index < action.conditions.length; index++) {
            const element = action.conditions[index];
            //console.log(element);
            if (!commonStates.includes(element.type) && index != action.conditions.length - 1) {
                isConditional = true;
            }
        }

        let mainAction = this.determineAction(id, action, widget);
        //console.log(mainAction);
        const mainActions: Action[] = [];
        if (mainAction != null) {
            mainActions.push(mainAction);
        }
        //DETERMINE TRIGGER FIRST
        const trigger: Trigger = {
            type: 'ON_CLICK'
        };

        if (isConditional) {
            const elseActions: Action[] = [];
            //we get the action by same method of doing either setNodeAction or setVariableAction
            //all we have to do here is to create the conditionData (which I think might have to be recursive as conditions just are added to the previous ones)
            //let conditionalAction = this.setConditionalAction(this.setIfConditional(mainAction), this.setElseConditional(elseActions));
            return;
        }

        if (eventWidget) {
            let reactions = clone(eventWidget.reactions);
            let reaction: Reaction | null = getReactionOfTriggerType(reactions, trigger);
            if (reaction == null) {
                reaction = this.setReaction(mainActions, trigger)
                reactions.push(reaction);
            } else {
                if (mainAction) {
                    reaction.actions?.push(mainAction);
                }
            }
            eventWidget.reactions = reactions;
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
                    //WE NEED TO APPEND TO ACTIONS - TWO CLICK ACTIONS -> ONLY ONE IS TRIGGERED
                    let variable = getVariableByName(this.collection, id + ":var:" + "value");
                    if (variable) {
                        let paramsValue = action.params.value;
                        if (variable.resolvedType == "BOOLEAN") paramsValue = !action.negated;
                        let value = this.setVariableData(variable.resolvedType, variable.resolvedType, paramsValue);
                        setAction = this.setVariableAction(variable.id, value);
                    }
                }

            } else {

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
            } else {

            }
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
            console.log(element);
            returnReaction = element;
            break;
        }
    }

    return returnReaction;
}
