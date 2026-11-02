/**
 * Moderator Service
 * Orchestrates calls to the server moderation proxy (OpenAI + heuristic fallback)
 * and evaluates channel policy rules.
 */

export async function moderateMessage(rawMessage, customApiKey, rules) {
  const payload = {
    text: rawMessage.text,
    apiKey: customApiKey || undefined
  };

  let moderationResult;
  try {
    const res = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      moderationResult = await res.json();
    } else {
      throw new Error('API response not ok');
    }
  } catch (err) {
    // Client-side fallback if server cannot be reached
    moderationResult = clientFallbackModeration(rawMessage.text);
  }

  // Determine policy action based on configurable thresholds
  const { flagged, confidence, categories, flaggedReason, sentiment } = moderationResult;
  let actionTaken = 'none';
  let penaltyDuration = 0;

  if (flagged || rules.raidShieldActive) {
    const isSevere = categories.hate || categories['self-harm'] || categories.violence || (confidence >= rules.autoTimeoutThreshold);
    
    if (rules.raidShieldActive) {
      actionTaken = 'auto_timed_out';
      penaltyDuration = rules.timeoutDuration || 600;
    } else if (isSevere) {
      actionTaken = 'auto_timed_out';
      penaltyDuration = rules.timeoutDuration || 600;
    } else if (confidence >= rules.autoDeleteThreshold) {
      actionTaken = 'auto_purged';
    } else {
      actionTaken = 'flagged_for_review';
    }
  }

  return {
    ...rawMessage,
    sentiment: sentiment || { score: 0, label: 'neutral', hypeScore: 0 },
    flag: {
      isFlagged: flagged,
      confidence: confidence || 0,
      categories: categories || {},
      reason: flaggedReason || (flagged ? 'Policy match' : null)
    },
    actionTaken,
    penaltyDuration,
    engine: moderationResult.engine || 'local_engine'
  };
}

function clientFallbackModeration(text) {
  const lower = text.toLowerCase();
  const toxic = lower.includes('kys') || lower.includes('die') || lower.includes('trash') || lower.includes('stfu');
  return {
    flagged: toxic,
    confidence: toxic ? 0.89 : 0.05,
    categories: { harassment: toxic, spam: false, hate: false },
    flaggedReason: toxic ? 'Detected prohibited language' : null,
    sentiment: {
      score: toxic ? -0.8 : (lower.includes('pog') || lower.includes('w') ? 0.8 : 0),
      label: toxic ? 'negative' : (lower.includes('pog') || lower.includes('w') ? 'positive' : 'neutral'),
      hypeScore: lower.includes('pog') || lower.includes('w') ? 60 : 0
    },
    engine: 'client_emergency_fallback'
  };
}
