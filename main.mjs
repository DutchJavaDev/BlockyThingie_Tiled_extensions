var customFormat = {
    name: "C Export",
    extension: "cbin",

    write: function(map, fileName) {
        try{
            var file = new TextFile(fileName, TextFile.WriteOnly);
            // Map info
            file.writeLine(`${map.width} ${map.height} ${map.tileWidth} ${map.tileHeight}`)
            
            if(map.isTileset)
            {
                tiled.alert("todo")
                return;
            }
    
            // Reverse order, i want object map layer first
            for (var i = map.layerCount-1; i >= 0; --i) {
                var layer = map.layerAt(i);
    
                // Objects
                if(layer.isObjectLayer)
                {
                    file.writeLine("map_obj");
                    for(var i = 0; i < layer.objects.length; i++)
                    {
                        var object = layer.objects[i];
                        if(object.name.length > 16)
                        {
                            tiled.alert(`${object.name} length is longer than 16 characters!`);
                            break;
                        }
                        file.writeLine(`${object.name} ${object.x} ${object.y}`);
                    }
                    file.writeLine("map_obj_end")
                }
                
                // Tiles
                if (layer.isTileLayer) {
                    file.writeLine("map_tile");
                    for (var y = 0; y < layer.height; ++y) {
                        for (var x = 0; x < layer.width; ++x)
                        {
                            var tile = layer.tileAt(x,y);
                            var cell = layer.cellAt(x,y);
                            var tileProps;
                            var dataString = `${cell.tileId} ${x} ${y}`;
                            
                            if(tile != null)
                            {
                                tileProps = tile.properties();
                                dataString += `${tileProps.static ? ' 1' : ' 0'}`;    
                            }
                            else
                            {
                                dataString += ` 0`;
                            }
    
                            file.writeLine(dataString)
                        }
                    }
                    file.writeLine("map_tile_end")
                }
            }
            file.commit("map_end");
            file.commit();
        }
        catch(e)
        {
            tiled.error(e)
        }
    },
}

tiled.registerMapFormat("CBIN map format", customFormat)

tiled.registerTilesetFormat("CBIN tileset format",customFormat)