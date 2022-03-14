const { promisify } = require('util')
const fs = require('fs')
const fsReadFile = promisify(fs.readFile)
const fsWriteFile = promisify(fs.writeFile)
const { BigNumber } = require('bignumber.js')
// Don't use exponential notation
BigNumber.config({ EXPONENTIAL_AT: [-30, 30] })

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
    const updatedAssetLinks = convertArrayAsset(event.externalAssetLinks, assetFromId, assetToId)
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
    const updatedFrom = convertArrayAsset(event.from, assetFromId, assetToId)
    if (updatedFrom) {
      event.from = updatedFrom
      console.log(`- 'from'`)
    }
    const updatedTo = convertArrayAsset(event.to, assetFromId, assetToId)
    if (updatedTo) {
      event.to = updatedTo
      console.log(`- 'to'`)
    }
    const updatedFees = convertArrayAsset(event.fees, assetFromId, assetToId)
    if (updatedFees) {
      event.fees = updatedFees
      console.log(`- 'fees'`)
    }
    const updatedAssetLinks = convertArrayAsset(event.externalAssetLinks, assetFromId, assetToId)
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
    const updatedOriginalLinked = convertLinksAsset(event.originalLinked, assetFromId, assetToId)
    if (updatedOriginalLinked) {
      event.originalLinked = updatedOriginalLinked
      console.log(` - 'originalLinked' (${event.id} "${event.label}")`)
    }
    const updatedAssetLinks = convertArrayAsset(event.externalAssetLinks, assetFromId, assetToId)
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
    const updatedDisposed = convertArrayAsset(event.disposed, assetFromId, assetToId)
    if (updatedDisposed) {
      event.disposed = updatedDisposed
      console.log(`Trade Event ${event.id} "${event.label}": updated 'disposed'`)
    }

    const updatedAcquired = convertArrayAsset(event.acquired, assetFromId, assetToId)
    if (updatedAcquired) {
      event.acquired = updatedAcquired
      console.log(`Trade Event ${event.id} "${event.label}": updated 'acquired'`)
    }

    const updatedFees = convertArrayAsset(event.fees, assetFromId, assetToId)
    if (updatedFees) {
      event.fees = updatedFees
      console.log(`Trade Event ${event.id} "${event.label}": updated 'fees'`)
    }

    const updatedAssetLinks = convertArrayAsset(event.externalAssetLinks, assetFromId, assetToId)
    if (updatedAssetLinks) {
      event.externalAssetLinks = updatedAssetLinks
      console.log(`Trade Event ${event.id} "${event.label}": updated asset links`)
    }
  }

  // Finished, export result
  await writeFile(filenameOut, data)
  console.log(`Written ${filenameOut}`)
  console.log('Note that asset ledger entries and CGT calculations in the file are now inaccurate and need to be recalculated')
  console.log('---------------------------')
}

module.exports.mergeLocations = async (filenameIn, filenameOut, locationFromId, locationToId) => {
  console.log(`Converting location ${locationFromId} to ${locationToId}, in ${filenameIn} -> ${filenameOut}`)
  if (!filenameIn || !filenameOut || !locationFromId || !locationToId) {
    console.log('Please provide all parameters')
    return
  }
  if (filenameIn === filenameOut) {
    console.log('Please provide different filenames')
    return
  }
  if (locationFromId === locationToId) {
    console.log('Please provide different locations')
    return
  }
  // convert location IDs to numbers
  locationFromId = locationFromId - 0
  locationToId = locationToId - 0

  const data = await readExportedFile(filenameIn)

  const locations = data.locations.locations
  console.log(`Loaded data with ${locations.length} locations`)
  const locationFrom = locations.find(({ id }) => id === locationFromId)
  const locationTo = locations.find(({ id }) => id === locationToId)
  if (!locationFrom) {
    console.log(`Cannot find location ${locationFromId}`)
    return
  }
  if (!locationTo) {
    console.log(`Cannot find location ${locationToId}`)
    return
  }
  console.log('Found locations')
  console.log({ locationFrom, locationTo })
  if (locationFrom.asset !== locationTo.asset) {
    console.log('Error: locations must have the same asset before merging!')
    return
  }

  // Remove location from list
  data.locations.locations = locations.filter(({ id }) => id !== locationFromId)
  console.log(`Removed from locations list (${data.locations.locations.length} remaining)`)

  // Remove location from location groups
  console.log(`Checking ${data.locations.locationGroups.length} Location Groups...`)
  for (const group of data.locations.locationGroups) {
    if (group.locations.includes(locationFromId)) {
      group.locations = group.locations.filter(id => id !== locationFromId)
      console.log(`Removed from location group ${group.id} "${group.label}"`)
    }
  }

  // Change location ledger entries
  console.log(`Checking ${data.locations.locationLedgerEntries.length} Location Ledger Entries...`)
  for (const entry of data.locations.locationLedgerEntries) {
    if (entry.location === locationFromId) {
      entry.location = locationToId
      console.log(`Location Ledger Entry ${entry.id} "${entry.label}" (${entry.date}) updated`)
    }
  }

  // Change income sources
  console.log(`Checking ${data.incomeSources.incomeSources.length} Income Sources...`)
  for (const source of data.incomeSources.incomeSources) {
    if (source.originalLocation === locationFromId) {
      source.originalLocation = locationToId
      console.log(`Income Source ${source.id} "${source.label}" 'originalLocation' updated`)
    }
    if (source.incomeLocation === locationFromId) {
      source.incomeLocation = locationToId
      console.log(`Income Source ${source.id} "${source.label}" 'incomeLocation' updated`)
    }
  }

  // Change income events
  console.log(`Checking ${data.incomeEvents.incomeEvents.length} Income Events...`)
  for (const event of data.incomeEvents.incomeEvents) {
    const updatedOriginalLinked = convertLinksLocation(event.originalLinked, locationFromId, locationToId)
    if (updatedOriginalLinked) {
      event.originalLinked = updatedOriginalLinked
      console.log(` - 'originalLinked' (${event.id} "${event.label}")`)
    }
  }

  // Finished, export result
  await writeFile(filenameOut, data)
  console.log(`Written ${filenameOut}`)
  console.log('---------------------------')
}

