const int_type = 0;
const float_type = 1;
const string_type = 2;

const max_string_length = 32
const int_size = 4;
const char_size = 1;

tiled.assetSaved.connect(function (asset) {

    if (!asset
        || asset === null
        || !asset.isTileMap) {
        return;
    }

    // file name
    var mapName = asset.fileName;
    var worldFileName = mapName.replace('.tmx', '.w.') // world file
    var tileSetFileName = mapName.replace('.tmx', '.tf.') // tile file
    var objectsFileName = mapName.replace('.tmx', '.o.') // collision file

    var map = asset;

    ExportTilesSets(map.usedTilesets(), tileSetFileName);
});
// Tile layers
function ExportWorld(map, fileName) {

}

function ExportTilesSets(tileSets, fileName)
{
    // Save tileset 
    // Save tile for tile set
    // Save collision bodies for tile

    var tileSetId = 0;

    for(var tileSetIndex = 0; tileSetIndex < tileSets.length; tileSetIndex++)
    {
        var tileSetData = [];
        var tileset = tileSets[tileSetIndex]
        
        tiled.log(`Exporting TileSet: ${tileset.name}`)
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
        var name = tileset.image.split('/');
        tileSetData.push({
            type: string_type,
            value: `${name[name.length - 1]}`
        })

        // Tile file name
        var name = (tileFileName+'.bin').split('/')
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
        
        var tileSetView = new DataView(tileSetBuffer)
        
        var bufferIndex = 0;

        tileSetData.forEach((b,index) => {

            if(b.type === int_type || b.type === float_type)
            {
                tileSetView.setInt32(bufferIndex, b.value, true)
                bufferIndex += int_size
            }

            if(b.type === string_type)
            {
                if(b.value.length < 32)
                {
                    // Heheheh boiiiiii
                    while(b.value.length !== 31)
                    {
                        b.value += ' '
                    }
                }

                for(var i = 0; i < b.value.length; i++)
                {
                    tileSetView.setInt8(bufferIndex, b.value.charCodeAt(i))

                    // Needed because C sees \0 as the end of a string
                    if(i === b.value.length-1)
                    {
                        bufferIndex += char_size;
                        tileSetView.setInt8(bufferIndex, '\0')
                    }
                    bufferIndex += char_size
                }
            }
        })
       
        var file = new BinaryFile(`${tileSetFileName}.bin`, BinaryFile.WriteOnly)
        file.write(tileSetBuffer)
        file.commit()

        // Info about tiles
        var tileId = 0;
        var tileData = [];
        var tileCollisionData = [];
        
        for (var y = 0; y < tileset.imageHeight; y += tileHeight) {
            for (var x = 0; x < tileset.imageWidth; x += tileWidth) {
                var tile = tileset.findTile(tileId)

                if(!tile)
                {
                    // This can be ignored.... most of the time
                    tiled.log(`Null tile found, skipping: ${tileId}`)
                    continue;
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
                
                //tileId++
                // var objectsGroup = tile.objectGroup;

                // if (objectsGroup != null) {
                //     objectsGroup.objects.forEach(obj => {

                //         tileCollisionData.push({
                //             type: int_type,
                //             value: tileId
                //         })

                //         // xposition
                //         tileCollisionData.push({
                //             type: int_type,
                //             value: obj.x
                //         })

                //         // yposition
                //         tileCollisionData.push({
                //             type: int_type,
                //             value: obj.y
                //         })

                //         // width
                //         tileCollisionData.push({
                //             type: int_type,
                //             value: obj.width
                //         })

                //         // height
                //         tileCollisionData.push({
                //             type: int_type,
                //             value: obj.height
                //         })
                //     });
                // }
                
            }
        }

        tiled.log(`Tiles: ${tileData.length / 3}`)

        var tileBuffer = new ArrayBuffer(tileData.length * int_size);
        var tileView = new DataView(tileBuffer)
        bufferIndex = 0;
        tileData.forEach((b,index) => {
            if(b.type === int_type || b.type === float_type)
            {
                tileView.setInt32(bufferIndex, b.value, true)
                bufferIndex += int_size
            }
            else
            {
                tiled.log(`THISSSSS `)
            }
        })
        file = new BinaryFile(`${tileFileName}.bin`, BinaryFile.WriteOnly)
        file.write(tileBuffer)
        file.commit()

        var tileCollisionBuffer = new ArrayBuffer(tileCollisionData.length * int_size)
        var tileCollisionView = new DataView(tileCollisionBuffer)
        bufferIndex = 0
        tileCollisionData.forEach(b => {
            if(b.type === int_type || b.type === float_type)
            {
                tileCollisionView.setInt32(bufferIndex, b.value, true)
                bufferIndex += int_size
            }
        })

        file = new BinaryFile(`${collisionFileName}`, BinaryFile.WriteOnly)
        file.write(tileCollisionBuffer)
        file.commit()

        tileSetId++;
    }
}

function ExportTileSets(tileSets, fileName) {
    
    // Save tileset 
    // Save tile for tile set
    // Save collision bodies for tile


    var byteIndex = 0;
    var tileSetId = 0;

    var data = [];

    tileSets.forEach(tileset => {

        var tileWidth, tileHeight
        tileWidth = tileset.tileWidth
        tileHeight = tileset.tileHeight

        var xOffset, yOffset
        xOffset = tileset.tileOffset.x / tileWidth
        yOffset = tileset.tileOffset.y / tileHeight

        // Id
        data.push({
            type: int_type,
            value: tileSetId
        })
        byteIndex++;

        // xoffset
        data.push({
            type: float_type,
            value: xOffset
        })
        byteIndex++;

        // xoffset
        data.push({
            type: float_type,
            value: yOffset
        })
        byteIndex++;

        // tilewidth
        data.push({
            type: int_type,
            value: tileWidth
        })
        byteIndex++;

        // tileheight
        data.push({
            type: int_type,
            value: tileHeight
        })
        byteIndex++;

        tiled.log(`${tileSetId} ${xOffset} ${yOffset} ${tileWidth} ${tileHeight}`)
        tileSetId++

        // Resize buffer!!!!
        // Nah its cool

        // info about tiles
        var tileId = 0;

        for (var y = 0; y < tileset.imageHeight; y += tileset.tileHeight) {
            for (var x = 0; x < tileset.imageWidth; x += tileset.tileWidth) {
                var tile = tileset.tile(tileId)

                // tileid
                data.push({
                    type: int_type,
                    value: tile.id
                })
                byteIndex++;

                // xposition
                data.push({
                    type: int_type,
                    value: x
                })
                byteIndex++;

                // yposition
                data.push({
                    type: int_type,
                    value: y
                })
                byteIndex++;

                // collision bodies
                // if none write 0
                var objectsGroup = tile.objectGroup;

                if (objectsGroup != null) {
                    objectsGroup.objects.forEach(obj => {
                        // xposition
                        data.push({
                            type: int_type,
                            value: obj.x
                        })
                        byteIndex++;

                        // yposition
                        data.push({
                            type: int_type,
                            value: obj.y
                        })
                        byteIndex++;

                        // width
                        data.push({
                            type: int_type,
                            value: obj.width
                        })
                        byteIndex++;

                        // height
                        data.push({
                            type: int_type,
                            value: obj.height
                        })
                        byteIndex++;
                    });
                }

                tileId++;
            }
        }
    });

    var int_count = data.filter(a => a.type === int_type).length
    var float_count = data.filter(b => b.type === float_type).length
    var bufferSize = (int_count * 4) + (float_count * 8)
    var buffer = new ArrayBuffer(bufferSize)
    var view = new DataView(buffer)
    
    var debugFileName = fileName.replace(".bin", "debug")
    var debugFile = new TextFile(debugFileName, TextFile.WriteOnly)
    var index = 0;

    data.forEach(i => {
        switch (i.type) {
            case int_type:
                view.setInt32(index, i.value, true)
                debugFile.writeLine(`type:int |bufferIndex: ${index} | value: ${i.value}`)
                index += 4
            break;

            case float_type:
                view.setFloat32(index, i.value, true)
                debugFile.writeLine(`type:float |bufferIndex: ${index} | value: ${i.value}`)
                index += 4 // Hhehehehehehhehehehehehehehe 4 not 8 boiiiii
            break;
            default: break;
        }
    });

    debugFile.commit();

    var binary = new BinaryFile(fileName, BinaryFile.WriteOnly);
    binary.write(buffer)
    binary.commit()
}

function ExportObjects(objects, fileName) {

}