import DOMPurify from "dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Allows safe HTML tags (formatting, links) but strips scripts and event handlers.
 */
export const sanitizeHTML = (dirty: string): string => {
  if (typeof window === "undefined") return dirty;
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      "b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li",
      "span", "div", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote",
      "code", "pre", "img",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "class", "style", "src", "alt", "width", "height",
    ],
    ALLOW_DATA_ATTR: false,
  });
};
