import { readFile } from 'node:fs/promises';

const archiveTemplateUrl = new URL('../../blog.html', import.meta.url);
const postTemplateUrl = new URL('../../blog-post.html', import.meta.url);

let archiveTemplatePromise;
let postTemplatePromise;

function readTemplate(url, label) {
  return readFile(url, 'utf8').catch(error => {
    throw new Error(`Could not load the ${label} template`, { cause: error });
  });
}

export function getBlogArchiveTemplate() {
  archiveTemplatePromise ||= readTemplate(archiveTemplateUrl, 'blog archive');
  return archiveTemplatePromise;
}

export function getBlogPostTemplate() {
  postTemplatePromise ||= readTemplate(postTemplateUrl, 'blog post');
  return postTemplatePromise;
}
