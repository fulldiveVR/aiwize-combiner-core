/* eslint-disable @typescript-eslint/no-explicit-any */


declare global {
  interface Window {
    chrome?: {
      send?: (channel: string, args: any[]) => void;
    };
    aiwize_applications?: {
      onPageScreenshotsReceived?: (items: string[]) => void;
      onPageContentReceived?: (success: boolean, content: string) => void;
      onPageInfoReceived?: (link: string, title: string) => void;
    };
  }
}

export class BrowserBackend {
  /**
   * Opens a link in the browser using the AIWIZE native bridge (if available)
   */
  openLink(url: string): void {
    window?.chrome?.send?.("aiwize_applications.openLink", [url]);
  }

  /**
   * Retrieves full HTML content of the current page from the browser extension
   */
  async getPageContent(): Promise<string> {
    return new Promise((resolve) => {
      window.aiwize_applications ??= {};

      window.aiwize_applications.onPageContentReceived = (_success, content) => {
        console.debug(
          "[BrowserBackend] onPageContentReceived:",
          _success,
          content.length
        );
        resolve(content);
      };

      window?.chrome?.send?.("aiwize_applications.getPageContent", []);
    });
  }

  /**
   * Retrieves the URL and title of the current page
   */
  async getPageInfo(): Promise<[string, string]> {
    return new Promise((resolve) => {
      window.aiwize_applications ??= {};

      window.aiwize_applications.onPageInfoReceived = (link, title) => {
        console.debug("[BrowserBackend] onPageInfoReceived:", link, title);
        resolve([link, title]);
      };

      window?.chrome?.send?.("aiwize_applications.getPageInfo", []);
    });
  }

  /**
   * Retrieves screenshots (base64 encoded strings) of the current page
   */
  async getPageScreenshots(): Promise<string[]> {
    return new Promise((resolve) => {
      window.aiwize_applications ??= {};

      window.aiwize_applications.onPageScreenshotsReceived = (items) => {
        console.debug("[BrowserBackend] onPageScreenshotsReceived:", items);
        resolve(items);
      };

      window?.chrome?.send?.("aiwize_applications.getPageScreenshots", []);
    });
  }
}

export const useBackend = () => new BrowserBackend(); 