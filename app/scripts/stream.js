/* eslint-disable no-use-before-define */
import Parser from 'jsonparse';
import { defaultsDeep } from 'lodash';

const MAX_ERROR_COUNT = 10;
const DEFAULT_RECONNECT_TIME = 3 * 60 * 1000;
function defer() {
  // update 062115 for typeof
  if (typeof(Promise) != 'undefined' && Promise.defer) {
    //need import of Promise.jsm for example: Cu.import('resource:/gree/modules/Promise.jsm');
    return Promise.defer();
  } else if (typeof(PromiseUtils) != 'undefined'  && PromiseUtils.defer) {
    //need import of PromiseUtils.jsm for example: Cu.import('resource:/gree/modules/PromiseUtils.jsm');
    return PromiseUtils.defer();
  } else {
    /* A method to resolve the associated Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} value : This value is used to resolve the promise
     * If the value is a Promise then the associated promise assumes the state
     * of Promise passed as value.
     */
    this.resolve = null;

    /* A method to reject the assocaited Promise with the value passed.
     * If the promise is already settled it does nothing.
     *
     * @param {anything} reason: The reason for the rejection of the Promise.
     * Generally its an Error object. If however a Promise is passed, then the Promise
     * itself will be the reason for rejection no matter the state of the Promise.
     */
    this.reject = null;

    /* A newly created Pomise object.
     * Initially in pending state.
     */
    this.promise = new Promise(function(resolve, reject) {
      this.resolve = resolve;
      this.reject = reject;
    }.bind(this));
    Object.freeze(this);
  }
}

export class Stream {
  constructor() {
    'ngInject';

    this.$timeout = (fn, t) => setTimeout(fn, t);
    this.$timeout.cancel = id => clearTimeout(id);
    this.$log = console;
    this.$q = Promise;
    this.$q.defer = () => defer();
  }

  get(url, options = {}) {
    const params = options.params;
    if (params) {
      const arr = [];
      angular.forEach(params, (v, k) => {
        arr.push(`${k}=${v}`);
      });
      if (url.indexOf('?') > -1) {
        url += `&${arr.join('&')}`;
      } else {
        url += `?${arr.join('&')}`;
      }
    }

    return this.create({
      url,
      options,
    });
  }

  create({ url, options }) {
    const _this = this;
    const { state } = this;
    const defaultOpts = {
      json: true,
      method: 'GET',
      reconnectTime: DEFAULT_RECONNECT_TIME,
    };
    const opts = defaultsDeep(options, defaultOpts);
    const { method, json, reconnectTime } = opts;
    const deffered = this.$q.defer();
    let errorCount = 0;
    let parser = new Parser();
    let xhr = new XMLHttpRequest();

    function jsonHandler() {
      if (this.readyState === this.UNSENT) return;
      if (!!this._response) {
        parser.write(this.responseText.slice(this._response.length));
      } else {
        parser.write(this.responseText);
      }
      this._response = this.responseText;
    }

    function textHandler() {
      if (this.status !== 200) return;
      if (this.readyState < XMLHttpRequest.LOADING) return;
      if (!!this._response) {
        deffered.notify(this.responseText.slice(this._response.length));
      } else {
        deffered.notify(this.responseText);
      }
      this._response = this.responseText;
    }

    function getXHR() {
      return xhr;
    }

    function bindXHR() {
      xhr.onreadystatechange = json ? jsonHandler : textHandler;

      xhr.addEventListener('error', onXhrError, false);
      xhr.open(method, url, true);

      // xhr.setRequestHeader need xhr opened
      if (state.actions.getAuthToken()) {
        xhr.setRequestHeader('x-dce-access-token', state.actions.getAuthToken());
      }
      xhr.send();
    }

    function retry() {
      _this.$log.warn('reconnecting...');

      stop();
      xhr = new XMLHttpRequest();

      // url 加参数 since，避免取到历史 log
      // 不同的 API 对参数的大小写要求不同，
      // 比如应用日志的 API 要求是 Since，
      // 而 events API 要求是 since
      const time = new Date;
      const now = Math.ceil(time.getTime() / 1000);

      // 匹配并捕捉 URL 中的 since 参数（忽略大小写)
      const regSince = /(since)=\d+/i;
      const matched = url.match(regSince); // null or [<url>, <matched part>]

      if (matched) {
        // 使用捕捉到的 since or Since 替换原参数
        url = url.replace(regSince, `${matched[1]}=${now}`);
      } else {
        // 目前已知只有 /events API 要求小写的 since 参数
        const param = url.indexOf('/events') > -1 ? 'since' : 'Since';

        if (url.indexOf('?') > -1) {
          url += `&${param}=${now}`;
        } else {
          url += `?${param}=${now}`;
        }
      }

      bindXHR();
    }

    function onXhrError() {
      if (xhr.readyState !== XMLHttpRequest.DONE) {
        return;
      }

      if (errorCount++ >= MAX_ERROR_COUNT) {
        stop();
        _this.$log.warn(`The stream error count is max:
                        ${MAX_ERROR_COUNT}.
                        You should check the API`);
        return;
      }

      retry();
    }

    function onParserValue(val) {
      if (parser.stack.length === 0) {
        if (val.toString() !== '[object Object]') return;
        deffered.notify(angular.toJson(val));
      }
    }

    function onParserError() {
      parser = new Parser();

      _this.$log.warn('parser error. reconnecting...');

      parser.onError = onParserError;
      parser.onValue = onParserValue;

      if (xhr.status > 400) {
        if (errorCount++ >= MAX_ERROR_COUNT) {
          stop();
          _this.$log.warn(`The stream error count is max:
                          ${MAX_ERROR_COUNT}.
                          You should check the API`);
          return;
        }
      }

      retry();
    }

    function stop() {
      _this.$timeout.cancel(getXHR.reConnector);
      getXHR().abort();
    }

    const reConnector = () => this.$timeout(() => {
      // 重连机制时间可控
      _this.$log.warn('connection timeout, reconnecting...');
      retry();

      getXHR.reConnector = reConnector();
    }, reconnectTime);
    getXHR.reConnector = reConnector();

    parser.onValue = onParserValue;
    parser.onError = onParserError;

    bindXHR();

    return this.wrapper(deffered.promise, getXHR);
  }

  wrapper(promise, getXHR) {
    return {
      notify: cb => this.wrapper(promise.then(undefined, undefined, cb), getXHR),
      close: () => {
        this.$timeout.cancel(getXHR.reConnector);
        getXHR().abort();
      },
    };
  }
}
