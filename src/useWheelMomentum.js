import { useEffect } from 'react'

export function useWheelMomentum(enabled) {
  useEffect(() => {
    if (!enabled) return
    let frame = 0
    let target = 0
    let position = 0
    let previousTime = null

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = null
    }

    function glide(time) {
      const remaining = target - position
      if (Math.abs(remaining) < 1) {
        window.scrollTo({ top: target, behavior: 'instant' })
        stop()
        return
      }
      const elapsed = previousTime === null ? 17 : Math.min(time - previousTime, 48)
      previousTime = time
      position += remaining * (1 - Math.exp(-elapsed / 100))
      window.scrollTo({ top: position, behavior: 'instant' })
      frame = requestAnimationFrame(glide)
    }

    function hasNestedScroll(element, delta) {
      for (let node = element; node instanceof Element && node !== document.body; node = node.parentElement) {
        if (!/auto|scroll/.test(getComputedStyle(node).overflowY)) continue
        if (delta > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true
        if (delta < 0 && node.scrollTop > 0) return true
      }
      return false
    }

    function wheel(event) {
      if (!event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey ||
          Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
          (event.target instanceof Element && event.target.closest('input, select, textarea, dialog')) ||
          hasNestedScroll(event.target, event.deltaY)) {
        if (frame) stop()
        return
      }

      const viewport = window.innerHeight
      const limit = Math.max(0, document.documentElement.scrollHeight - viewport)
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 22 :
        event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? viewport : 1
      const input = event.deltaY * unit
      const delta = Math.max(-viewport, Math.min(viewport, input * 1.14))
      event.preventDefault()
      const directionChanged = frame && Math.sign(target - position) !== Math.sign(delta)
      if (!frame) position = window.scrollY
      target = Math.max(0, Math.min(limit, (frame && !directionChanged ? target : position) + delta))
      if (!frame && target !== position) frame = requestAnimationFrame(glide)
    }

    window.addEventListener('wheel', wheel, { passive: false })
    window.addEventListener('keydown', stop)
    window.addEventListener('pointerdown', stop, { passive: true })
    return () => {
      stop()
      window.removeEventListener('wheel', wheel)
      window.removeEventListener('keydown', stop)
      window.removeEventListener('pointerdown', stop)
    }
  }, [enabled])
}
