import weaviate, { WeaviateClient } from 'weaviate-client';

// Best practice: store your credentials in environment variables
const weaviateUrl = '52kvy1rz6yu15gjx9x5g.c0.us-west3.gcp.weaviate.cloud';
const weaviateApiKey = process.env.WEAVIATE_API_KEY as string;

const client: WeaviateClient = await weaviate.connectToWeaviateCloud(
  weaviateUrl, // Replace with your Weaviate Cloud URL
  {
    authCredentials: new weaviate.ApiKey(weaviateApiKey), // Replace with your Weaviate Cloud API key
  }
);

var clientReadiness = await client.isReady();
console.log(clientReadiness); // Should return `true`

client.close(); // Close the client connection