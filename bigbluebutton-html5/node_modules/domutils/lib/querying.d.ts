import { Node, Element } from "domhandler";
/**
 * Search a node and its children for nodes passing a test function.
 *
 * @param test Function to test nodes on.
 * @param element Element to search. Will be included in the result set if it matches.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 */
export declare function filter(test: (elem: Node) => boolean, node: Node | Node[], recurse?: boolean, limit?: number): Node[];
/**
 * Like `filter`, but only works on an array of nodes.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @param recurse Also consider child nodes.
 * @param limit Maximum number of nodes to return.
 */
export declare function find(test: (elem: Node) => boolean, nodes: Node[], recurse: boolean, limit: number): Node[];
/**
 * Finds the first element inside of an array that matches a test function.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 */
export declare function findOneChild(test: (elem: Node) => boolean, nodes: Node[]): Node | undefined;
/**
 * Finds one element in a tree that passes a test.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 * @param recurse Also consider child nodes.
 */
export declare function findOne(test: (elem: Element) => boolean, nodes: Node[], recurse?: boolean): Element | null;
/**
 * Returns whether a tree of nodes contains at least one node passing a test.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 */
export declare function existsOne(test: (elem: Element) => boolean, nodes: Node[]): boolean;
/**
 * Search and array of nodes and its children for nodes passing a test function.
 *
 * Same as `find`, only with less options, leading to reduced complexity.
 *
 * @param test Function to test nodes on.
 * @param nodes Array of nodes to search.
 */
export declare function findAll(test: (elem: Element) => boolean, nodes: Node[]): Element[];
//# sourceMappingURL=querying.d.ts.map