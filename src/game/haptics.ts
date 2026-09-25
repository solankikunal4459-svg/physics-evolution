class HapticsManager {
  private enabled: boolean = true;

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enable: boolean) {
    this.enabled = enable;
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Soft tap (e.g. pickup)
  light() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(20);
    } catch {
      // Ignore vibration errors on non-supported platforms
    }
  }

  // Medium pulse (e.g. recipe buffer component)
  medium() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(35);
    } catch {
      // Ignore
    }
  }

  // Transformation fanfare vibration
  transform() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([40, 30, 60]);
    } catch {
      // Ignore
    }
  }

  // Invalid combination buzz vibration
  invalid() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([80, 50, 80]);
    } catch {
      // Ignore
    }
  }

  // Player hurt heavy impact vibration
  damage() {
    if (!this.enabled || typeof navigator === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate(100);
    } catch {
      // Ignore
    }
  }
}

export const haptics = new HapticsManager();
