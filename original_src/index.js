/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2023 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 *  Enhanced Feature added by @FreySu
 */

(() => {
  'use strict';

  const storedTheme = localStorage.getItem('theme');

  const getPreferredTheme = () => {
    if (storedTheme) {
      return storedTheme;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = function (theme) {
    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-bs-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-bs-theme', theme);
    }
  };

  const toggleTheme = function () {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    showActiveTheme(newTheme, true);
  };

  setTheme(getPreferredTheme());

  const showActiveTheme = (theme, focus = false) => {
    const themeDropdown = document.querySelector('#themeDropdown');
    const dropdownItems = document.querySelectorAll('.dropdown-item');

    dropdownItems.forEach((item) => {
      item.classList.remove('active');
      item.setAttribute('aria-pressed', 'false');
    });

    const activeItem = document.querySelector(`[data-bs-theme-value="${theme}"]`);
    activeItem.classList.add('active');
    activeItem.setAttribute('aria-pressed', 'true');

    themeDropdown.textContent = `主题模式 (${theme})`;

    if (focus) {
      themeDropdown.focus();
    }
  };

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (storedTheme !== 'light' && storedTheme !== 'dark') {
      setTheme(getPreferredTheme());
    }
  });

  window.addEventListener('DOMContentLoaded', () => {
    showActiveTheme(getPreferredTheme());

    document.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        const theme = item.getAttribute('data-bs-theme-value');
        localStorage.setItem('theme', theme);
        setTheme(theme);
        showActiveTheme(theme, true);
      });
    });

    // // 添加一个按钮或事件来触发 toggleTheme
    // document
    //   .getElementById('toggle-theme-button')
    //   .addEventListener('click', toggleTheme)
  });
})();

// 捕获异步错误（Promise 拒绝）
window.addEventListener('unhandledrejection', function (event) {
  const errorDetails = {
    reason: event.reason,
    stack: event.reason ? event.reason.stack : 'No stack trace available',
    timestamp: new Date().toISOString(),
  };
  my_debugger.showError('Unhandled Rejection', errorDetails);
});

