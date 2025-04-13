// 获取DOM元素
const sourceChars = document.getElementById('source-chars');
const targetChars = document.getElementById('target-chars');
const sourceDropZone = document.getElementById('source-drop');
const targetDropZone = document.getElementById('target-drop');
const dpTable = document.getElementById('dp-table');

// 当前字符串状态
let currentSourceString = '';
let currentTargetString = '';

// 初始化TensorFlow模型
const initModel = () => {
    return tf.sequential({
        layers: [
            tf.layers.dense({units: 1, inputShape: [2]})
        ]
    });
};

// 计算编辑距离
const calculateEditDistance = (source, target) => {
    const m = source.length;
    const n = target.length;
    const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

    // 初始化第一行和第一列
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    // 填充DP表格
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (source[i - 1] === target[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,  // 删除
                    dp[i][j - 1] + 1,  // 插入
                    dp[i - 1][j - 1] + 1  // 替换
                );
            }
        }
    }

    return dp;
};

// 更新DP表格显示
const updateDPTable = () => {
    if (!currentSourceString && !currentTargetString) return;

    const dp = calculateEditDistance(currentSourceString, currentTargetString);
    const tableHTML = [];

    // 添加表头行
    tableHTML.push('<tr><th></th><th>ε</th>');
    for (let char of currentTargetString) {
        tableHTML.push(`<th>${char}</th>`);
    }
    tableHTML.push('</tr>');

    // 添加数据行
    for (let i = 0; i <= currentSourceString.length; i++) {
        tableHTML.push('<tr>');
        // 添加行头
        if (i === 0) {
            tableHTML.push('<th>ε</th>');
        } else {
            tableHTML.push(`<th>${currentSourceString[i-1]}</th>`);
        }

        // 添加单元格数据
        for (let j = 0; j <= currentTargetString.length; j++) {
            tableHTML.push(`<td>${dp[i][j]}</td>`);
        }
        tableHTML.push('</tr>');
    }

    dpTable.innerHTML = tableHTML.join('');
};

// 拖拽相关事件处理
const handleDragStart = (e) => {
    e.target.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.textContent);
    e.dataTransfer.setData('application/x-moz-node', e.target.textContent);
};

const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
};

const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('active');
};

const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('active');
};

const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const char = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('application/x-moz-node');
    const dropZone = e.currentTarget;
    dropZone.classList.remove('active');

    // 创建新的字符元素
    const charElement = document.createElement('span');
    charElement.className = 'draggable-char';
    charElement.draggable = true;
    charElement.textContent = char;
    
    // 如果是第一个字符，清除默认文本
    if (dropZone.textContent === '拖放区域 1' || dropZone.textContent === '拖放区域 2') {
        dropZone.textContent = '';
    }
    
    dropZone.appendChild(charElement);

    // 更新当前字符串
    if (dropZone === sourceDropZone) {
        currentSourceString = Array.from(sourceDropZone.children)
            .map(child => child.textContent)
            .join('');
    } else if (dropZone === targetDropZone) {
        currentTargetString = Array.from(targetDropZone.children)
            .map(child => child.textContent)
            .join('');
    }

    // 更新DP表格
    updateDPTable();
};

// 初始化拖拽事件监听
const initDragAndDrop = () => {
    const draggableChars = document.querySelectorAll('.draggable-char');
    draggableChars.forEach(char => {
        char.addEventListener('dragstart', handleDragStart);
        char.addEventListener('dragend', handleDragEnd);
    });

    [sourceDropZone, targetDropZone].forEach(zone => {
        zone.addEventListener('dragover', handleDragOver);
        zone.addEventListener('dragleave', handleDragLeave);
        zone.addEventListener('drop', handleDrop);
    });
};

// 重置功能
const resetButton = document.getElementById('reset-button');

const handleReset = () => {
    // 清空拖放区域并恢复默认文本
    sourceDropZone.innerHTML = '拖放区域 1';
    targetDropZone.innerHTML = '拖放区域 2';

    // 重置字符串状态
    currentSourceString = '';
    currentTargetString = '';

    // 清空DP表格
    dpTable.innerHTML = '';
};

// 初始化应用
const init = () => {
    initDragAndDrop();
    updateDPTable();
    resetButton.addEventListener('click', handleReset);
};

// 启动应用
init();
