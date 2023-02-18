const int_type = 0
const float_type = 1
const string_type = 2

const max_string_length = 32
const object_max_name_length = 32
const int_size = 4
const char_size = 1

var tileSetCount

tiled.assetSaved.connect(function (asset) {

    if (!asset
        || asset === null
        || !asset.isTileMap) {
        return
    }

    // file names
    var mapName = asset.fileName
    var worldFileName = mapName.replace('.tmx', '.wf.') // world file
    var tileSetFileName = mapName.replace('.tmx', '.tf.') // tile file
    var objectsFileName = mapName.replace('.tmx', '.of.bin') // objects file

    var map = asset

    var tileSets = map.usedTilesets()
    tileSetCount = tileSets.length
    ExportTilesSets(tileSets, tileSetFileName)

    for (var i = 0; i < map.layerCount; i++) {
        var layer = map.layerAt(i)

        if (layer.isObjectLayer) {
            ExportObjects(layer, objectsFileName)
        }

        if (layer.isTileLayer) {
            ExportWorld(layer, worldFileName, objectsFileName)
        }
    }
})

function ExportObjects(objectLayer, fileName) {
    var objectData = [];

    for (var i = 0; i < objectLayer.objectCount; i++) {
        var object = objectLayer.objectAt(i)

        var nameLenght = object.name.length
        var name = object.name

        if (nameLenght === 0) {
            name = "col"
        }

        if (nameLenght > object_max_name_length) {
            tiled.error(`${object.name} is longer than ${object_max_name_length} characters!`)
            break
        }

        var xpos = object.x.toFixed(0);
        var ypos = object.y.toFixed(0);
        var width = object.width.toFixed(0);
        var height = object.height.toFixed(0);

        objectData.push({
            type: string_type,
            value: name
        })
        objectData.push({
            type: float_type,
            value: xpos
        })
        objectData.push({
            type: float_type,
            value: ypos
        })
        objectData.push({
            type: float_type,
            value: width
        })
        objectData.push({
            type: float_type,
            value: height
        })
    }

    var numCount = objectData.filter(i => i.type === float_type || i.type === int_type).length
    var strCount = objectData.filter(i => i.type === string_type).length

    var buffer = new ArrayBuffer((numCount * int_size) + (strCount * max_string_length))

    WriteData(objectData, new DataView(buffer))
    WriteFile(buffer,fileName);
}

function ExportTilesSets(tileSets, fileName) {
    // Save tileset 
    // Save tile for tile set
    // Save collision bodies for tile

    var tileSetId = 0

    for (var tileSetIndex = 0; tileSetIndex < tileSets.length; tileSetIndex++) {
        var tileSetData = []
        var tileset = tileSets[tileSetIndex]

        //tiled.log(`Exporting TileSet: ${tileset.name}`)
        var tileWidth, tileHeight
        tileWidth = tileset.tileWidth
        tileHeight = tileset.tileHeight

        var xOffset, yOffset
        xOffset = tileset.tileOffset.x / tileWidth
        yOffset = tileset.tileOffset.y / tileHeight

        var tileSetFileName = fileName + `${tileSetId}` // add .bin
        var tileFileName = tileSetFileName + `.tfn` // add .bin
        var collisionFileName = tileFileName + `.cl.bin`

        tileSetData.push({
            type: int_type,
            value: tileSetId
        })

        tileSetData.push({
            type: float_type,
            value: xOffset
        })

        tileSetData.push({
            type: float_type,
            value: yOffset
        })

        tileSetData.push({
            type: int_type,
            value: tileWidth
        })

        tileSetData.push({
            type: int_type,
            value: tileHeight
        })

        // Image file name
        var name = tileset.image.split('/')
        tileSetData.push({
            type: string_type,
            value: `${name[name.length - 1]}`
        })

        // Tile file name
        var name = (tileFileName + '.bin').split('/')
        tileSetData.push({
            type: string_type,
            value: `${name[name.length - 1]}`
        })

        // collision file name
        var name = collisionFileName.split('/')
        tileSetData.push({
            type: string_type,
            value: `${name[name.length - 1]}`
        })

        var numLength = tileSetData.filter(i => i.type === int_type || i.type === float_type).length

        var stringCount = tileSetData.filter(i => i.type === string_type).length

        var tileSetBuffer = new ArrayBuffer((int_size * numLength) + (stringCount * max_string_length))

        WriteData(tileSetData, new DataView(tileSetBuffer))
        WriteFile(tileSetBuffer, `${tileSetFileName}.bin`)

        // Info about tiles
        var tileId = 0
        var tileData = []
        var tileCollisionData = []

        for (var y = 0; y < tileset.imageHeight; y += tileHeight) {
            for (var x = 0; x < tileset.imageWidth; x += tileWidth) {
                var tile = tileset.findTile(tileId)

                if (!tile) {
                    // This can be ignored.... most of the time
                    tiled.log(`Null tile found, skipping: ${tileId}`)
                    continue
                }

                tileData.push({
                    type: int_type,
                    value: tile.id
                })

                // xposition
                tileData.push({
                    type: int_type,
                    value: x
                })

                // yposition
                tileData.push({
                    type: int_type,
                    value: y
                })

                tileId++

                var objectsGroup = tile.objectGroup

                if (objectsGroup != null) {
                    objectsGroup.objects.forEach(obj => {

                        tileCollisionData.push({
                            type: int_type,
                            value: tileId
                        })

                        // xposition
                        tileCollisionData.push({
                            type: int_type,
                            value: obj.x
                        })

                        // yposition
                        tileCollisionData.push({
                            type: int_type,
                            value: obj.y
                        })

                        // width
                        tileCollisionData.push({
                            type: int_type,
                            value: obj.width
                        })

                        // height
                        tileCollisionData.push({
                            type: int_type,
                            value: obj.height
                        })
                    })
                }
            }
        }

        //        tiled.log(`Tiles: ${tileData.length / 3}`)

        var tileBuffer = new ArrayBuffer(tileData.length * int_size)
        WriteData(tileData, new DataView(tileBuffer))
        WriteFile(tileBuffer, `${tileFileName}.bin`)

        var tileCollisionBuffer = new ArrayBuffer(tileCollisionData.length * int_size)
        WriteData(tileCollisionData, new DataView(tileCollisionBuffer))
        WriteFile(tileCollisionBuffer, `${collisionFileName}`)

        tileSetId++
    }
}