async function highlightCodeInPreElements() {
  const extractLanguageFromUrl = (url) => {
    try {
      const match = url.match(/\.([a-zA-Z0-9]+)(?:[\?#]|$)/);
      return match ? match[1] : 'json';
    } catch (error) {
      console.error('Error extracting language from URL:', error);
      return 'json';
    }
  };
  try {
    const preElements = Array.from(document.querySelectorAll('pre'));
    const fragment = document.createDocumentFragment();

    preElements.forEach((pre) => {
      if (!pre.querySelector('code')) {
        const language = extractLanguageFromUrl(location.href);
        if (/^[a-zA-Z\-]+$/.test(language)) {
          const newCodeElement = document.createElement('code');
          newCodeElement.className = `language-${language}`;
          newCodeElement.textContent = pre.textContent;
          fragment.appendChild(newCodeElement);
          pre.textContent = '';
          pre.appendChild(newCodeElement);
        }
      }
    });

    requestAnimationFrame(() => {
      document.body.appendChild(fragment);
      preElements.forEach((pre) => {
        const codeElement = pre.querySelector('code');
        if (codeElement) {
          window.hljs.highlightElement(codeElement);

          // Add the language label if it doesn't already exist
          if (
            !codeElement.nextElementSibling ||
            !codeElement.nextElementSibling.classList.contains('highlight-language')
          ) {
            const language = codeElement.result ? codeElement.result.language : 'plaintext';
            const languageLabel = document.createElement('span');
            languageLabel.className = 'highlight-language';
            languageLabel.textContent = `Language: ${language}`;
            pre.appendChild(languageLabel);
          }
        }
      });
    });
  } catch (error) {
    my_debugger.showError('Error highlighting code in <pre> elements:', error);
  }
}

var my_debugger = {};
my_debugger.showError = (message, error = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    ...(error
      ? {
          error: {
            message: error.message || 'Unknown error',
            stack: error.stack || 'No stack trace available',
            name: error.name || 'Error',
          },
        }
      : {}),
  };

  // if (isDevelopment) {
  // In development, log everything with more details
  console.error(JSON.stringify(logEntry, null, 2));
};

// 确保模板只插入一次
if (!document.querySelector('.toast-container')) {
  document.body.insertAdjacentHTML(
    'beforeend',
    `
    <!-- Toast Container -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1111100; transform: translate3d(0px, 36px, 0px);">
      <div id="programToast" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <span id="toastIcon" class="me-2"></span>
          <strong id="toastTitle" class="me-auto"></strong>
          <small id="toastTimeDiff" class="text-muted"></small>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
          <span id="toastMessage"></span>
          <div id="toastButtons" class="mt-2 pt-2 border-top d-flex gap-2"></div>
        </div>
      </div>
    </div>

    <!-- Modal Template -->
    <div class="modal fade" id="notificationModal" tabindex="-1" aria-labelledby="modalTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitle"></h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" id="modalBody" style="
    max-height: 30rem;
    overflow: auto;
"></div>
          <div class="modal-footer" id="modalFooter"></div>
        </div>
      </div>
    </div>
  `,
  );
}

/**
 * Configuration object for notification icons and colors
 * @type {Object}
 */
const notificationConfig = {
  icons: {
    info: '📝',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  },
  colors: {
    info: '#0dcaf0',
    success: '#198754',
    warning: '#ffc107',
    error: '#dc3545',
  },
};

/**
 * Shows a notification using either toast or modal
 * @param {string} title - The notification title
 * @param {string} message - The notification message
 * @param {NotificationOptions} [options={}] - Configuration options
 * @returns {bootstrap.Toast|bootstrap.Modal|null} The notification instance (toast or modal)
 * @throws {Error} When required DOM elements are not found
 * @example
 * // Show a simple toast notification
 * showNotification('Hello', 'This is a message');
 *
 * // Show a success modal with custom buttons
 * showNotification('Success', 'Operation completed', {
 *   type: 'success',
 *   modal: true,
 *   buttons: [{
 *     text: 'Continue',
 *     onClick: () => console.log('Continued')
 *   }]
 * });
 */
function showNotification(title, message, options = {}) {
  const defaults = {
    type: 'info',
    duration: 3000,
    position: 'end-0',
    animate: true,
    dismissible: true,
    buttons: [],
    modal: false,
    size: 'medium',
    html: false,
    triggerTime: Date.now(), // 记录触发时间
  };

  const config = { ...defaults, ...options };

  // Handle modal notifications
  if (config.modal) {
    return showModalNotification(title, message, config);
  }
  // Handle toast notifications
  return showToastNotification(title, message, config);
}

/**
 * Shows a toast notification
 * @private
 * @param {string} title - The toast title
 * @param {string} message - The toast message
 * @param {NotificationOptions} config - Configuration options
 * @returns {bootstrap.Toast|null} The toast instance or null if failed
 */
function showToastNotification(title, message, config) {
  try {
    let toastEl = document.getElementById('programToast');
    if (!toastEl) throw new Error('Toast element not found');

    // Create a new toast element if the existing one is showing
    if (toastEl.classList.contains('show')) {
      const newToastEl = toastEl.cloneNode(true);
      newToastEl.removeAttribute('id');
      document.querySelector('.toast-container').appendChild(newToastEl);
      toastEl = newToastEl;
    }
    // Create Bootstrap toast instance
    const toastInstance = new bootstrap.Toast(toastEl, {
      animation: config.animate,
      autohide: config.duration !== false,
      delay: config.duration,
    });

    // Get elements
    const iconEl = document.getElementById('toastIcon');
    const titleEl = document.getElementById('toastTitle');
    const messageEl = document.getElementById('toastMessage');
    const buttonContainer = document.getElementById('toastButtons');
    const closeBtn = toastEl.querySelector('.btn-close');

    // Set content
    if (iconEl) {
      iconEl.textContent = notificationConfig.icons[config.type];
      iconEl.style.color = notificationConfig.colors[config.type];
    }

    if (titleEl) titleEl.textContent = title;
    if (messageEl) {
      if (config.html) {
        messageEl.innerHTML = message;
      } else {
        messageEl.textContent = message;
      }
    }

    // Handle buttons
    if (buttonContainer) {
      buttonContainer.innerHTML = '';
      if (config.buttons && config.buttons.length > 0) {
        config.buttons.forEach((button) => {
          const btnElement = document.createElement('button');
          btnElement.textContent = button.text;
          btnElement.className = button.class || 'btn btn-sm btn-primary';
          btnElement.onclick = () => {
            if (button.onClick) button.onClick();
            if (button.closeOnClick !== false) {
              toastInstance.hide();
            }
          };
          buttonContainer.appendChild(btnElement);
        });
        buttonContainer.style.display = 'flex';
      } else {
        buttonContainer.style.display = 'none';
      }
    }

    // Handle close button
    if (closeBtn) {
      closeBtn.style.display = config.dismissible ? 'block' : 'none';
    }

    const timeDiffEl = document.getElementById('toastTimeDiff');
    timeDiffEl.textContent = '刚刚';
    const intervalId = setInterval(() => {
      timeDiffEl.textContent = calculateTimeDifference(Date.now(), config.triggerTime);
    }, 1000);

    toastInstance._element.addEventListener('hidden.bs.toast', () => clearInterval(intervalId));
    toastInstance.show();
    return toastInstance;
  } catch (error) {
    my_debugger.showError('Failed to show toast notification:', error);
    return null;
  }
}

/**
 * Shows a modal notification
 * @private
 * @param {string} title - The modal title
 * @param {string} message - The modal message
 * @param {NotificationOptions} config - Configuration options
 * @returns {bootstrap.Modal|null} The modal instance or null if failed
 */
function showModalNotification(title, message, config) {
  try {
    // Ensure config.dismissible is always boolean
    config.dismissible = Boolean(config.dismissible ?? true); // defaults to true if undefined
    const modalEl = document.getElementById('notificationModal');
    if (!modalEl) throw new Error('Modal element not found');

    // Get modal elements
    const titleEl = modalEl.querySelector('#modalTitle');
    const bodyEl = modalEl.querySelector('#modalBody');
    const footerEl = modalEl.querySelector('#modalFooter');
    const closeBtn = modalEl.querySelector('.btn-close');
    const dialogEl = modalEl.querySelector('.modal-dialog');

    // Set modal size
    dialogEl.className = `modal-dialog modal-dialog-centered ${
      config.size === 'large' ? 'modal-lg' : config.size === 'small' ? 'modal-sm' : ''
    }`;

    // Set content
    if (titleEl) {
      titleEl.innerHTML = `${notificationConfig.icons[config.type]} ${title}`;
    }

    if (bodyEl) {
      if (config.html) {
        bodyEl.innerHTML = message;
      } else {
        bodyEl.textContent = message;
      }
    }

    // Handle buttons
    if (footerEl) {
      footerEl.innerHTML = config.dismissible
        ? '<button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>'
        : '';

      if (config.buttons.length > 0) {
        config.buttons.forEach((button) => {
          const btnElement = document.createElement('button');
          btnElement.textContent = button.text;
          btnElement.className = button.class || 'btn btn-primary';
          btnElement.onclick = () => {
            if (button.onClick) button.onClick();
            if (button.closeOnClick !== false) {
              modalInstance.hide();
            }
          };
          footerEl.appendChild(btnElement);
        });
      }
    }

    // Handle close button
    if (closeBtn) {
      closeBtn.style.display = config.dismissible ? 'block' : 'none';
    }

    // Create and show modal
    const modalInstance = new bootstrap.Modal(modalEl, {
      backdrop: config.dismissible ? true : 'static',
      keyboard: config.dismissible || false,
    });
    modalInstance.show();

    return modalInstance;
  } catch (error) {
    my_debugger.showError('Failed to show modal notification:', error);
    return null;
  }
}

/**
 * Calculates the time difference between two dates
 * @param {Date} now - The current date
 * @param {Date} triggerTime - The trigger time of the notification
 * @returns {string} The formatted time difference
 */
function calculateTimeDifference(now, triggerTime) {
  const diff = now - triggerTime;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return `${seconds}秒前`;
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  return '刚刚';
}

class ThemeConfigForm {
  constructor() {
    this.themeConfig = {
      themeColors: {
        low: [{ color: 'blu', per: '100%' }],
        mid: [{ color: 'blu', per: '100%' }],
        high: [{ color: 'blu', per: '100%' }],
        accent: [{ color: 'blu', per: '100%' }],
        base: 'blu',
      },
    };
    this.sections = ['low', 'mid', 'high', 'accent'];
  }

  createSectionContainers() {
    const colorSections = document.getElementById('colorSections');
    if (!colorSections) return;

    colorSections.innerHTML = ''; // Clear existing content

    this.sections.forEach((section) => {
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'mb-4';
      sectionDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-capitalize mb-0">${section} Colors</h6>
                <button type="button" class="btn btn-sm btn-outline-primary add-color-btn" data-section="${section}">
                    <i class="material-icons">add</i> 添加颜色
                </button>
            </div>
            <div id="${section}Colors" class="color-items">
            </div>
        `;
      colorSections.appendChild(sectionDiv);
    });

    // Add event listeners to the newly created buttons
    this._addEventListeners();
  }

  renderColorItems(section) {
    const container = document.getElementById(`${section}Colors`);
    if (!container) {
      my_debugger.showError(`Container for ${section} not found`);
      return;
    }

    container.innerHTML = '';

    this.themeConfig.themeColors[section].forEach((item, index) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'row mb-2 align-items-center';
      itemDiv.innerHTML = `
            <div class="col">
                ${this.createColorSelect(section, index, item.color).outerHTML}
            </div>
            <div class="col">
                <div class="input-group">
                    <input type="number" class="form-control percentage-input" 
                           value="${parseInt(item.per, 10)}"
                           min="0" max="100"
                           data-section="${section}"
                           data-index="${index}">
                    <span class="input-group-text">%</span>
                </div>
            </div>
            <div class="col-auto">
                <button type="button" class="btn btn-sm btn-outline-danger remove-color-btn"
                        data-section="${section}"
                        data-index="${index}">
                    <i class="material-icons">删除</i>
                </button>
            </div>
        `;
      container.appendChild(itemDiv);
      // Add event listeners to the newly created elements
      const select = itemDiv.querySelector('select');
      select.value = item.color;
      select.onchange = (e) => {
        if (index == null) {
          this.themeConfig.themeColors.base = e.target.value;
        } else {
          this.updateColor(section, index, e.target.value);
        }
      };
    });
    // Remove Color buttons
    document.querySelectorAll('.remove-color-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const { section, index } = e.currentTarget.dataset;
        this.removeColorItem(section, parseInt(index));
      });
    });

    // Percentage inputs
    document.querySelectorAll('.percentage-input').forEach((input) => {
      input.addEventListener('change', (e) => {
        const { section, index } = e.currentTarget.dataset;
        this.updatePercentage(section, parseInt(index), e.target.value);
      });
    });
  }

  _addEventListeners() {
    // Add Color buttons
    document.querySelectorAll('.add-color-btn').forEach((button) => {
      button.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.section;
        this.addColorItem(section);
      });
    });

    // Export button
    const exportBtn = document.querySelector('#themeConfig_exportConfig');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportConfig());
    }

    // Import input
    const importInput = document.querySelector('#themeConfig_importConfig');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.importConfig(e.target));
    }

    const saveInput = document.querySelector('#themeConfig_saveConfig');
    if (saveInput) {
      saveInput.addEventListener('click', (e) => this.saveConfig());
    }
  }

  createColorSelect(section, index, currentValue) {
    const select = document.createElement('select');
    select.className = 'form-select';
    // Add options based on ColorManager.COLORS
    Object.values(ColorManager.COLORS).forEach((color) => {
      const option = document.createElement('option');
      option.value = color;
      option.textContent = color.toUpperCase();
      option.selected = color === currentValue;
      select.appendChild(option);
    });
    return select;
  }

  addColorItem(section) {
    this.themeConfig.themeColors[section].push({
      color: ColorManager.COLORS.BLU,
      per: 0,
    });
    this.renderColorItems(section);
    this.validatePercentages(section);

    showNotification('颜色已添加! ✨', '新的颜色选项已添加到您的调色板', {
      type: 'success',
      duration: 2000,
    });
  }

  removeColorItem(section, index) {
    this.themeConfig.themeColors[section].splice(index, 1);
    if (this.themeConfig.themeColors[section].length === 0) {
      this.addColorItem(section);
    }
    this.renderColorItems(section);
    this.validatePercentages(section);

    showNotification('颜色已移除! 🗑️', '该颜色已从调色板中移除', {
      type: 'info',
      duration: 2000,
    });
  }

  updateColor(section, index, value) {
    this.themeConfig.themeColors[section][index].color = value;
  }

  updatePercentage(section, index, value) {
    this.themeConfig.themeColors[section][index].per = parseInt(value, 10) + '%';
    this.validatePercentages(section) &&
      showNotification('百分比已更新！📊', '您的颜色分布已更新', {
        type: 'success',
        duration: 2000,
      });
  }

  validatePercentages(section) {
    const items = this.themeConfig.themeColors[section];
    const total = items.reduce((sum, item) => sum + parseInt(item.per, 10), 0);
    const rest = 100 - total;

    if (total > 100) {
      showNotification('快速检查! 🎨', `${section}中的颜色超过100%。请减少${total - 100}%。`, {
        type: 'warning',
        duration: 4000,
        dismissible: true,
      });
      return false;
    } else if (total < 100) {
      showNotification(
        '快速检查! 🎨',
        `${section}中的颜色加起来应该是100! 现在它们处于 ${total}% (${rest}% 剩余)。`,
        {
          type: 'warning',
          duration: 4000,
          dismissible: true,
        },
      );
      return false;
    } else if (total === 100) {
      return true;
    }
    showNotification('错误', '出了一点问题，请再试一次。', {
      type: 'error',
      duration: 5000,
    });
    return false;
  }

  exportConfig() {
    // Validate all sections before export
    const isValid = ['low', 'mid', 'high', 'accent'].every((section) =>
      this.validatePercentages(section),
    );

    if (!isValid) return;

    const configString = JSON.stringify(this.themeConfig, null, 2);
    const blob = new Blob([configString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    /////////

    showNotification('已导出！📤', '你的颜色设置已成功导出', {
      type: 'success',
      duration: 3000,
    });
  }

  saveConfig() {
    // Validate all sections before export
    const isValid = ['low', 'mid', 'high', 'accent'].every((section) =>
      this.validatePercentages(section),
    );

    if (!isValid) return;

    window.AudioAnalyzer &&
      window.AudioAnalyzer.handleThemeChange_manual(this.themeConfig) &&
      showNotification('已保存！💫', '你的颜色偏好已更新', {
        type: 'success',
      });

    /////////
  }

  importConfig(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate imported colors
        const isValid = this.validateImportedConfig(imported);
        if (!isValid) {
          throw new Error('Invalid color codes in imported configuration');
        }

        this.themeConfig = imported;
        this.initializeForm();
        showNotification('已导入！📥', '你的颜色偏好已成功导入', {
          type: 'success',
          duration: 3000,
        });
        this.saveConfig();
      } catch (error) {
        showNotification('错误', '出了一点问题，请再试一次。', {
          type: 'error',
          duration: 5000,
        });
      }
    };
    reader.readAsText(file);
  }

  validateImportedConfig(config) {
    const validColors = Object.values(ColorManager.COLORS);
    const sections = ['low', 'mid', 'high', 'accent'];

    // Validate base color
    if (!validColors.includes(config.themeColors.base)) {
      showNotification('配置无效', '基础颜色无效', {
        type: 'error',
        duration: 5000,
      });
      return false;
    }

    // Validate section colors
    for (const section of sections) {
      if (!config.themeColors[section]) {
        showNotification('配置无效', `缺少部分：${section}`, {
          type: 'error',
          duration: 5000,
        });
        return false;
      }

      for (const item of config.themeColors[section]) {
        if (!validColors.includes(item.color)) {
          showNotification('配置无效', `${section} 部分颜色无效`, {
            type: 'error',
            duration: 5000,
          });
          return false;
        }

        if (typeof item.per !== 'string') {
          showNotification('配置无效', `${section} 部分百分比格式无效`, {
            type: 'error',
            duration: 5000,
          });
          return false;
        }

        const percentage = parseInt(item.per, 10);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
          showNotification('配置无效', `${section} 部分百分比值无效`, {
            type: 'error',
            duration: 5000,
          });
          return false;
        }
      }
    }

    return true;
  }

  initializeForm() {
    // First create base color select
    const baseContainer = document.getElementById('baseColorContainer');
    if (baseContainer) {
      baseContainer.innerHTML = '';
      const baseSelect = this.createColorSelect('base', null, this.themeConfig.themeColors.base);
      baseContainer.appendChild(baseSelect);

      baseSelect.onchange = (e) => {
        console.log('e: ', e);
        this.themeConfig.themeColors.base = e.target.value;
      };
    }

    // Then create section containers and render items
    this.createSectionContainers();
    this.sections.forEach((section) => {
      this.renderColorItems(section);
    });
  }
}

/**
 *
 * @param {string} data
 * @example [length: 03:36]
 * @return {<Array>{string}} ['length', '03:06']
 */

function extractInfo(data) {
  const info = data.trim().slice(1, -1); // remove brackets: length: 03:06
  return info.split(': ');
}

function lrcParser(data) {
  if (typeof data !== 'string') {
    throw new TypeError('expect first argument to be a string');
  }
  // split a long stirng into lines by system's end-of-line marker line \r\n on Windows
  // or \n on POSIX
  let lines = data.split('\n');
  const timeStart = /\[(\d*\:\d*\.?\d*)\]/; // i.g [00:10.55]
  const scriptText = /(.+)/; // Havana ooh na-na (ayy)
  const timeEnd = timeStart;
  const startAndText = new RegExp(timeStart.source + scriptText.source);

  const infos = [];
  const scripts = [];
  const result = {};

  for (let i = 0; startAndText.test(lines[i]) === false; i++) {
    infos.push(lines[i]);
  }

  infos.reduce((result, info) => {
    const [key, value] = extractInfo(info);
    result[key] = value;
    return result;
  }, result);

  lines.splice(0, infos.length); // remove all info lines
  const qualified = new RegExp(startAndText.source + '|' + timeEnd.source);
  lines = lines.filter((line) => qualified.test(line));

  for (let i = 0, l = lines.length; i < l; i++) {
    const matches = startAndText.exec(lines[i]);
    const timeEndMatches = timeEnd.exec(lines[i + 1]);
    if (matches && timeEndMatches) {
      const [, start, text] = matches;
      const [, end] = timeEndMatches;
      scripts.push({
        start: convertTime(start),
        text,
        end: convertTime(end),
      });
    }
  }

  result.scripts = scripts;
  return result;
}

// convert time string to seconds
// i.g: [01:09.10] -> 69.10
function convertTime(string) {
  string = string.split(':');
  const minutes = parseInt(string[0], 10);
  const seconds = parseFloat(string[1]);
  if (minutes > 0) {
    const sc = minutes * 60 + seconds;
    return parseFloat(sc.toFixed(2));
  }
  return seconds;
}

/*
 * generate-tool
 */

import { parseBlob, parseBuffer } from 'music-metadata';
import sentimentAnalyzer from './sentiment-zh_cn_web.js';
class AudioAnalyzer {
  constructor() {
    this.state = {
      audioContext: null,
      isAnalyzing: false,
      audioBuffer: null,
      metadata: null,
      lyrics: null,
      themeColors: null,
    };

    this.setupEventListeners();
    // 控制状态显示的函数
    this.showStatusNotStarted = () => {
      document.getElementById('statusNotStarted').classList.remove('d-none');
      document.getElementById('statusProcessing').classList.add('d-none');
      document.getElementById('statusCompleted').classList.add('d-none');
    };

    this.showStatusProcessing = () => {
      document.getElementById('statusNotStarted').classList.add('d-none');
      document.getElementById('statusProcessing').classList.remove('d-none');
      document.getElementById('statusCompleted').classList.add('d-none');
    };

    this.showStatusCompleted = () => {
      document.getElementById('statusNotStarted').classList.add('d-none');
      document.getElementById('statusProcessing').classList.add('d-none');
      document.getElementById('statusCompleted').classList.remove('d-none');
    };
  }

  setupEventListeners() {
    document
      .getElementById('audioFileInput_generate_tool')
      .addEventListener('change', (e) => this.handleAudioFileSelect(e));
    document
      .getElementById('lrcFileInput_generate_tool')
      .addEventListener('change', (e) => this.handleLrcFileSelect(e));

    // Analysis button
    document.getElementById('generate-btn').addEventListener('click', () => this.startAnalysis());

    document.getElementById('copy-btn').addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(document.getElementById('output-result').value);
        showNotification('耶！', '📋 已复制到剪贴板！', {
          type: 'success',
          duration: 3000,
        });
      } catch (err) {
        my_debugger.showError('Failed to copy:', err);
        showNotification('哎呀！', '📋 无法复制到剪贴板！', {
          type: 'error',
          duration: 5000,
        });
      }
    });

    document.getElementById('download-btn').addEventListener('click', () => {
      try {
        const content = document.getElementById('output-result').value;
        if (!content.trim()) {
          showNotification('检查一下！💭', '还没有内容可以下载。先添加一些内容吧！', {
            type: 'warning',
            duration: 4000,
          });
          return;
        }
        const blob = new Blob([content], {
          type: 'text/plain',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `converted-output.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Add success notification
        showNotification('开始下载！✨', '你的文件正在下载中', {
          type: 'success',
          duration: 3000,
        });
      } catch (error) {
        // Add error notification if something goes wrong
        showNotification(
          'Oops! 🤔',
          'There was a problem downloading your file. Please try again.',
          {
            type: 'error',
            duration: 5000,
            dismissible: true,
          },
        );
        my_debugger.showError('Download error:', error);
      }
    });
  }

  async getMetadata(filePath) {
    try {
      let metadata = {};
      const isIOSDevice = /iPad|iPhone|iPod/.test(window.navigator.userAgent) && !window.MSStream;

      try {
        // 尝试非iOS设备的处理方法
        metadata = await parseBlob(filePath);
      } catch (nonIOSDeviceError) {
        if (isIOSDevice) {
          // 如果是非iOS设备出错且当前设备是iOS设备，再尝试iOS设备的处理方法
          metadata = await parseBuffer(await blob.arrayBuffer(), {
            mimeType: filePath.type,
          });
        } else {
          // 如果是非iOS设备出错且当前设备也不是iOS设备，抛出错误
          throw nonIOSDeviceError;
        }
      }

      const bpm = metadata.common.bpm || 120;
      const format = metadata.format || {};
      const sampleRate = format.sampleRate || 44100;
      const bitrate = format.bitrate || 128000;
      const duration = format.duration || 0;
      // Success notification with audio details
      showNotification(
        '音频解析完成！🎵',
        `找到 ${bpm} BPM，时长: ${this.formatDuration(duration)} `,
        {
          type: 'success',
          duration: 4000,
        },
      );

      return { bpm, sampleRate, bitrate, duration };
    } catch (error) {
      // Error notification for failed analysis
      showNotification('音频解析问题 🎧', '无法解析这个音频文件。请尝试不同的格式。', {
        type: 'error',
        duration: 5000,
        dismissible: true,
      });
      my_debugger.showError(`Error parsing metadata for file ${filePath}: ${error}`);
      throw error;
    }
  }

  checkFileFormat(file) {
    // prettier-ignore
    const supportedFormats = ['.aac','.flac','.mp3', '.wav', '.ogg', '.m4a'];
    const fileExtension = file.name.toLowerCase().match(/\.[^.]*$/)?.[0];

    if (!supportedFormats.includes(fileExtension)) {
      showNotification(
        '文件类型检查 ⚠️',
        '为了获得最佳效果，请使用 AAC、FLAC、MP3、WAV、OGG 或 M4A 文件！',
        {
          type: 'warning',
          duration: 4000,
          dismissible: true,
        },
      );
      return false;
    }
    return true;
  }

  async handleAudioFileSelect(event) {
    const file = event.target.files[0];

    if (!file && !this.checkFileFormat(file)) return;
    try {
      // Load audio file and metadata
      if (this.state.audioContext) {
        await this.cleanup();
      }
      this.state.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      this.state.audioBuffer = await this.state.audioContext.decodeAudioData(arrayBuffer);
      this.state.metadata = await this.getMetadata(file);

      // Update UI
      this.updateFileInfo('audioFileInfo', file, this.state.metadata);
      this.updateAnalyzeButtonState();
      showNotification('成功', '音频文件加载成功', {
        type: 'success',
        duration: 3000,
      });
      document.getElementById('processing').classList.remove('d-none');
      this.showStatusNotStarted();
    } catch (error) {
      document.getElementById('processing').classList.add('d-none');
      showNotification('错误', `加载音频文件出错：${error.message}`, {
        type: 'error',
        duration: 5000,
      });
      my_debugger.showError(`Error loading audio file: ${error.message}`, error);
    }
  }

  async handleLrcFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      this.state.lyrics = lrcParser(text);

      // Update UI
      this.updateFileInfo('lrcFileInfo', file);
      this.updateAnalyzeButtonState();
      showNotification('成功', '加载LRC文件成功', {
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      showNotification('错误', `加载LRC文件出错: ${error.message}`, {
        type: 'error',
        duration: 5000,
      });
      my_debugger.showError(`Error loading LRC file: ${error.message}`, error);
    }
  }

  async handleThemeChange(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsedData = JSON.parse(e.target.result);
          if (!parsedData || !parsedData.themeColors) {
            throw new Error('Invalid theme configuration format');
          }
          this.state.themeColors = parsedData.themeColors;
          if (ColorManager.validateThemeColors(this.state.themeColors)) {
            // Update UI
            this.updateFileInfo('themeConfigInfo', file);
            this.updateAnalyzeButtonState();
            showNotification('成功', '主题颜色导入成功', {
              type: 'success',
              duration: 3000,
            });
          } else {
            showNotification('错误', '主题颜色配置无效', {
              type: 'error',
              duration: 5000,
            });
            my_debugger.showError(`Invalid theme colors configuration. - ${error.message}`, error);
          }
        } catch (error) {
          showNotification('错误', '无效的JSON格式', {
            type: 'error',
            duration: 5000,
          });
        }
      };
      reader.readAsText(file);
    }
  }

  async handleThemeChange_manual(configs_json) {
    try {
      if (!configs_json || !configs_json.themeColors) {
        throw new Error('Invalid theme configuration format');
      }
      this.state.themeColors = configs_json.themeColors;
      if (ColorManager.validateThemeColors(this.state.themeColors)) {
        this.updateAnalyzeButtonState();
        showNotification('成功', '主题颜色导入成功', {
          type: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Invalid theme colors configuration');
      }
    } catch (error) {
      showNotification('错误', '主题颜色配置无效', {
        type: 'error',
        duration: 5000,
      });
      my_debugger.showError(`Invalid theme colors configuration: ${error.message}`, error);
    }
  }

  updateFileInfo(elementId, file, metadata = null) {
    try {
      const infoElement = document.getElementById(elementId);
      let info = `文件名: ${file.name}<br>大小: ${this.formatFileSize(file.size)}`;

      if (metadata) {
        info += `<br>时长: ${this.formatDuration(metadata.duration)}`;
        info += `<br>采样率: ${metadata.sampleRate}Hz`;

        // Success notification when metadata is loaded
        showNotification('音频信息准备就绪 🎵', `成功加载 "${file.name}"`, {
          type: 'success',
          duration: 3000,
        });

        // Show notification if sample rate is unusual
        if (metadata.sampleRate !== 44100 && metadata.sampleRate !== 48000) {
          showNotification('采样率通知🎚️', '检测到异常的采样率。这可能会影响处理', {
            type: 'warning',
            duration: 4000,
            dismissible: true,
          });
        }

        // Notification for very long audio files
        if (metadata.duration > 600) {
          // longer than 10 minutes
          showNotification('检测到大文件 📦', '此文件较大，处理可能需要更长时间', {
            type: 'info',
            duration: 4000,
          });
        }
      }

      // infoElement.innerHTML = info;
    } catch (error) {
      // Error notification if something goes wrong
      showNotification('文件信息错误 ⚠️', '无法正确显示文件信息', {
        type: 'error',
        duration: 5000,
        dismissible: true,
      });
      my_debugger.showError('Error updating file info:', error);
    }

    // Check file size and show appropriate notification
    if (file.size > 100 * 1024 * 1024) {
      // 100MB
      showNotification('检测到大文件 📦', '此文件较大，处理可能需要更长时间', {
        type: 'info',
        duration: 4000,
      });
    }
  }

  formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  updateAnalyzeButtonState() {
    const button = document.getElementById('generate-btn');
    const canAnalyze = this.state.audioBuffer && !this.state.isAnalyzing;
    button.disabled = !canAnalyze;
  }

  async cleanup() {
    if (this.state.audioContext !== null) {
      await this.state.audioContext.close();
      this.state.audioContext = null;
    }
  }

  async startAnalysis() {
    if (this.state.isAnalyzing) {
      showNotification('正在处理中 🎵', '请等待当前分析完成', {
        type: 'info',
        duration: 3000,
      });
      return;
    }
    this.state.isAnalyzing = true;
    this.updateAnalyzeButtonState();
    this.clearOutput();

    try {
      // Input verification
      if (!this.state.audioBuffer) {
        showNotification('缺少音频 🎵', '请先上传一个音频文件', {
          type: 'warning',
          duration: 4000,
          dismissible: true,
          modal: true,
          buttons: [],
        });
        throw new Error('Audio buffer is not initialized');
      }
      if (!this.state.metadata) {
        showNotification('音频无效 🎵', '请先换一个音频文件,再试试吧', {
          type: 'warning',
          duration: 4000,
          dismissible: true,
          modal: true,
          buttons: [],
        });
        throw new Error('Metadata is not initialized');
      }
      if (!this.state.themeColors) {
        showNotification('颜色主题问题 🎨', '没读取到颜色设置!请检查是否保存', {
          type: 'error',
          duration: 4000,
          dismissible: true,
          modal: true,
          buttons: [],
        });
        throw new Error('Theme colors are not initialized');
      }
      if (!ColorManager.validateThemeColors(this.state.themeColors)) {
        showNotification('颜色主题问题 🎨', '颜色设置似乎有问题', {
          type: 'error',
          duration: 4000,
          dismissible: true,
          modal: true,
          buttons: [],
        });
        throw new Error('Invalid themeColors configuration');
      }

      await this.generateColorSequence();
      // Success notification after analysis completes
      showNotification('分析完成！✨', '你的音频已成功处理', {
        type: 'success',
        duration: 4000,
      });
      this.showStatusCompleted();
    } catch (error) {
      my_debugger.showError(`Analysis failed: ${error.message}`, error);

      // // Error notification
      // showNotification('分析错误 🎧', error.message, {
      //   type: 'error',
      //   duration: 5000,
      //   dismissible: true
      // })
    } finally {
      this.state.isAnalyzing = false;
      this.updateAnalyzeButtonState();
    }
  }

  async generateColorSequence(intervalMultiplier = 1) {
    try {
      const bpm = this.state.metadata.bpm || 120;
      const totalDuration = this.state.metadata.duration || 0;

      if (totalDuration > 600) {
        console.warn('Audio duration exceeds recommended length of 10 minutes');
      }

      const fileSizeInMB = this.state.audioBuffer.length / (1024 * 1024);
      if (fileSizeInMB > 50) {
        console.warn('Large File Detected 📦', 'This might take a little longer to process', {
          type: 'warning',
          duration: 4000,
        });
      }

      showNotification('开始处理 🎼', '正在分析你的音频文件...', {
        type: 'info',
        duration: 3000,
      });
      this.showStatusProcessing();

      // Setup
      const interval = (60 / bpm) * 1000 * intervalMultiplier; // milliseconds
      const totalIntervals = Math.ceil((totalDuration * 1000) / interval);
      const sortedLyrics = this.state.lyrics
        ? this.state.lyrics.scripts.sort((a, b) => a.start - b.start)
        : [];

      let lastOffEffect = -Infinity; // To track when we last used the "off4" effect

      const timelineData = [];
      let currentIndex = 0;

      const processChunk = async (startIndex) => {
        try {
          const chunkSize = 100; // Process 100 intervals at a time
          for (let i = startIndex; i < startIndex + chunkSize && i < totalIntervals; i++) {
            const currentTime = (i * interval) / 1000;
            const normalizedTime = 100 * Math.round(10 * currentTime);

            console.log(
              `Processing time: ${currentTime}s, Normalized: ${normalizedTime}, Total Duration: ${totalDuration}s`,
            );

            // Check if current time exceeds total duration
            if (currentTime >= totalDuration) {
              console.log(`Reached end of audio duration at ${currentTime}s`);
              return;
            }

            const currentLyric = sortedLyrics.find(
              (lyric) => Math.abs(lyric.start - currentTime) < 0.1,
            );
            try {
              const audioAnalysis = await this.processAudioChunk(
                this.state.audioBuffer,
                currentTime,
                0.1,
              );

              let normalizedFrequency = 0.5; // Default value
              let normalizedAmplitude = 0.5; // Default value

              if (typeof audioAnalysis.frequency === 'number' && !isNaN(audioAnalysis.frequency)) {
                normalizedFrequency =
                  audioAnalysis.frequency > 0 ? Math.min(audioAnalysis.frequency / 2000, 1) : 0;
              }

              if (typeof audioAnalysis.amplitude === 'number' && !isNaN(audioAnalysis.amplitude)) {
                normalizedAmplitude = audioAnalysis.amplitude;
              }

              // Ensure values are within [0-1] range
              normalizedFrequency = Math.max(0, Math.min(1, normalizedFrequency));
              normalizedAmplitude = Math.max(0, Math.min(1, normalizedAmplitude));

              let sentimentScore = 0;
              if (currentLyric) {
                sentimentScore = sentimentAnalyzer(currentLyric.text).comparative;
              }

              const isOffEffect = normalizedTime - lastOffEffect >= 800;

              const colorCode = ColorManager.getColorCode(
                normalizedFrequency,
                normalizedAmplitude,
                sentimentScore,
                this.state.themeColors,
                isOffEffect,
              );

              if (colorCode === 'off4') {
                lastOffEffect = normalizedTime;
              }

              console.log(
                `---\n[歌词]: ${
                  currentLyric ? currentLyric.text : '无'
                }, [情感分数]: ${sentimentScore},\n [时间]: ${normalizedTime}, [颜色]: ${colorCode},\n [归一化频率]: ${normalizedFrequency}, [归一化幅度]: ${normalizedAmplitude}\n---\n`,
              );

              if (currentLyric) {
                timelineData.push(`${normalizedTime},${colorCode} // ${currentLyric.text}`);
              } else {
                timelineData.push(`${normalizedTime},${colorCode}`);
              }
            } catch (error) {
              if (error.message && error.message.includes('Reached end of file')) {
                showNotification('处理完成 🎵', '完成音频文件的分析', {
                  type: 'success',
                  duration: 3000,
                });
              } else {
                showNotification('处理错误 🎧', '分析你的音频时出现问题', {
                  type: 'error',
                  duration: 5000,
                  dismissible: true,
                });
                my_debugger.showError(`Error analyzing audio: ${error}`);
              }
            }
            this.updateProgress((i / totalIntervals) * 100);
          }

          currentIndex += chunkSize;
          if (currentIndex < totalIntervals) {
            requestAnimationFrame(() => processChunk(currentIndex));
          } else {
            this.handleAnalysisResult(timelineData);
          }
        } catch (error) {
          showNotification('块处理错误', error.message, {
            type: 'error',
            duration: 5000,
            dismissible: true,
          });
          throw error;
        }
      };

      // Start processing from the beginning
      processChunk(0);
    } catch (error) {
      showNotification('分析错误', error.message, {
        type: 'error',
        duration: 5000,
        dismissible: true,
      });
      this.updateProgress(0);
      throw error;
    }
  }

  async processAudioChunk(audioBuffer, startTime, duration) {
    return new Promise((resolve, reject) => {
      // Add input validation
      if (!audioBuffer) {
        reject(new Error('Audio buffer is null or undefined'));
        return;
      }

      const sampleRate = audioBuffer.sampleRate;
      if (!sampleRate) {
        reject(new Error('Invalid sample rate'));
        return;
      }

      const startSample = Math.floor(startTime * sampleRate);
      const numSamples = Math.floor(duration * sampleRate);

      // Validate array bounds
      if (startSample < 0 || startSample >= audioBuffer.length) {
        reject(new Error('Start sample out of bounds'));
        return;
      }

      try {
        const channelData = audioBuffer.getChannelData(0);
        if (!channelData) {
          reject(new Error('Channel data is null'));
          return;
        }

        const chunk = channelData.slice(startSample, startSample + numSamples);

        // Validate chunk data
        if (!chunk || chunk.length === 0) {
          reject(new Error('Invalid audio chunk'));
          return;
        }

        // Calculate amplitude
        const amplitude = chunk.reduce((sum, sample) => sum + Math.abs(sample), 0) / numSamples;

        // Estimate frequency using zero-crossings
        let crossings = 0;
        for (let i = 1; i < chunk.length; i++) {
          if ((chunk[i] > 0 && chunk[i - 1] <= 0) || (chunk[i] < 0 && chunk[i - 1] >= 0)) {
            crossings++;
          }
        }
        const frequency = (crossings * sampleRate) / (2 * chunk.length);

        resolve({
          amplitude: isNaN(amplitude) ? 0 : amplitude,
          frequency: isNaN(frequency) ? 0 : frequency,
        });
      } catch (error) {
        reject(new Error(`Audio processing error: ${error.message}`));
      }
    });
  }

  updateProgress(progress) {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    progressBar.style.width = `${progress}%`;
    progressText.textContent = `${Math.round(progress)}%`;

    // Update ARIA attributes
    progressBar.setAttribute('aria-valuenow', progress);
    progressText.setAttribute('aria-live', 'polite');
  }

  handleAnalysisResult(timelineData) {
    const output = document.getElementById('output-result');
    output.value = this.formatTimelineData(timelineData);
  }

  formatTimelineData(timelineData) {
    return timelineData
      .map((entry) => {
        const [time, color, lyric] = entry.split(',');
        return `${time},${color} ${lyric ? `// ${lyric}` : ''}`;
      })
      .join('\n');
  }

  clearOutput() {
    document.getElementById('output-result').value = '';
    this.updateProgress(0);
  }

  getDefaultThemeColors() {
    return {
      base: 'blu',
      low: [
        { color: 'blu', per: 60 },
        { color: 'pur', per: 40 },
      ],
      mid: [
        { color: 'pin', per: 50 },
        { color: 'red', per: 50 },
      ],
      high: [
        { color: 'yel', per: 40 },
        { color: 'ora', per: 60 },
      ],
      accent: [{ color: 'whi', per: 100 }],
    };
  }
}

// Color management class
class ColorManager {
  static COLORS = {
    RED: 'red',
    ORA: 'ora',
    YEL: 'yel',
    SKY: 'sky',
    BLU: 'blu',
    PUR: 'pur',
    PIN: 'pin',
    WHI: 'whi',
    OFF: 'off',
    RAI: 'rai',
  };

  static INTENSITIES = ['1', '2', '3', '4', 'T'];

  static SPECIAL_INTENSITIES = {
    pin: new Set(['2', '4']),
    whi: new Set(['4', 'T']),
    off: new Set(['4']),
    rai: new Set(['4']),
  };

  static getColorMap() {
    return Object.keys(this.COLORS).reduce((map, color) => {
      const colorKey = this.COLORS[color];
      map[colorKey] = this.SPECIAL_INTENSITIES[colorKey] || new Set(this.INTENSITIES);
      return map;
    }, {});
  }

  static validateThemeColors(themeColors) {
    const colorMap = this.getColorMap();
    const validRanges = ['low', 'mid', 'high', 'accent'];
    const validColors = Object.keys(colorMap);

    for (const range of validRanges) {
      if (!Array.isArray(themeColors[range])) {
        my_debugger.showError(`Invalid themeColors: ${range} should be an array`, 'error');
        return false;
      }

      for (const colorInfo of themeColors[range]) {
        if (typeof colorInfo !== 'object' || !colorInfo.color || !colorInfo.per) {
          showNotification(
            '颜色范围问题 🎨',
            `${range}范围需要正确配置！ ${range}范围内的颜色信息无效: ${JSON.stringify(colorInfo)}`,
            {
              type: 'error',
              duration: 4000,
            },
          );
          return false;
        }

        if (!validColors.includes(colorInfo.color)) {
          showNotification(
            '颜色选择无效 🎨',
            `请为${range}范围选择一个有效的颜色！${range}范围内颜色无效: ${colorInfo.color}`,
            {
              type: 'error',
              duration: 4000,
              dismissible: true,
            },
          );
          return false;
        }

        const percentage = parseInt(colorInfo.per);
        if (isNaN(percentage) || percentage <= 0 || percentage > 100) {
          showNotification(
            '百分比范围 📊',
            `颜色百分比必须在1到100之间！${range}范围内无效百分比: ${colorInfo.per}`,
            {
              type: 'warning',
              duration: 4000,
            },
          );
          return false;
        }
      }

      // Check if percentages sum up to 100
      const totalPercentage = themeColors[range].reduce(
        (sum, colorInfo) => sum + parseInt(colorInfo.per),
        0,
      );
      if (totalPercentage !== 100) {
        showNotification('百分比范围 🎯', `${range}范围百分比加起来应该是100!`, {
          type: 'warning',
          duration: 5000,
          dismissible: true,
        });
        return false;
      }
    }

    if (typeof themeColors.base !== 'string' || !validColors.includes(themeColors.base)) {
      showNotification('基础颜色缺失 🔍', '请为您的主题选择一个基础颜色！', {
        type: 'error',
        duration: 4000,
      });
      return false;
    }

    return true;
  }

  static validateColorCode(colorCode) {
    const color = colorCode.slice(0, 3);
    const intensity = colorCode.slice(3);
    const colorMap = this.getColorMap();

    if (!colorMap.hasOwnProperty(color)) {
      return false;
    }

    return colorMap[color].has(intensity);
  }

  static getValidColorCode(color, preferredIntensity) {
    const colorMap = this.getColorMap();
    if (!colorMap.hasOwnProperty(color)) {
      return null;
    }

    const validIntensities = Array.from(colorMap[color]);

    if (validIntensities.includes(preferredIntensity)) {
      return `${color}${preferredIntensity}`;
    }

    const closestIntensity = validIntensities.reduce((closest, current) => {
      const currentDiff = Math.abs(
        this.INTENSITIES.indexOf(current) - this.INTENSITIES.indexOf(preferredIntensity),
      );
      const closestDiff = Math.abs(
        this.INTENSITIES.indexOf(closest) - this.INTENSITIES.indexOf(preferredIntensity),
      );
      return currentDiff < closestDiff ? current : closest;
    }, validIntensities[0]);

    return `${color}${closestIntensity}`;
  }

  static getColorIntensity(normalizedFreq, adjustedLoudness) {
    const frequencyFactor = 1 - Math.pow(Math.abs(normalizedFreq - 0.5), 2);
    const combinedIntensity = adjustedLoudness * (1 + frequencyFactor);

    if (isNaN(combinedIntensity)) return 'off4';
    if (combinedIntensity >= 0.9) return 'T';
    if (combinedIntensity >= 0.7) return '4';
    if (combinedIntensity >= 0.5) return '3';
    if (combinedIntensity >= 0.3) return '2';
    return '1';
  }

  static mapFrequencyToColorInRange(frequency, range) {
    if (!Array.isArray(range) || range.length === 0) {
      return null;
    }

    const allEqual = range.every((item) => item.per === range[0].per);
    if (allEqual) {
      const slots = range.map((item) => item.color);
      for (let i = slots.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [slots[i], slots[j]] = [slots[j], slots[i]];
      }
      return slots[Math.floor(Math.random() * slots.length)];
    }

    const randomValue = Math.random();
    let accumulator = 0;

    for (const colorInfo of range) {
      accumulator += parseFloat(colorInfo.per) / 100;
      if (randomValue <= accumulator) {
        return colorInfo.color;
      }
    }

    return range[range.length - 1].color;
  }

  static mapFrequencyToColor(normalizedFreq, themeColors) {
    let range = {};
    if (normalizedFreq < 0.33) {
      range = themeColors.low;
    } else if (normalizedFreq < 0.66) {
      range = themeColors.mid;
    } else {
      range = themeColors.high;
    }

    if (!Array.isArray(range) || range.length === 0) {
      throw new Error('Invalid color range');
    }

    return this.mapFrequencyToColorInRange(normalizedFreq, range);
  }

  static getAccentColor(themeColors) {
    if (!Array.isArray(themeColors.accent) || themeColors.accent.length === 0) {
      throw new Error('Invalid accent color range');
    }

    return this.mapFrequencyToColorInRange(Math.random(), themeColors.accent);
  }

  static getColorCode(
    normalizedFreq,
    weightedAmplitude,
    sentimentScore,
    themeColors,
    useOffEffect = false,
  ) {
    // Apply Stevens' power law for perceived loudness (exponent ~0.6 for loudness)
    const perceivedLoudness = Math.pow(weightedAmplitude, 0.6);
    // Fletcher-Munson curves suggest that human hearing is most sensitive around 2-4 kHz
    // Adjust the amplitude threshold based on frequency sensitivity
    const sensitivityFactor = this.getSensitivityFactor(normalizedFreq);
    const adjustedLoudness = perceivedLoudness * sensitivityFactor;

    let color = '';
    try {
      color = this.mapFrequencyToColor(normalizedFreq, themeColors);
    } catch (error) {
      my_debugger.showError(`Error in mapFrequencyToColor: ${error}. Using base color.`, 'warn');
      color = themeColors.base;
    }

    // Use accent colors for extreme sentiments or high amplitudes
    // Reduced threshold for using accent colors, with less emphasis on sentiment
    if (adjustedLoudness >= 0.7) {
      try {
        color = this.getAccentColor(themeColors);
      } catch (error) {
        my_debugger.showError(`Error in getAccentColor: ${error}. Using original color.`, 'warn');
      }
    }

    // Get base intensity
    let intensity = this.getColorIntensity(normalizedFreq, adjustedLoudness);

    // Adjust intensity based on sentiment
    // Using a more gradual scale based on the circumplex model of affect
    if (sentimentScore > 0.75) {
      intensity = Math.min(parseInt(intensity) + Math.ceil(sentimentScore * 0.75), 4).toString();
    } else if (sentimentScore < -0.75) {
      intensity = Math.max(
        parseInt(intensity) - Math.ceil(Math.abs(sentimentScore) * 0.75),
        1,
      ).toString();
    }

    // Use flicker effect for high amplitudes or extreme sentiments
    // Threshold based on research on visual flicker fusion threshold
    if (adjustedLoudness > 0.98) {
      intensity = 'T';
    }

    if (useOffEffect && adjustedLoudness >= 0.5) {
      return 'off4';
    }

    let colorCode = `${color}${intensity}`;

    // Validate the color code
    if (!this.validateColorCode(colorCode)) {
      const fallbackColorCode = this.getValidColorCode(color, intensity);
      if (fallbackColorCode) {
        my_debugger.showError(
          `[WARN]Invalid color code generated: ${colorCode}. Falling back to ${fallbackColorCode}.`,
          'warn',
        );
        colorCode = fallbackColorCode;
      } else {
        my_debugger.showError(
          `[ERROR]Critical error: Unable to generate a valid color code - ${colorCode}.`,
          'error',
        );
        colorCode = 'whi4'; // Using 'whi4' as a last resort
      }
    }

    return colorCode;
  }

  static getSensitivityFactor(normalizedFreq) {
    // Implement a curve based on the Fletcher-Munson equal-loudness contours
    // This is a simplified approximation
    const peakSensitivity = 0.3; // Corresponds to about 3-4 kHz
    return 1 + Math.sin((normalizedFreq - peakSensitivity) * Math.PI) * 0.3;
  }
}

/*
 * color-visualizer
 */

// File Import Handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const sequenceInput = document.getElementById('input');

// Prevent default drag behaviors
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, preventDefaults, false);
  document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// Highlight drop zone when dragging over it
