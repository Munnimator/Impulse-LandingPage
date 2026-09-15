// A single transaction-backed bucket is shared by every serverless instance.
// Fail closed if Firestore is unavailable; no unbounded per-IP documents.
export async function consumeSharedWebhookLimit(db, now = Date.now()) {
  const windowMs = 60000;
  const limit = 30;
  const ref = db.collection('_websiteSecurity').doc('blogWebhookRateLimit');
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data();
    const current = previous && now >= previous.windowStart && now - previous.windowStart < windowMs
      ? previous : { windowStart: now, count: 0 };
    const retryAfter = Math.max(1, Math.ceil((current.windowStart + windowMs - now) / 1000));
    if (current.count >= limit) return { allowed: false, retryAfter };
    transaction.set(ref, { windowStart: current.windowStart, count: current.count + 1 });
    return { allowed: true, retryAfter };
  });
}

// Check approval inside the write transaction so concurrent editorial approval
// cannot be undone by a webhook between a query and an update.
export async function updateUnapprovedDraft(db, ref, postData) {
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const previous = snapshot.data();
    if (!snapshot.exists || previous.published === true || previous.editoriallyApproved === true) return false;
    transaction.update(ref, { ...postData, createdAt: previous.createdAt || postData.createdAt });
    return true;
  });
}
