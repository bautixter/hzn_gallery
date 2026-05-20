import { useState, useCallback } from 'react'

const key = (page) => `hint_${page}_seen`

export function useControlsHintState() {
  const [currentPage, _setCurrentPage] = useState('navigation')
  const [visible, setVisible] = useState(false)

  /** Show hint for `page` only if not yet seen this session, and update currentPage. */
  const showIfUnseen = useCallback((page) => {
    _setCurrentPage(page)
    try {
      if (!sessionStorage.getItem(key(page))) {
        sessionStorage.setItem(key(page), '1')
        setVisible(true)
      }
    } catch (_) {
      setVisible(true)
    }
  }, [])

  /** Update which page the Controls button will re-open, without forcing the overlay. */
  const setCurrentPage = useCallback((page) => {
    _setCurrentPage(page)
  }, [])

  /** Force-open the overlay on the current page (Controls button). */
  const reopenHint = useCallback(() => setVisible(true), [])

  const dismissHint = useCallback(() => setVisible(false), [])

  return { currentPage, visible, showIfUnseen, setCurrentPage, reopenHint, dismissHint }
}
