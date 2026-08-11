export const BLOG_ARCHIVE_PATH = '/blog';

export function getArchiveRedirectTarget({ tag, category, page, hasPosts } = {}) {
  if (tag || category) return BLOG_ARCHIVE_PATH;
  if (page > 1 && hasPosts === false) return BLOG_ARCHIVE_PATH;
  return null;
}

export function getUnavailablePostRedirectTarget(publicationState) {
  return publicationState === 'unpublished' ? BLOG_ARCHIVE_PATH : null;
}
