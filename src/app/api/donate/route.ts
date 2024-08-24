import {
    ACTIONS_CORS_HEADERS, // Importing CORS headers for actions
    ActionGetResponse, // Type for GET response
    ActionPostRequest, // Type for POST request
    ActionPostResponse, // Type for POST response
    createPostResponse, // Function to create a POST response
  } from "@solana/actions";
  
  import {
    Connection, // Class for Solana network connection
    LAMPORTS_PER_SOL, // Constant for lamports to SOL conversion
    PublicKey, // Class for handling public keys
    SystemProgram, // System program for basic transactions
    Transaction, // Class for creating transactions
    clusterApiUrl, // Function to get cluster API URL
  } from "@solana/web3.js";
  
  export async function GET(request: Request) {
    const url = new URL(request.url); // Parse the request URL
    const payload: ActionGetResponse = {
      // Define the GET response payload
      icon: "https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.bbc.com%2Fnews%2Fworld-africa-55173605&psig=AOvVaw27JZCEZ-djl9K3P3tcd8AK&ust=1724584270330000&source=images&cd=vfe&opi=89978449&ved=0CBQQjRxqFwoTCNCw95m_jYgDFQAAAAAdAAAAABAE", // Icon URL
      title: "Donate ", // Title
      description: "Support by donating SOL.", // Description
      label: "Donate", // Label for the action
      links: {
        actions: [
          {
            label: "Donate 0.1 SOL", // Action label
            href: `${url.href}?amount=0.1`, // Action URL with amount parameter
          },
        ],
      },
      type: "action"
    };
    return Response.json(payload, {
      headers: ACTIONS_CORS_HEADERS, // Set CORS headers
    });
  }
  
  export const OPTIONS = GET; // Allow OPTIONS request to use GET handler
  
  export async function POST(request: Request) {
    const body: ActionPostRequest = await request.json(); // Parse the request body
    const url = new URL(request.url); // Parse the request URL
    const amount = Number(url.searchParams.get("amount")) || 0.1; // Get the amount from query params or default to 0.1
    let sender;
  
    try {
      sender = new PublicKey(body.account); // Parse the sender public key
    } catch (error) {
      return Response.json(
        {
          error: {
            message: "Invalid account", // Return error if invalid account
          },
        },
        {
          status: 400, // Bad request status
          headers: ACTIONS_CORS_HEADERS, // Set CORS headers
        }
      );
    }
  
    const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed"); // Create a connection to the mainnet-beta cluster
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender, // Sender public key
        toPubkey: new PublicKey("3DrTsHjhCt1sJPEzZ5EZryrvErB4wEqtjq"), // Recipient public key
        lamports: amount * LAMPORTS_PER_SOL, // Amount to transfer in lamports
      })
    );
    transaction.feePayer = sender; // Set the fee payer
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash; // Get the latest blockhash
    transaction.lastValidBlockHeight = (
      await connection.getLatestBlockhash()
    ).lastValidBlockHeight; // Get the last valid block height
  
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction, // Add the transaction to the response payload
        message: "Transaction created", // Success message
      },
    });
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS, // Set CORS headers
    });
  }