import Groq from "groq-sdk";
import dotenv from "dotenv";
import {tavily} from "@tavily/core";

dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

// Example of using Groq for chat completions
// This is a simple example to demonstrate how to use Groq for chat completions
// You can modify the messages and model as per your requirements
export async function generate(userMessage) {
        //here messages is history data
     const messages= [ 
        {
            role:"system",
            content:  `You are a smart personal assistant who answers the asked questions.
                You have access to following tools:
                1. searchWeb({query}: {query: string}) //Search the latest information and realtime data on the internet.
                current date and time: ${new Date().toUTCString()}`,
        },
        //we'll hand it dynamically
        // {
        //   role: "user",
        //   content: "who is MLA of Shivpuri district?",
        // },
      ];
        messages.push({
            role: 'user',
            content: userMessage,
        });
        // Call the Groq chat completions API
        while(true){
        const completions = await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature:0,
         messages: messages,
        // stream:true,
        //format can be "json_object" or "json_schema" or "text"
        response_format:{type:"text"},
        //external tools
         tools: [
                {
                    type: 'function',
                    function: {
                        name: 'webSearch',
                        description:
                            'Search the latest information and realtime data on the internet.',
                        parameters: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'The search query to perform search on.',
                                },
                            },
                            required: ['query'],
                        },
                    },
                },
            ],
        tool_choice: "auto",
    })
    //push the assistant message
     messages.push(completions.choices[0].message);
     const toolCalls = completions.choices[0].message.tool_calls;
      if (!toolCalls) {
                // console.log(`Assistant: ${completions.choices[0].message.content}`);
                return completions.choices[0].message.content;
            }

   for (const tool of toolCalls) {
                // console.log('tool: ', tool);
                const functionName = tool.function.name;
                const functionParams = tool.function.arguments;

                if (functionName === 'webSearch') {
                    const toolResult = await webSearch(JSON.parse(functionParams));
                    // console.log('Tool result: ', toolResult);

                    messages.push({
                        tool_call_id: tool.id,
                        role: 'tool',
                        name: functionName,
                        content: toolResult,
                    });
                }
            }
        }
    }


// Function to perform web search using Tavily
async function webSearch({query}){
    console.log("webSearch tool is calling...");
    const response = await tvly.search(query);
      const finalResult = response.results.map((result) => result.content).join('\n\n');

    return finalResult;
} 