['dragenter', 'dragover'].forEach((eventName) => {
  dropZone.addEventListener(eventName, highlight, false);
});
['dragleave', 'drop'].forEach((eventName) => {
  dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  dropZone.classList.add('drag-over');
}

function unhighlight(e) {
  dropZone.classList.remove('drag-over');
}

// Handle dropped files
dropZone.addEventListener('drop', handleDrop, false);
dropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleFileSelect(e) {
  const files = e.target.files;
  handleFiles(files);
}

function handleFiles(files) {
  const file = files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      sequenceInput.value = e.target.result;
    };
    reader.readAsText(file);
  }
}

// config.js - Color configuration
// prettier-ignore
const ColorConfig = { colors: { red: { 4: '#ef4444', 3: '#f87171', 2: '#fca5a5', 1: '#fecaca', T: '#ef4444' }, ora: { 4: '#f97316', 3: '#fb923c', 2: '#fdba74', 1: '#fed7aa', T: '#f97316' }, yel: { 4: '#eab308', 3: '#facc15', 2: '#fde047', 1: '#fef08a', T: '#eab308' }, sky: { 4: '#06b6d4', 3: '#22d3ee', 2: '#67e8f9', 1: '#a5f3fc', T: '#06b6d4' }, blu: { 4: '#3b82f6', 3: '#60a5fa', 2: '#93c5fd', 1: '#bfdbfe', T: '#3b82f6' }, pur: { 4: '#a855f7', 3: '#c084fc', 2: '#d8b4fe', 1: '#e9d5ff', T: '#a855f7' }, off: { 4: '#333333' }, pin: { 4: '#ec4899', 2: '#f472b6' }, whi: { 4: '#ffffff', T: '#eeeeee' } }, colorCache: new Map(), getColorCode (colorName) { if (this.colorCache.has(colorName)) { return this.colorCache.get(colorName) } const [base, level] = [colorName.slice(0, 3), colorName.slice(3)]; const color = this.colors[base]?.[level] || null; this.colorCache.set(colorName, color); return color } };

