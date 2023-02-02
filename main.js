var customMapFormat = {
    name: "C Export",
    extension: "cbin",

    write: function(map, fileName) {
        var file = new TextFile(fileName, TextFile.WriteOnly);
        
        file.write(`${map.width},${map.height}\n`)
        file.write(`${map.tileWidth},${map.tileHeight}\n`)
        for (var i = 0; i < map.layerCount; ++i) {
            var layer = map.layerAt(i);
            if (layer.isTileLayer) {
                for (y = 0; y < layer.height; ++y) {
                    for (x = 0; x < layer.width; ++x)
                    {
                        var cell = layer.cellAt(x,y);
                        file.write(`${cell.tileId},${x},${y}\n`)
                    }
                }
            }
        }
        file.commit();
    },
}

tiled.registerMapFormat("custom", customMapFormat)