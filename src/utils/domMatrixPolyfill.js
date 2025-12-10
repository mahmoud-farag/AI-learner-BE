// Polyfill for DOMMatrix if it doesn't exist (needed for some pdf-parse versions)
if (!global.DOMMatrix) {
    global.DOMMatrix = class DOMMatrix { };
}
