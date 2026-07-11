// Tokenization happens fully client-side via gpt-tokenizer, a pure-JS BPE
// implementation — no server call needed, unlike Claude's tokenizer, which
// Anthropic only exposes through an API endpoint.
import * as cl100k from 'gpt-tokenizer/encoding/cl100k_base'
import * as o200k from 'gpt-tokenizer/encoding/o200k_base'

export const ENCODINGS = {
  cl100k_base: { label: 'GPT-3.5 / GPT-4 (cl100k_base)', encode: cl100k.encode, decode: cl100k.decode },
  o200k_base: { label: 'GPT-4o (o200k_base)', encode: o200k.encode, decode: o200k.decode },
}

// Decoding every token individually to show it as its own chip is O(n) calls
// into the tokenizer, which gets slow past a few hundred tokens — plenty for
// what this tool is for (previewing a sentence or paragraph), so the
// visualization caps there while the raw id list stays uncapped.
const MAX_TOKENS_SHOWN = 600

export function tokenize(text, encodingKey) {
  const { encode, decode } = ENCODINGS[encodingKey]
  if (text === '') return { ids: [], tokens: [], total: 0, truncated: false }

  const ids = encode(text)
  const shownIds = ids.slice(0, MAX_TOKENS_SHOWN)
  const tokens = shownIds.map((id) => ({ id, text: decode([id]) }))
  return { ids, tokens, total: ids.length, truncated: ids.length > MAX_TOKENS_SHOWN }
}
