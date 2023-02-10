var customFormat = {
    name: "C Export",
    extension: "cbin",
    outputFiles: function (map, fileName) {
        // try {
            if (map == null) return;

            var mapData = `${map.width} ${map.height} ${map.tileWidth} ${map.tileHeight}\n`;
            var tileData = 'tile_data\n';
            var objectData = 'object_data\n'

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

                    /// I dont recomend this but it has to be done
                    // because I cant think of a other way at the moment
                    var tileSet = layer.tileAt(0, 0);

                    if(!tileSet.tileset)
                    {
                        var x = 0,y = 0;
                        var run = true;
                        while(run)
                        {
                            var tt = layer.tileAt(x,y);

                            if(tt)
                            {
                                run = false;
                                break;
                            }

                            x++
                            y++;
                        }
                    }

                    var br = false;
                    for (var y = 0; y < tileSet.imageHeight; y += tileSet.tileHeight) {
                        if(br)
                        {
                            break;
                        }
                        for (var x = 0; x < tileSet.imageWidth; x += tileSet.tileWidth) {
                            tileSet =  layer.tileAt(0, 0).tileset;

                            if(!tileSet)
                            {
                                
                                break;
                            }
                        }

                    }

                    var tileSetCoordMap = [];
                    var id = 0;

                    if(tileSet != null)
                    {
                        for (var y = 0; y < tileSet.imageHeight; y += tileSet.tileHeight) {
                            for (var x = 0; x < tileSet.imageWidth; x += tileSet.tileWidth) {
                                tileSetCoordMap[id] = Qt.size(x, y);
                                id++;
                            }
                        }
                    }

                    
                    for (var y = 0; y < layer.height; ++y) {
                        for (var x = 0; x < layer.width; ++x) {
                            var tile = layer.tileAt(x, y);
                            if (!tile) {
                                // add static body instead? to block player
                                continue;
                            }
                            var tileTexture = tileSetCoordMap[tile.id];
                            var tx,ty;
                            
                            tileData += `${layer.id} ${tile.id} ${x} ${y} ${tx} ${ty}\n`;
                        }
                    }
                }
            }

            tileData += 'tile_data_end\n';
            objectData += 'object_data_end\n';

            var file = new TextFile(fileName, TextFile.WriteOnly);
            file.write(mapData)
            file.write(objectData)
            file.write(tileData)
            file.commit()
        // }
        // catch (e) {
        //     tiled.log(e)
        // }
    },
    write: function () { }
}

tiled.registerMapFormat("CBIN map format", customFormat);