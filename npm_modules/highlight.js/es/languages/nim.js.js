function emitWarning() {
    if (!emitWarning.warned) {
      emitWarning.warned = true;
      console.log(
        'Deprecation (warning): Using file extension in specifier is deprecated, use "highlight.js/lib/languages/nim" instead of "highlight.js/lib/languages/nim.js"'
      );
    }
  }
  emitWarning();
    import lang from './nim.js';
    export default lang;