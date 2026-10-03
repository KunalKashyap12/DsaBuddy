export const StreamMonitor = {
  checkStreamChunk(accumulatedText: string): boolean {
    if (!accumulatedText || accumulatedText.length < 8) return false;
    // Abort live stream immediately if any code fence or code structure is detected
    return (
      /```/i.test(accumulatedText) ||
      /\b(class\s+Solution|def\s+[a-zA-Z_]\w*\s*\(|#include\s*<|void\s+solve\s*\(|public\s+(static\s+)?(class|void|int|boolean|List))\b/i.test(accumulatedText) ||
      /\bfor\s*\(\s*(int|let|var|auto)\s+[a-zA-Z_]\w*\s*=/i.test(accumulatedText) ||
      /\bfor\s+[a-zA-Z_]\w*\s+in\s+range\s*\(/i.test(accumulatedText)
    );
  }
};
