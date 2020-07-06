import {run} from '/lib/xp/context';
import {create as createRepo} from '/lib/xp/repo';

run({
	repository: app.name,
	branch: 'master',
	principals: ['role:system.admin']
}, () => {
	createRepo({
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
	});
});
