export interface Options {
	/**
	 * Number of concurrently pending promises returned by `mapper`.
	 *
	 * @default Infinity
	 */
	concurrency?: number;
}

/**
 * Function which is called for every item in `input`. Expected to return a `Promise` or value.
 *
 * @param input - Iterated element.
 * @param index - Index of the element in the source array.
 */
export type Mapper<Element = any, NewElement = any> = (input: Element, index: number) => NewElement | Promise<NewElement>

/**
 * Returns a `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in `input` order.
 *
 * @param input - Iterated over concurrently in the `mapper` function.
 * @param mapper - Function which is called for every item in `input`. Expected to return a `Promise` or value.
 * @param options - Options-object.
 *
 * @example
 *
 * const sites = [
 * 	'ava.li',
 * 	'todomvc.com
 * ];
 *
 * (async () => {
 * 	const mapper = async site => {
 * 		const {requestUrl} = await got.head(site);
 * 		return requestUrl;
 * 	};
 *
 * 	const result = await pMap(sites, mapper, {concurrency: 2});
 * 	//=> ['http://ava.li/', 'http://todomvc.com/']
 * })();
 */
export default function <Element, NewElement>(input: Iterable<Element>, mapper: Mapper<Element, NewElement>, options?: Options): Promise<NewElement[]>;
