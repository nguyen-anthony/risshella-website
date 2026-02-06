/**
 * Submit a hunt action by creating and submitting a form
 */
export function submitHuntAction(
  action: 'complete' | 'pause' | 'abandon' | 'delete' | 'resume',
  huntId: string,
  additionalData?: Record<string, string>
): void {
  const form = document.createElement('form');
  form.method = 'post';
  form.action = `/api/hunts/${action}`;
  
  // Add hunt_id
  const huntIdInput = document.createElement('input');
  huntIdInput.type = 'hidden';
  huntIdInput.name = 'hunt_id';
  huntIdInput.value = huntId;
  form.appendChild(huntIdInput);
  
  // Add additional data
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
  }
  
  document.body.appendChild(form);
  form.submit();
}
