import { useEffect } from 'react'

export function useScrollReveals(root, pathname, enabled) {
  useEffect(() => {
    if (!enabled || !root.current || !('IntersectionObserver' in window)) return
    const sections = [...root.current.querySelectorAll('[data-reveal]')]
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.dataset.revealState = 'visible'
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: .05 })

    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * .88) continue
      section.dataset.revealState = 'pending'
      observer.observe(section)
    }

    return () => {
      observer.disconnect()
      for (const section of sections) delete section.dataset.revealState
    }
  }, [root, pathname, enabled])
}
