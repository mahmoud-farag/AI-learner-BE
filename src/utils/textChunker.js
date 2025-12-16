




const textChunkerUtils = {};

// Split text into chunks for better AI processing
/**
 * @param {string} text – Full text to chunk
 * @param {number} chunkSize – Target size per chunk (in words)
 * @param {number} overlap – Number of words to overlap between chunks
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>}
 */
textChunkerUtils.chunkText = (params = {}) => {

  const { text, chunkSize = 20, overlap = 5 } = params;
  if (!text || text.trim().length === 0)
    return [];


  // Clean text while preserving paragraph structure
  const cleanedText = cleanText(text);

  // Try to split by paragraphs (single or double newlines)
  const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {

    const paragraphWords = paragraph.trim().split(/\s+/);

    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {

      if (currentChunk.length > 0) {

        chunks.push({
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        currentChunk = [];
        currentWordCount = 0;
      }


      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {

        const chunkWords = paragraphWords.slice(i, i + chunkSize);

        chunks.push({
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }

      continue;
    }


    // If adding this paragraph exceeds chunk size, save current chunk
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 1,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(' ');
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;

    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }

  }

  // Add the last chunk
  if (currentChunk.length > 0) {

    chunks.push({
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex,
      pageNumber: 1
    });

  }

  // Fallback: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {

    const allWords = cleanedText.split(/\s+/);

    for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {

      const chunkWords = allWords.slice(i, i + chunkSize);

      chunks.push({
        content: chunkWords.join(' '),
        chunkIndex: chunkIndex++,
        pageNumber: 1
      });

      if (i + chunkSize >= allWords.length) break;

    }
  }


  return chunks;


};

/**
 * Generator function to split text into chunks page by page
 * @param {object} params
 * @param {string[]} params.pages - Array of page texts
 * @param {number} params.chunkSize - Target size per chunk (in words)
 * @param {number} params.overlap - Number of words to overlap between chunks
 * @yields {object} Chunk object
 */
textChunkerUtils.chunkTextV2 = function* (params = {}) {
  const { pages, chunkSize = 20, overlap = 5 } = params;

  if (!pages || !Array.isArray(pages) || pages.length === 0) {
    // Fallback: process full text lazily if no pages provided
    const subGenerator = textChunkerUtils.chunkFromFullText(params);

    for (const chunk of subGenerator) {
      yield chunk;
    }
    return;
  }

  let chunkIndex = 0;

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const pageText = pages[pageIdx];
    const pageNumber = pageIdx + 1;

    if (!pageText || pageText.trim().length === 0) continue;

    const cleanedPageText = cleanText(pageText);
    const paragraphs = cleanedPageText.split(/\n+/).filter(p => p.trim().length > 0);

    let currentChunk = [];
    let currentWordCount = 0;

    for (const paragraph of paragraphs) {
      const paragraphWords = paragraph.trim().split(/\s+/);
      const paragraphWordCount = paragraphWords.length;

      // If single paragraph exceeds chunk size, split it by words
      if (paragraphWordCount > chunkSize) {
        if (currentChunk.length > 0) {
          yield {
            content: currentChunk.join('\n\n'),
            chunkIndex: chunkIndex++,
            pageNumber: pageNumber
          };
          currentChunk = [];
          currentWordCount = 0;
        }

        // Split large paragraph into word-based chunks
        for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
          const chunkWords = paragraphWords.slice(i, i + chunkSize);
          yield {
            content: chunkWords.join(' '),
            chunkIndex: chunkIndex++,
            pageNumber: pageNumber
          };
          if (i + chunkSize >= paragraphWords.length) break;
        }
        continue;
      }

      // If adding this paragraph exceeds chunk size, save current chunk
      if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
        yield {
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: pageNumber,
        };

        // Create overlap from previous chunk
        const prevChunkText = currentChunk.join(' ');
        const prevWords = prevChunkText.split(/\s+/);
        const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

        currentChunk = [overlapText, paragraph.trim()];
        currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;

      } else {
        // Add paragraph to current chunk
        currentChunk.push(paragraph.trim());
        currentWordCount += paragraphWordCount;
      }
    }

    // Add the last chunk of the page
    if (currentChunk.length > 0) {
      yield {
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: pageNumber
      };
    }
  }
};

/**
 * Generator function to split raw text into chunks (fallback for V2)
 * @param {object} params
 * @yields {object} Chunk object
 */
textChunkerUtils.chunkFromFullText = function* (params = {}) {

  const { text, chunkSize = 20, overlap = 5 } = params;

  if (!text || text.trim().length === 0) return;

  const cleanedText = cleanText(text);
  const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);

  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        yield {
          content: currentChunk.join('\n\n'),
          chunkIndex: chunkIndex++,
          pageNumber: 1 // Default to 1
        };
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split large paragraph into word-based chunks
      for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        yield {
          content: chunkWords.join(' '),
          chunkIndex: chunkIndex++,
          pageNumber: 1
        };
        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      yield {
        content: currentChunk.join('\n\n'),
        chunkIndex: chunkIndex++,
        pageNumber: 1,
      };

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(' ');
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords.slice(-Math.min(overlap, prevWords.length)).join(' ');

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      // Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    yield {
      content: currentChunk.join('\n\n'),
      chunkIndex: chunkIndex,
      pageNumber: 1
    };
  }
};

function cleanText(text) {

  const cleanedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/(?:\.\s*){3,}/g, ' ') // Remove sequences of 3+ dots (leaders)
    .replace(/\s+/g, ' ')
    .replace(/\n /g, '\n')
    .trim();

  return cleanedText;
}


textChunkerUtils.findRelevantChunks = (chunks, query, maxChunks = 3) => {

  if (!chunks || chunks.length === 0 || !query)
    return [];


  // Common stop words to exclude
  const stopwords = new Set([
    'the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but',
    'in', 'with', 'to', 'for', 'of', 'as', 'by', 'this', 'that', 'it'
  ]);

  // Extract and clean query words
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));

  if (queryWords.length === 0) {
    // Return clean chunk objects without Mongoose metadata
    return chunks.slice(0, maxChunks).map(chunk => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      id: chunk._id
    }));
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    // Score each query word
    for (const word of queryWords) {
      // Exact word match (higher score)
      const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
      score += exactMatches * 3;

      // Partial match (lower score)
      const partialMatches = (content.match(new RegExp(word, 'g')) || []).length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5;
    }

    // Bonus: Multiple query words found
    const uniqueWordsFound = queryWords.filter(word =>
      content.includes(word)
    ).length;

    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2;
    }

    // Normalize by content length
    const normalizedScore = score / Math.sqrt(contentWords);

    // Small bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1;


    // Return clean object without Mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus,
      rawScore: score,
      matchedWords: uniqueWordsFound
    };

  })


  return scoredChunks
    .filter(chunk => chunk.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords;
      }
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);


}

export default textChunkerUtils;
