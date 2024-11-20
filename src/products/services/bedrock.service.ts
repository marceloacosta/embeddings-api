import { Injectable } from '@nestjs/common';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class BedrockService {
  private readonly client: BedrockRuntimeClient;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: 'us-east-1',
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const command = new InvokeModelCommand({
      modelId: 'amazon.titan-embed-text-v1',
      contentType: 'application/json',
      accept: '*/*',
      body: JSON.stringify({
        inputText: text,
      }),
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return responseBody.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  async generateProductEmbedding(product: any): Promise<number[]> {
    // Combine relevant product information for embedding
    const textToEmbed = `${product.name} ${product.description} ${
      product.categories?.join(' ') || ''
    } ${product.tags?.join(' ') || ''}`.trim();

    return this.generateEmbedding(textToEmbed);
  }
}