module.exports.convertLocationToPool = async (filenameIn, filenameOut, locationId, assetToId, filenamePrices) => {
  console.log(`Converting ${locationId} to a pool of ${assetToId}, in ${filenameIn} -> ${filenameOut}, using prices from ${filenamePrices}`)
  if (!filenameIn || !filenameOut || !locationId || !assetToId || !filenamePrices) {
    console.log('Please provide all parameters')
    return
  }
  if (filenameIn === filenameOut) {
    console.log('Please provide different filenames')
    return
  }
  const prices = await readExportedFile(filenamePrices)
  console.log(`Using provided prices for assets ${Object.keys(prices).join(', ')}`)

  // convert location IDs to numbers
  locationId = locationId - 0

  const data = await readExportedFile(filenameIn)

  const assets = data.assets.assets
  const locations = data.locations.locations
  console.log(`Loaded data with ${assets.length} assets, ${locations.length} locations`)
  const location = locations.find(({ id }) => id === locationId)
  if (!location) {
    console.log(`Cannot find location ${locationId}`)
    return
  }
  const assetFrom = assets.find(({ id }) => id === location.asset)
  const assetTo = assets.find(({ id }) => id === assetToId)
  if (!assetFrom) {
    console.log(`Cannot find location asset ${location.asset}`)
    return
  }
  if (!assetTo) {
    console.log(`Cannot find pool asset ${assetToId}`)
    return
  }
  if (assetFrom.id === assetTo.id) {
    console.log('Error: location is already associated with the pool asset')
    return
  }
  console.log('Found location and assets')
  console.log({ location, assetFrom, assetTo })

  // Change asset in location
  location.asset = assetToId
  console.log(`Location ${location.id} "${location.label}" changed to pool asset`)

  // Find location ledger entries for this location
  const myLocationLedgerEntries = data.locations.locationLedgerEntries.filter(({ location }) => location === locationId)
  console.log(`Found ${myLocationLedgerEntries.length} ledger entries for this location`)
  // Check that the ledger entries are things we can convert
  for (const event of myLocationLedgerEntries) {
    for (const link of event.linked) {
      if (!['transferEvent', 'incomeEvent'].includes(link.type)) {
        console.log(`Error: Found unsupported location ledger entry type "${link.type}" (${event.id} "${event.label}" ${event.date})`)
        return
      } else {
        // console.log(`Supported type ${link.type}`)
      }
    }
  }

  // Make easy locationLedgerEntry lookups
  const locationLedgerEntriesMap = Object.fromEntries(
    Object.values(data.locations.locationLedgerEntries).map(location => [location.id, location])
  )
  const myLocationLedgerEntriesMap = Object.fromEntries(
    Object.values(myLocationLedgerEntries).map(location => [location.id, location])
  )

  // Make an easy assetLedgerEntry lookup
  const assetLedgerEntriesMap = Object.fromEntries(
    Object.values(data.assets.assetLedgerEntries).map(entry => [entry.id, entry])
  )

  // Convert income events:
  // 1. look at all income sources and correct their assets if pointing to this location
  //    (N.B. these are default settings, a source can have a mixture of income events with different locations)
  /*
      {
        "id": 3,
        "label": "Celsius DAI savings: DAI interest",
        "originalAsset": "DAI",   <--- optional, replace with new asset ID if location below matches
        "originalLocation": 71,   <--- optional, check location matches
        "incomeAsset": "DAI",     <--- replace with new asset ID if location below matches
        "incomeLocation": 71,
        "defaultLabel": "Celsius Dai interest earned",
        "comments": "Get the precise amounts from the emailed statement. The app limits the number of decimal places displayed."
      },
  */
  console.log(`Checking ${data.incomeSources.incomeSources.length} Income Sources...`)
  for (const source of data.incomeSources.incomeSources) {
    if (source.originalLocation === locationId) {
      source.originalAsset = assetToId
      console.log(`Income Source ${source.id} "${source.label}" 'originalAsset' updated`)
    }
    if (source.incomeLocation === locationId) {
      source.incomeAsset = assetToId
      console.log(`Income Source ${source.id} "${source.label}" 'incomeAsset' updated`)
    }
  }

  // 2. look at all income events and update originalLinked that points to this location
  /*
        "originalLinked": [
          {
            "type": "asset",
            "id": "DAI"   <----- replace with new asset ID if location below matches
          },
          {
            "type": "location",
            "id": 71
          }
        ],
  */
  console.log(`Checking ${data.incomeEvents.incomeEvents.length} Income Events (originalLinked)...`)
  for (const event of data.incomeEvents.incomeEvents) {
    if (event.originalLinked?.length) {
      const originalLocationLink = event.originalLinked.find(({ type }) => type === 'location')
      if (originalLocationLink?.id === locationId) {
        const originalAssetLink = event.originalLinked.find(({ type }) => type === 'asset')
        if (originalAssetLink) {
          originalAssetLink.id = assetToId
          console.log(`Income Event originalAssetLink updated in event ${event.id} "${event.label}" (${event.date})`)
        } else {
          console.log(`(Error?) Couldn't find originalAssetLink in event ${event.id} "${event.label}" (${event.date})`)
        }
      }
    }
  }

  // 3. find income events that are linked to this location through their locationLedgerEntry,
  //    and update them
  /*
    Income Event:
      {
        "id": 16,
        "source": 3,
        "date": "2021-03-04T05:06:00.000Z",
        "label": "Celsius interest earned",
        "asset": "DAI",   <----- replace with new asset ID
        "assetValueGBP": "0.09",
        "amount": "0.12345",
        "comments": " (Using day rate: 1 DAI = £0.72)",
        "originalLinked": [
          {
            "type": "asset",
            "id": "DAI"
          },
          {
            "type": "location",
            "id": 71
          }
        ],
        "linked": [
          {
            "type": "assetLedgerEntry",
            "id": 642    <----- find this entry and update it
          },
          {
            "type": "locationLedgerEntry",
            "id": 792    <----- Match against this
          }
        ],
        "externalAssetLinks": []
      },

    Location Ledger Entry: (no changes needed)
      {
        "id": 792,
        "date": "2021-03-04T05:06:00.000Z",
        "location": 71,
        "amount": "0.12345",
        "label": "Celsius interest earned",
        "comments": " (Using day rate: 1 DAI = £0.72)",
        "linked": [
          {
            "type": "incomeEvent",
            "id": 16
          }
        ]
      },

    Asset Ledger Entry:
      {
        "id": 642,
        "date": "2021-03-04T05:06:00.000Z",
        "type": "acquisition",
        "asset": "DAI",    <----- replace with new asset ID
        "assetValueGBP": "0.09",
        "amount": "0.12345",
        "label": "Celsius interest earned",
        "comments": " (Using day rate: 1 DAI = £0.72)",
        "linked": [
          {
            "type": "incomeEvent",
            "id": 16
          }
        ]
      },
  */
  console.log(`Checking ${data.incomeEvents.incomeEvents.length} Income Events (linked)...`)
  for (const event of data.incomeEvents.incomeEvents) {
    if (event.linked?.length) {
      const locationLedgerEntryLink = event.linked.find(({ type }) => type === 'locationLedgerEntry')
      // see if this ledger entry is for our target location
      if (myLocationLedgerEntriesMap[locationLedgerEntryLink?.id]) {
        // update the asset id in the event
        event.asset = assetToId
        // look up the asset ledger entry
        const assetLedgerEntryLink = event.linked.find(({ type }) => type === 'assetLedgerEntry')
        if (assetLedgerEntryLink && assetLedgerEntriesMap[assetLedgerEntryLink.id]) {
          const assetLedgerEntry = assetLedgerEntriesMap[assetLedgerEntryLink.id]
          assetLedgerEntry.asset = assetToId
          console.log(`Income Event assetLedgerEntry updated in event ${event.id} "${event.label}" (${event.date})`)
        } else {
          console.log(`(Error?) Couldn't find assetLedgerEntry in links for event ${event.id} "${event.label}" (${event.date})`)
        }
      }
    }
  }

  // Convert transfer events involving this location to trade events
  // 1. find transfer events through locationLedgerEntries pointing to the target location
  //    in either 'from', 'to', or 'fees' (if in 'fees', throw an error!)
  const myTransferEvents = []
  const findLinkToTargetLocationEntry = event => event.linked.find(link => link.type === 'locationLedgerEntry' && myLocationLedgerEntriesMap[link.id])
  for (const transferEvent of data.transferEvents.transferEvents) {
    if ([...transferEvent.from, ...transferEvent.to].find(findLinkToTargetLocationEntry)) {
      myTransferEvents.push(transferEvent)
    } else if (transferEvent.fees.find(findLinkToTargetLocationEntry)) {
      console.log(`Error: transferEvent ${transferEvent.id} has a fee involving the target location. "${event.label}" (${event.date})`)
      return
    }
  }
  console.log(`Found ${myTransferEvents.length} transfer events involving this location`)

  // 2. check to see if prices for the original asset on those days are provided.
  //    If not, print out details of date, asset and URL and end.

  let hasAllPrices = true
  const neededPriceDates = {}
  const APP_NAME = 'mus_hoard'
  for (const transferEvent of myTransferEvents) {
    const day = transferEvent.date.substring(0, transferEvent.date.indexOf('T'))
    const priceAsset = transferEvent.asset
    const priceForTransferEvent = prices[priceAsset]?.[day]
    if (!priceForTransferEvent) {
      if (!neededPriceDates[`${priceAsset}__${day}`]) {
        const timestamp = Math.floor(new Date(day).getTime() / 1000)
        console.log(`Need GBP price of ${priceAsset} on ${day}: https://min-api.cryptocompare.com/data/dayAvg?fsym=${priceAsset}&tsym=GBP&toTs=${timestamp}&extraParams=${APP_NAME}`)
      }
      neededPriceDates[`${priceAsset}__${day}`] = true
      hasAllPrices = false
    }
  }
  if (!hasAllPrices) {
    console.log(`Error: need GBP prices listed above, please look them up and add them to prices.json e.g. { "DAI": { "2021-01-02": "0.75" } }`)
    return
  }

  // 3. replace each transfer event with a trade event
  /*
    Transfer event:
      {
          "id": 79,
          "date": "2021-01-10T11:12:00.000Z",
          "label": "Transfer Dai from Ledger to Celsius",
          "asset": "DAI",
          "amount": "10",
          "comments": " (Using day rate: 1 ETH = 1310.1 GBP)",
          "from": [
              {
                  "asset": "DAI",
                  "amount": "-10",
                  "linked": [
                      {
                          "type": "locationLedgerEntry",
                          "id": 730
                      }
                  ]
              }
          ],
          "to": [
              {
                  "asset": "DAI",
                  "amount": "10",
                  "linked": [
                      {
                          "type": "locationLedgerEntry",
                          "id": 731
                      }
                  ]
              }
          ],
          "fees": [
              {
                  "asset": "ETH",
                  "amount": "0.0033333",
                  "linked": [
                      {
                          "type": "locationLedgerEntry",
                          "id": 732
                      },
                      {
                          "type": "assetLedgerEntry",
                          "id": 603
                      }
                  ]
              }
          ],
          "externalAssetLinks": [
              {
                  "asset": "DAI",
                  "type": "transaction",
                  "item": "0xabcdef"
              }
          ]
      },

    Trade event:
      {
          "id": 20,  <--- Generate a new ID for the trade event
          "date": "2021-01-10T11:12:00.000Z",  <-- copy from transfer event 'date'
          "label": "Transfer Dai from Ledger to Celsius", <-- copy from transfer event 'label', maybe append '(Conversion)'
          "comments": " (Using day rate: 1 ETH = 1310.1 GBP)", <-- copy from transfer event 'comments'
          "fees": [
              {  <--- copy this object from the transfer event (which only has 0-1 fee)
                  "asset": "ETH", <---- IF the asset matches the original transfer asset, also subtract this fee from the corresponding disposed amount (of the same asset)
                  "amount": "0.0033333",
                  "comments": "",  <---- copy from original (add if missing)
                  "linked": [
                      {
                          "type": "locationLedgerEntry",  <---- only present in original transferEvent if fee is taken from different asset/location
                                  <---- if this was not present in the original event, ADD a new location ledger entry for it
                          "id": 732 <---- verify that the location is NOT the target location - otherwise error as unsupported
                                <---- update this entry's links to point to the new tradeEvent instead of the old transferEvent
                      },
                      {
                          "type": "assetLedgerEntry",
                          "id": 603  <---- update this entry's links to point to the new tradeEvent instead of the old transferEvent
                      }
                  ]
              }
          ],
          "disposed": [
              { <--- copy this object from the transfer event 'from' (require just 1 entry)
                  "asset": "DAI", <---- IF the associated locationLedgerEntry is the target location, change this to the pool asset
                  "amount": "10", <---- *-1, because the transfer event stores a negative amount but we want positive here
                                  <---- IF the transfer fee AND this disposed asset are the originally transferred asset, subtract the transfer fee amount
                  "comments": "",  <---- copy from original (add if missing)
                  "linked": [
                      {
                          "type": "locationLedgerEntry",
                          "id": 730  <---- find this entry object and update it (details below)
                      },
                      {  <---- add this as a NEW assetLedgerEntry (details below)
                          "type": "assetLedgerEntry",
                          "id": 335
                      }
                  ]
              }
          ],
          "acquired": [
              { <--- copy this object from the transfer event 'to' (require just 1 entry)
                  "asset": "DAI--CELSIUS", <---- IF the associated locationLedgerEntry is the target location, change this to the pool asset
                  "amount": "10",
                  "comments": "",  <---- copy from original (add if missing)
                  "linked": [
                      {
                          "type": "locationLedgerEntry",
                          "id": 731  <---- find this entry object and update it (details below)
                      },
                      {  <---- add this as a NEW assetLedgerEntry (details below)
                          "type": "assetLedgerEntry",
                          "id": 336
                      }
                  ]
              }
          ],
          "externalAssetLinks": [ <--- copy this array from the transfer event
              {
                  "asset": "DAI",
                  "type": "transaction",
                  "item": "0xabcdef"
              }
          ]
      },

      Location Ledger Entry:
        // disposed
        {
            "id": 730,
            "date": "2021-01-10T11:12:00.000Z",
            "location": 70,
            "amount": "-10",  <--- IF the transfer fee changed the disposed amount, also change this amount
            "label": "Transfer Dai from Ledger to Celsius",
            "comments": " (Using day rate: 1 ETH = 1310.1 GBP)",
            "linked": [
                {
                    "type": "transferEvent",  <---- change this to "tradeEvent"
                    "id": 79  <---- change this to the new tradeEvent's ID
                }
            ]
        },
        // acquired
        {
            "id": 731,
            "date": "2021-01-10T11:12:00.000Z",
            "location": 71,
            "amount": "10",
            "label": "Transfer Dai from Ledger to Celsius",
            "comments": " (Using day rate: 1 ETH = 1310.1 GBP)",
            "linked": [
                {
                    "type": "transferEvent",  <---- change this to "tradeEvent"
                    "id": 79  <---- change this to the new tradeEvent's ID
                }
            ]
        },

    Create New Asset Ledger Entry:
      First: fetch the GBP price of the non-pool asset (DAI) at the transfer event's 'date'
        // disposed
        {
            "id": 4, <--- generate new asset ledger entry id
            "date": "2021-01-10T11:12:00.000Z", <-- copy from transfer event 'date'
            "type": "disposal",
            "asset": "DAI",  <---- either the original or the pool asset, depending on the associated location
            "assetValueGBP": "6",  <--- calculate using the looked-up price
            "amount": "-10", <--- copy from the Location Ledger Entry 'amount' (already negative)
            "label": "Transfer Dai from Ledger to Celsius", <--- copy from the new Trade Event 'label'
            "comments": "(Using rate 1 DAI = 0.60799 GBP)",   <---- add comment with exchange rate used
            "linked": [
                {
                    "type": "tradeEvent",
                    "id": 20   <---- new trade event id
                }
            ]
        },
        // acquired
        Almost the same as 'disposed', only difference is the 'type', 'asset' and sign of the 'amount'
        {
            "id": 5, <--- generate new asset ledger entry id
            "date": "2021-01-10T11:12:00.000Z", <-- copy from transfer event 'date'
            "type": "acquisition",
            "asset": "DAI--CELSIUS",  <---- either the original or the pool asset, depending on the associated location
            "assetValueGBP": "6",  <--- calculate using the looked-up price
            "amount": "10", <--- copy from the Location Ledger Entry 'amount'
            "label": "Transfer Dai from Ledger to Celsius", <--- copy from the new Trade Event 'label'
            "comments": "(Using rate 1 DAI = 0.60799 GBP)",  <---- add comment with exchange rate used
            "linked": [
                {
                    "type": "tradeEvent",
                    "id": 20   <---- new trade event id
                }
            ]
        },
  */
  console.log(`Converting ${myTransferEvents.length} Transfer Events to Trade Events...`)
  const tradeEventsById = Object.fromEntries(
    data.tradeEvents.tradeEvents.map(event => [event.id, event])
  )
  for (const transferEvent of myTransferEvents) {
    console.log(`Convert Transfer Event #${transferEvent.id} "${transferEvent.label}" (${transferEvent.date})`)
    // create new trade event
    const newTradeEventId = findNextId(tradeEventsById)
    console.log(` - New trade event id ${newTradeEventId}`)
    const newTradeEvent = {
      id: newTradeEventId,
      date: transferEvent.date,
      label: transferEvent.label + ' (recording as conversion)',
      comments: transferEvent.comments,
      fees: [],
      disposed: [],
      acquired: [],
      externalAssetLinks: transferEvent.externalAssetLinks || []
    }
    // fees: original event may have 0 or 1 fee
    let transferAssetFeeAmount = null
    if (transferEvent.fees) {
      if (transferEvent.fees.length === 1) {
        const fee = transferEvent.fees[0]
        // Update linked assetLedgerEntry (should already be present)
        const assetLedgerEntryLink = fee.linked.find(({ type }) => type === 'assetLedgerEntry')
        const assetLedgerEntry = assetLedgerEntriesMap[assetLedgerEntryLink?.id]
        if (!assetLedgerEntry) {
          console.log(" - Error: couldn't find assetLedgerEntry for fee")
          return
        }
        const transferEventLink = assetLedgerEntry.linked?.find(({ type }) => type === 'transferEvent')
        if (!transferEventLink) {
          console.log(" - Error: couldn't find transferEventLink for fee's assetLedgerEntry")
          return
        }
        transferEventLink.type = 'tradeEvent'
        transferEventLink.id = newTradeEventId
        console.log(` - Updated fee's assetLedgerEntry ${assetLedgerEntry.id}`)

        // Update linked locationLedgerEntry - add it if not present
        const locationLedgerEntryLink = fee.linked.find(({ type }) => type === 'locationLedgerEntry')
        const existingLocationLedgerEntry = locationLedgerEntriesMap[locationLedgerEntryLink?.id]
        if (existingLocationLedgerEntry) {
          const transferEventLink = existingLocationLedgerEntry.linked?.find(({ type }) => type === 'transferEvent')
          if (!transferEventLink) {
            console.log(" - Error: couldn't find transferEventLink for fee's locationLedgerEntry")
            return
          }
          transferEventLink.type = 'tradeEvent'
          transferEventLink.id = newTradeEventId
          console.log(` - Updated fee's locationLedgerEntry ${existingLocationLedgerEntry.id}`)
        } else {
          // If no location ledger entry was present, the fee comes from the original transfer source
          // Add a location ledger entry for the fee
          const fromLocationLedgerEntryLink = transferEvent.from[0].linked.find(({ type }) => type === 'locationLedgerEntry')
          const fromLocationLedgerEntry = locationLedgerEntriesMap[fromLocationLedgerEntryLink.id]
          const newLocationLedgerEntry = {
            id: findNextId(locationLedgerEntriesMap),
            date: transferEvent.date,
            location: fromLocationLedgerEntry.location,
            amount: `-${fee.amount}`,
            label: `Fee: ${transferEvent.label}`,
            comments: fee.comments || '',
            linked: [
              {
                type: 'tradeEvent',
                id: newTradeEventId
              }
            ]
          }
          data.locations.locationLedgerEntries.push(newLocationLedgerEntry)
          locationLedgerEntriesMap[newLocationLedgerEntry.id] = newLocationLedgerEntry
          console.log(` - Added fee locationLedgerEntry ${newLocationLedgerEntry.id}`)
        }
        const feeItem = {
          asset: fee.asset,
          amount: fee.amount,
          comments: fee.comments || '',
          linked: [
            assetLedgerEntryLink
          ]
        }
        newTradeEvent.fees.push(feeItem)
        if (fee.asset === transferEvent.asset) {
          transferAssetFeeAmount = fee.amount
        }
      } else if (transferEvent.fees.length > 1) {
        console.log(` - Error: unexpected number of 'fees' for transfer event ${transferEvent.fees.length}`)
        return
      }
    }
    // disposed: copy details from the 'from'
    if (transferEvent.from) {
      if (transferEvent.from.length === 1) {
        const fromItem = transferEvent.from[0]
        const locationLedgerEntryLink = fromItem.linked?.[0]
        if (fromItem.linked?.length !== 1 && locationLedgerEntryLink?.type !== 'locationLedgerEntry') {
          console.log(` - Error: unexpected 'from.linked' contents, expected a single locationLedgerEntry`)
          return
        }
        let amount = fromItem.amount.indexOf('-') === 0 ? fromItem.amount.substring(1) : fromItem.amount
        if (transferAssetFeeAmount) {
          if (fromItem.asset === transferEvent.asset) {
            console.log(` - Subtracting transfer fee ${transferAssetFeeAmount} from disposed amount ${amount}`)
            amount = newBigNumberForAsset(amount, transferEvent.asset).minus(newBigNumberForAsset(transferAssetFeeAmount, transferEvent.asset)).toString()
            console.log(`   = ${amount}`)
          } else {
            console.error(` - Unexpected transfer fee asset ${transferEvent.asset} compared to disposed asset ${fromItem.asset}`)
            return
          }
        }
        // update the linked locationLedgerEntry
        const locationLedgerEntry = locationLedgerEntriesMap[locationLedgerEntryLink.id]
        if (!locationLedgerEntry) {
          console.log(` - Error: can't find location ledger entry ${locationLedgerEntryLink.id}`)
          return
        } else {
          locationLedgerEntry.amount = `-${amount}` // as this amount might have changed after subtracting a fee
          if (!locationLedgerEntry.linked?.length === 1 || !locationLedgerEntry.linked[0].type === 'transferEvent') {
            console.log(` - Error: unexpected locationLedgerEntry links ${locationLedgerEntryLink.id}`)
            return
          }
          locationLedgerEntry.linked[0].type = 'tradeEvent'
          locationLedgerEntry.linked[0].id = newTradeEventId
          console.log(` - Updated location ledger entry ${locationLedgerEntry.id}`)
        }

        const isTargetLocation = locationLedgerEntry.location === locationId
        const disposedAsset = isTargetLocation ? assetToId : fromItem.asset
        const day = transferEvent.date.substring(0, transferEvent.date.indexOf('T'))
        const priceAsset = transferEvent.asset
        const price = prices[priceAsset]?.[day]
        const assetValueGBP = roundFiat(newBigNumberForAsset(amount, priceAsset).times(newBigNumberForFiat(price))).toString()
        const newAssetLedgerEntryId = findNextId(assetLedgerEntriesMap)
        const newAssetLedgerEntry = {
          id: newAssetLedgerEntryId,
          date: transferEvent.date,
          type: 'disposal',
          asset: disposedAsset,
          assetValueGBP,
          amount: `-${amount}`, // negative
          label: newTradeEvent.label,
          comments: `(Using rate 1 ${priceAsset} = ${price} GBP)`,
          linked: [
            {
              type: 'tradeEvent',
              id: newTradeEventId
            }
          ]
        }
        newTradeEvent.disposed.push({
          asset: disposedAsset,
          amount, // positive
          comments: fromItem.comments || '',
          linked: [
            {
              type: 'locationLedgerEntry',
              id: locationLedgerEntry.id
            },
            {
              type: 'assetLedgerEntry',
              id: newAssetLedgerEntry.id
            }
          ]
        })
        assetLedgerEntriesMap[newAssetLedgerEntryId] = newAssetLedgerEntry
        data.assets.assetLedgerEntries.push(newAssetLedgerEntry)
        console.log(` - new asset ledger entry ${newAssetLedgerEntryId} (${newAssetLedgerEntry.type} of ${newAssetLedgerEntry.asset})`)
        // console.log(newAssetLedgerEntry)
      } else if (transferEvent.from.length > 1) {
        console.log(` - Error: unexpected number of 'from' for transfer event ${transferEvent.from.length}`)
        return
      }
    }
    // acquired: copy details from the 'to'
    if (transferEvent.to) {
      if (transferEvent.to.length === 1) {
        const toItem = transferEvent.to[0]
        const locationLedgerEntryLink = toItem.linked?.[0]
        if (toItem.linked?.length !== 1 && locationLedgerEntryLink?.type !== 'locationLedgerEntry') {
          console.log(` - Error: unexpected 'to.linked' contents, expected a single locationLedgerEntry`)
          return
        }
        // update the linked locationLedgerEntry
        const locationLedgerEntry = locationLedgerEntriesMap[locationLedgerEntryLink.id]
        if (!locationLedgerEntry) {
          console.log(` - Error: can't find location ledger entry ${locationLedgerEntryLink.id}`)
          return
        } else {
          if (!locationLedgerEntry.linked?.length === 1 || !locationLedgerEntry.linked[0].type === 'transferEvent') {
            console.log(` - Error: unexpected locationLedgerEntry links ${locationLedgerEntryLink.id}`)
            return
          }
          locationLedgerEntry.linked[0].type = 'tradeEvent'
          locationLedgerEntry.linked[0].id = newTradeEventId
          console.log(` - Updated location ledger entry ${locationLedgerEntry.id}`)
        }
        const isTargetLocation = locationLedgerEntry.location === locationId
        const acquiredAsset = isTargetLocation ? assetToId : toItem.asset
        const amount = toItem.amount
        const day = transferEvent.date.substring(0, transferEvent.date.indexOf('T'))
        const priceAsset = transferEvent.asset
        const price = prices[priceAsset]?.[day]
        const assetValueGBP = roundFiat(newBigNumberForAsset(amount, priceAsset).times(newBigNumberForFiat(price))).toString()
        const newAssetLedgerEntryId = findNextId(assetLedgerEntriesMap)
        const newAssetLedgerEntry = {
          id: newAssetLedgerEntryId,
          date: transferEvent.date,
          type: 'acquisition',
          asset: acquiredAsset,
          assetValueGBP,
          amount,
          label: newTradeEvent.label,
          comments: `(Using rate 1 ${priceAsset} = ${price} GBP)`,
          linked: [
            {
              type: 'tradeEvent',
              id: newTradeEventId
            }
          ]
        }
        newTradeEvent.acquired.push({
          asset: acquiredAsset,
          amount,
          comments: toItem.comments || '',
          linked: [
            {
              type: 'locationLedgerEntry',
              id: locationLedgerEntry.id
            },
            {
              type: 'assetLedgerEntry',
              id: newAssetLedgerEntry.id
            }
          ]
        })
        assetLedgerEntriesMap[newAssetLedgerEntryId] = newAssetLedgerEntry
        data.assets.assetLedgerEntries.push(newAssetLedgerEntry)
        console.log(` - new asset ledger entry ${newAssetLedgerEntryId} (${newAssetLedgerEntry.type} of ${newAssetLedgerEntry.asset})`)
        // console.log(newAssetLedgerEntry)
      } else if (transferEvent.from.length > 1) {
        console.log(` - Error: unexpected number of 'from' for transfer event ${transferEvent.from.length}`)
        return
      }
    }
    // console.log(` - new trade event`, newTradeEvent)
    tradeEventsById[newTradeEvent.id] = newTradeEvent
    data.tradeEvents.tradeEvents.push(newTradeEvent)

    // delete transfer event
    data.transferEvents.transferEvents = data.transferEvents.transferEvents.filter(({ id }) => id !== transferEvent.id)
    console.log(` - Removed old transfer event ${transferEvent.id}`)
  }

  // Finished, export result
  await writeFile(filenameOut, data)
  console.log(`Written ${filenameOut}`)
  console.log('Note that asset ledger entries and CGT calculations in the file are now inaccurate and need to be recalculated')
  console.log('---------------------------')
}