// models/Timeline.js - Timeline data structure
class Timeline {
  constructor(sequence = []) {
    this.sequence = sequence;
  }

  addFrame(time, color) {
    if (typeof time !== 'number' || time < 0) {
      throw new Error('Invalid time value');
    }
    if (!color || typeof color !== 'string') {
      throw new Error('Invalid color value');
    }
    this.sequence.push({ time, color });
    this.sort();
  }

  sort() {
    this.sequence.sort((a, b) => a.time - b.time);
  }

  getFrameAtTime(currentTime) {
    if (!this.sequence.length) return null;

    let left = 0;
    let right = this.sequence.length - 1;

    // Binary search for the appropriate frame
    while (left < right) {
      const mid = Math.floor((left + right + 1) / 2);
      if (this.sequence[mid].time <= currentTime) {
        left = mid;
      } else {
        right = mid - 1;
      }
    }
    return this.sequence[left];
  }

  getDuration() {
    if (this.sequence.length === 0) return 0;
    return this.sequence[this.sequence.length - 1].time;
  }

  clear() {
    this.sequence = [];
  }
}

// Update the TimelineParser class
class TimelineParser {
  static validate(line, index) {
    if (typeof line !== 'string') {
      return { errors: [`Line ${index + 1}: Invalid input type`] };
    }

    if (line.length <= 0) {
      return { errors: [`Line ${index + 1}: Empty Context`] };
    }

    if (line.length > 1000) {
      return { errors: [`Line ${index + 1}: Line too long`] };
    }

    const contentWithoutComment = line.split('//')[0].trim();

    if (!contentWithoutComment) {
      return null;
    }

    const errors = [];
    const [time, color] = contentWithoutComment.split(',').map((s) => s.trim());
    const timeMs = parseInt(time);

    if (isNaN(timeMs)) {
      errors.push(`Line ${index + 1}: Invalid time value: ${time}`);
    } else if (timeMs % 100 !== 0) {
      errors.push(`Line ${index + 1}: Time must be multiple of 100ms`);
    }

    if (!color) {
      errors.push(`Line ${index + 1}: Missing color value`);
    } else if (!ColorConfig.getColorCode(color)) {
      errors.push(`Line ${index + 1}: Invalid color code: ${color}`);
    }

    return errors.length ? { errors } : { time: timeMs, color };
  }

