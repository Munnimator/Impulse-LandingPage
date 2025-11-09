#!/usr/bin/env node
/**
 * Blog Post Update Script for ImpulseLog
 *
 * This script updates the 'updatedAt' timestamp for all published blog posts.
 * This signals to Google that the content has changed, triggering faster re-crawl.
 *
 * Usage: node scripts/add-updated-dates.js [--dry-run]
 *
 * Options:
 *   --dry-run  Show what would be updated without making changes
 */

import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

/**
 * Format private key to handle both single-line (Vercel) and \n formats
 */
function formatPrivateKey(key) {
  if (!key) return key;
  if (key.includes('\n')) return key;
  if (key.includes('\\n')) return key.replace(/\\n/g, '\n');

  const match = key.match(/-----BEGIN PRIVATE KEY-----(.*?)-----END PRIVATE KEY-----/);
  if (match) {
    const base64 = match[1];
    const formatted = base64.match(/.{1,64}/g)?.join('\n') || base64;
    return `-----BEGIN PRIVATE KEY-----\n${formatted}\n-----END PRIVATE KEY-----`;
  }

  return key;
}

// Initialize Firebase Admin SDK
try {
  // Try to load from environment variables (production)
  if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: 'impulsebuy-a64e2',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
      }),
      databaseURL: 'https://impulsebuy-a64e2.firebaseio.com'
    });
    log.info('Firebase Admin SDK initialized from environment variables');
  } else {
    log.error('Firebase credentials not found in environment variables');
    log.warning('Please set FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY environment variables');
    process.exit(1);
  }
} catch (error) {
  log.error(`Failed to initialize Firebase: ${error.message}`);
  process.exit(1);
}

const db = admin.firestore();
const BLOG_COLLECTION = 'blogPosts';

/**
 * Main function to update blog posts
 */
async function updateBlogPosts() {
  log.header('ImpulseLog Blog Post Updater');

  if (isDryRun) {
    log.warning('DRY RUN MODE - No changes will be made');
  }

  try {
    // Fetch all published blog posts
    log.info('Fetching published blog posts from Firestore...');
    const snapshot = await db.collection(BLOG_COLLECTION)
      .where('published', '==', true)
      .get();

    const totalPosts = snapshot.size;
    log.success(`Found ${totalPosts} published blog posts`);

    if (totalPosts === 0) {
      log.warning('No published posts found. Exiting.');
      return;
    }

    console.log('');
    log.header('Updating Posts');

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Get current timestamp
    const now = admin.firestore.Timestamp.now();

    // Update each post
    for (const doc of snapshot.docs) {
      const postData = doc.data();
      const slug = postData.slug || 'unknown';

      try {
        if (isDryRun) {
          log.info(`Would update: ${slug}`);
          updated++;
        } else {
          // Update the updatedAt timestamp
          await doc.ref.update({
            updatedAt: now,
          });
          log.success(`Updated: ${slug}`);
          updated++;
        }
      } catch (error) {
        log.error(`Failed to update ${slug}: ${error.message}`);
        errors++;
      }
    }

    // Summary
    console.log('');
    log.header('Summary');
    console.log(`Total posts:     ${totalPosts}`);
    console.log(`${colors.green}Updated:         ${updated}${colors.reset}`);
    if (skipped > 0) {
      console.log(`${colors.yellow}Skipped:         ${skipped}${colors.reset}`);
    }
    if (errors > 0) {
      console.log(`${colors.red}Errors:          ${errors}${colors.reset}`);
    }

    console.log('');
    if (isDryRun) {
      log.warning('This was a dry run. No changes were made.');
      log.info('Run without --dry-run to apply changes');
    } else {
      log.success('All posts updated successfully!');
      log.info('Google will detect these changes and prioritize re-crawling');
    }

  } catch (error) {
    log.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run the update
updateBlogPosts()
  .then(() => process.exit(0))
  .catch((error) => {
    log.error(`Unhandled error: ${error.message}`);
    process.exit(1);
  });
