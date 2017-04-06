var fs = require('fs'),
	path = require('path'),
	SOURCE_PATH = process.argv && process.argv[2] || './node_modules/fusioncharts',
	OUT_DIR = process.argv && process.argv[3] || './types/',
	TYPE_DEFINITION = `
import { FusionChartStatic } from "fusioncharts";

declare namespace __MOD_NAME__ {}
declare var __MOD_NAME__: (H: FusionChartStatic) => FusionChartStatic;
export = __MOD_NAME__;
export as namespace __MOD_NAME__;

`;

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

		console.log('✓ ', i[1]);
	    createDir(dirPath);

	    data = TYPE_DEFINITION.replace(/__MOD_NAME__/g, fileName.replace(/(.)(.*)/, function (word, match1, match2) {  return match1.toUpperCase() + match2.toLowerCase()  }));

	    // Main file should be index.d.ts instead of fusioncharts.js
		if (!/^fusioncharts\.js/.test(i[1])) {
			fs.writeFileSync(path.join(dirPath, i[1].replace(/\.js$/, '.d.ts')), data);
		} else {
			fs.writeFileSync(path.join(dirPath, 'index.d.ts'), fs.readFileSync('./fusioncharts-definition.d.ts'));
		}
	}
}
