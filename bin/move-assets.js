'use strict';

const fse = require('fs-extra');
const path = require('path');

const paths = {
	'dist/fonts': 'node_modules/font-awesome/fonts'
};

Object.keys(paths)
	.forEach(
		p => (paths[p] instanceof Array)
			? paths[p].forEach(v =>
				fse.copySync(
					path.resolve(__dirname, '..', v),
					path.resolve(__dirname, '..', p)
				)
			)
			: fse.copySync(
				path.resolve(__dirname, '..', paths[p]),
				path.resolve(__dirname, '..', p)
			)
	);
