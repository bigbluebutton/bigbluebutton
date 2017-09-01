/*!
 * Bootstrap Grunt task for parsing Less docstrings
 * http://getbootstrap.com
 * Copyright 2014-2015 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 */


const Markdown = require('markdown-it');

function markdown2html(markdownString) {
  const md = new Markdown();

  // the slice removes the <p>...</p> wrapper output by Markdown processor
  return md.render(markdownString.trim()).slice(3, -5);
}


/*
Mini-language:
  //== This is a normal heading, which starts a section. Sections group variables together.
  //## Optional description for the heading

  //=== This is a subheading.

  //** Optional description for the following variable. You **can** use Markdown in descriptions to discuss `<html>` stuff.
  @foo: #fff;

  //-- This is a heading for a section whose variables shouldn't be customizable

  All other lines are ignored completely.
*/


const CUSTOMIZABLE_HEADING = /^[/]{2}={2}(.*)$/;
const UNCUSTOMIZABLE_HEADING = /^[/]{2}-{2}(.*)$/;
const SUBSECTION_HEADING = /^[/]{2}={3}(.*)$/;
const SECTION_DOCSTRING = /^[/]{2}#{2}(.+)$/;
const VAR_ASSIGNMENT = /^(@[a-zA-Z0-9_-]+):[ ]*([^ ;][^;]*);[ ]*$/;
const VAR_DOCSTRING = /^[/]{2}[*]{2}(.+)$/;

function Section(heading, customizable) {
  this.heading = heading.trim();
  this.id = this.heading.replace(/\s+/g, '-').toLowerCase();
  this.customizable = customizable;
  this.docstring = null;
  this.subsections = [];
}

Section.prototype.addSubSection = function (subsection) {
  this.subsections.push(subsection);
};

function SubSection(heading) {
  this.heading = heading.trim();
  this.id = this.heading.replace(/\s+/g, '-').toLowerCase();
  this.variables = [];
}

SubSection.prototype.addVar = function (variable) {
  this.variables.push(variable);
};

function VarDocstring(markdownString) {
  this.html = markdown2html(markdownString);
}

function SectionDocstring(markdownString) {
  this.html = markdown2html(markdownString);
}

function Variable(name, defaultValue) {
  this.name = name;
  this.defaultValue = defaultValue;
  this.docstring = null;
}

function Tokenizer(fileContent) {
  this._lines = fileContent.split('\n');
  this._next = undefined;
}

Tokenizer.prototype.unshift = function (token) {
  if (this._next !== undefined) {
    throw new Error('Attempted to unshift twice!');
  }
  this._next = token;
};

Tokenizer.prototype._shift = function () {
  // returning null signals EOF
  // returning undefined means the line was ignored
  if (this._next !== undefined) {
    const result = this._next;
    this._next = undefined;
    return result;
  }
  if (this._lines.length <= 0) {
    return null;
  }
  const line = this._lines.shift();
  let match = null;
  match = SUBSECTION_HEADING.exec(line);
  if (match !== null) {
    return new SubSection(match[1]);
  }
  match = CUSTOMIZABLE_HEADING.exec(line);
  if (match !== null) {
    return new Section(match[1], true);
  }
  match = UNCUSTOMIZABLE_HEADING.exec(line);
  if (match !== null) {
    return new Section(match[1], false);
  }
  match = SECTION_DOCSTRING.exec(line);
  if (match !== null) {
    return new SectionDocstring(match[1]);
  }
  match = VAR_DOCSTRING.exec(line);
  if (match !== null) {
    return new VarDocstring(match[1]);
  }
  const commentStart = line.lastIndexOf('//');
  const varLine = commentStart === -1 ? line : line.slice(0, commentStart);
  match = VAR_ASSIGNMENT.exec(varLine);
  if (match !== null) {
    return new Variable(match[1], match[2]);
  }
  return undefined;
};

Tokenizer.prototype.shift = function () {
  while (true) {
    const result = this._shift();
    if (result === undefined) {
      continue;
    }
    return result;
  }
};

function Parser(fileContent) {
  this._tokenizer = new Tokenizer(fileContent);
}

Parser.prototype.parseFile = function () {
  const sections = [];
  while (true) {
    const section = this.parseSection();
    if (section === null) {
      if (this._tokenizer.shift() !== null) {
        throw new Error('Unexpected unparsed section of file remains!');
      }
      return sections;
    }
    sections.push(section);
  }
};

Parser.prototype.parseSection = function () {
  const section = this._tokenizer.shift();
  if (section === null) {
    return null;
  }
  if (!(section instanceof Section)) {
    throw new Error(`Expected section heading; got: ${JSON.stringify(section)}`);
  }
  const docstring = this._tokenizer.shift();
  if (docstring instanceof SectionDocstring) {
    section.docstring = docstring;
  } else {
    this._tokenizer.unshift(docstring);
  }
  this.parseSubSections(section);

  return section;
};

Parser.prototype.parseSubSections = function (section) {
  while (true) {
    let subsection = this.parseSubSection();
    if (subsection === null) {
      if (section.subsections.length === 0) {
        // Presume an implicit initial subsection
        subsection = new SubSection('');
        this.parseVars(subsection);
      } else {
        break;
      }
    }
    section.addSubSection(subsection);
  }

  if (section.subsections.length === 1 && !section.subsections[0].heading && section.subsections[0].variables.length === 0) {
    // Ignore lone empty implicit subsection
    section.subsections = [];
  }
};

Parser.prototype.parseSubSection = function () {
  const subsection = this._tokenizer.shift();
  if (subsection instanceof SubSection) {
    this.parseVars(subsection);
    return subsection;
  }
  this._tokenizer.unshift(subsection);
  return null;
};

Parser.prototype.parseVars = function (subsection) {
  while (true) {
    const variable = this.parseVar();
    if (variable === null) {
      return;
    }
    subsection.addVar(variable);
  }
};

Parser.prototype.parseVar = function () {
  let docstring = this._tokenizer.shift();
  if (!(docstring instanceof VarDocstring)) {
    this._tokenizer.unshift(docstring);
    docstring = null;
  }
  const variable = this._tokenizer.shift();
  if (variable instanceof Variable) {
    variable.docstring = docstring;
    return variable;
  }
  this._tokenizer.unshift(variable);
  return null;
};


module.exports = Parser;
