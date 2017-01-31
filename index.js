var fs = require('fs'),
	path = require('path'),
	SOURCE_PATH = process.argv && process.argv[2] || './node_modules/fusionmaps',
	OUT_DIR = process.argv && process.argv[3] || './types/';

var walk = function(dir) {
    var results = []
    var list = fs.readdirSync(dir)
    list.forEach(function(file) {
        var fileName = file;
        file = dir + '/' + file
        var stat = fs.statSync(file)
        if (stat && stat.isDirectory()) results = results.concat(walk(file))
        else results.push([file, fileName])
    })
    return results
}

var createDir = (dirPath) => {
	dirPath.split('/').forEach((dir, index, splits) => {
  		const parent = splits.slice(0, index).join('/');
	  	const dirPath = path.resolve(parent, dir);
	  	if (!fs.existsSync(dirPath)) {
	    	fs.mkdirSync(dirPath);
	  	}
	});

}

res = walk(SOURCE_PATH);

for (i of res) {
	if (/^fusioncharts/.test(i[1])) {
		var fileName = i[1].replace(/^fusioncharts\.(.*)\.js/, '$1').replace(/^theme\./, ''),
		    dirPath = path.join(OUT_DIR, i[0].replace(/(.*)node_modules/, '')).replace(/fusioncharts\.(.*)/, '');

	    createDir(dirPath);

		var data = `interface FusionCharts {
}

declare var ${fileName}: (H: FusionCharts) => FusionCharts;
export = ${fileName};
export as namespace ${fileName};
`;

		fs.writeFileSync(path.join(dirPath, i[1].replace(/\.js$/, '.d.ts')), data);

	}
}
