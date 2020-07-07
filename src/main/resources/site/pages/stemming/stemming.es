import {query} from '/lib/xp/content';
//import {toStr} from '/lib/util';

export function get() {
	const testResults = [];

	[
		'før ha etter', // Ngram test
		'før havnedistrikt etter', // Main stem
		'før havnedistriktene etter',
		'før havnedistrikter etter',
		'før havnedistriktet etter',
		'før havnedistriktets etter',
	].forEach((word) => {
		const queryParams = {
			query: `stemmed('_allText', '${word}', 'OR', 'no')`
		};
		const res = query(queryParams);
		//log.info(`queryParams:${toStr(queryParams)}\nres:${toStr(res)}`);
		testResults.push({
			queryParams,
			res
		});

		/*const queryParams2 = {
			query: `fulltext('_allText', '${word}', 'OR')`
		};
		const res2 = query(queryParams2);
		//log.info(`queryParams2:${toStr(queryParams2)}\nres2:${toStr(res2)}`);
		testResults.push({
			queryParams2,
			res2
		});

		const queryParams3 = {
			query: `ngram('_allText', '${word}', 'OR')`
		};
		const res3 = query(queryParams3);
		//log.info(`queryParams3:${toStr(queryParams3)}\nres3:${toStr(res3)}`);
		testResults.push({
			queryParams3,
			res3
		});*/
	}); // foreach
	return {
		body: testResults,
		contentType: 'application/json'
	}; // return
} // function get
