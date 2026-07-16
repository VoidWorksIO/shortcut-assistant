import changeEstimate, { setEstimate } from '../../../src/js/keyboard-shortcuts/change-estimate'


interface MockedElement extends Element {
  click: jest.Mock
}

describe('change estimate', () => {
  it('should send an event to the background script', async () => {
    chrome.runtime.sendMessage = jest.fn()

    await changeEstimate()

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'sendEvent', data: { eventName: 'change_estimate' } })
  })

  it('click on the dropdown', async () => {
    const mockDropdown = { click: jest.fn() } as MockedElement
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(mockDropdown)

    await changeEstimate()

    expect(mockDropdown.click).toHaveBeenCalled()
  })

  it('should log error to console if no dropdown is found', async () => {
    console.error = jest.fn()
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(null)

    await changeEstimate()

    expect(console.error).toHaveBeenCalledWith('The estimate dropdown was not found.')
  })
})

describe('set estimate', () => {
  const modifierKeys = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey']

  describe.each(modifierKeys)('%s is pressed', (key) => {
    it('should return early if a modifier key is pressed', async () => {
      const event = { [key]: true } as unknown as KeyboardEvent
      const documentQueryMock = jest.spyOn(document, 'querySelector')
      documentQueryMock.mockReturnValueOnce(null)

      await setEstimate(event)

      expect(documentQueryMock).not.toHaveBeenCalled()
    })
  })
  it('should return early if key is not a digit', async () => {
    const event = { key: 'Wat' } as unknown as KeyboardEvent
    const documentQueryMock = jest.spyOn(document, 'querySelector')

    await setEstimate(event)

    expect(documentQueryMock).not.toHaveBeenCalled()
  })

  it('should log an error if estimates dropdown is not found', async () => {
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(null)
    const event = { key: '1' } as unknown as KeyboardEvent

    await setEstimate(event)

    expect(console.error).toHaveBeenCalledWith('The estimates dropdown was not found.')
  })

  it('should click on the estimate if it is found', async () => {
    const mockOption = { click: jest.fn(), innerText: '1 Points' } as unknown as MockedElement
    const mockQuerySelectorAll = jest.fn().mockReturnValue([mockOption])
    const value = { querySelectorAll: mockQuerySelectorAll } as unknown as Element
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(value)

    const event = { key: '1' } as unknown as KeyboardEvent

    await setEstimate(event)

    expect(mockQuerySelectorAll).toHaveBeenCalledWith('li[role="option"]')
    expect(mockOption.click).toHaveBeenCalled()
  })

  it('should match the correct estimate among several options', async () => {
    const mockOptions = ['0 Points', '1 Points', '2 Points'].map((innerText) => {
      return { click: jest.fn(), innerText } as unknown as MockedElement
    })
    const mockQuerySelectorAll = jest.fn().mockReturnValue(mockOptions)
    const value = { querySelectorAll: mockQuerySelectorAll } as unknown as Element
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(value)

    const event = { key: '2' } as unknown as KeyboardEvent

    await setEstimate(event)

    expect(mockOptions[2].click).toHaveBeenCalled()
    expect(mockOptions[0].click).not.toHaveBeenCalled()
    expect(mockOptions[1].click).not.toHaveBeenCalled()
  })

  it('should normalize non-breaking spaces in the option text', async () => {
    const mockOption = { click: jest.fn(), innerText: '8 Points' } as unknown as MockedElement
    const mockQuerySelectorAll = jest.fn().mockReturnValue([mockOption])
    const value = { querySelectorAll: mockQuerySelectorAll } as unknown as Element
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(value)

    const event = { key: '8' } as unknown as KeyboardEvent

    await setEstimate(event)

    expect(mockOption.click).toHaveBeenCalled()
  })

  it('should log an error if the estimate is not found', async () => {
    const mockOption = { click: jest.fn(), innerText: '2 Points' } as unknown as MockedElement
    const mockQuerySelectorAll = jest.fn().mockReturnValue([mockOption])
    const value = { querySelectorAll: mockQuerySelectorAll } as unknown as Element
    jest.spyOn(document, 'querySelector').mockReturnValueOnce(value)

    const event = { key: '1' } as unknown as KeyboardEvent

    await setEstimate(event)

    expect(mockOption.click).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith('The estimate was not found.')
  })
})
