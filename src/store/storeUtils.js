var timezoneString = 'GMT+0100 (BST)'

var groupBy = function (list, key) {
  return list.reduce(
    (acc, item) => {
      var groupKey = item[key]
      if (!acc[groupKey]) { acc[groupKey] = [] }
      acc[groupKey].push(item)
      return acc
    },
    {}
  )
}

var loadDate = function (list, dateKey) {
  dateKey = dateKey || 'date'
  return list.map(x => {
    return Object.assign(
      x,
      {
        date: new Date(x[dateKey])
      }
    )
  })
}

var findNextId = function (itemsById) {
  var id = 1
  while (itemsById[id]) {
    id++
  }
  return id
}

var commonFindNextId = function (itemsById) {
  return () => findNextId(itemsById)
}

// Model helpers
var commonUpdateModel = function (model, byId) {
  var id = model.id
  if (!byId[id]) {
    console.error('Invalid model ID provided')
    return
  }
  Object.assign(
    byId[id],
    model
  )
}

export default {
  timezoneString,
  groupBy,
  loadDate,
  commonFindNextId,
  commonUpdateModel
}
