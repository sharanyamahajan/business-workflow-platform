/**
 * Real-time SLA Status Calculator
 * Calculates SLA state from actual request timestamps (never stored as static labels)
 */

function calculateSlaState(submittedAt, targetSlaAt, completedAt = null, targetSlaHours = 24) {
  const now = new Date();
  const targetDate = new Date(targetSlaAt);
  const submittedDate = new Date(submittedAt);
  const totalSlaMs = targetSlaHours * 60 * 60 * 1000;
  
  // If request has been completed
  if (completedAt) {
    const completionDate = new Date(completedAt);
    if (completionDate <= targetDate) {
      return {
        code: 'COMPLETED_WITHIN_SLA',
        label: 'Completed within SLA',
        color: 'emerald',
        isOverdue: false,
        hoursRemaining: 0
      };
    } else {
      const overHours = ((completionDate - targetDate) / (1000 * 60 * 60)).toFixed(1);
      return {
        code: 'COMPLETED_AFTER_SLA',
        label: `Completed overdue by ${overHours}h`,
        color: 'orange',
        isOverdue: true,
        hoursRemaining: 0
      };
    }
  }

  // If request is still active/open
  const remainingMs = targetDate - now;
  const remainingHours = (remainingMs / (1000 * 60 * 60)).toFixed(1);

  if (remainingMs < 0) {
    const overdueHours = Math.abs(remainingHours);
    return {
      code: 'OVERDUE',
      label: `Overdue by ${overdueHours}h`,
      color: 'rose',
      isOverdue: true,
      hoursRemaining: parseFloat(remainingHours)
    };
  }

  // Approaching threshold: 25% of total SLA duration remaining
  const warningThresholdMs = totalSlaMs * 0.25;
  if (remainingMs <= warningThresholdMs) {
    return {
      code: 'APPROACHING_SLA',
      label: `Approaching SLA (${remainingHours}h left)`,
      color: 'amber',
      isOverdue: false,
      hoursRemaining: parseFloat(remainingHours)
    };
  }

  return {
    code: 'WITHIN_SLA',
    label: `Within SLA (${remainingHours}h left)`,
    color: 'emerald',
    isOverdue: false,
    hoursRemaining: parseFloat(remainingHours)
  };
}

module.exports = { calculateSlaState };
