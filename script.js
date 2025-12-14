document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const output = document.getElementById('output');

    // Drag & drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        uploadArea.classList.add('dragover');
    }

    function unhighlight(e) {
        uploadArea.classList.remove('dragover');
    }

    uploadArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }

    // File input click
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    });

    function handleFiles(files) {
        const file = files[0];
        if (!file) return;

        // Clear previous output
        output.innerHTML = '🔄 Reading file...';

        // Check file size
        if (file.size === 0) {
            showMessage('❌ File is empty!', 'error');
            return;
        }

        // Check if text file
        const validTypes = ['text/plain', 'text/csv', 'text/markdown'];
        const validExtensions = /\.(txt|log|csv|md|js)$/i;
        
        if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
            showMessage('❌ Please upload a text file (.txt, .log, .csv, .md, .js)', 'error');
            return;
        }

        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                const lines = content.split(/\r?\n/).slice(0, 10);
                
                if (lines.length === 0 || (lines.length === 1 && !lines[0].trim())) {
                    showMessage('📭 File is empty or contains only whitespace!', 'error');
                    return;
                }

                displayLines(lines, file.name);
            } catch (err) {
                showMessage('❌ Error processing file content!', 'error');
            }
        };

        reader.onerror = function() {
            showMessage('❌ Error reading file!', 'error');
        };

        reader.readAsText(file, 'UTF-8');
    }

    function displayLines(lines, filename) {
        const lineCount = lines.length;
        let html = `<div class="success">
            ✅ Loaded <strong>${lineCount}</strong> line${lineCount !== 1 ? 's' : ''} 
            from <strong>${filename}</strong>
        </div>`;
        
        html += '<div class="output-content">';
        lines.forEach((line, index) => {
            html += `<div style="margin: 5px 0;">`;
            html += `<strong style="color: #007bff;">Line ${index + 1}:</strong> `;
            html += `<span style="background: #f8f9fa; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${escapeHtml(line)}</span>`;
            html += `</div>`;
        });
        html += '</div>';

        output.innerHTML = html;
    }

    function showMessage(message, type) {
        output.innerHTML = `<div class="${type}">${message}</div>`;
    }

    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
});
