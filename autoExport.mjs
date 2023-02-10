tiled.assetSaved.connect(function(asset) {
    ExportForRaylib(asset);
})

function ExportForRaylib(map)
{
    if (map == null) 
    return;
    
    if(!map.isTileMap)
    return;

    var tilesetDb = [];
    var tileLayerId = 0;
    // Get tile sets info
    map.tilesets.forEach(set => {
        var id = 0;
        var s  = 
        {
            id: tileLayerId,
            name: set.name.toString(),
            xOffset: set.tileOffset.x / set.tileWidth,
            yOffset: set.tileOffset.y / set.tileHeight,
            size: []
        };

        for (var y = 0; y < set.imageHeight; y += set.tileHeight) {
            for (var x = 0; x < set.imageWidth; x += set.tileWidth) {
                s.size[id] = Qt.size(x,y);
                tilesetDb.push(s)
                id++
            }
        }

        tileLayerId++;
    });

    try {
        var exportFileName = map.fileName.replace('.tmx','.cbin')
        var mapData = `${map.width} ${map.height} ${map.tileWidth} ${map.tileHeight}\n`;
        var tileData = 'tile_data\n';
        var objectData = 'object_data\n'

        var tileSet = map.tilesets[0];
        var tileSetCoordMap = [];
        var id = 0;

        for (var y = 0; y < tileSet.imageHeight; y += tileSet.tileHeight) {
            for (var x = 0; x < tileSet.imageWidth; x += tileSet.tileWidth) {
                tileSetCoordMap[id] = Qt.size(x, y);
                id++;
            }

        }
        
        for (var layerIndex = 0; layerIndex < map.layerCount; layerIndex++) {
            var layer = map.layerAt(layerIndex);

            if (layer.isObjectLayer) {
                for (var j = 0; j < layer.objectCount; j++) {
                    var object = layer.objectAt(j);

                    var nameLenght = object.name.length;
                    var name = object.name;

                    if (nameLenght === 0) {
                        name = "col"
                    }

                    if (nameLenght > 0 && nameLenght > 16) {
                        tiled.error(`${object.name} is longer than 16 characters!`);
                        break;
                    }
                    var xpos = object.x.toFixed(0);
                    var ypos = object.y.toFixed(0);
                    var width = object.width.toFixed(0);
                    var height = object.height.toFixed(0);
                    objectData += `${name} ${xpos} ${ypos} ${width} ${height}\n`;
                }
            }

            if (layer.isTileLayer) {
                for (var y = 0; y < layer.height; ++y) {
                    for (var x = 0; x < layer.width; ++x) {
                        var tile = layer.tileAt(x, y);
                        if (!tile) {
                            // add static body instead? to block player
                            continue;
                        }
                        var tileTexture = tilesetDb.filter(set => set.name === tile.tileset.name)[0];
                        if(tileTexture == null)
                        {
                            continue
                        }
                        tileData += `${layer.id} ${tile.id} ${x + tileTexture.xOffset} ${y - tileTexture.yOffset} ${tileTexture.id} ${tileTexture.size[tile.id].width} ${tileTexture.size[tile.id].height}\n`;
                    }
                }
            }
        }
        
        tileData += 'tile_data_end\n';
        objectData += 'object_data_end\n';

        var file = new TextFile(exportFileName, TextFile.WriteOnly);
        file.write(mapData)
        file.write(objectData)
        file.write(tileData)
        file.commit()
        tiled.log("Exported for raylib")
    }
    catch (e) {
        tiled.log(e)
    }
}