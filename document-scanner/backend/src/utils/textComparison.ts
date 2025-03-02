/**
 * Utility for text comparison operations
 */
export class TextComparisonUtil {
  /**
   * Calculate Levenshtein distance between two strings
   * @param a First string
   * @param b Second string
   * @returns Levenshtein distance
   */
  public static levenshteinDistance(a: string, b: string): number {
    // Create matrix
    const distanceMatrix: number[][] = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(null));

    // Fill the first row
    for (let i = 0; i <= a.length; i++) {
      distanceMatrix[0][i] = i;
    }

    // Fill the first column
    for (let j = 0; j <= b.length; j++) {
      distanceMatrix[j][0] = j;
    }

    // Fill the rest of the matrix
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
        distanceMatrix[j][i] = Math.min(
          distanceMatrix[j][i - 1] + 1, // deletion
          distanceMatrix[j - 1][i] + 1, // insertion
          distanceMatrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return distanceMatrix[b.length][a.length];
  }

  /**
   * Calculate similarity score (as a percentage) between two strings
   * @param a First string
   * @param b Second string
   * @returns Similarity score (0-100)
   */
  public static calculateSimilarity(a: string, b: string): number {
    if (a.length === 0 && b.length === 0) return 100; // Both empty strings are 100% similar
    if (a.length === 0 || b.length === 0) return 0; // One empty string means 0% similarity
    
    const distance = this.levenshteinDistance(a, b);
    const maxLength = Math.max(a.length, b.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;
    
    return parseFloat(similarity.toFixed(2));
  }

  /**
   * Preprocess text for comparison
   * - Convert to lowercase
   * - Remove extra whitespace
   * - Remove special characters
   * @param text Text to preprocess
   * @returns Preprocessed text
   */
  public static preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '')
      .trim();
  }

  /**
   * Optimize comparison for long texts
   * Extracts key phrases or chunks to compare instead of whole texts
   * @param text Long text to optimize
   * @returns Optimized representation for comparison
   */
  public static optimizeForComparison(text: string): string {
    // For very long texts, we could extract key phrases or chunks
    // For now, just use the first 5000 characters
    const preprocessed = this.preprocessText(text);
    return preprocessed.substring(0, 5000);
  }
}
