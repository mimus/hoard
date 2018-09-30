// Adapted from https://github.com/shaunpersad/throttled-queue
// https://github.com/shaunpersad/throttled-queue/blob/master/throttled-queue.js

/**
 * Factory function.
 *
 * @param maxRequestsPerInterval
 * @param interval
 * @param evenlySpaced
 * @returns {Function}
 */
var throttledQueue = function (maxRequestsPerInterval, interval, evenlySpaced) {
  /**
   * If all requests should be evenly spaced, adjust to suit.
   */
  if (evenlySpaced) {
    interval = interval / maxRequestsPerInterval
    maxRequestsPerInterval = 1
  }

  if (interval < 200) {
    console.warn('An interval of less than 200ms can create performance issues.')
  }

  var queue = []
  var lastCalled = Date.now()

  /**
   * Gets called at a set interval to remove items from the queue.
   * This is a self-adjusting timer,
   * since the browser's setTimeout is highly inaccurate.
   */
  var dequeue = function () {
    var threshold = lastCalled + interval
    var now = Date.now()

    /**
     * Adjust the timer if it was called too early.
     */
    if (now < threshold) {
      clearTimeout(timeout)
      timeout = setTimeout(dequeue, threshold - now)
      return
    }

    var callbacks = queue.splice(0, maxRequestsPerInterval)
    for (var x = 0; x < callbacks.length; x++) {
      callbacks[x]()
    }

    lastCalled = Date.now()
    timeout = setTimeout(dequeue, interval)
  }

  /**
   * Kick off the timer.
   */
  var timeout = setTimeout(dequeue, interval)

  /**
   * Return a function that can enqueue items.
   */
  return function (callback) {
    queue.push(callback)
  }
}

export default throttledQueue
