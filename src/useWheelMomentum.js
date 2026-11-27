import { useEffect } from 'react'

export function useWheelMomentum(enabled) {
  useEffect(() => {
    if (!enabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    let target = 0
    let position = 0
    let previousTime = null
    let scrollTarget = null

    function stop() {
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = null
      scrollTarget = null
    }

    function readTop(node) {
      return node ? node.scrollTop : window.scrollY
    }

    function writeTop(node, top) {
      if (node) node.scrollTop = top
      else window.scrollTo({ top, behavior: 'instant' })
    }

    function maxTop(node) {
      return node ? node.scrollHeight - node.clientHeight : document.documentElement.scrollHeight - window.innerHeight
    }

    function glide(time) {
      const remaining = target - position
      if (Math.abs(remaining) < 1) {
        writeTop(scrollTarget, target)
        stop()
        return
      }
      const elapsed = previousTime === null ? 17 : Math.min(time - previousTime, 48)
      previousTime = time
      position += remaining * (1 - Math.exp(-elapsed / 100))
      writeTop(scrollTarget, position)
      frame = requestAnimationFrame(glide)
    }

    function findScrollable(element, delta) {
      for (let node = element instanceof Element ? element : element?.parentElement; node instanceof Element && node !== document.body; node = node.parentElement) {
        if (!/auto|scroll/.test(getComputedStyle(node).overflowY)) continue
        const top = node.scrollTop
        const limit = node.scrollHeight - node.clientHeight
        if (delta > 0 && top < limit - 1) return node
        if (delta < 0 && top > 1) return node
      }
      const top = window.scrollY
      const limit = maxTop(null)
      if (delta > 0 && top < limit - 1) return null
      if (delta < 0 && top > 1) return null
      return undefined
    }

    function wheel(event) {
      if (!event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey ||
          Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
          (event.target instanceof Element && event.target.closest('input, select, textarea, dialog'))) {
        if (frame) stop()
        return
      }

      const viewport = window.innerHeight
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 22 :
        event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? viewport : 1
      const input = event.deltaY * unit
      const delta = Math.max(-viewport, Math.min(viewport, input * 1.14))
      const nextScroller = findScrollable(event.target, delta)
      if (nextScroller === undefined) {
        if (frame) stop()
        return
      }
      if (frame && scrollTarget !== nextScroller) stop()
      event.preventDefault()
      const directionChanged = frame && Math.sign(target - position) !== Math.sign(delta)
      if (!frame) {
        scrollTarget = nextScroller
        position = readTop(scrollTarget)
      }
      target = Math.max(0, Math.min(maxTop(scrollTarget), (frame && !directionChanged ? target : position) + delta))
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
