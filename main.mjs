var customFormat = {
    name: "C Export",
    extension: "cbin",
    outputFiles: function(map, fileName){
        if(map == null) return;

        var mapData = `${map.width} ${map.height} ${map.tileWidth} ${map.tileHeight}\n`;
        var tileData = 'tile_data\n';
        var objectData = 'object_data\n'
        
        for(var i = 0; i < map.layerCount; i++)
        {
            var layer = map.layerAt(i);

            if(layer.isObjectLayer)
            {
                for(var j = 0; j < layer.objectCount; j++)
                {
                    var object = layer.objectAt(j);

                    if(object.name.lenght > 16)
                    {
                        tiled.error(`${object.name} is longer than 16 characters!`);
                        break;
                    }
                    objectData += `${object.name} ${object.x} ${object.y}\n`;
                }
            }

            if(layer.isTileLayer)
            {
                for (var y = 0; y < layer.height; ++y) 
                {
                    for (var x = 0; x < layer.width; ++x)
                    {
                        var tile = layer.tileAt(x,y);
                        if(!tile)
                        {
                            // add static body instead? to block player
                            continue;
                        }

                        tileData += `${tile.id} ${x} ${y}\n`;
                    }
                }
            }
        }
        tileData += 'tile_data_end\n';
        objectData += 'object_data_end\n';

        var file = new TextFile(fileName,TextFile.WriteOnly);
        file.write(mapData)
        file.write(objectData)
        file.write(tileData)
        file.write(`${tiled.version}`);
        file.commit()
        file.close()
    },
    write: function(){}
}

tiled.registerMapFormat("CBIN map format", customFormat);
