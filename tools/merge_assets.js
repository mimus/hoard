const { promisify } = require('util')
const fs = require('fs')
const fsReadFile = promisify(fs.readFile)
const fsWriteFile = promisify(fs.writeFile)

module.exports.mergeAssets = async (filenameIn, filenameOut, assetFromId, assetToId) => {
  console.log(`Converting ${assetFromId} to ${assetToId}, in ${filenameIn} -> ${filenameOut}`)
  if (!filenameIn || !filenameOut || !assetFromId || !assetToId) {
    console.log('Please provide all parameters')
    return
  }
  if (filenameIn === filenameOut) {
    console.log('Please provide different filenames')
    return
  }
  if (assetFromId === assetToId) {
    console.log('Please provide different assets')
    return
  }

  const data = await readExportedFile(filenameIn)

  const assets = data.assets.assets
  console.log(`Loaded data with ${assets.length} assets`)
  const assetFrom = assets.find(({ id }) => id === assetFromId)
  const assetTo = assets.find(({ id }) => id === assetToId)
  if (!assetFrom) {
    console.log(`Cannot find asset ${assetFromId}`)
    return
  }
  if (!assetTo) {
    console.log(`Cannot find asset ${assetToId}`)
    return
  }
  console.log('Found assets')
  console.log({ assetFrom, assetTo })

  // Remove asset from list
  data.assets.assets = assets.filter(({ id }) => id !== assetFromId)
  console.log(`Removed from assets list (${data.assets.assets.length} remaining)`)

  // Change asset in asset ledger entries
  console.log(`Checking ${data.assets.assetLedgerEntries.length} Asset Ledger Entries...`)
  for (const entry of data.assets.assetLedgerEntries) {
    if (entry.asset === assetFromId) {
      entry.asset = assetToId
      console.log(`Asset Ledger Entry ${entry.id} "${entry.label}" (${entry.type}, ${entry.date}) updated`)
    }
  }

  // Change asset in locations
  console.log(`Checking ${data.locations.locations.length} Locations...`)
  for (const location of data.locations.locations) {
    if (location.asset === assetFromId) {
      location.asset = assetToId
      console.log(`Location ${location.id} "${location.label}" updated`)
    }
  }

  // Change asset in mining pools
  console.log(`Checking ${data.miningPools.miningPools.length} Mining Pools...`)
  for (const miningPool of data.miningPools.miningPools) {
    if (miningPool.asset === assetFromId) {
      miningPool.asset = assetToId
      console.log(`Mining Pool ${miningPool.id} "${miningPool.label}" updated`)
    }
  }
  console.log(`Checking ${data.miningEvents.miningEvents.length} Mining Events...`)
  for (const event of data.miningEvents.miningEvents) {
    const updatedAssetLinks = convertArray(event.externalAssetLinks, assetFromId, assetToId)
    if (updatedAssetLinks) {
      event.externalAssetLinks = updatedAssetLinks
      console.log(`Mining Event asset links ${event.id} "${event.label}" updated`)
    }
  }

  // Change transfer events
  console.log(`Checking ${data.transferEvents.transferEvents.length} Transfer Events...`)
  for (const event of data.transferEvents.transferEvents) {
    if (event.asset === assetFromId) {
      event.asset = assetToId
      console.log(`Transfer Event ${event.id} "${event.label}" updated:`)
    }
    const updatedFrom = convertArray(event.from, assetFromId, assetToId)
    if (updatedFrom) {
      event.from = updatedFrom
      console.log(`- 'from'`)
    }
    const updatedTo = convertArray(event.to, assetFromId, assetToId)
    if (updatedTo) {
      event.to = updatedTo
      console.log(`- 'to'`)
    }
    const updatedFees = convertArray(event.fees, assetFromId, assetToId)
    if (updatedFees) {
      event.fees = updatedFees
      console.log(`- 'fees'`)
    }
    const updatedAssetLinks = convertArray(event.externalAssetLinks, assetFromId, assetToId)
    if (updatedAssetLinks) {
      event.externalAssetLinks = updatedAssetLinks
      console.log(` - asset links`)
    }
  }

  // Change income sources
  console.log(`Checking ${data.incomeSources.incomeSources.length} Income Sources...`)
  for (const source of data.incomeSources.incomeSources) {
    if (source.originalAsset === assetFromId) {
      source.originalAsset = assetToId
      console.log(`Income Source ${source.id} "${source.label}" 'originalAsset' updated`)
    }
    if (source.incomeAsset === assetFromId) {
      source.incomeAsset = assetToId
      console.log(`Income Source ${source.id} "${source.label}" 'incomeAsset' updated`)
    }
  }

  // Change income events
  console.log(`Checking ${data.incomeEvents.incomeEvents.length} Income Events...`)
  for (const event of data.incomeEvents.incomeEvents) {
    if (event.asset === assetFromId) {
      event.asset = assetToId
      console.log(`Income Event ${event.id} "${event.label}" updated:`)
    }
    const updatedOriginalLinked = convertLinks(event.originalLinked, assetFromId, assetToId)
    if (updatedOriginalLinked) {
      event.originalLinked = updatedOriginalLinked
      console.log(` - 'originalLinked' (${event.id} "${event.label}")`)
    }
    const updatedAssetLinks = convertArray(event.externalAssetLinks, assetFromId, assetToId)
    if (updatedAssetLinks) {
      event.externalAssetLinks = updatedAssetLinks
      console.log(` - asset links`)
    }
  }

  // Change deposit events
  console.log(`Checking ${data.depositEvents.depositEvents.length} Deposit Events...`)
  for (const event of data.depositEvents.depositEvents) {
    if (event.asset === assetFromId) {
      event.asset = assetToId
      console.log(`Deposit Event ${event.id} "${event.label}" updated`)
    }
  }

  // Change trade events
  console.log(`Checking ${data.tradeEvents.tradeEvents.length} Trade Events...`)
  for (const event of data.tradeEvents.tradeEvents) {
    const updatedDisposed = convertArray(event.disposed, assetFromId, assetToId)
    if (updatedDisposed) {
      event.disposed = updatedDisposed
      console.log(`Trade Event ${event.id} "${event.label}": updated 'disposed'`)
    }

    const updatedAcquired = convertArray(event.acquired, assetFromId, assetToId)
    if (updatedAcquired) {
      event.acquired = updatedAcquired
      console.log(`Trade Event ${event.id} "${event.label}": updated 'acquired'`)
    }

    const updatedFees = convertArray(event.fees, assetFromId, assetToId)
    if (updatedFees) {
      event.fees = updatedFees
      console.log(`Trade Event ${event.id} "${event.label}": updated 'fees'`)
    }

    const updatedAssetLinks = convertArray(event.externalAssetLinks, assetFromId, assetToId)
    if (updatedAssetLinks) {
      event.externalAssetLinks = updatedAssetLinks
      console.log(`Trade Event ${event.id} "${event.label}": updated asset links`)
    }
  }

  // Finished, export result
  await writeFile(filenameOut, data)
  console.log(`Written ${filenameOut}`)
  console.log('Note that asset ledger entries and CGT calculations in the file are now inaccurate and need to be recalculated')
}

function convertLinks (links, assetFromId, assetToId) {
  if (!links.find(link => link.type === 'asset' && link.id === assetFromId)) { return null }
  return links.map(link => {
    if (link.type === 'asset' && link.id === assetFromId) {
      return {
        ...link,
        id: assetToId
      }
    }
    return link
  })
}

function convertArray (arr, assetFromId, assetToId) {
  if (!arr || !arr.find(({ asset }) => asset === assetFromId)) { return null }
  return arr.map(item => {
    if (item.asset === assetFromId) {
      return {
        ...item,
        asset: assetToId
      }
    }
    return item
  })
}

async function readExportedFile (filename) {
  const content = await fsReadFile(filename, 'utf8')
  return JSON.parse(content)
}

async function writeFile (filename, data) {
  await fsWriteFile(filename, JSON.stringify(data, null, 4))
}