  static parse(input) {
    const lines = input.split('\n');
    const errors = [];
    const frames = [];

    lines.forEach((line, index) => {
      const result = this.validate(line, index);
      if (result) {
        if (result.errors) {
          errors.push(...result.errors);
        } else {
          frames.push(result);
        }
      }
    });

    // Sort frames by time
    frames.sort((a, b) => a.time - b.time);

    // Validate minimum interval
    for (let i = 1; i < frames.length; i++) {
      const gap = frames[i].time - frames[i - 1].time;
      if (gap < 200) {
        errors.push(
          `Invalid gap of ${gap}ms between ${frames[i - 1].time}ms and ${frames[i].time}ms`,
        );
      }
    }

    return { errors, frames };
  }
}

// Update the AnimationController class
class AnimationController {
  constructor(element, timerDisplay) {
    this.element = element;
    this.timerDisplay = timerDisplay;
    this.timeline = null;
    this.startTime = 0;
    this.lastFrameTime = 0;
    this.animationFrame = null;
    this.pausedTime = 0;
    this.isPaused = false;
    this.colorInfoTemplate = document.createElement('div');
    this.colorInfoTemplate.className = 'color-info';
  }

  setTimeline(timeline) {
    this.timeline = timeline;
    this.reset();
  }

  start() {
    if (this.isPaused) {
      // Resume from paused state
      this.startTime = performance.now() - this.pausedTime;
      this.isPaused = false;
    } else {
      // Start fresh
      this.reset();
      this.startTime = performance.now();
    }
    this.animate();
  }

