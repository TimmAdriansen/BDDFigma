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
