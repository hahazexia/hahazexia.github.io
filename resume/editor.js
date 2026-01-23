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
      const scrollPercentage = this.textarea.scrollTop / (this.textarea.scrollHeight - this.textarea.clientHeight);
      const previewScrollTop = scrollPercentage * (this.previewPanel.scrollHeight - this.previewPanel.clientHeight);
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
      window.print();
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
}

document.addEventListener('DOMContentLoaded', () => {
  new MarkdownEditor();
});
