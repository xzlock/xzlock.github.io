/**
 * Operation Lexicon · 云端进度同步 V2
 *
 * 架构：
 *   - 每个用户一个代号（agent-xxx）
 *   - 代号对应一个 KV 记录，内含多个 section (fce / toefl / toefl_study)
 *   - 前端按 section 单独同步，减少数据量
 */

(function () {
  'use strict';

  var _saveTimers = {};           // 每个 section 独立的防抖计时器
  var _pendingSections = {};      // 待保存的 section 数据

  var CloudSync = {
    // ⚠ 部署后替换成你的 Worker URL，留空 = 纯本地模式
    API_BASE: 'https://mute-brook-ca50.weiborao.workers.dev',

    CODE_KEY: 'lexicon-agent-code',   // 全站共享一个代号

    // 项目 section 定义
    SECTIONS: {
      FCE: 'fce',
      TOEFL: 'toefl',
      TOEFL_STUDY: 'toefl_study'
    },

    // 每个 section 对应的本地存储 key
    LOCAL_KEYS: {
      fce: 'fce-progress',
      toefl: 'toefl-progress',
      toefl_study: 'toefl-study'
    },

    // ========== 代号管理 ==========
    getCode: function () {
      return localStorage.getItem(this.CODE_KEY) || '';
    },

    setCode: function (code) {
      if (!this.isValidCode(code)) {
        throw new Error('代号格式错误：需 3-64 字符，仅允许字母数字和 - _');
      }
      localStorage.setItem(this.CODE_KEY, code);
    },

    clearCode: function () {
      localStorage.removeItem(this.CODE_KEY);
    },

    isValidCode: function (code) {
      return /^[a-zA-Z0-9_-]{3,64}$/.test(code || '');
    },

    generateCode: function () {
      var agents = ['jett', 'viper', 'phoenix', 'sage', 'cypher', 'omen', 'sova',
        'raze', 'reyna', 'killjoy', 'skye', 'yoru', 'breach', 'astra',
        'kayo', 'chamber', 'neon', 'fade', 'harbor', 'gekko', 'deadlock',
        'iso', 'clove'];
      var agent = agents[Math.floor(Math.random() * agents.length)];
      var rand = Math.random().toString(36).slice(2, 6);
      return 'agent-' + agent + '-' + rand;
    },

    // ========== 本地存储 ==========
    getLocal: function (section) {
      var key = this.LOCAL_KEYS[section];
      if (!key) return {};
      try {
        return JSON.parse(localStorage.getItem(key) || '{}');
      } catch (e) {
        return {};
      }
    },

    setLocal: function (section, data) {
      var key = this.LOCAL_KEYS[section];
      if (!key) return;
      localStorage.setItem(key, JSON.stringify(data));
    },

    // ========== 云端读写 ==========
    /**
     * 拉取某个 section 的云端数据
     */
    fetchSection: function (section) {
      var self = this;
      if (!self.API_BASE) return Promise.resolve(null);
      var code = self.getCode();
      if (!code) return Promise.resolve(null);

      return fetch(self.API_BASE + '/progress/' + code + '/' + section)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        })
        .then(function (data) {
          return data.progress || {};
        })
        .catch(function (err) {
          console.warn('[CloudSync] Fetch ' + section + ' failed:', err.message);
          return null;
        });
    },

    /**
     * 推送某个 section 到云端
     */
    pushSection: function (section, data) {
      var self = this;
      if (!self.API_BASE) return Promise.resolve(false);
      var code = self.getCode();
      if (!code) return Promise.resolve(false);

      return fetch(self.API_BASE + '/progress/' + code + '/' + section, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return true;
        })
        .catch(function (err) {
          console.warn('[CloudSync] Push ' + section + ' failed:', err.message);
          return false;
        });
    },

    // ========== 合并策略 ==========
    merge: function (local, remote) {
      var merged = {};
      var k;
      for (k in remote) {
        if (Object.prototype.hasOwnProperty.call(remote, k)) merged[k] = remote[k];
      }
      for (k in local) {
        if (!Object.prototype.hasOwnProperty.call(local, k)) continue;
        if (k.charAt(0) === '_') continue;
        if (!merged[k]) {
          merged[k] = local[k];
        } else {
          // 以 date 较新者为准
          var lDate = new Date((local[k] && local[k].date) || 0);
          var rDate = new Date((merged[k] && merged[k].date) || 0);
          if (lDate > rDate) merged[k] = local[k];
        }
      }
      return merged;
    },

    // ========== 核心 API ==========
    /**
     * 初始化某 section：拉云端 → 合并本地 → 返回
     * @param {string} section - 'fce' / 'toefl' / 'toefl_study'
     */
    initSection: function (section) {
      var self = this;
      var local = self.getLocal(section);

      if (!self.API_BASE || !self.getCode()) {
        return Promise.resolve(local);
      }

      return self.fetchSection(section).then(function (remote) {
        if (remote === null) return local;

        var merged = self.merge(local, remote);
        self.setLocal(section, merged);

        if (JSON.stringify(merged) !== JSON.stringify(remote)) {
          self.pushSection(section, merged);
        }
        return merged;
      });
    },

    /**
     * 保存某 section 的某一天进度（防抖 3 秒）
     */
    saveDay: function (section, dayKey, dayData) {
      var self = this;
      var progress = self.getLocal(section);
      progress[dayKey] = dayData;
      self.setLocal(section, progress);

      if (!self.API_BASE || !self.getCode()) return;

      _pendingSections[section] = progress;
      clearTimeout(_saveTimers[section]);
      _saveTimers[section] = setTimeout(function () {
        if (_pendingSections[section]) {
          self.pushSection(section, _pendingSections[section]);
          delete _pendingSections[section];
        }
      }, 3000);
    },

    /**
     * 直接保存某 section 的整个数据（用于学习数据）
     */
    saveSection: function (section, data) {
      var self = this;
      self.setLocal(section, data);

      if (!self.API_BASE || !self.getCode()) return;

      _pendingSections[section] = data;
      clearTimeout(_saveTimers[section]);
      _saveTimers[section] = setTimeout(function () {
        if (_pendingSections[section]) {
          self.pushSection(section, _pendingSections[section]);
          delete _pendingSections[section];
        }
      }, 3000);
    },

    // ========== 兼容性方法（保持向后兼容） ==========
    // 旧代码可能在调用 init() 和 saveDay(dayKey, data)
    init: function () {
      console.warn('[CloudSync] init() 已过时，请使用 initSection(section)');
      return Promise.resolve({});
    }
  };

  // 挂载到全局
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CloudSync;
  } else {
    window.CloudSync = CloudSync;
  }
})();