const { Client } = require('@microsoft/microsoft-graph-client');
const { ConfidentialClientApplication } = require('@azure/msal-node');
const logger = require('../utils/logger');

class MicrosoftAuthService {
  constructor() {
    this.clientApp = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`
      }
    });
    
    this.graphClient = null;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get access token using client credentials flow
   */
  async getAccessToken() {
    try {
      // Check if current token is still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const clientCredentialRequest = {
        scopes: ['https://graph.microsoft.com/.default'],
      };

      const response = await this.clientApp.acquireTokenSilent(clientCredentialRequest);
      
      if (!response) {
        // If silent acquisition fails, try to acquire token
        const tokenResponse = await this.clientApp.acquireTokenByClientCredential(clientCredentialRequest);
        this.accessToken = tokenResponse.accessToken;
        this.tokenExpiry = Date.now() + (tokenResponse.expiresIn * 1000);
      } else {
        this.accessToken = response.accessToken;
        this.tokenExpiry = Date.now() + (response.expiresIn * 1000);
      }

      logger.info('Microsoft Graph access token acquired successfully');
      return this.accessToken;
    } catch (error) {
      logger.error('Failed to acquire Microsoft Graph access token:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Get authenticated Graph client
   */
  async getGraphClient() {
    try {
      const accessToken = await this.getAccessToken();
      
      if (!this.graphClient) {
        this.graphClient = Client.init({
          authProvider: (done) => {
            done(null, accessToken);
          }
        });
      }

      return this.graphClient;
    } catch (error) {
      logger.error('Failed to create Graph client:', error);
      throw error;
    }
  }

  /**
   * Test connection to Microsoft Graph
   */
  async testConnection() {
    try {
      const graphClient = await this.getGraphClient();
      const me = await graphClient.api('/me').get();
      logger.info('Microsoft Graph connection test successful:', me.displayName);
      return true;
    } catch (error) {
      logger.error('Microsoft Graph connection test failed:', error);
      return false;
    }
  }

  /**
   * Get user information
   */
  async getUserInfo() {
    try {
      const graphClient = await this.getGraphClient();
      return await graphClient.api('/me').get();
    } catch (error) {
      logger.error('Failed to get user info:', error);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new MicrosoftAuthService();
