export function speakText(text: string, rate: number = 1.0) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Clean markdown tags & code blocks
  const clean = text
    .replace(/```[\s\S]*?```/g, 'code snippet omitted')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*_#>-]/g, '')
    .trim();

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
