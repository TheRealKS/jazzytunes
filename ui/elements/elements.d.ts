declare var fs: any;
/**
 * Represents one instance of a custom element
 */
declare class CustomElement {
    name: string;
    content: Array<Element>;
    constructor(name: string, elements: Array<Element>);
    /**
     * Populates the available slots in this custom element
     * @param slots Array of slot elements, in order of appeareance
     */
    populateSlots(slots: Array<Element>): void;
    /**
     * Will append this element in its current state to the provided container, or return a div containing the element. Thus, you should get the content of the div for the actual element
     * @param container The container to append the element to
     * @returns The container with the element appended to it
     */
    getElement(container?: Element, append?: boolean): Element;
    appendChildren(container: Element, childnodes: Array<Element>): Element;
}
interface ElementsArray {
    [key: string]: CustomElementData;
}
declare class CustomElementData {
    name: string;
    content: Array<Element>;
    constructor(name: string, content: Array<Element>);
    getContent(): Node[];
}
declare class CustomElementsDatabase {
    styles: HTMLStyleElement;
    elements: ElementsArray;
    constructor();
    registerElement(templatedata: HTMLTemplateElement, elementname: string): void;
    /**
     * @returns An instance of CustomElementData from which an element can be created
     * @param name Name of the element
     */
    getElement(name: string): CustomElementData;
}
declare var database: CustomElementsDatabase;
declare var elementlist: any;
declare function getElementList(): void;
declare function getCriticalElements(): void;
declare function registerElement(htmlBody: string, elementName: string): void;
