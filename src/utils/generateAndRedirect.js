import toast from 'react-hot-toast'

/**
 * Copies a prompt to the clipboard.
 * Returns true if copy succeeded. Does NOT open any URL.
 * The AI picker modal handles the redirect.
 */
export async function generateAndRedirect(prompt) {
  try {
    await navigator.clipboard.writeText(prompt)
    return true
  } catch {
    // Fallback: show the prompt for manual copy
    window.prompt('Salin prompt ini secara manual:', prompt)
    toast('Salin prompt di atas, lalu paste ke AI pilihan Anda.', { icon: '📋', duration: 6000 })
    return false
  }
}
