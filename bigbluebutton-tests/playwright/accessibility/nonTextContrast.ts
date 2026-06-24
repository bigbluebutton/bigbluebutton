import { Page as PlaywrightPage } from '@playwright/test';

const MIN_NON_TEXT_CONTRAST_RATIO = 3;

export interface NonTextContrastViolation {
  selector: string;
  element: string;
  elementName: string;
  ancestorContext: string;
  domPath: string;
  property: string;
  color: string;
  backgroundColor: string;
  adjacentTo: string;
  ratio: number;
  requiredRatio: number;
  cssRule?: string;
  cssDeclaration?: string;
  stylesheet?: string;
  text: string;
}

export interface NonTextContrastOptions {
  ignoredSelectors?: string[];
  minRatio?: number;
}

export function formatNonTextContrastViolations(violations: NonTextContrastViolation[]): string {
  const details = violations
    .slice(0, 20)
    .map((violation) =>
      [
        `${violation.elementName} (${violation.selector})`,
        `${violation.property}: ${violation.color}`,
        `${violation.adjacentTo}: ${violation.backgroundColor}`,
        `ratio: ${violation.ratio}:1`,
        violation.ancestorContext ? `context: ${violation.ancestorContext}` : undefined,
        violation.cssRule ? `rule: ${violation.cssRule}` : undefined,
        violation.cssDeclaration ? `declaration: ${violation.cssDeclaration}` : undefined,
        violation.stylesheet ? `stylesheet: ${violation.stylesheet}` : undefined,
      ]
        .filter(Boolean)
        .join(' | '),
    )
    .join('\n');

  const suffix = violations.length > 20 ? `\n...and ${violations.length - 20} more` : '';
  return `Found ${violations.length} non-text contrast issue(s):\n${details}${suffix}`;
}

