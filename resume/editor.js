class MarkdownEditor {
  constructor() {
    this.textarea = document.getElementById('markdown-input');
    this.preview = document.getElementById('preview-output');
    this.previewPanel = document.querySelector('.preview-panel');
    this.fileInput = document.getElementById('file-input');

    this.init();
  }

  init() {
    this.loadFromStorage();

    this.textarea.addEventListener('input', () => {
      this.updatePreview();
      this.saveToStorage();
    });

    this.bindToolbarButtons();

    this.bindFileOperations();

    this.bindScrollSync();

    this.updatePreview();
  }

  bindScrollSync() {
    this.textarea.addEventListener('scroll', () => {
      const scrollPercentage =
        this.textarea.scrollTop /
        (this.textarea.scrollHeight - this.textarea.clientHeight);
      const previewScrollTop =
        scrollPercentage *
        (this.previewPanel.scrollHeight - this.previewPanel.clientHeight);
      this.previewPanel.scrollTop = previewScrollTop;
    });
  }

  updatePreview() {
    const markdown = this.textarea.value;
    const html = markdownParser.parse(markdown);
    this.preview.innerHTML = html;
  }

  saveToStorage() {
    localStorage.setItem('markdown-content', this.textarea.value);
  }

  loadFromStorage() {
    const saved = localStorage.getItem('markdown-content');
    if (saved) {
      this.textarea.value = saved;
    } else {
      this.textarea.value = `# Alex Morgan

A passionate backend engineer and cloud architecture enthusiast.

## Contact

https://github.com/alexmorgan

## Tech Stack

- Backend: Python; Django; FastAPI; Flask; Celery; Apache Kafka
- Database: PostgreSQL; MySQL; Elasticsearch; Cassandra; Amazon Aurora
- Frontend: Vue.js; TypeScript; TailwindCSS; Three.js
- DevOps: Docker; Kubernetes; Terraform; Jenkins; GitHub Actions


## Projects (open source)

- **[data-viz-toolkit](https://github.com/alexmorgan/data-viz-toolkit)**: Modern data visualization library for real-time analytics.
  - 8.2k+ stars on GitHub, 250k downloads
  - Built with Vue.js and WebGL
- **[task-flow](https://github.com/alexmorgan/task-flow)**: Lightweight task management system with kanban board.
  - 3k+ active users
  - Built with Python, FastAPI, PostgreSQL
- **[api-guardian](https://github.com/alexmorgan/api-guardian)**: API rate limiting and monitoring solution.
  - 500+ production deployments
  - Frontend: Vue.js; Backend: Python, Redis, Elasticsearch


## Working Experience

- **[CloudTech Solutions](https://cloudtech.example)**: Senior Backend Engineer; Tech Lead; (2021/03 - now) Leading microservices architecture design; Building scalable APIs serving 10M+ requests per day
- **[DataFlow Inc](https://dataflow.example)**: Backend Engineer; (2018/06 - 2021/02) Developed real-time data processing pipelines; Implemented caching strategies reducing response time by 60%
- **[StartupHub](https://startuphub.example)**: Full-stack Developer; (2017/01 - 2018/05) Built RESTful APIs and admin dashboards; Migrated legacy systems to modern architecture
- **[TechCorp Labs](https://techcorp.example)**: Intern; (2016/06 - 2016/12) Contributed to internal tools development using Python and Django


## Education

- Master's Degree in Computer Science, **Stanford University** *(2015 – 2017)*
- Bachelor's Degree in Software Engineering, **UC Berkeley** *(2011 – 2015)*
`;
    }
  }

  bindToolbarButtons() {
    document.getElementById('btn-bold').addEventListener('click', () => {
      this.insertText('**bold text**');
    });

    document.getElementById('btn-italic').addEventListener('click', () => {
      this.insertText('*italic text*');
    });

    document.getElementById('btn-h1').addEventListener('click', () => {
      this.insertText('\n# Heading 1\n');
    });

    document.getElementById('btn-h2').addEventListener('click', () => {
      this.insertText('\n## Heading 2\n');
    });

    document.getElementById('btn-h3').addEventListener('click', () => {
      this.insertText('\n### Heading 3\n');
    });

    document.getElementById('btn-ul').addEventListener('click', () => {
      this.insertText('\n- List item\n');
    });

    document.getElementById('btn-ol').addEventListener('click', () => {
      this.insertText('\n1. List item\n');
    });

    document.getElementById('btn-link').addEventListener('click', () => {
      this.insertText('[Link text](https://example.com)');
    });

    document.getElementById('btn-image').addEventListener('click', () => {
      this.insertText('![Image description](https://example.com/image.jpg)');
    });

    document.getElementById('btn-table').addEventListener('click', () => {
      this.insertText(
        '\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Content 1 | Content 2 | Content 3 |\n',
      );
    });

    document.getElementById('btn-hr').addEventListener('click', () => {
      this.insertText('\n---\n');
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all content?')) {
        this.textarea.value = '';
        this.updatePreview();
        this.saveToStorage();
      }
    });

    document.getElementById('btn-pdf').addEventListener('click', () => {
      this.exportToPDF();
    });
  }

  insertText(text) {
    const start = this.textarea.selectionStart;
    const end = this.textarea.selectionEnd;
    const value = this.textarea.value;

    this.textarea.value =
      value.substring(0, start) + text + value.substring(end);

    const newPos = start + text.length;
    this.textarea.selectionStart = newPos;
    this.textarea.selectionEnd = newPos;
    this.textarea.focus();

    this.updatePreview();
    this.saveToStorage();
  }

  bindFileOperations() {
    document.getElementById('btn-import').addEventListener('click', () => {
      this.fileInput.click();
    });

    this.fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          this.textarea.value = event.target.result;
          this.updatePreview();
          this.saveToStorage();
        };
        reader.readAsText(file);
      }
    });

    document.getElementById('btn-export').addEventListener('click', () => {
      const content = this.textarea.value;
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.md';
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // 设置中文字体
    doc.setFont('AlibabaPuHuiTi-Regular', 'normal');

    const markdown = this.textarea.value;
    const lines = markdown.split('\n');

    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;
    let lastElementType = null; // 记录上一个元素类型

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]; // 不要 trim，保留缩进
      const trimmedLine = line.trim(); // 用于检测是否为空行

      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
        lastElementType = null;
      }

      if (trimmedLine === '') {
        y += 4;
        lastElementType = 'empty';
        continue;
      }

      // 跳过 <br> 标签（有时空行会被解析为 br）
      if (trimmedLine === '<br>' || trimmedLine.startsWith('<br')) {
        y += 4;
        lastElementType = 'empty';
        continue;
      }

      // H1 标题
      if (trimmedLine.startsWith('# ')) {
        // 如果不是页面开头，增加额外间距
        if (lastElementType) {
          y += 6;
        }
        doc.setFontSize(20);
        doc.setFont('AlibabaPuHuiTi-Regular', 'normal');
        doc.setTextColor(0, 0, 0); // 标题使用黑色
        const text = this.stripMarkdown(trimmedLine.substring(2));
        const textLines = doc.splitTextToSize(text, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 8;
        // H1 下划线
        doc.setLineWidth(0.5);
        doc.setDrawColor(238, 238, 238);
        doc.line(margin, y, pageWidth - margin, y);
        y += 3;
        lastElementType = 'h1';
        continue;
      }

      // H2 标题
      if (trimmedLine.startsWith('## ')) {
        // 如果不是页面开头，增加额外间距
        if (lastElementType) {
          y += 5;
        }
        doc.setFontSize(16);
        doc.setFont('AlibabaPuHuiTi-Regular', 'normal');
        doc.setTextColor(0, 0, 0); // 标题使用黑色
        const text = this.stripMarkdown(trimmedLine.substring(3));
        const textLines = doc.splitTextToSize(text, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 6;
        // H2 下划线
        doc.setLineWidth(0.3);
        doc.setDrawColor(238, 238, 238);
        doc.line(margin, y, pageWidth - margin, y);
        y += 2;
        lastElementType = 'h2';
        continue;
      }

      // H3 标题
      if (trimmedLine.startsWith('### ')) {
        // 如果不是页面开头，增加额外间距
        if (lastElementType) {
          y += 4;
        }
        doc.setFontSize(14);
        doc.setFont('AlibabaPuHuiTi-Regular', 'normal');
        doc.setTextColor(0, 0, 0); // 标题使用黑色
        const text = this.stripMarkdown(trimmedLine.substring(4));
        const textLines = doc.splitTextToSize(text, maxWidth);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 2;
        lastElementType = 'h3';
        continue;
      }

      // 水平线
      if (/^(-{3,}|_{3,}|\*{3,})$/.test(trimmedLine)) {
        doc.setLineWidth(0.5);
        doc.setDrawColor(238, 238, 238);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
        lastElementType = 'hr';
        continue;
      }

      // 无序列表
      if (/^[\s]*[-*+]\s+/.test(line)) {
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85); // 设置浅灰色

        // 计算缩进层级（每2个空格或1个tab为一级）
        const leadingSpaces = line.match(/^[\s]*/)[0];
        const indentLevel = Math.floor((leadingSpaces.replace(/\t/g, '  ').length) / 2);
        const indent = margin + (indentLevel * 3); // 每级缩进3像素

        const text = line.replace(/^[\s]*[-*+]\s+/, '');

        // 渲染小圆点
        doc.text('•', indent, y);

        // 渲染带样式的文本
        this.renderTextWithStyles(doc, text, indent + 4, y, maxWidth - (indentLevel * 3) - 4);

        // 计算行数
        const plainText = this.stripMarkdown(text);
        const textLines = doc.splitTextToSize(plainText, maxWidth - (indentLevel * 3) - 4);
        y += textLines.length * 4 + 1;
        lastElementType = 'ul';
        continue;
      }

      // 有序列表
      if (/^[\s]*\d+\.\s+/.test(line)) {
        doc.setFontSize(10);
        doc.setTextColor(85, 85, 85); // 设置浅灰色

        // 计算缩进层级（每2个空格或1个tab为一级）
        const leadingSpaces = line.match(/^[\s]*/)[0];
        const indentLevel = Math.floor((leadingSpaces.replace(/\t/g, '  ').length) / 2);
        const indent = margin + (indentLevel * 3); // 每级缩进3像素

        const match = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
        if (match) {
          const number = match[1];
          const text = match[2];

          // 渲染数字
          doc.text(number + '.', indent, y);

          // 渲染带样式的文本
          this.renderTextWithStyles(doc, text, indent + 10, y, maxWidth - (indentLevel * 3) - 10);

          // 计算行数
          const plainText = this.stripMarkdown(text);
          const textLines = doc.splitTextToSize(plainText, maxWidth - (indentLevel * 3) - 10);
          y += textLines.length * 4 + 1;
        }
        lastElementType = 'ol';
        continue;
      }

      // 普通文本
      doc.setFontSize(10);
      doc.setTextColor(85, 85, 85); // 设置浅灰色

      // 渲染带样式的文本
      this.renderTextWithStyles(doc, trimmedLine, margin, y, maxWidth);

      // 计算行数
      const plainText = this.stripMarkdown(trimmedLine);
      const textLines = doc.splitTextToSize(plainText, maxWidth);
      y += textLines.length * 4 + 1;
      lastElementType = 'text';
    }

    doc.save('resume.pdf');
  }

  stripMarkdown(text) {
    // 移除图片
    text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1');
    // 移除链接但保留文字
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    // 移除粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
    text = text.replace(/__([^_]+)__/g, '$1');
    // 移除斜体
    text = text.replace(/\*([^*]+)\*/g, '$1');
    text = text.replace(/_([^_]+)_/g, '$1');
    // 移除代码
    text = text.replace(/`([^`]+)`/g, '$1');
    return text;
  }

  renderTextWithStyles(doc, text, x, y, maxWidth) {
    // 解析文本中的样式标记（粗体、斜体等）
    const segments = [];
    let currentPos = 0;

    // 匹配粗体 **text**
    const boldRegex = /\*\*([^*]+)\*\*/g;
    let match;

    // 记录所有粗体位置
    const boldMatches = [];
    while ((match = boldRegex.exec(text)) !== null) {
      boldMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        text: match[1],
        type: 'bold',
      });
    }

    // 如果没有任何样式，直接渲染
    if (boldMatches.length === 0) {
      const plainText = this.stripMarkdown(text);
      const lines = doc.splitTextToSize(plainText, maxWidth);
      doc.text(lines, x, y);
      return;
    }

    // 分段处理文本
    boldMatches.sort((a, b) => a.start - b.start);

    for (let i = 0; i < boldMatches.length; i++) {
      const boldMatch = boldMatches[i];

      // 添加普通文本（在粗体之前）
      if (currentPos < boldMatch.start) {
        segments.push({
          text: text.substring(currentPos, boldMatch.start),
          bold: false,
        });
      }

      // 添加粗体文本
      segments.push({
        text: boldMatch.text,
        bold: true,
      });

      currentPos = boldMatch.end;
    }

    // 添加最后的普通文本
    if (currentPos < text.length) {
      segments.push({
        text: text.substring(currentPos),
        bold: false,
      });
    }

    // 渲染分段文本
    let currentX = x;
    const fontSize = doc.internal.getFontSize();
    const fontName = 'AlibabaPuHuiTi-Regular';

    for (const segment of segments) {
      const cleanText = this.stripMarkdown(segment.text);

      if (segment.bold) {
        // 使用粗体（通过增加字重模拟，因为我们没有粗体字体文件）
        // 先渲染一次正常文本
        doc.setFont(fontName, 'normal');
        doc.text(cleanText, currentX, y);
        // 再偏移0.15像素渲染一次，模拟粗体效果
        doc.text(cleanText, currentX + 0.15, y);
      } else {
        doc.setFont(fontName, 'normal');
        doc.text(cleanText, currentX, y);
      }

      // 计算文本宽度，移动 x 位置
      const textWidth = doc.getTextWidth(cleanText);
      currentX += textWidth;
    }

    // 恢复默认字体
    doc.setFont(fontName, 'normal');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new MarkdownEditor();
});
