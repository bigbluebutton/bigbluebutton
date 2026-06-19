// @ts-nocheck -- BlockNote schema-generic types unresolved for custom block; safe POC
import { createReactBlockSpec } from '@blocknote/react';
import * as React from 'react';
import katex from 'katex';

const LatexBlockContent: React.FC<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  block: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  editor: any;
}> = ({ block, editor }) => {
  const [editing, setEditing] = React.useState(
    !block.props.formula || block.props.formula === '',
  );
  const [formula, setFormula] = React.useState(block.props.formula || '');
  const [error, setError] = React.useState<string | null>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setFormula(block.props.formula || '');
  }, [block.props.formula]);

  React.useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [editing]);

  const renderFormula = () => {
    if (!formula || formula.trim() === '') {
      return (
        <span className="latex-block-placeholder">
          Click to insert LaTeX formula
        </span>
      );
    }
    try {
      const html = katex.renderToString(formula, {
        displayMode: block.props.displayMode ?? false,
        throwOnError: true,
      });
      return (
        <span
          className="latex-block-rendered"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Invalid LaTeX';
      return (
        <span className="latex-block-error">
          {msg}
        </span>
      );
    }
  };

  const commitFormula = (newFormula: string) => {
    const trimmed = newFormula.trim();
    editor.updateBlock(block, {
      type: 'latex' as const,
      props: {
        formula: trimmed,
        displayMode: block.props.displayMode ?? false,
      },
    });
    setError(null);
    if (trimmed) {
      try {
        katex.renderToString(trimmed, {
          displayMode: block.props.displayMode ?? false,
          throwOnError: true,
        });
        setEditing(false);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Invalid LaTeX');
      }
    } else {
      setEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Shift+Enter = commit and render
      e.preventDefault();
      commitFormula(formula);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setFormula(block.props.formula || '');
      setError(null);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="latex-block latex-block-editing" contentEditable={false}>
        <div className="latex-block-label">LaTeX</div>
        <textarea
          ref={textareaRef}
          className="latex-block-textarea"
          value={formula}
          onChange={(e) => {
            setFormula(e.target.value);
            setError(null);
          }}
          onBlur={() => commitFormula(formula)}
          onKeyDown={handleKeyDown}
          placeholder="E = mc^2 \\\\ \text{or try: } \\\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"
          rows={3}
        />
        {error && <div className="latex-block-error">{error}</div>}
        <div className="latex-block-hint">
          Press Enter+Shift to render &bull; Esc to cancel
        </div>
      </div>
    );
  }

  return (
    <div
      className={`latex-block latex-block-rendered ${block.props.displayMode ? 'latex-block-display' : 'latex-block-inline'}`}
      contentEditable={false}
      onClick={() => setEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setEditing(true);
        }
      }}
    >
      <div className="latex-block-label">LaTeX</div>
      <div className="latex-block-content">{renderFormula()}</div>
    </div>
  );
};

export const createLatexBlock = createReactBlockSpec(
  {
    type: 'latex',
    propSchema: {
      formula: {
        default: '',
      },
      displayMode: {
        default: false,
      },
    },
    content: 'none',
  },
  {
    render: (props) => {
      return (
        <LatexBlockContent
          block={props.block}
          editor={props.editor}
        />
      );
    },
  },
);

export default createLatexBlock;
