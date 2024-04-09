export class WidgetReactions {

    getTypingReactions(id: string, startString: string, reactions: any) {
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(97 + i);
            const keyCode = 65 + i;

            const reaction = {
                "action": {
                    "type": "CONDITIONAL",
                    "conditionalBlocks": [
                        {
                            "actions": [
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": id,
                                    "variableValue": {
                                        "value": letter,
                                        "type": "STRING",
                                        "resolvedType": "STRING"
                                    }
                                }
                            ],
                            "condition": {
                                "value": {
                                    "expressionArguments": [
                                        {
                                            "value": {
                                                "type": "VARIABLE_ALIAS",
                                                "id": id
                                            },
                                            "type": "VARIABLE_ALIAS",
                                            "resolvedType": "STRING"
                                        },
                                        {
                                            "value": startString,
                                            "type": "STRING",
                                            "resolvedType": "STRING"
                                        }
                                    ],
                                    "expressionFunction": "EQUALS"
                                },
                                "type": "EXPRESSION",
                                "resolvedType": "BOOLEAN"
                            }
                        },
                        {
                            "actions": [
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": id,
                                    "variableValue": {
                                        "value": {
                                            "expressionArguments": [
                                                {
                                                    "value": {
                                                        "type": "VARIABLE_ALIAS",
                                                        "id": id
                                                    },
                                                    "type": "VARIABLE_ALIAS",
                                                    "resolvedType": "STRING"
                                                },
                                                {
                                                    "value": letter, // Use the current letter
                                                    "type": "STRING",
                                                    "resolvedType": "STRING"
                                                }
                                            ],
                                            "expressionFunction": "ADDITION"
                                        },
                                        "type": "EXPRESSION",
                                        "resolvedType": "STRING"
                                    }
                                }
                            ]
                        }
                    ]
                },
                "actions": [
                    {
                        "type": "CONDITIONAL",
                        "conditionalBlocks": [
                            {
                                "actions": [
                                    {
                                        "type": "SET_VARIABLE",
                                        "variableId": id,
                                        "variableValue": {
                                            "value": letter, // Use the current letter
                                            "type": "STRING",
                                            "resolvedType": "STRING"
                                        }
                                    }
                                ],
                                "condition": {
                                    "value": {
                                        "expressionArguments": [
                                            {
                                                "value": {
                                                    "type": "VARIABLE_ALIAS",
                                                    "id": id
                                                },
                                                "type": "VARIABLE_ALIAS",
                                                "resolvedType": "STRING"
                                            },
                                            {
                                                "value": startString,
                                                "type": "STRING",
                                                "resolvedType": "STRING"
                                            }
                                        ],
                                        "expressionFunction": "EQUALS"
                                    },
                                    "type": "EXPRESSION",
                                    "resolvedType": "BOOLEAN"
                                }
                            },
                            {
                                "actions": [
                                    {
                                        "type": "SET_VARIABLE",
                                        "variableId": id,
                                        "variableValue": {
                                            "value": {
                                                "expressionArguments": [
                                                    {
                                                        "value": {
                                                            "type": "VARIABLE_ALIAS",
                                                            "id": id
                                                        },
                                                        "type": "VARIABLE_ALIAS",
                                                        "resolvedType": "STRING"
                                                    },
                                                    {
                                                        "value": letter, // Use the current letter
                                                        "type": "STRING",
                                                        "resolvedType": "STRING"
                                                    }
                                                ],
                                                "expressionFunction": "ADDITION"
                                            },
                                            "type": "EXPRESSION",
                                            "resolvedType": "STRING"
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "trigger": {
                    "type": "ON_KEY_DOWN",
                    "device": "KEYBOARD",
                    "keyCodes": [
                        keyCode // Use the adjusted keycode
                    ]
                }
            };

            reactions.push(reaction);
        }

        const reaction = {
            "action": {
                "type": "SET_VARIABLE",
                "variableId": id,
                "variableValue": {
                    "value": startString,
                    "type": "STRING",
                    "resolvedType": "STRING"
                }
            },
            "actions": [
                {
                    "type": "SET_VARIABLE",
                    "variableId": id,
                    "variableValue": {
                        "value": startString,
                        "type": "STRING",
                        "resolvedType": "STRING"
                    }
                }
            ],
            "trigger": {
                "type": "ON_KEY_DOWN",
                "device": "KEYBOARD",
                "keyCodes": [
                    8
                ]
            }
        }

        reactions.push(reaction);

        return reactions;
    }

    numericStepperMinusReaction(idFloat: string, idString: string, reactions: any) {
        console.log(idFloat);
        console.log(idString);
        const reaction =
        {
            "action": {
                "type": "CONDITIONAL",
                "conditionalBlocks": [
                    {
                        "actions": [
                            {
                                "type": "SET_VARIABLE",
                                "variableId": idFloat,
                                "variableValue": {
                                    "value": {
                                        "expressionArguments": [
                                            {
                                                "value": {
                                                    "type": "VARIABLE_ALIAS",
                                                    "id": idFloat
                                                },
                                                "type": "VARIABLE_ALIAS",
                                                "resolvedType": "FLOAT"
                                            },
                                            {
                                                "value": 1,
                                                "type": "FLOAT",
                                                "resolvedType": "FLOAT"
                                            }
                                        ],
                                        "expressionFunction": "SUBTRACTION"
                                    },
                                    "type": "EXPRESSION",
                                    "resolvedType": "FLOAT"
                                }
                            },
                            {
                                "type": "SET_VARIABLE",
                                "variableId": idString,
                                "variableValue": {
                                    "value": {
                                        "expressionArguments": [
                                            {
                                                "value": "",
                                                "type": "STRING",
                                                "resolvedType": "STRING"
                                            },
                                            {
                                                "value": {
                                                    "type": "VARIABLE_ALIAS",
                                                    "id": idFloat
                                                },
                                                "type": "VARIABLE_ALIAS",
                                                "resolvedType": "FLOAT"
                                            }
                                        ],
                                        "expressionFunction": "ADDITION"
                                    },
                                    "type": "EXPRESSION",
                                    "resolvedType": "STRING"
                                }
                            }
                        ],
                        "condition": {
                            "value": {
                                "expressionArguments": [
                                    {
                                        "value": {
                                            "type": "VARIABLE_ALIAS",
                                            "id": idFloat
                                        },
                                        "type": "VARIABLE_ALIAS",
                                        "resolvedType": "FLOAT"
                                    },
                                    {
                                        "value": 0,
                                        "type": "FLOAT",
                                        "resolvedType": "FLOAT"
                                    }
                                ],
                                "expressionFunction": "GREATER_THAN"
                            },
                            "type": "EXPRESSION",
                            "resolvedType": "BOOLEAN"
                        }
                    },
                    {
                        "actions": []
                    }
                ]
            },
            "actions": [
                {
                    "type": "CONDITIONAL",
                    "conditionalBlocks": [
                        {
                            "actions": [
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": idFloat,
                                    "variableValue": {
                                        "value": {
                                            "expressionArguments": [
                                                {
                                                    "value": {
                                                        "type": "VARIABLE_ALIAS",
                                                        "id": idFloat
                                                    },
                                                    "type": "VARIABLE_ALIAS",
                                                    "resolvedType": "FLOAT"
                                                },
                                                {
                                                    "value": 1,
                                                    "type": "FLOAT",
                                                    "resolvedType": "FLOAT"
                                                }
                                            ],
                                            "expressionFunction": "SUBTRACTION"
                                        },
                                        "type": "EXPRESSION",
                                        "resolvedType": "FLOAT"
                                    }
                                },
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": idString,
                                    "variableValue": {
                                        "value": {
                                            "expressionArguments": [
                                                {
                                                    "value": "",
                                                    "type": "STRING",
                                                    "resolvedType": "STRING"
                                                },
                                                {
                                                    "value": {
                                                        "type": "VARIABLE_ALIAS",
                                                        "id": idFloat
                                                    },
                                                    "type": "VARIABLE_ALIAS",
                                                    "resolvedType": "FLOAT"
                                                }
                                            ],
                                            "expressionFunction": "ADDITION"
                                        },
                                        "type": "EXPRESSION",
                                        "resolvedType": "STRING"
                                    }
                                }
                            ],
                            "condition": {
                                "value": {
                                    "expressionArguments": [
                                        {
                                            "value": {
                                                "type": "VARIABLE_ALIAS",
                                                "id": idFloat
                                            },
                                            "type": "VARIABLE_ALIAS",
                                            "resolvedType": "FLOAT"
                                        },
                                        {
                                            "value": 0,
                                            "type": "FLOAT",
                                            "resolvedType": "FLOAT"
                                        }
                                    ],
                                    "expressionFunction": "GREATER_THAN"
                                },
                                "type": "EXPRESSION",
                                "resolvedType": "BOOLEAN"
                            }
                        },
                        {
                            "actions": []
                        }
                    ]
                }
            ],
            "trigger": {
                "type": "ON_CLICK"
            }
        }

        reactions.push(reaction);
        return reactions;
    }

    numericStepperPlusReaction(idFloat: string, idString: string, reactions: any) {
        const reaction = {
            "action": {
                "type": "CONDITIONAL",
                "conditionalBlocks": [
                    {
                        "actions": [
                            {
                                "type": "SET_VARIABLE",
                                "variableId": idFloat,
                                "variableValue": {
                                    "value": {
                                        "expressionArguments": [
                                            {
                                                "value": {
                                                    "type": "VARIABLE_ALIAS",
                                                    "id": idFloat
                                                },
                                                "type": "VARIABLE_ALIAS",
                                                "resolvedType": "FLOAT"
                                            },
                                            {
                                                "value": 1,
                                                "type": "FLOAT",
                                                "resolvedType": "FLOAT"
                                            }
                                        ],
                                        "expressionFunction": "ADDITION"
                                    },
                                    "type": "EXPRESSION",
                                    "resolvedType": "FLOAT"
                                }
                            },
                            {
                                "type": "SET_VARIABLE",
                                "variableId": idString,
                                "variableValue": {
                                    "value": {
                                        "expressionArguments": [
                                            {
                                                "value": "",
                                                "type": "STRING",
                                                "resolvedType": "STRING"
                                            },
                                            {
                                                "value": {
                                                    "type": "VARIABLE_ALIAS",
                                                    "id": idFloat
                                                },
                                                "type": "VARIABLE_ALIAS",
                                                "resolvedType": "FLOAT"
                                            }
                                        ],
                                        "expressionFunction": "ADDITION"
                                    },
                                    "type": "EXPRESSION",
                                    "resolvedType": "STRING"
                                }
                            }
                        ],
                        "condition": {
                            "value": {
                                "expressionArguments": [
                                    {
                                        "value": {
                                            "type": "VARIABLE_ALIAS",
                                            "id": idFloat
                                        },
                                        "type": "VARIABLE_ALIAS",
                                        "resolvedType": "FLOAT"
                                    },
                                    {
                                        "value": 999,
                                        "type": "FLOAT",
                                        "resolvedType": "FLOAT"
                                    }
                                ],
                                "expressionFunction": "LESS_THAN"
                            },
                            "type": "EXPRESSION",
                            "resolvedType": "BOOLEAN"
                        }
                    },
                    {
                        "actions": []
                    }
                ]
            },
            "actions": [
                {
                    "type": "CONDITIONAL",
                    "conditionalBlocks": [
                        {
                            "actions": [
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": idFloat,
                                    "variableValue": {
                                        "value": {
                                            "expressionArguments": [
                                                {
                                                    "value": {
                                                        "type": "VARIABLE_ALIAS",
                                                        "id": idFloat
                                                    },
                                                    "type": "VARIABLE_ALIAS",
                                                    "resolvedType": "FLOAT"
                                                },
                                                {
                                                    "value": 1,
                                                    "type": "FLOAT",
                                                    "resolvedType": "FLOAT"
                                                }
                                            ],
                                            "expressionFunction": "ADDITION"
                                        },
                                        "type": "EXPRESSION",
                                        "resolvedType": "FLOAT"
                                    }
                                },
                                {
                                    "type": "SET_VARIABLE",
                                    "variableId": idString,
                                    "variableValue": {
                                        "value": {
                                            "expressionArguments": [
                                                {
                                                    "value": "",
                                                    "type": "STRING",
                                                    "resolvedType": "STRING"
                                                },
                                                {
                                                    "value": {
                                                        "type": "VARIABLE_ALIAS",
                                                        "id": idFloat
                                                    },
                                                    "type": "VARIABLE_ALIAS",
                                                    "resolvedType": "FLOAT"
                                                }
                                            ],
                                            "expressionFunction": "ADDITION"
                                        },
                                        "type": "EXPRESSION",
                                        "resolvedType": "STRING"
                                    }
                                }
                            ],
                            "condition": {
                                "value": {
                                    "expressionArguments": [
                                        {
                                            "value": {
                                                "type": "VARIABLE_ALIAS",
                                                "id": idFloat
                                            },
                                            "type": "VARIABLE_ALIAS",
                                            "resolvedType": "FLOAT"
                                        },
                                        {
                                            "value": 999,
                                            "type": "FLOAT",
                                            "resolvedType": "FLOAT"
                                        }
                                    ],
                                    "expressionFunction": "LESS_THAN"
                                },
                                "type": "EXPRESSION",
                                "resolvedType": "BOOLEAN"
                            }
                        },
                        {
                            "actions": []
                        }
                    ]
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

export class WidgetStateReactions {
    //Then states

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
}