function convertLinksAsset (links, assetFromId, assetToId) {
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

function convertLinksLocation (links, locationFromId, locationToId) {
  if (!links.find(link => link.type === 'location' && link.id === locationFromId)) { return null }
  return links.map(link => {
    if (link.type === 'location' && link.id === locationFromId) {
      return {
        ...link,
        id: locationToId
      }
    }
    return link
  })
}

function convertArrayAsset (arr, assetFromId, assetToId) {
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

const findNextId = function (itemsById) {
  let id = 1
  while (itemsById[id]) {
    id++
  }
  return id
}

const ASSET_DECIMALS = {
  ETH: 18,
  OMG: 18,
  BTC: 8,
  BCH: 8,
  BTG: 8,
  ZEC: 8,
  LTC: 8,
  VTC: 8,
  XVG: 8,
  GAS: 8,
  USDT: 8,
  XRP: 8,
  _FIAT: 2,
  GBP: 2,
  EUR: 2,
  USD: 2,
  DAI: 18,
  GUSD: 8,
  BUSD: 18,
  LPT: 18,
  LSK: 8,
  NEO: 8,
  WBTC: 8,
  XMR: 12
}

const BIG_NUMBER_FOR_ASSET = Object.entries(ASSET_DECIMALS)
  .reduce((memo, [asset, decimals]) => {
    memo[asset] = BigNumber.clone({ DECIMAL_PLACES: decimals, EXPONENTIAL_AT: [-30, 30] })
    return memo
  }, {})

const newBigNumberForAsset = (value, asset) => {
  const BN = BIG_NUMBER_FOR_ASSET[asset] || BigNumber
  return new BN(value)
}
const newBigNumberForFiat = (value) => {
  const BN = BIG_NUMBER_FOR_ASSET._FIAT
  return new BN(value)
}

/* from MDN Math.round page: avoid floating point errors */
const round = function (number, precision) {
  const shift = function (number, precision, reverseShift) {
    if (reverseShift) {
      precision = -precision
    }
    const numArray = ('' + number).split('e')
    return +(numArray[0] + 'e' + (numArray[1] ? (+numArray[1] + precision) : precision))
  }
  return shift(Math.round(shift(number, precision, false)), precision, true)
}

const roundAssetValue = function (value, asset, toFixed) {
  const decimals = ASSET_DECIMALS[asset]
  if (decimals === undefined) { return +value }

  if (typeof value === 'string') {
    value = newBigNumberForAsset(value, asset)
  }

  if (BigNumber.isBigNumber(value)) {
    value = value.decimalPlaces(decimals)
    if (toFixed) { value = value.toFixed(decimals) }
  } else {
    value = round(value, decimals)
    if (toFixed) { value = value.toFixed(decimals) }
  }
  return value
}

const roundFiat = function (value, toFixed) {
  return roundAssetValue(value, '_FIAT', toFixed)
}
