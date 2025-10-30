/**
 * Chrome AI Test Utilities
 * 
 * Comprehensive testing utilities for Chrome AI APIs with detailed reporting,
 * performance metrics, and error analysis.
 */

import { chromeAIService } from '@/features/analysis/services/chrome-ai-service-simple';
import { ComprehensiveTestResult, APITestResult, ChromeAIResult } from '@/features/analysis/types/chrome-ai';

export class ChromeAITestUtils {
  /**
   * Run comprehensive tests on all Chrome AI APIs
   */
  public static async runComprehensiveTests(): Promise<ComprehensiveTestResult> {
    const availability = await chromeAIService.getAvailabilityStatus();
    
    const results: APITestResult[] = [];
    
    // Test Summarizer if available
    if (availability.summarizer) {
      const startTime = performance.now();
      try {
        const result = await chromeAIService.summarizeText("This is a test text to summarize.", { language: 'en' });
        const responseTime = performance.now() - startTime;
        
        results.push({
          apiName: 'Summarizer',
          available: result.success,
          responseTime,
          sampleResponse: result.data?.summary || null
        });
      } catch (error) {
        results.push({
          apiName: 'Summarizer',
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    // Test Writer if available
    if (availability.writer) {
      const startTime = performance.now();
      try {
        const result = await chromeAIService.generateText("Write a brief summary of artificial intelligence.", {
          tone: 'professional',
          format: 'paragraph',
          length: 'medium'
        });
        const responseTime = performance.now() - startTime;
        
        results.push({
          apiName: 'Writer',
          available: result.success,
          responseTime,
          sampleResponse: result.data?.text || null
        });
      } catch (error) {
        results.push({
          apiName: 'Writer',
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return {
      overallAvailable: availability.available,
      tests: results,
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1]
    };
  }

  /**
   * Test individual API with detailed metrics
   */
  public static async testIndividualAPI(apiName: string, testData: unknown): Promise<APITestResult> {
    const startTime = performance.now();
    let result: ChromeAIResult<unknown> | null = null;
    let error: string | undefined = undefined;

    try {
      switch (apiName.toLowerCase()) {
        case 'summarizer':
          result = await chromeAIService.summarizeText(testData as string, { language: 'en' });
          break;
        case 'writer':
          result = await chromeAIService.generateText(testData as string, {
            tone: 'professional',
            format: 'paragraph',
            length: 'medium'
          });
          break;
        default:
          throw new Error(`API ${apiName} not supported in current implementation`);
      }

      if (!result.success) {
        error = result.error?.message || 'Unknown error';
      }
    } catch (err: unknown) {
      error = err instanceof Error ? err.message : 'Unknown error';
    }

    const responseTime = performance.now() - startTime;

    return {
      apiName,
      available: result?.success || false,
      responseTime,
      error,
      sampleResponse: result?.data
    };
  }

  /**
   * Test API with user activation requirements
   */
  public static async testWithUserActivation(apiName: string, testData: unknown): Promise<APITestResult> {
    // Chrome AI APIs require user activation, so we need to ensure this is called
    // in response to a user interaction
    return await this.testIndividualAPI(apiName, testData);
  }

  /**
   * Generate test report
   */
  public static generateTestReport(testResult: ComprehensiveTestResult): string {
    const { overallAvailable, tests, timestamp, chromeVersion } = testResult;
    
    let report = `# Chrome AI API Test Report\n\n`;
    report += `**Generated:** ${timestamp.toISOString()}\n`;
    report += `**Chrome Version:** ${chromeVersion || 'Unknown'}\n`;
    report += `**Overall Available:** ${overallAvailable ? 'Yes' : 'No'}\n\n`;

    if (!overallAvailable) {
      report += `## Setup Required\n\n`;
      report += `Chrome AI APIs are not available. Please:\n`;
      report += `1. Update Chrome to version 138 or later\n`;
      report += `2. Go to chrome://flags\n`;
      report += `3. Enable the required flags for each API\n`;
      report += `4. Restart Chrome\n\n`;
    }

    report += `## API Test Results\n\n`;
    
    tests.forEach(test => {
      const status = test.available ? '✅ Available' : '❌ Not Available';
      const responseTime = test.responseTime ? ` (${test.responseTime.toFixed(2)}ms)` : '';
      report += `- **${test.apiName}:** ${status}${responseTime}\n`;
      
      if (test.error) {
        report += `  - Error: ${test.error}\n`;
      }
      
      if (test.sampleResponse) {
        report += `  - Sample Response: ${JSON.stringify(test.sampleResponse, null, 2)}\n`;
      }
      
      report += `\n`;
    });

    return report;
  }

  /**
   * Validate Chrome AI API requirements
   */
  public static async validateRequirements(): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      issues.push('Not running in browser environment');
      return { isValid: false, issues, recommendations };
    }

    // Check Chrome version
    const userAgent = navigator.userAgent;
    const chromeMatch = userAgent.match(/Chrome\/(\d+)/);
    
    if (!chromeMatch) {
      issues.push('Not running in Chrome browser');
      recommendations.push('Use Chrome browser for Chrome AI APIs');
    } else {
      const chromeVersion = parseInt(chromeMatch[1]);
      if (chromeVersion < 138) {
        issues.push(`Chrome version ${chromeVersion} is too old (requires 138+)`);
        recommendations.push('Update Chrome to version 138 or later');
      }
    }

    // Check if Chrome AI APIs are available
    const availability = await chromeAIService.getAvailabilityStatus();
    if (!availability.available) {
      issues.push('Chrome AI APIs not detected');
      recommendations.push('Enable Chrome AI flags in chrome://flags');
      recommendations.push('Restart Chrome after enabling flags');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Get sample test data for each API
   */
  public static getSampleTestData(): Record<string, unknown> {
    return {
      summarizer: {
        text: "Tesla is a leading electric vehicle manufacturer with strong growth prospects. The company has revolutionized the automotive industry with its innovative approach to sustainable transportation."
      },
      writer: {
        prompt: "Write a brief analysis of Tesla's business model and market position",
        options: {
          maxLength: 300,
          style: 'analytical',
          tone: 'professional'
        }
      },
      rewriter: {
        text: "Tesla is a good company with strong growth potential.",
        options: {
          style: 'professional',
          tone: 'analytical'
        }
      },
      translator: {
        text: "Tesla is a leading electric vehicle manufacturer.",
        targetLanguage: 'es'
      },
      languageModel: {
        text: "Tesla is a leading electric vehicle manufacturer with strong growth prospects."
      }
    };
  }
}
