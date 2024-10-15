# dictionary_output_tokenizer

The purpose of this repository is to demonstrate/compare different ways to tokenize text, for text classification (ie: word count matrix) and/or text generation. This JavaScript tokenizers uses regex to find unique words and assign each unique word to a number; regex is a powerful library that can be used to preprocess text strings. 


## Example of library usage

[Demonstration of how to use the library: Word tokenization for word count text classification] https://codesolutions2.github.io/dictionary_output_tokenizer/index7.html
The example webapp shows the tokenizer output of the dictionary_output_tokenizer, and the encode output of a popular tokenizer for gpt ([gpt-tokenizer](https://www.jsdelivr.com/package/npm/gpt-tokenizer)) because gpt-tokenizer is rapid. 


## Library versions
The available functions that can be exported are:

### Version 0 (current version)
- async function create_tokenizer(input_text)
- async function delete_key_value(tokenizer_obj, key_names_str)
- async function encode(xs, tokenizer_obj)
- async function decode(xs_tokens, tokenizer_obj)

## In progress
  - Word tokenization similar to GPT/BERT 
  - Subword tokenization
