import { createContext, useContext } from 'react'

export const ControlsHintContext = createContext({
  showIfUnseen: () => {},
  setCurrentPage: () => {},
})

export const useControlsHint = () => useContext(ControlsHintContext)