  pause() {
    if (!this.isPaused && this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
      this.pausedTime = performance.now() - this.startTime;
      this.isPaused = true;
    }
  }

  resume() {
    if (this.isPaused) {
      this.start();
    }
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.reset();
    // Dispatch a custom event when animation stops
    this.element.dispatchEvent(new CustomEvent('animationStopped'));
  }

  reset() {
    this.startTime = 0;
    this.lastFrameTime = 0;
    this.pausedTime = 0;
    this.isPaused = false;
    this.element.style.backgroundColor = 'var(--surface-secondary';
    this.element.innerHTML = '';
    this.updateDisplay(0);
  }

  restart() {
    this.stop();
    this.start();
  }

  clear() {
    this.stop();
    this.timeline = null;
    this.element.style.backgroundColor = 'var(--surface-secondary';
    this.element.innerHTML = '';
    this.updateDisplay(0);
  }

  destroy() {
    this.clear();
    this.element = null;
    this.timerDisplay = null;
    this.colorInfoTemplate = null;
  }

  hexToRgb(hex) {
    const value = parseInt(hex.slice(1), 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgb(${r}, ${g}, ${b})`;
  }

  updateColorInfo(colorName, hexColor, time) {
    const fragment = document.createDocumentFragment();
    const div = this.colorInfoTemplate.cloneNode(true);
    div.innerHTML = `
                    <div>Name: ${colorName}</div>
                    <div>Time: ${time}ms</div>
                    <div>Hex: ${hexColor}</div>
                    <div>RGB: ${this.hexToRgb(hexColor)}</div>
                `;
    fragment.appendChild(div);
    this.element.innerHTML = '';
    this.element.appendChild(fragment);
  }

  animate(currentTime = 0) {
    if (this.isPaused) return;

    // Frame throttling for performance
    if (this.lastFrameTime && currentTime - this.lastFrameTime < 16) {
      this.animationFrame = requestAnimationFrame((time) => this.animate(time));
      return;
    }
    this.lastFrameTime = currentTime;

    const elapsed = currentTime - this.startTime;
    this.updateDisplay(elapsed);

    const frame = this.timeline?.getFrameAtTime(elapsed);
    if (frame) {
      const hexColor = ColorConfig.getColorCode(frame.color);
      if (hexColor) {
        this.element.style.backgroundColor = hexColor;
        this.updateColorInfo(frame.color, hexColor, frame.time);
      }
    }

    if (elapsed <= this.timeline.getDuration() + 1000) {
      this.animationFrame = requestAnimationFrame((time) => this.animate(time));
    } else {
      this.stop();
    }
  }

  updateDisplay(time) {
    this.timerDisplay.textContent = `[${formatTimestamp(time, 'mm:ss:ms')}] => ${Math.floor(
      time,
    )}ms `;
  }
}

class AudioVisualizer {
  constructor(audioElement) {
    this.audio = audioElement;
    this.isInitialized = false;
    this.canvas = document.getElementById('visualizer');
    this.ctx = this.canvas.getContext('2d');
    this.visualizationType = document.getElementById('visualizationType');
    this.minHeight = 100; // Minimum height for mobile
    this.maxHeight = 200; // Maximum height for larger screens

    this.setupAudioContext();
    this.setupEventListeners();
    this.resizeCanvas();
  }

  setupAudioContext() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    // Reduce FFT size for better performance on mobile
    this.analyser.fftSize = window.innerWidth < 768 ? 1024 : 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);

    this.source = this.audioContext.createMediaElementSource(this.audio);
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.isInitialized = true;
  }

  setupEventListeners() {
    // Debounce resize event for better performance
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resizeCanvas(), 250);
    });

    this.visualizationType.addEventListener('change', () => this.draw());

    // Handle orientation change for mobile devices
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.resizeCanvas(), 100);
    });
  }

  resizeCanvas() {
    const containerWidth = this.canvas.parentElement.offsetWidth;
    const screenWidth = window.innerWidth;

    // Responsive height calculation
    let canvasHeight;
    if (screenWidth < 576) {
      // Mobile
      canvasHeight = this.minHeight;
    } else if (screenWidth < 992) {
      // Tablet
      canvasHeight = Math.min(this.minHeight * 1.5, this.maxHeight);
    } else {
      // Desktop
      canvasHeight = this.maxHeight;
    }

    // Update canvas dimensions
    this.canvas.style.height = `${canvasHeight}px`;
    this.canvas.width = containerWidth * window.devicePixelRatio;
    this.canvas.height = canvasHeight * window.devicePixelRatio;

    // Scale canvas context
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Adjust visualization parameters based on screen size
    this.analyser.fftSize = screenWidth < 768 ? 1024 : 2048;
    this.bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(this.bufferLength);
  }

  draw() {
    if (!this.isInitialized) return;

    requestAnimationFrame(() => this.draw());

    this.analyser.getByteTimeDomainData(this.dataArray);

    // Clear canvas
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.visualizationType.value === 'frequency') {
      this.drawFrequencyBars();
    } else {
      this.drawWaveform();
    }
  }

  drawFrequencyBars() {
    this.analyser.getByteFrequencyData(this.dataArray);

    // Adjust bar width based on screen size
    const screenWidth = window.innerWidth;
    const barWidthMultiplier = screenWidth < 576 ? 1.5 : 2.5;
    const barWidth = (this.canvas.width / this.bufferLength) * barWidthMultiplier;
    const barSpacing = screenWidth < 576 ? 0.5 : 1;

    let x = 0;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.bufferLength; i++) {
      const barHeight = (this.dataArray[i] / 255) * this.canvas.height * 0.8;

      // Create gradient with adjusted colors for better visibility
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      gradient.addColorStop(0, '#00ff88');
      gradient.addColorStop(0.5, '#00ffff');
      gradient.addColorStop(1, '#0088ff');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        x,
        this.canvas.height - barHeight,
        Math.max(barWidth, 1), // Ensure minimum width of 1px
        barHeight,
      );

      x += barWidth + barSpacing;
    }
  }

  drawWaveform() {
    this.analyser.getByteTimeDomainData(this.dataArray);

    // Adjust line width based on screen size
    this.ctx.lineWidth = window.innerWidth < 576 ? 1 : 2;
    this.ctx.strokeStyle = '#00ffff';
    this.ctx.beginPath();

    const sliceWidth = this.canvas.width / this.bufferLength;
    let x = 0;

    for (let i = 0; i < this.bufferLength; i++) {
      const v = this.dataArray[i] / 128.0;
      const y = v * (this.canvas.height / 2);

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.lineTo(this.canvas.width, this.canvas.height / 2);
    this.ctx.stroke();
  }

  start() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.draw();
  }

  stop() {
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }
}

// Audio handling class
class AudioController {
  constructor() {
    this.audio = new Audio();
    this.visualizer = null;
    this.isAudioLoaded = false;
    this.syncedWithTimeline = false;
    this.setupAudioElements();
    this.setupEventListeners();
  }

  setupAudioElements() {
    this.audioDropZone = document.getElementById('audioDropZone');
    this.audioInput = document.getElementById('audioInput');
    this.audioControls = document.getElementById('audioControls');
    this.audioProgress = document.getElementById('audioProgress');
    this.currentTimeDisplay = document.getElementById('currentTime');
    this.totalTimeDisplay = document.getElementById('totalTime');
    this.audioFileName = document.getElementById('audioFileName');
    this.currentPer = document.getElementById('currentPer');
  }

  setupEventListeners() {
    // Audio file drop handling
    this.audioDropZone.addEventListener('drop', (e) => this.handleAudioDrop(e));
    this.audioDropZone.addEventListener('click', () => this.audioInput.click());
    this.audioInput.addEventListener('change', (e) => this.handleAudioSelect(e));

    // Audio playback events
    this.audio.addEventListener('loadedmetadata', () => this.handleAudioLoaded());
    this.audio.addEventListener('timeupdate', () => this.updateTimeDisplay());
    this.audio.addEventListener('ended', () => this.handleAudioEnded());

    // Progress bar handling with improved sync
    this.audioProgress.addEventListener('mousedown', () => {
      this.audio.pause();
    });

    // Timeline slider control
    this.audioProgress.addEventListener('input', (e) => {
      if (this.audio && !isNaN(this.audio.duration) && this.audio.duration > 0) {
        const percentage = parseFloat(e.target.value) / 100;
        const newTime = percentage * this.audio.duration;

        if (isFinite(newTime) && newTime >= 0) {
          this.audio.currentTime = newTime;
        } else {
          showNotification('播放出错', '检测到无效的时间位置.', {
            type: 'error',
            duration: 3000,
          });
        }
      } else {
        showNotification('音频未就绪', '请确保音频文件已正确加载。', {
          type: 'warning',
          duration: 3000,
        });
      }
    });
    this.audioProgress.addEventListener('mouseup', () => {
      // Only play if audio was previously playing
      if (!this.audio.paused) {
        this.audio.play();
      }
    });
    // Add volume control listener
    const volumeControl = document.getElementById('volumeControl');
    if (volumeControl) {
      volumeControl.addEventListener('input', (e) => {
        this.setVolume(e.target.value / 100);
      });
    }
  }

  handleAudioDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      this.loadAudioFile(file);
    }
  }

  handleAudioSelect(e) {
    const file = e.target.files[0];
    if (file) {
      this.loadAudioFile(file);
    }
  }

  loadAudioFile(file) {
    const url = URL.createObjectURL(file);
    this.audio.src = url;
    this.audioFileName.textContent = file.name;
    this.isAudioLoaded = true;
    // this.audioControls.className = '';
    this.updateControlButtons(true);

    // Initialize visualizer after loading audio
    if (!this.visualizer) {
      this.visualizer = new AudioVisualizer(this.audio);
    }
  }

  handleAudioLoaded() {
    this.audioProgress.max = 100;
    this.totalTimeDisplay.textContent = this.formatTime(this.audio.duration);
  }

  updateTimeDisplay() {
    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;
    const currentProgressValue = ((currentTime / duration) * 100).toFixed(2);
    this.currentTimeDisplay.textContent = this.formatTime(currentTime);
    this.totalTimeDisplay.textContent = this.formatTime(duration);
    this.currentPer.textContent = currentProgressValue + '%';
    this.audioProgress.value = currentProgressValue;
  }

  handleAudioEnded() {
    this.audioProgress.value = 0;
    this.updateTimeDisplay();
    if (this.syncedWithTimeline) {
      // Trigger timeline stop
      document.getElementById('stop').click();
    }
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Volume control (0.0 to 1.0)
  setVolume(value) {
    const volume = Math.max(0, Math.min(1, value));
    this.audio.volume = volume;
    return volume;
  }

  // // Playback speed control (0.5 to 2.0)
  // setPlaybackRate (rate) {
  //     const validRate = Math.max(0.5, Math.min(2, rate));
  //     this.audio.playbackRate = validRate;
  //     return validRate;
  // }

  // Seek to specific time in seconds
  seekTo(timeInSeconds) {
    if (this.isAudioLoaded) {
      const validTime = Math.max(0, Math.min(timeInSeconds, this.audio.duration));
      this.audio.currentTime = validTime;
      this.updateTimeDisplay();
    }
  }

  // Skip forward by specified seconds
  skipForward(seconds = 10) {
    if (this.isAudioLoaded) {
      this.seekTo(this.audio.currentTime + seconds);
    }
  }

  // Skip backward by specified seconds
  skipBackward(seconds = 10) {
    if (this.isAudioLoaded) {
      this.seekTo(this.audio.currentTime - seconds);
    }
  }

  // Mute/unmute toggle
  toggleMute() {
    this.audio.muted = !this.audio.muted;
    return this.audio.muted;
  }

  // Get current audio state
  getAudioState() {
    return {
      currentTime: this.audio.currentTime,
      duration: this.audio.duration,
      volume: this.audio.volume,
      playbackRate: this.audio.playbackRate,
      isMuted: this.audio.muted,
      isPlaying: !this.audio.paused,
    };
  }

  // Enhanced play method with optional start time
  play(startFromTime) {
    if (this.isAudioLoaded) {
      if (startFromTime !== undefined) {
        this.seekTo(startFromTime);
      }
      this.audio.play();
      this.visualizer?.start();
    }
  }

  syncWithControls_run() {
    if (!this.isAudioLoaded) return;
    this.audio.currentTime = 0; // Reset to start
    this.play();
    this.visualizer?.start();
    this.updateControlButtons(true);
  }

  syncWithControls_pause() {
    if (!this.isAudioLoaded) return;
    this.audio.pause();
    this.visualizer?.stop();
  }

  syncWithControls_resume() {
    if (!this.isAudioLoaded) return;
    this.play();
    this.visualizer?.start();
  }

  syncWithControls_stop() {
    if (!this.isAudioLoaded) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.visualizer?.stop();
    this.updateTimeDisplay();
    this.audioProgress.value = 0;
    this.currentPer.textContent = '0%';
  }

  syncWithControls_restart() {
    if (!this.isAudioLoaded) return;
    this.audio.currentTime = 0;
    this.currentPer.textContent = '0%';
    this.play();
    this.visualizer?.start();
  }

  syncWithControls_clear() {
    if (!this.isAudioLoaded) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.visualizer?.stop();
    this.isAudioLoaded = false;
    this.audio.src = '';
    this.audioFileName.textContent = '';
    this.audioProgress.value = 0;
    this.currentPer.textContent = '0%';
    this.updateTimeDisplay();
    // this.audioControls.className = 'd-none';
    this.updateControlButtons(false);
  }

  updateControlButtons(isSynced) {
    const controls = document.querySelectorAll('.control-button');
    controls.forEach((button) => {
      if (isSynced) {
        button.classList.add('synced');
      } else {
        button.classList.remove('synced');
      }
    });
  }
}

// Prevent default drag behaviors for audio drop zone
['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
  document.getElementById('audioDropZone').addEventListener(eventName, preventDefaults, false);
});

function formatTimestamp(milliseconds, format = 'dd HH:mm:ss') {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const millisecondsPart = milliseconds % 1000;

  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const totalHours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const formattedDays = String(days).padStart(2, '0');
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');
  const formattedMilliseconds = String(millisecondsPart.toFixed(0)).padStart(2, '0');
  return format
    .replace('dd', formattedDays)
    .replace('HH', formattedHours)
    .replace('mm', formattedMinutes)
    .replace('ss', formattedSeconds)
    .replace('ms', formattedMilliseconds);
}

window.addEventListener('load', () => {
  const fileInputs = document.querySelectorAll('input[type="file"]');
  const hasAutoFilled = Array.from(fileInputs).some((input) => input.value !== '');

  if (hasAutoFilled) {
    // Clear the inputs
    fileInputs.forEach((input) => {
      input.value = '';
    });

    // Use your existing notification system to show the message
    showNotification('需要选择文件', '请再次选择您的文件以确保正确处理。', {
      type: 'info',
      duration: 5000,
      buttons: [
        {
          text: 'OK',
          class: 'btn btn-sm btn-primary',
          onClick: () => {},
        },
      ],
    });
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  // Cache DOM elements
  const elements = {
    colorElement: document.getElementById('colorElement'),
    input: document.getElementById('input'),
    timerDisplay: document.getElementById('timer'),
    buttons: {
      run: document.getElementById('run'),
      pause: document.getElementById('pause'),
      resume: document.getElementById('resume'),
      stop: document.getElementById('stop'),
      restart: document.getElementById('restart'),
      clear: document.getElementById('clear'),
    },
  };
  // Initialize the form
  const themeConfigForm = new ThemeConfigForm();
  themeConfigForm.initializeForm();
  window.AudioAnalyzer = new AudioAnalyzer();

  // Initialize controller
  const animationController = new AnimationController(elements.colorElement, elements.timerDisplay);
  // Initialize audio controller
  const audioController = new AudioController();
  // Add listener for animation stopped event
  elements.colorElement.addEventListener('animationStopped', () => {
    updateButtonStates(false, false);
  });

  // Set initial button states
  const updateButtonStates = (running = false, paused = false) => {
    elements.buttons.run.disabled = running;
    elements.buttons.pause.disabled = !running || paused;
    elements.buttons.resume.disabled = !paused;
    elements.buttons.stop.disabled = !running;
    elements.buttons.restart.disabled = !animationController.timeline;
    elements.buttons.clear.disabled = !animationController.timeline;

    // Update button tooltips with hotkey information
    elements.buttons.run.title = '开始（空格）';
    elements.buttons.pause.title = '暂停（空格）';
    elements.buttons.resume.title = '恢复播放（空格）';
    elements.buttons.stop.title = '停止（Esc）';
    elements.buttons.restart.title = '重新启动（Ctrl/Cmd+R）';
    elements.buttons.clear.title = '清除（Ctrl/Cmd+Del）';
  };

  // Event Handlers
  const handleRun = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在运行前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }

    const { errors, frames } = TimelineParser.parse(elements.input.value);
    if (errors.length) {
      showNotification(
        '时间轴内容检查 ⚠️',
        '在你的时间轴内容上发现了一些问题:\n' + errors.join('\n'),
        {
          type: 'error',
          duration: 5000,
          dismissible: true,
        },
      );
      return handleStop();
    }
    if (frames.length === 0) {
      showNotification('空白时间轴内容 🎬', '找不到有效的时间轴。请先添加一些内容！', {
        type: 'warning',
        duration: 4000,
      });
      return;
    }

    try {
      animationController.timeline = new Timeline(frames);
      animationController.start();
      audioController.syncWithControls_run();
      updateButtonStates(true);

      showNotification('开始预览 🎵', '当前在预览时间轴颜色效果', {
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      showNotification('播放错误 🎼', '无法开始预览。请重试！', {
        type: 'error',
        duration: 4000,
        dismissible: true,
      });
      my_debugger.showError('Animation error:', error);
    }
  };

  const handlePause = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在暂停前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }
    animationController.pause();
    audioController.syncWithControls_pause();
    updateButtonStates(true, true);
    // showNotification('播放状态: 暂停 ⏸️', '已尝试暂停时间轴演示和音频', {
    //   type: 'info',
    //   duration: 3000
    // })
  };

  const handleResume = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在播放前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }
    animationController.resume();
    audioController.syncWithControls_resume();
    updateButtonStates(true, false);
    // showNotification('播放状态: 继续 ▶️', '从我们暂停的地方继续', {
    //   type: 'success',
    //   duration: 3000
    // })
  };

  const handleStop = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在暂停前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }
    animationController.stop();
    audioController.syncWithControls_stop();
    updateButtonStates();
    const modalBackdrop = document.querySelector('.modal-backdrop.fade.show');
    modalBackdrop?.remove();
    // showNotification('播放状态: 暂停 🔄', '已尝试暂停', {
    //   type: 'info',
    //   duration: 3000
    // })
  };

  const handleRestart = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在暂停前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }
    animationController.restart();
    audioController.syncWithControls_restart();
    updateButtonStates(true);

    // showNotification('播放状态: 重播 🔄', '已尝试重新开始播放', {
    //   type: 'success',
    //   duration: 3000
    // })
  };

  const handleClear = () => {
    if (document.activeElement === elements.input) {
      showNotification('检测到正在输入 ⌨️', '请在清除前完成编辑', {
        type: 'info',
        duration: 3000,
      });
      return;
    }

    if (elements.input.value.trim()) {
      showModalNotification('清除已生成的时间轴内容', '你确定要清除所有内容吗？此操作无法撤销。', {
        type: 'warning',
        buttons: [
          {
            text: '是的，清除所有 ',
            class: 'btn btn-danger',
            onClick: () => {
              performClear();
            },
          },
          {
            text: 'Cancel',
            class: 'btn btn-secondary',
            onClick: () => {
              showNotification('已取消清除 ↩️', '你的时间轴内容没有改变', {
                type: 'info',
                duration: 3000,
              });
            },
          },
        ],
        modal: true,
      });
    } else {
      showNotification('没什么需要清理的 🌟', '时间轴内容已经空了', {
        type: 'info',
        duration: 3000,
      });
    }
  };

  // Separate function to perform the actual clear operation
  const performClear = () => {
    try {
      elements.input.value = '';
      animationController.stop();
      animationController.timeline = null;
      elements.colorElement.style.backgroundColor = 'var(--surface-secondary';
      elements.timerDisplay.textContent = '[00:00:00] => 0ms';
      audioController.syncWithControls_clear();
      updateButtonStates();

      // Show success notification after clearing
      showNotification('清除成功 ✨', '一切都被成功重置了', {
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      // Show error notification if something goes wrong
      showNotification('清除错误 ⚠️', '清除输入的时间轴内容时出错', {
        type: 'error',
        duration: 4000,
        dismissible: true,
      });
      my_debugger.showError('Clear error:', error);
    }
  };

  // Bind click event listeners
  elements.buttons.run.addEventListener('click', handleRun);
  elements.buttons.pause.addEventListener('click', handlePause);
  elements.buttons.resume.addEventListener('click', handleResume);
  elements.buttons.stop.addEventListener('click', handleStop);
  elements.buttons.restart.addEventListener('click', handleRestart);
  elements.buttons.clear.addEventListener('click', handleClear);

  let errorCount = 0;
  const maxErrors = 5; // 设置最大错误处理次数
  let lastErrorTime = 0;
  const cooldownDuration = 5000; // 设置冷却时间为5秒

  // Add error handling
  window.addEventListener('error', (event) => {
    if (errorCount >= maxErrors) {
      showNotification(
        '频繁错误',
        `
                <div class="alert alert-warning">
                    <p><strong>频繁出现错误:</strong></p>
                    <p>快跟作者反馈一下!:</p>
                    <ul>
                        <li>刷新页面</li>
                        <li>检查您的输入数据</li>
                        <li>请在几分钟后重试</li>
                    </ul>
                </div>
            `,
        {
          type: 'warning',
          size: 'large',
          dismissible: true,
          modal: true,
          html: true,
          buttons: [
            {
              text: '确定',
              class: 'btn btn-primary',
              onClick: () => location.reload(),
              closeOnClick: true,
            },
          ],
        },
      );
      return; // 达到最大错误处理次数，不再处理新的错误
    }
    errorCount++;

    const currentTime = new Date().getTime();
    if (currentTime - lastErrorTime < cooldownDuration) {
      return; // 在冷却时间内，不再处理新的错误
    }

    lastErrorTime = currentTime;

    // // 将错误信息记录到本地存储
    // localStorage.setItem('errorLog', JSON.stringify(errorDetails));
    // 或者将错误信息发送到服务器
    // fetch()

    const errorDetails = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      stack: event.error ? event.error.stack : 'No stack trace available',
      timestamp: new Date().toISOString(),
    };

    showNotification(
      '发生错误',
      `
              <div class="alert alert-danger">
                  <p><strong>出错了:</strong></p>
                  <p>${event.message}</p>
                  <p>文件: ${event.filename}</p>
                  <p>行号: ${event.lineno}, 列号: ${event.colno}</p>
              </div>
              <p>请尝试以下方法:</p>
              <ul>
                  <li>刷新页面</li>
                  <li>检查您的输入数据</li>
                  <li>请在几分钟后重试</li>
              </ul>
          `,
      {
        type: 'error',
        size: 'large',
        dismissible: true,
        modal: true,
        html: true,
        buttons: [
          {
            text: '报告错误',
            class: 'btn btn-danger',
            onClick: () => showNotification('Report Error', `好了好了我知道了!`),
            closeOnClick: true,
          },
        ],
      },
    );

    my_debugger.showError('Error occurred:', errorDetails);
    return handleStop();
  });

  // Setup Mousetrap hotkeys
  const setupHotkeys = () => {
    // Space - Toggle Play/Pause
    Mousetrap.bind('space', (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      if (!animationController.timeline) {
        handleRun();
      } else if (animationController.isPaused) {
        handleResume();
      } else {
        handlePause();
      }
    });

    // Stop - Escape or Ctrl/Cmd + S
    Mousetrap.bind(['escape', 'mod+s'], (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      handleStop();
    });

    // Restart - Ctrl/Cmd + R
    Mousetrap.bind('mod+r', (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      handleRestart();
    });

    // Clear - Ctrl/Cmd + Delete
    Mousetrap.bind('mod+backspace', (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      handleClear();
    });

    // Additional helpful shortcuts
    Mousetrap.bind('mod+enter', (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      handleRun();
    });

    // Prevent default browser shortcuts when working with the animation
    Mousetrap.bind(['mod+s', 'mod+r'], (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
    });

    // Add help shortcut to show available hotkeys
    Mousetrap.bind('mod+.', (e) => {
      e.preventDefault();
      if (!document.querySelector('.nav-link.active[data-bs-target="#color-visualizer"]')) return;
      if (!document.querySelector('.modal-backdrop.fade.show'))
        showModalNotification(
          '快捷键帮助 ⌨️',
          `<div>可用的快捷键:<br>
      • 空格键 (Space) - 播放/暂停切换<br>
      • Ctrl/Cmd + Enter - 运行<br>
      • Esc 或 Ctrl/Cmd + S - 停止<br>
      • Ctrl/Cmd + R - 重新开始<br>
      • Ctrl/Cmd + Backspace - 清除内容<br>
      <br>
提示: 在编辑文本时，快捷键会暂时禁用</div>`,
          {
            type: 'info',
            buttons: [
              {
                text: 'OK',
                class: 'btn btn-primary',
                onClick: () => {},
              },
            ],
            modal: true,
            dismissible: true,
            html: true,
          },
        );
    });
  };

  // Initialize hotkeys
  setupHotkeys();

  // // Disable hotkeys when typing in textarea
  // elements.input.addEventListener('focus', () => {
  //     Mousetrap.pause();
  // });

  // elements.input.addEventListener('blur', () => {
  //     Mousetrap.unpause();
  // });

  // Optional: Add sample data to textarea
  if (!elements.input.value) {
    elements.input.value = '0,pin2\n500,pin2\n1000,sky3\n1500,pin4';
  }

  // Initial button states
  updateButtonStates();

  function toggleHelp(elm) {
    const isExpanded = elm.getAttribute('aria-expanded') === 'true';
    elm.setAttribute('aria-expanded', !isExpanded);
    elm.textContent = isExpanded ? '帮助 (收起)' : '帮助 (展开)';
  }

  showModalNotification(
    '公告📢 - 2024/11/23 15:20',
    `
      <div class="card shadow-sm mb-4">
          <div class="card-header">
              <h2 class="modal-title" id="announcementModalLabel">欢迎wmls来玩!</h2>
          </div>
          <div class="modal-body">
              <h6>制作者<a
                  href="https://www.xiaohongshu.com/user/profile/5d7e751900000000010010bd"
                  target="_blank">（小红书@那一转眼只剩我🥕)</a>留言：</h6>
              <p>本工具旨在帮助五月天演唱会的观众和组织者轻松生成荧光棒的控制代码，实现更加炫酷的灯光效果。通过简单的配置，你可以生成自定义的荧光棒控制代码，并在实时预览中查看基础效果。生成算法还在持续优化!本工具还在迭代!<br>感谢<a
                      href="https://www.xiaohongshu.com/user/profile/5d7e751900000000010010bd"
                      target="_blank">小红书@Diu🥕</a>大佬开发的<strong><code style="font-family: 'Lato', sans-serif;">Mayday.Blue</code></strong>小程序!
              </p>
  
              <h6>网站功能简介：</h6>
              <ul>
                  <li><strong>生成工具🎨：</strong>提供你想做预设的音频文件,轻松配置荧光棒的颜色主题并生成 <strong><code style="font-family: 'Lato', sans-serif;">Mayday.Blue</code></strong> 场控预设代码。</li>
                  <li><strong>实时预览👀：</strong>可以把生成的预设代码添加进来，实时展示荧光棒使用到的电脑颜色效果。</li>
              </ul>
  
              <h6>功能详细介绍：</h6>
              <ul>
                  <li>生成工具🎨：请看<strong>预设代码生成器</strong>选项卡的使用指南</li>
                  <li>实时预览👀：请看<strong>预设可视化工具</strong>选项卡的使用指南</li>
              </ul>
  
              <h6>重要细节：</h6>
              <ul>
                  <li>生成的代码可以直接复制并粘贴到你的<strong><code style="font-family: 'Lato', sans-serif;">Mayday.Blue</code></strong>中。</li>
                  <li>支持导出和导入颜色主题配置，方便保存和分享创意。</li>
              </ul>
  
              <h6>演示视频链接：</h6>
              <p>观看演示视频，了解更多使用技巧：<a href="https://example.com/demo-video" target="_blank">点击这里</a></p>
  
              <h6>用户交流群信息：</h6>
              <p>加入我们的用户交流群，与其他用户交流经验和技巧：<a href="https://example.com/user-group" target="_blank">点击这里</a></p>
          </div>
      </div>
    `,
    {
      type: 'info',
      size: 'large',
      buttons: [],
      html: true,
      dismissible: true,
    },
  );

  // const toggleGuide = document.querySelectorAll('.toggleGuide');
  // toggleGuide &&
  //   toggleGuide.forEach((element) => {
  //     element.addEventListener('click', (e) => toggleHelp(e.target));
  //   });

  window.hljs && (await highlightCodeInPreElements());
});
