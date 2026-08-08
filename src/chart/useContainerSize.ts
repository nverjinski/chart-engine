import { useEffect, useState, type RefObject } from 'react'

export type ContainerSize = {
  width: number
  height: number
}

/**
 * Measure a container's content box so D3 scales can use real pixel ranges.
 * Scales need explicit width/height before domain→range mapping is valid.
 */
export function useContainerSize(
  ref: RefObject<HTMLElement | null>,
): ContainerSize {
  const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const update = (width: number, height: number) => {
      setSize((prev) =>
        prev.width === width && prev.height === height
          ? prev
          : { width, height },
      )
    }

    update(element.clientWidth, element.clientHeight)

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) return
      const { width, height } = entry.contentRect
      update(width, height)
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])

  return size
}
