import {run} from '/lib/xp/context';
import {create as createRepo} from '/lib/xp/repo';
import {connect} from '/lib/xp/node';
import {toStr} from '/lib/util';

const INDEX_CONFIG = {
	default: {
		decideByType: false, // Let's explicitly index everything the same
		enabled: true,
		nGram: true,
		fulltext: true, // Needed for stemming?
		includeInAllText: true, // Needed for stemming?
		path: false, // Is this needed for _name ? WARNING true is not reflected!
		indexValueProcessors: [], // TODO Needed for stemming?
		languages: ['no-NO'],
		stemmed: true
	}
};

run({
	repository: app.name,
	branch: 'master',
	principals: ['role:system.admin']
}, () => {
	const createRepoParams = {
		id: app.name,
		rootPermissions: [{
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
		}]/*, // WARNING This does not seem to work!
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
	createRepo(createRepoParams);

	const connectParams = {
		branch: 'master',
		repoId: app.name,
		principals: ['role:system.admin']
	};
	log.info(`connectParams:${toStr(connectParams)}`);
	const connection = connect(connectParams);

	const createNodeParams = {
		_name: 'havnedistriktene',
		_path: '/',
		_indexConfig: INDEX_CONFIG//,
		//displayName: 'Havnedistriktene' // Adding this fails without any error
	};
	log.info(`createNodeParams:${toStr(createNodeParams)}`);
	connection.create(createNodeParams);

	[
		'ha', // Ngram test
		'havnedistriktene', // Fulltext direct match test
		'havnedistrikt', // Main stem
		'havnedistrikter', // Other stemming
		'havnedistriktet', // Other stemming
		'havnedistriktets', // Other stemming
	].forEach((word) => {
		const queryParams = {
			query: `stemmed('_allText', '${word}')`
		};
		const res = connection.query(queryParams);
		log.info(`queryParams:${toStr(queryParams)}\nres:${toStr(res)}`);

		const queryParams2 = {
			query: `fulltext('_allText', '${word}')`
		};
		const res2 = connection.query(queryParams2);
		log.info(`queryParams2:${toStr(queryParams2)}\nres2:${toStr(res2)}`);

		const queryParams3 = {
			query: `ngram('_allText', '${word}')`
		};
		const res3 = connection.query(queryParams3);
		log.info(`queryParams3:${toStr(queryParams3)}\nres3:${toStr(res3)}`);
	}); // foreach
}); // context.run
