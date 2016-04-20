'use strict';

var TokenType = require('../token-types');

module.exports = (function() {
  /**
  * Mark whitespaces and comments
  */
  function markSpaceComments(tokens) {
    let tokensLength = tokens.length;
    let whiteSpace = -1; // Flag for whitespaces
    let spaceComment = -1; // Flag for whitespaces and comments
    let token; // Current token

    // For every token in the token list, mark spaces and line breaks
    // as spaces (set both `whiteSpace` and `sc` flags). Mark multiline comments
    // with `sc` flag.
    // If there are several spaces or tabs or line breaks or multiline
    // comments in a row, group them: take the last one's index number
    // and save it to the first token in the group as a reference:
    // e.g., `ws_last = 7` for a group of whitespaces or `sc_last = 9`
    // for a group of whitespaces and comments.
    for (var i = 0; i < tokensLength; i++) {
      token = tokens[i];
      switch (token.type) {
        case TokenType.Space:
        case TokenType.Tab:
        case TokenType.Newline:
          token.whiteSpace = true;
          token.spaceComment = true;

          if (whiteSpace === -1) whiteSpace = i;
          if (spaceComment === -1) spaceComment = i;

          break;
        case TokenType.CommentML:
        case TokenType.CommentSL:
          if (whiteSpace !== -1) {
            tokens[whiteSpace].whiteSpace_last = i - 1;
            whiteSpace = -1;
          }

          token.spaceComment = true;

          break;
        default:
          if (whiteSpace !== -1) {
            tokens[whiteSpace].whiteSpace_last = i - 1;
            whiteSpace = -1;
          }

          if (spaceComment !== -1) {
            tokens[spaceComment].spaceComment_last = i - 1;
            spaceComment = -1;
          }
      }
    }

    if (whiteSpace !== -1) tokens[whiteSpace].whiteSpace_last = i - 1;
    if (spaceComment !== -1) tokens[spaceComment].spaceComment_last = i - 1;
  }

  /**
  * Pair brackets
  */
  function markBrackets(tokens) {
    let tokensLength = tokens.length;
    let ps = []; // Parentheses
    let sbs = []; // Square brackets
    let cbs = []; // Curly brackets
    let token; // Current token

    // For every token in the token list, if we meet an opening (left)
    // bracket, push its index number to a corresponding array.
    // If we then meet a closing (right) bracket, look at the corresponding
    // array. If there are any elements (records about previously met
    // left brackets), take a token of the last left bracket (take
    // the last index number from the array and find a token with
    // this index number) and save right bracket's index as a reference:
    for (var i = 0; i < tokensLength; i++) {
      token = tokens[i];
      switch (token.type) {
        case TokenType.LeftParenthesis:
          ps.push(i);
          break;
        case TokenType.RightParenthesis:
          if (ps.length) {
            token.left = ps.pop();
            tokens[token.left].right = i;
          }
          break;
        case TokenType.LeftSquareBracket:
          sbs.push(i);
          break;
        case TokenType.RightSquareBracket:
          if (sbs.length) {
            token.left = sbs.pop();
            tokens[token.left].right = i;
          }
          break;
        case TokenType.LeftCurlyBracket:
          cbs.push(i);
          break;
        case TokenType.RightCurlyBracket:
          if (cbs.length) {
            token.left = cbs.pop();
            tokens[token.left].right = i;
          }
          break;
      }
    }
  }

  return function(tokens) {
    markBrackets(tokens);
    markSpaceComments(tokens);
  };
})();
