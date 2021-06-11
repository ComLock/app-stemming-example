import {toStr} from '/lib/util';
import {run} from '/lib/xp/context';
import {connect} from '/lib/xp/node';
import {create as createRepo} from '/lib/xp/repo';
import {submit} from '/lib/xp/task';

const LANG = 'no';
const PROPERTY = 'property';

function task() {
	const INDEX_CONFIG = {
		default: {
			decideByType: false,
			enabled: true,
			nGram: false,
			fulltext: false, // Needed for stemming?
			includeInAllText: false, // Needed for stemming?
			path: false, // Is this needed for _name ? WARNING true is not reflected!
			indexValueProcessors: [], // TODO Needed for stemming?
			languages: [LANG], // Needs to set LANG on default to work elsewhere?
			stemmed: true // Not reflected in node
		},
		configs: [{
			// Not possible to stem _name
			path: '_name',
			config: {
				decideByType: false,
				enabled: true,
				nGram: false,
				fulltext: false,
				includeInAllText: false,
				path: false//,
				//indexValueProcessors: [],
				//languages: [LANG],
				//stemmed: true // Not reflected in node
			}
		}, {
			path: PROPERTY,
			config: {
				decideByType: false,
				enabled: true,
				nGram: true,
				fulltext: true, // Must be false? Nah, didn't help
				includeInAllText: true,
				path: false,
				indexValueProcessors: [],
				languages: [LANG], // Reflected in node :)
				stemmed: true // Not reflected in node
			}
		}]
	};

	const PERMISSIONS = [{
		principal: 'role:system.admin',
		allow: [
			'READ',
			'CREATE',
			'MODIFY',
			'DELETE',
			'PUBLISH',
			'READ_PERMISSIONS',
			'WRITE_PERMISSIONS'
		],
		deny: []
	}];

	run({
		repository: app.name,
		branch: 'master',
		principals: ['role:system.admin']
	}, () => {
		const createRepoParams = {
			id: app.name,
			rootPermissions: PERMISSIONS/*, // WARNING This does not seem to work!
			settings: {
				definitions: {
					branch: {
						mapping: INDEX_CONFIG,
						settings: INDEX_CONFIG
					},
					search: {
						mapping: INDEX_CONFIG,
						settings: INDEX_CONFIG
					},
					version: {
						mapping: INDEX_CONFIG,
						settings: INDEX_CONFIG
					}
				}
			}*/
		};
		log.info(`createRepoParams:${toStr(createRepoParams)}`);
		try {
			createRepo(createRepoParams);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}

		const connectParams = {
			branch: 'master',
			repoId: app.name,
			principals: ['role:system.admin']
		};
		log.info(`connectParams:${toStr(connectParams)}`);
		const connection = connect(connectParams);

		const createNodeParams = {
			_indexConfig: INDEX_CONFIG,
			_inheritsPermissions: true,
			_name: 'node',
			_path: '/',
			[PROPERTY]: 'havnedistriktene'//,
			//_permissions: PERMISSIONS,
			//displayName: 'Havnedistriktene' // Adding this fails without any error
		};
		log.info(`createNodeParams:${toStr(createNodeParams)}`);
		try {
			connection.delete(createNodeParams);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}
		try {
			connection.create(createNodeParams);
		} catch (e) {
			log.error(`e:${toStr(e)}`);
		}

		// Refresh the index for the current repoConnection. The index has two parts, search and storage. It is possible to index both or just one of them.
		connection.refresh();

		[
			'ha', // Ngram test
			'havnedistrikt', // Main stem
			'havnedistriktene', // Fulltext direct match test
			'havnedistrikter', // Other stemming
			'havnedistriktet', // Other stemming
			'havnedistriktets', // Other stemming
		].forEach((word) => {
			const queryParams = {
				//query: `stemmed('_allText', '${word}', 'OR', '${LANG}')`
				query: `stemmed('${PROPERTY}', '${word}', 'OR', '${LANG}')`
			};
			const res = connection.query(queryParams);
			log.info(`queryParams:${toStr(queryParams)}\nres:${toStr(res)}`);

			/*const queryParams2 = {
				query: `fulltext('_allText', '${word}')`
			};
			const res2 = connection.query(queryParams2);
			log.info(`queryParams2:${toStr(queryParams2)}\nres2:${toStr(res2)}`);

			const queryParams3 = {
				query: `ngram('_allText', '${word}')`
			};
			const res3 = connection.query(queryParams3);
			log.info(`queryParams3:${toStr(queryParams3)}\nres3:${toStr(res3)}`);*/
		}); // foreach
	}); // context.run
} // function runTest

submit({
	description: '',
	task
});
