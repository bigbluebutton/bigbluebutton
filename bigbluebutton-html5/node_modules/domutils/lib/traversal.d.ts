import { Node, Element } from "domhandler";
export declare function getChildren(elem: Node | Element): Node[] | null;
export declare function getParent(elem: Node): Node | null;
export declare function getSiblings(elem: Node): Node[] | null;
export declare function getAttributeValue(elem: Element, name: string): string;
export declare function hasAttrib(elem: Element, name: string): boolean;
/***
 * Returns the name property of an element
 *
 * @param elem The element to get the name for
 */
export declare function getName(elem: Element): string;
//# sourceMappingURL=traversal.d.ts.map