function ExportWorld(tileLayer, fileName, objectsFileName) {
    var temp = objectsFileName
    var _t = objectsFileName.split('/')
    objectsFileName = _t[_t.length-1]
    var name = tileLayer.name
    var tile_fileName = `${name}.map.bin`
    var width = tileLayer.width
    var height = tileLayer.height
    var tileWidth = tileLayer.tileWidth
    var tileHeight = tileLayer.tileHeight

    // world data
    var worldData = [
        {
            type: string_type,
            value: name
        },
        {
            type: int_type,
            value: width
        },
        {
            type: int_type,
            value: height
        },
        {
            type: int_type,
            value: tileWidth
        },
        {
            type: int_type,
            value: tileHeight
        },
        {
            type: int_type,
            value: tileSetCount
        },
        {
            type: string_type,
            value: tile_fileName
        },
        {
            type: string_type,
            value: objectsFileName
        }
    ];

    var numCount = worldData.filter(i => i.type === int_type || i.type === float_type).length
    var strCount = worldData.filter(i => i.type === string_type).length

    var buffer = new ArrayBuffer((numCount * int_size) + (strCount * max_string_length))
    var view = new DataView(buffer)

    WriteData(worldData, view)
    WriteFile(buffer,`${fileName}bin`)

    // Tile data
    var tileData = [];

    for (var y = 0; y < width; ++y) {
        for (var x = 0; x < height; ++x) {

            var tile = tileLayer.tileAt(x, y)

            // null tile
            if (!tile) {
                // add some kind of bodie?
                continue
            }
            
            tileData.push({
                type: int_type,
                value: tile.id
            })

            tileData.push({
                type: int_type,
                value: x
            })

            tileData.push({
                type: int_type,
                value: y
            })
        }
    }

    var numCount = tileData.filter(i => i.type === int_type).length
    var tbuffer = new ArrayBuffer(numCount * int_size)

    WriteData(tileData, new DataView(tbuffer))

    // Black magic conversion
    // this is needed because i need the file name to write it away, with the full path
    tile_fileName = `${temp.replace(objectsFileName,tile_fileName)}`
    WriteFile(tbuffer, tile_fileName)
}

function WriteData(dataArray, view) {
    var bufferIndex = 0;

    dataArray.forEach(b => {
        if (b.type === int_type || b.type === float_type) {    
            view.setInt32(bufferIndex, b.value, true)
            bufferIndex += int_size
        }

        if (b.type === string_type) {
            if (b.value.length < 32) {
                // Heheheh boiiiiii
                while (b.value.length !== 31) {
                    b.value += ' '
                }
            }

            for (var i = 0; i < b.value.length; i++) {
                view.setInt8(bufferIndex, b.value.charCodeAt(i))

                // Needed because C sees \0 as the end of a string
                if (i === b.value.length - 1) {
                    bufferIndex += char_size
                    view.setInt8(bufferIndex, '\0')
                }
                bufferIndex += char_size
            }
        }
    })
}

function WriteFile(arrayBuffer, fileName) {
    var file = new BinaryFile(fileName, BinaryFile.WriteOnly)
    file.write(arrayBuffer)
    file.commit()
}