export async function findNonTextContrastViolations(
  page: PlaywrightPage,
  options: NonTextContrastOptions = {},
): Promise<NonTextContrastViolation[]> {
  const { ignoredSelectors = [], minRatio = MIN_NON_TEXT_CONTRAST_RATIO } = options;
  return page.evaluate(
    ({ ignoredSelectors: ignored, minRatio: minimumRatio }) => {
      type Rgba = {
        r: number;
        g: number;
        b: number;
        a: number;
      };

      type Candidate = {
        property: string;
        color: string;
        isBorder: boolean;
        sourceProperties: string[];
      };

      type CssSource = {
        cssRule?: string;
        cssDeclaration?: string;
        stylesheet?: string;
      };

      type Violation = {
        selector: string;
        element: string;
        elementName: string;
        ancestorContext: string;
        domPath: string;
        property: string;
        color: string;
        backgroundColor: string;
        adjacentTo: string;
        ratio: number;
        requiredRatio: number;
        cssRule?: string;
        cssDeclaration?: string;
        stylesheet?: string;
        text: string;
      };

      const TRANSPARENT_ALPHA_THRESHOLD = 0.01;
      const MIN_VISIBLE_SIZE = 1;

      const parseCssColor = (color: string): Rgba | null => {
        const match = color.match(/^rgba?\((.*)\)$/);
        if (!match) return null;

        const parts = match[1]
          .replace('/', ' ')
          .split(/[,\s]+/)
          .filter(Boolean);

        if (parts.length < 3) return null;

        const readChannel = (value: string) => {
          if (value.endsWith('%')) return (parseFloat(value) / 100) * 255;
          return parseFloat(value);
        };

        const alpha = parts[3] === undefined ? 1 : parseFloat(parts[3]);
        return {
          r: readChannel(parts[0]),
          g: readChannel(parts[1]),
          b: readChannel(parts[2]),
          a: Number.isNaN(alpha) ? 1 : alpha,
        };
      };

      const isTransparent = (color: Rgba | null) => !color || color.a <= TRANSPARENT_ALPHA_THRESHOLD;

      const composite = (foreground: Rgba, background: Rgba): Rgba => {
        const alpha = foreground.a + background.a * (1 - foreground.a);
        if (alpha <= TRANSPARENT_ALPHA_THRESHOLD) return { r: 255, g: 255, b: 255, a: 1 };

        return {
          r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
          g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
          b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
          a: alpha,
        };
      };

      const normalize = (value: number) => {
        const channel = value / 255;
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      };

      const luminance = (color: Rgba) =>
        0.2126 * normalize(color.r) + 0.7152 * normalize(color.g) + 0.0722 * normalize(color.b);

      const contrastRatio = (first: Rgba, second: Rgba) => {
        const firstLuminance = luminance(first);
        const secondLuminance = luminance(second);
        const lighter = Math.max(firstLuminance, secondLuminance);
        const darker = Math.min(firstLuminance, secondLuminance);
        return (lighter + 0.05) / (darker + 0.05);
      };

      const colorToRgbString = (color: Rgba) =>
        `rgb(${Math.round(color.r)}, ${Math.round(color.g)}, ${Math.round(color.b)})`;

      const isSameColor = (first: Rgba, second: Rgba) =>
        Math.round(first.r) === Math.round(second.r) &&
        Math.round(first.g) === Math.round(second.g) &&
        Math.round(first.b) === Math.round(second.b) &&
        Math.round(first.a * 100) === Math.round(second.a * 100);

      const effectiveBackground = (element: Element | null): Rgba => {
        const base = { r: 255, g: 255, b: 255, a: 1 };
        if (!element) return base;

        const chain: Element[] = [];
        let current: Element | null = element;
        while (current) {
          chain.push(current);
          current = current.parentElement;
        }

        return chain.reverse().reduce((background, item) => {
          const color = parseCssColor(window.getComputedStyle(item).backgroundColor);
          if (isTransparent(color)) return background;
          return composite(color as Rgba, background);
        }, base);
      };

      const cssEscape = (value: string) => {
        if (window.CSS?.escape) return window.CSS.escape(value);
        return value.replace(/[^a-zA-Z0-9_-]/g, '\\$&');
      };

      const selectorFor = (element: Element) => {
        const dataTest = element.getAttribute('data-test');
        if (dataTest) return `${element.tagName.toLowerCase()}[data-test="${dataTest}"]`;
        if (element.id) return `${element.tagName.toLowerCase()}#${cssEscape(element.id)}`;

        const parent = element.parentElement;
        const tagName = element.tagName.toLowerCase();
        if (!parent) return tagName;

        const siblings = Array.from(parent.children).filter((child) => child.tagName === element.tagName);
        const index = siblings.indexOf(element) + 1;
        return `${tagName}:nth-of-type(${index})`;
      };

      const domPathFor = (element: Element) => {
        const path: string[] = [];
        let current: Element | null = element;

        while (current && current !== document.body) {
          path.unshift(selectorFor(current));
          current = current.parentElement;
        }

        return `body > ${path.join(' > ')}`;
      };

      const textFor = (element: Element) => (element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);

      const attributeNameFor = (element: Element) => {
        const labelledBy = element.getAttribute('aria-labelledby');
        if (labelledBy) {
          const name = labelledBy
            .split(/\s+/)
            .map((id) => document.getElementById(id)?.textContent?.trim())
            .filter(Boolean)
            .join(' ');
          if (name) return name;
        }

        return (
          element.getAttribute('aria-label') ||
          element.getAttribute('title') ||
          element.getAttribute('alt') ||
          element.getAttribute('placeholder') ||
          element.getAttribute('name') ||
          ''
        );
      };

      const labelFor = (element: Element) => {
        const dataTest = element.getAttribute('data-test');
        if (dataTest) return `[data-test="${dataTest}"]`;
        if (element.id) return `#${element.id}`;
        if (element.className && typeof element.className === 'string')
          return `.${element.className.trim().split(/\s+/)[0]}`;
        return element.tagName.toLowerCase();
      };

      const elementNameFor = (element: Element) => {
        const parts = [element.tagName.toLowerCase()];
        const role = element.getAttribute('role');
        const dataTest = element.getAttribute('data-test');
        const { id } = element;
        const name = attributeNameFor(element) || textFor(element);

        if (role) parts.push(`role="${role}"`);
        if (dataTest) parts.push(`data-test="${dataTest}"`);
        if (id) parts.push(`id="${id}"`);
        if (name) parts.push(`name="${name.slice(0, 80)}"`);

        return parts.join(' ');
      };

      const contextLabelFor = (element: Element) => {
        const dataTest = element.getAttribute('data-test');
        const role = element.getAttribute('role');
        const ariaLabel = element.getAttribute('aria-label');
        const { id } = element;
        const tagName = element.tagName.toLowerCase();

        if (dataTest) return `${tagName}[data-test="${dataTest}"]`;
        if (id) return `${tagName}#${id}`;
        if (role) return `${tagName}[role="${role}"]`;
        if (ariaLabel) return `${tagName}[aria-label="${ariaLabel}"]`;
        return '';
      };

      const ancestorContextFor = (element: Element) => {
        const context: string[] = [];
        let current = element.parentElement;

        while (current && current !== document.body && context.length < 5) {
          const label = contextLabelFor(current);
          if (label) context.unshift(label);
          current = current.parentElement;
        }

        return context.join(' > ');
      };

      const stylesheetNameFor = (styleSheet: CSSStyleSheet) => {
        if (styleSheet.href) return styleSheet.href;

        const { ownerNode } = styleSheet;
        if (ownerNode instanceof Element) {
          const dataStyled = ownerNode.getAttribute('data-styled');
          const { id } = ownerNode;
          const nodeName = ownerNode.nodeName.toLowerCase();
          if (dataStyled) return `${nodeName}[data-styled="${dataStyled}"]`;
          if (id) return `${nodeName}#${id}`;
          return nodeName;
        }

        return 'inline stylesheet';
      };

      const findCssSourceInRules = (
        element: Element,
        candidate: Candidate,
        rules: CSSRuleList,
        styleSheet: CSSStyleSheet,
      ): CssSource | null => {
        for (let index = rules.length - 1; index >= 0; index--) {
          const rule = rules[index];
          let source: CssSource | null = null;

          if ('cssRules' in rule) {
            source = findCssSourceInRules(element, candidate, (rule as CSSGroupingRule).cssRules, styleSheet);
          }

          if (!source && rule instanceof CSSStyleRule) {
            let matches = false;
            try {
              matches = element.matches(rule.selectorText);
            } catch {
              matches = false;
            }

            const hasSourceProperty =
              matches && candidate.sourceProperties.some((property) => rule.style.getPropertyValue(property));

            if (hasSourceProperty) {
              const property = candidate.sourceProperties.find((sourceProperty) =>
                rule.style.getPropertyValue(sourceProperty),
              );
              const value = property ? rule.style.getPropertyValue(property).trim() : '';
              source = {
                cssRule: rule.selectorText,
                cssDeclaration: property && value ? `${property}: ${value}` : undefined,
                stylesheet: stylesheetNameFor(styleSheet),
              };
            }
          }

          if (source) return source;
        }

        return null;
      };

      const findCssSource = (element: Element, candidate: Candidate): CssSource => {
        const styleAttribute = element.getAttribute('style') || '';
        const hasInlineSource = candidate.sourceProperties.some((property) => styleAttribute.includes(property));
        if (hasInlineSource) return { cssRule: 'style attribute', stylesheet: 'inline style' };

        for (let index = document.styleSheets.length - 1; index >= 0; index--) {
          const styleSheet = document.styleSheets[index] as CSSStyleSheet;
          try {
            const source = findCssSourceInRules(element, candidate, styleSheet.cssRules, styleSheet);
            if (source) return source;
          } catch {
            // Cross-origin stylesheets can block cssRules access.
          }
        }

        return {};
      };

      const isVisible = (element: Element) => {
        const style = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          parseFloat(style.opacity) > 0 &&
          rect.width >= MIN_VISIBLE_SIZE &&
          rect.height >= MIN_VISIBLE_SIZE
        );
      };

      const isIgnored = (element: Element) =>
        ignored.some((selector) => {
          try {
            return element.matches(selector) || Boolean(element.closest(selector));
          } catch {
            return false;
          }
        });

      const borderCandidates = (style: CSSStyleDeclaration): Candidate[] => {
        const sides = ['top', 'right', 'bottom', 'left'] as const;
        return sides.flatMap((side) => {
          const width = parseFloat(style.getPropertyValue(`border-${side}-width`));
          const borderStyle = style.getPropertyValue(`border-${side}-style`);
          const color = style.getPropertyValue(`border-${side}-color`);
          if (width < 1 || borderStyle === 'none' || borderStyle === 'hidden') return [];
          return [
            {
              property: `border-${side}-color`,
              color,
              isBorder: true,
              sourceProperties: [`border-${side}-color`, `border-${side}`, 'border-color', 'border'],
            },
          ];
        });
      };

      const outlineCandidates = (style: CSSStyleDeclaration): Candidate[] => {
        const width = parseFloat(style.outlineWidth);
        if (width < 1 || style.outlineStyle === 'none' || style.outlineStyle === 'hidden') return [];
        return [
          {
            property: 'outline-color',
            color: style.outlineColor,
            isBorder: false,
            sourceProperties: ['outline-color', 'outline'],
          },
        ];
      };

      const elements = Array.from(document.body.querySelectorAll('*'));
      const violations: Violation[] = [];

      elements.forEach((element) => {
        if (!isVisible(element) || isIgnored(element)) return;
        if (element.closest('svg, canvas, video, iframe')) return;

        const style = window.getComputedStyle(element);
        const outerBackground = effectiveBackground(element.parentElement);
        const innerBackground = effectiveBackground(element);
        const candidates = [...borderCandidates(style), ...outlineCandidates(style)];

        candidates.forEach((candidate) => {
          const parsedColor = parseCssColor(candidate.color);
          if (isTransparent(parsedColor)) return;

          const adjacentColors = [{ name: 'outer background', color: outerBackground }];
          if (candidate.isBorder && !isSameColor(innerBackground, outerBackground)) {
            adjacentColors.push({ name: 'inner background', color: innerBackground });
          }

          adjacentColors.forEach((adjacentColor) => {
            const color = composite(parsedColor as Rgba, adjacentColor.color);
            const ratio = contrastRatio(color, adjacentColor.color);
            if (ratio >= minimumRatio) return;
            const source = findCssSource(element, candidate);

            violations.push({
              selector: selectorFor(element),
              element: labelFor(element),
              elementName: elementNameFor(element),
              ancestorContext: ancestorContextFor(element),
              domPath: domPathFor(element),
              property: candidate.property,
              color: colorToRgbString(color),
              backgroundColor: colorToRgbString(adjacentColor.color),
              adjacentTo: adjacentColor.name,
              ratio: Number(ratio.toFixed(2)),
              requiredRatio: minimumRatio,
              cssRule: source.cssRule,
              cssDeclaration: source.cssDeclaration,
              stylesheet: source.stylesheet,
              text: textFor(element),
            });
          });
        });
      });

      return violations;
    },
    { ignoredSelectors, minRatio },
  );
}
