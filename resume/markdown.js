class MarkdownParser {
    constructor() {
        this.inTable = false;
        this.inList = false;
        this.listType = null;
    }

    parse(markdown) {
        if (!markdown) return '';

        const lines = markdown.split('\n');
        let html = '';
        this.inTable = false;
        this.inList = false;
        this.listType = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const parsedLine = this.parseLine(line, lines, i);

            if (parsedLine !== null) {
                html += parsedLine;
            }
        }

        if (this.inTable) {
            html += '</tbody></table>\n';
            this.inTable = false;
        }

        if (this.inList) {
            html += this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
            this.inList = false;
        }

        return html;
    }

    parseLine(line, allLines, index) {
        if (line.trim() === '') {
            if (this.inTable) {
                this.inTable = false;
                return '</tbody></table>\n';
            }
            if (this.inList) {
                const closeTag = this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
                this.inList = false;
                this.listType = null;
                return closeTag;
            }
            return '<br>\n';
        }

        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }
            if (this.inList) {
                result = this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
                this.inList = false;
                this.listType = null;
            }
            const level = headerMatch[1].length;
            const text = this.parseInline(headerMatch[2]);
            return result + `<h${level}>${text}</h${level}>\n`;
        }

        if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }
            if (this.inList) {
                result = this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
                this.inList = false;
                this.listType = null;
            }
            return result + '<hr>\n';
        }

        const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
        if (ulMatch) {
            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }
            if (!this.inList || this.listType !== 'ul') {
                if (this.inList) {
                    result = '</ol>\n';
                }
                result += '<ul>\n';
                this.inList = true;
                this.listType = 'ul';
            }
            const text = this.parseInline(ulMatch[1]);
            return result + `<li>${text}</li>\n`;
        }

        const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
        if (olMatch) {
            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }
            if (!this.inList || this.listType !== 'ol') {
                if (this.inList) {
                    result = '</ul>\n';
                }
                result += '<ol>\n';
                this.inList = true;
                this.listType = 'ol';
            }
            const text = this.parseInline(olMatch[1]);
            return result + `<li class="ordered">${text}</li>\n`;
        }

        if (this.isTableRow(line)) {
            if (this.inList) {
                const closeTag = this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
                this.inList = false;
                this.listType = null;
                return closeTag + this.parseTableRow(line, allLines, index);
            }
            return this.parseTableRow(line, allLines, index);
        }

        let result = '';
        if (this.inTable) {
            this.inTable = false;
        }
        if (this.inList) {
            result = this.listType === 'ul' ? '</ul>\n' : '</ol>\n';
            this.inList = false;
            this.listType = null;
        }
        const text = this.parseInline(line);
        return result + `<div>${text}</div>\n`;
    }

    parseInline(text) {
        text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');

        text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

        text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

        text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

        text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

        return text;
    }

    isTableRow(line) {
        return line.includes('|');
    }

    parseTableRow(line, allLines, index) {
        const cells = line.split('|').filter(cell => cell.trim() !== '');

        const nextLine = allLines[index + 1];
        const isSeparator = nextLine && /^[\s]*\|?[\s]*:?-+:?[\s]*\|/.test(nextLine);

        if (!this.inTable) {
            this.inTable = true;
            let html = '<table>\n<thead>\n<tr>\n';
            cells.forEach(cell => {
                html += `<th>${this.parseInline(cell.trim())}</th>\n`;
            });
            html += '</tr>\n</thead>\n';

            if (!isSeparator) {
                html += '<tbody>\n';
            }
            return html;
        }

        if (/^[\s]*:?-+:?[\s]*$/.test(line.replace(/\|/g, ' '))) {
            return '<tbody>\n';
        }

        let html = '<tr>\n';
        cells.forEach(cell => {
            html += `<td>${this.parseInline(cell.trim())}</td>\n`;
        });
        html += '</tr>\n';

        return html;
    }
}

const markdownParser = new MarkdownParser();
