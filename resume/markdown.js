class MarkdownParser {
    constructor() {
        this.inTable = false;
        this.inList = false;
        this.listType = null;
        this.listStack = []; // 用于跟踪嵌套列表
    }

    parse(markdown) {
        if (!markdown) return '';

        const lines = markdown.split('\n');
        let html = '';
        this.inTable = false;
        this.inList = false;
        this.listType = null;
        this.listStack = [];

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

        // 关闭所有打开的列表
        while (this.listStack.length > 0) {
            const item = this.listStack.pop();
            html += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
        }

        return html;
    }

    parseLine(line, allLines, index) {
        if (line.trim() === '') {
            if (this.inTable) {
                this.inTable = false;
                return '</tbody></table>\n';
            }
            // 空行关闭所有列表
            if (this.listStack.length > 0) {
                let result = '';
                while (this.listStack.length > 0) {
                    const item = this.listStack.pop();
                    result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
                }
                return result + '<br>\n';
            }
            return '<br>\n';
        }

        const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
        if (headerMatch) {
            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }
            // 标题关闭所有列表
            while (this.listStack.length > 0) {
                const item = this.listStack.pop();
                result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
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
            // 水平线关闭所有列表
            while (this.listStack.length > 0) {
                const item = this.listStack.pop();
                result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
            }
            return result + '<hr>\n';
        }

        const ulMatch = line.match(/^([\s]*)[-*+]\s+(.+)$/);
        if (ulMatch) {
            const indent = ulMatch[1].replace(/\t/g, '  ').length;
            const level = Math.floor(indent / 2);
            const text = this.parseInline(ulMatch[2]);

            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }

            // 调整列表层级
            result += this.adjustListLevel(level, 'ul');

            return result + `<li>${text}</li>\n`;
        }

        const olMatch = line.match(/^([\s]*)\d+\.\s+(.+)$/);
        if (olMatch) {
            const indent = olMatch[1].replace(/\t/g, '  ').length;
            const level = Math.floor(indent / 2);
            const text = this.parseInline(olMatch[2]);

            let result = '';
            if (this.inTable) {
                this.inTable = false;
            }

            // 调整列表层级
            result += this.adjustListLevel(level, 'ol');

            return result + `<li class="ordered">${text}</li>\n`;
        }

        if (this.isTableRow(line)) {
            let result = '';
            // 表格关闭所有列表
            while (this.listStack.length > 0) {
                const item = this.listStack.pop();
                result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
            }
            return result + this.parseTableRow(line, allLines, index);
        }

        let result = '';
        if (this.inTable) {
            this.inTable = false;
        }
        // 普通文本关闭所有列表
        while (this.listStack.length > 0) {
            const item = this.listStack.pop();
            result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
        }
        const text = this.parseInline(line);
        return result + `<div>${text}</div>\n`;
    }

    adjustListLevel(targetLevel, listType) {
        let result = '';

        // 如果栈为空，创建第一层列表
        if (this.listStack.length === 0) {
            result += `<${listType}>\n`;
            this.listStack.push({ level: targetLevel, type: listType });
            return result;
        }

        const currentLevel = this.listStack[this.listStack.length - 1].level;

        // 如果层级增加（嵌套更深）
        if (targetLevel > currentLevel) {
            result += `<${listType}>\n`;
            this.listStack.push({ level: targetLevel, type: listType });
        }
        // 如果层级减少（回到上层）
        else if (targetLevel < currentLevel) {
            // 关闭多余的列表直到目标层级
            while (this.listStack.length > 0 && this.listStack[this.listStack.length - 1].level > targetLevel) {
                const item = this.listStack.pop();
                result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
            }

            // 如果类型不同，需要关闭当前列表并打开新类型
            if (this.listStack.length > 0 && this.listStack[this.listStack.length - 1].type !== listType) {
                const item = this.listStack.pop();
                result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
                result += `<${listType}>\n`;
                this.listStack.push({ level: targetLevel, type: listType });
            }
        }
        // 同一层级但类型不同
        else if (this.listStack[this.listStack.length - 1].type !== listType) {
            const item = this.listStack.pop();
            result += item.type === 'ul' ? '</ul>\n' : '</ol>\n';
            result += `<${listType}>\n`;
            this.listStack.push({ level: targetLevel, type: listType });
        }

        return result;
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
