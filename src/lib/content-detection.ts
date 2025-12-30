/**
 * Detects the content type and language of a given text string
 * Returns the detected language/type and whether it's valid JSON
 */
export function detectContentType(content: string): {
  type: string;
  language: string | null;
  isValidJson: boolean;
} {
  if (!content || content.trim().length === 0) {
    return { type: 'text', language: null, isValidJson: false };
  }

  const trimmed = content.trim();

  // Try to parse as JSON first
  let isValidJson = false;
  try {
    JSON.parse(trimmed);
    isValidJson = true;
    // If it's valid JSON, return JSON type
    return { type: 'json', language: 'json', isValidJson: true };
  } catch {
    isValidJson = false;
  }

  // Check for HTML
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    return { type: 'html', language: 'html', isValidJson: false };
  }

  // Check for XML
  if (/<\?xml[\s\S]*\?>/i.test(trimmed) || /<[a-z]+:[\s\S]*>/i.test(trimmed)) {
    return { type: 'xml', language: 'xml', isValidJson: false };
  }

  // Check for SQL
  const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|FROM|WHERE|JOIN|INNER|OUTER|LEFT|RIGHT|GROUP BY|ORDER BY|HAVING|UNION|EXEC|EXECUTE)\b/i;
  if (sqlKeywords.test(trimmed) && trimmed.length > 20) {
    return { type: 'sql', language: 'sql', isValidJson: false };
  }

  // Check for JavaScript/TypeScript
  const jsPatterns = [
    /^(import|export|const|let|var|function|class|interface|type|enum)\s+/m,
    /=>\s*{?/,
    /console\.(log|error|warn|info)/,
    /\.(map|filter|reduce|forEach)\(/,
    /async\s+function/,
    /await\s+/,
  ];
  const hasJsPatterns = jsPatterns.some(pattern => pattern.test(trimmed));
  
  if (hasJsPatterns) {
    // Check for TypeScript-specific patterns
    if (/:\s*(string|number|boolean|object|any|void|never|unknown|Record|Array<|Promise<)/.test(trimmed) ||
        /interface\s+\w+|type\s+\w+\s*=|enum\s+\w+/.test(trimmed)) {
      return { type: 'typescript', language: 'typescript', isValidJson: false };
    }
    return { type: 'javascript', language: 'javascript', isValidJson: false };
  }

  // Check for Python
  const pythonPatterns = [
    /^(def|class|import|from|if|elif|else|for|while|try|except|with|async|await)\s+/m,
    /:\s*$/m, // Python-style indentation blocks
    /print\s*\(/,
    /__name__\s*==\s*['"]__main__['"]/,
  ];
  if (pythonPatterns.some(pattern => pattern.test(trimmed))) {
    return { type: 'python', language: 'python', isValidJson: false };
  }

  // Check for CSS
  if (/^[\s\S]*\{[\s\S]*:[\s\S]*;[\s\S]*\}/.test(trimmed) && 
      !trimmed.includes('function') && 
      !trimmed.includes('=>')) {
    const cssSelectors = /^[\w\s.#:,\[\]()]+{/.test(trimmed.split('{')[0] || '');
    if (cssSelectors) {
      return { type: 'css', language: 'css', isValidJson: false };
    }
  }

  // Check for YAML
  if (/^[\s]*(---|[\w-]+:[\s]|[\s]+-[\s]+)/m.test(trimmed)) {
    return { type: 'yaml', language: 'yaml', isValidJson: false };
  }

  // Check for Markdown
  if (/^#{1,6}\s+/.test(trimmed) || /^\*\*[\s\S]+\*\*/.test(trimmed) || /^[\s]*[-*+][\s]+/.test(trimmed)) {
    return { type: 'markdown', language: 'markdown', isValidJson: false };
  }

  // Check for shell/bash
  if (/^#!\/bin\/(bash|sh)/.test(trimmed) || /^\$[\s]/.test(trimmed) || /^(cd|ls|grep|awk|sed|curl|wget)\s+/.test(trimmed)) {
    return { type: 'shell', language: 'bash', isValidJson: false };
  }

  // Default to plain text
  return { type: 'text', language: null, isValidJson: false };
}

/**
 * Formats JSON content with proper indentation
 */
export function formatJson(content: string): string {
  try {
    const parsed = JSON.parse(content);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return content;
  }
}

