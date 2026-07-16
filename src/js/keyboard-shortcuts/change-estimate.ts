// eslint-disable-next-line @typescript-eslint/require-await
async function changeEstimate(): Promise<void> {
  chrome.runtime.sendMessage({ action: 'sendEvent', data: { eventName: 'change_estimate' } })
  const dropdown: HTMLElement | null = document.querySelector('.story-points')
  if (!dropdown) {
    console.error('The estimate dropdown was not found.')
    return
  }
  dropdown.click()
  document.addEventListener('keydown', setEstimate)
}

// eslint-disable-next-line @typescript-eslint/require-await
async function setEstimate(event: KeyboardEvent): Promise<void> {
  const key = event.key

  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return
  }

  if (!key.match(/^\d+$/)) {
    return
  }
  const estimatesList: HTMLUListElement | null = document.querySelector('.react-multiselect-list')
  if (!estimatesList) {
    console.error('The estimates dropdown was not found.')
    return
  }
  const options: NodeListOf<HTMLLIElement> = estimatesList.querySelectorAll('li[role="option"]')
  const matchingOption = Array.from(options).find((option) => {
    const optionText = option.innerText.replace(/\u00A0/g, ' ').trim()
    return optionText === `${key} Points`
  })
  if (!matchingOption) {
    console.error('The estimate was not found.')
    return
  }
  matchingOption.click()
}

export default changeEstimate
export { setEstimate }
