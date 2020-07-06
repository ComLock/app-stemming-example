import {run} from '/lib/xp/context';
import {create as createRepo} from '/lib/xp/repo';
import {connect} from '/lib/xp/node';
import {toStr} from '/lib/util';

run({
	repository: app.name,
	branch: 'master',
	principals: ['role:system.admin']
}, () => {
	const createRepoParams = {
		id: app.name,
		rootPermissions: [{
			principal: 'role:admin',
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
		}],
		settings: {
			IndexDefinitions: {
				search: {
					settings: {
						decideByType: true,
						enabled: true,
						nGram: false,
						fulltext: false,
						includeInAllText: false,
						path: false,
						indexValueProcessors: [],
						languages: ['no-NO'],
						stemmed: true
					}
				}
			}
		}
	};
	log.info(`createRepoParams:${toStr(createRepoParams)}`);
	createRepo(createRepoParams);

	const connectParams = {
		branch: 'master',
		repoId: app.name
	};
	log.info(`connectParams:${toStr(connectParams)}`);
	const connection = connect(connectParams);

	const createNodeParams = {
		_name: 'havnedistriktene'
	};
	log.info(`createNodeParams:${toStr(createNodeParams)}`);
	connection.create(createNodeParams);

	[
		'havnedistrikt',
		'havnedistriktene',
		'havnedistrikter',
		'havnedistriktet',
		'havnedistriktets',
	].forEach((word) => {
		const queryParams = {
			query: `stemmed(${word})`
		};
		log.info(`queryParams:${toStr(queryParams)}`);
		const res = connection.query(queryParams);
		log.info(`res:${toStr(res)}`);
	});
});
