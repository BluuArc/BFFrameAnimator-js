var App = (function () {
  'use strict';

  /*!
   * Vue.js v2.5.18-beta.0
   * (c) 2014-2018 Evan You
   * Released under the MIT License.
   */
  const t=Object.freeze({});function e(t){return null==t}function n(t){return null!=t}function o(t){return !0===t}function r(t){return "string"==typeof t||"number"==typeof t||"symbol"==typeof t||"boolean"==typeof t}function i(t){return null!==t&&"object"==typeof t}const s=Object.prototype.toString;function a(t){return "[object Object]"===s.call(t)}function c(t){const e=parseFloat(String(t));return e>=0&&Math.floor(e)===e&&isFinite(t)}function l(t){return null==t?"":"object"==typeof t?JSON.stringify(t,null,2):String(t)}function u(t){const e=parseFloat(t);return isNaN(e)?t:e}function f(t,e){const n=Object.create(null),o=t.split(",");for(let t=0;t<o.length;t++)n[o[t]]=!0;return e?t=>n[t.toLowerCase()]:t=>n[t]}const p=f("slot,component",!0),d=f("key,ref,slot,slot-scope,is");function h(t,e){if(t.length){const n=t.indexOf(e);if(n>-1)return t.splice(n,1)}}const m=Object.prototype.hasOwnProperty;function y(t,e){return m.call(t,e)}function g(t){const e=Object.create(null);return function(n){return e[n]||(e[n]=t(n))}}const v=/-(\w)/g,$=g(t=>t.replace(v,(t,e)=>e?e.toUpperCase():"")),_=g(t=>t.charAt(0).toUpperCase()+t.slice(1)),b=/\B([A-Z])/g,w=g(t=>t.replace(b,"-$1").toLowerCase());const C=Function.prototype.bind?function(t,e){return t.bind(e)}:function(t,e){function n(n){const o=arguments.length;return o?o>1?t.apply(e,arguments):t.call(e,n):t.call(e)}return n._length=t.length,n};function x(t,e){e=e||0;let n=t.length-e;const o=new Array(n);for(;n--;)o[n]=t[n+e];return o}function k(t,e){for(const n in e)t[n]=e[n];return t}function A(t){const e={};for(let n=0;n<t.length;n++)t[n]&&k(e,t[n]);return e}function O(t,e,n){}const S=(t,e,n)=>!1,T=t=>t;function N(t,e){if(t===e)return !0;const n=i(t),o=i(e);if(!n||!o)return !n&&!o&&String(t)===String(e);try{const n=Array.isArray(t),o=Array.isArray(e);if(n&&o)return t.length===e.length&&t.every((t,n)=>N(t,e[n]));if(t instanceof Date&&e instanceof Date)return t.getTime()===e.getTime();if(n||o)return !1;{const n=Object.keys(t),o=Object.keys(e);return n.length===o.length&&n.every(n=>N(t[n],e[n]))}}catch(t){return !1}}function E(t,e){for(let n=0;n<t.length;n++)if(N(t[n],e))return n;return -1}function j(t){let e=!1;return function(){e||(e=!0,t.apply(this,arguments));}}const L="data-server-rendered",I=["component","directive","filter"],M=["beforeCreate","created","beforeMount","mounted","beforeUpdate","updated","beforeDestroy","destroyed","activated","deactivated","errorCaptured"];var D={optionMergeStrategies:Object.create(null),silent:!1,productionTip:!1,devtools:!1,performance:!1,errorHandler:null,warnHandler:null,ignoredElements:[],keyCodes:Object.create(null),isReservedTag:S,isReservedAttr:S,isUnknownElement:S,getTagNamespace:O,parsePlatformTagName:T,mustUseProp:S,async:!0,_lifecycleHooks:M};function P(t){const e=(t+"").charCodeAt(0);return 36===e||95===e}function F(t,e,n,o){Object.defineProperty(t,e,{value:n,enumerable:!!o,writable:!0,configurable:!0});}const R=/[^\w.$]/;const H="__proto__"in{},B="undefined"!=typeof window,U="undefined"!=typeof WXEnvironment&&!!WXEnvironment.platform,V=U&&WXEnvironment.platform.toLowerCase(),z=B&&window.navigator.userAgent.toLowerCase(),K=z&&/msie|trident/.test(z),J=z&&z.indexOf("msie 9.0")>0,q=z&&z.indexOf("edge/")>0,W=(z&&z.indexOf("android"),z&&/iphone|ipad|ipod|ios/.test(z)||"ios"===V),G=(z&&/chrome\/\d+/.test(z),{}.watch);let Z,X=!1;if(B)try{const t={};Object.defineProperty(t,"passive",{get(){X=!0;}}),window.addEventListener("test-passive",null,t);}catch(t){}const Y=()=>(void 0===Z&&(Z=!B&&!U&&"undefined"!=typeof global&&(global.process&&"server"===global.process.env.VUE_ENV)),Z),Q=B&&window.__VUE_DEVTOOLS_GLOBAL_HOOK__;function tt(t){return "function"==typeof t&&/native code/.test(t.toString())}const et="undefined"!=typeof Symbol&&tt(Symbol)&&"undefined"!=typeof Reflect&&tt(Reflect.ownKeys);let nt;nt="undefined"!=typeof Set&&tt(Set)?Set:class{constructor(){this.set=Object.create(null);}has(t){return !0===this.set[t]}add(t){this.set[t]=!0;}clear(){this.set=Object.create(null);}};let ot=O,rt=0;class it{constructor(){this.id=rt++,this.subs=[];}addSub(t){this.subs.push(t);}removeSub(t){h(this.subs,t);}depend(){it.target&&it.target.addDep(this);}notify(){const t=this.subs.slice();for(let e=0,n=t.length;e<n;e++)t[e].update();}}it.target=null;const st=[];function at(t){st.push(t),it.target=t;}function ct(){st.pop(),it.target=st[st.length-1];}class lt{constructor(t,e,n,o,r,i,s,a){this.tag=t,this.data=e,this.children=n,this.text=o,this.elm=r,this.ns=void 0,this.context=i,this.fnContext=void 0,this.fnOptions=void 0,this.fnScopeId=void 0,this.key=e&&e.key,this.componentOptions=s,this.componentInstance=void 0,this.parent=void 0,this.raw=!1,this.isStatic=!1,this.isRootInsert=!0,this.isComment=!1,this.isCloned=!1,this.isOnce=!1,this.asyncFactory=a,this.asyncMeta=void 0,this.isAsyncPlaceholder=!1;}get child(){return this.componentInstance}}const ut=(t="")=>{const e=new lt;return e.text=t,e.isComment=!0,e};function ft(t){return new lt(void 0,void 0,void 0,String(t))}function pt(t){const e=new lt(t.tag,t.data,t.children&&t.children.slice(),t.text,t.elm,t.context,t.componentOptions,t.asyncFactory);return e.ns=t.ns,e.isStatic=t.isStatic,e.key=t.key,e.isComment=t.isComment,e.fnContext=t.fnContext,e.fnOptions=t.fnOptions,e.fnScopeId=t.fnScopeId,e.asyncMeta=t.asyncMeta,e.isCloned=!0,e}const dt=Array.prototype,ht=Object.create(dt);["push","pop","shift","unshift","splice","sort","reverse"].forEach(function(t){const e=dt[t];F(ht,t,function(...n){const o=e.apply(this,n),r=this.__ob__;let i;switch(t){case"push":case"unshift":i=n;break;case"splice":i=n.slice(2);}return i&&r.observeArray(i),r.dep.notify(),o});});const mt=Object.getOwnPropertyNames(ht);let yt=!0;function gt(t){yt=t;}class vt{constructor(t){var e;this.value=t,this.dep=new it,this.vmCount=0,F(t,"__ob__",this),Array.isArray(t)?(H?(e=ht,t.__proto__=e):function(t,e,n){for(let o=0,r=n.length;o<r;o++){const r=n[o];F(t,r,e[r]);}}(t,ht,mt),this.observeArray(t)):this.walk(t);}walk(t){const e=Object.keys(t);for(let n=0;n<e.length;n++)_t(t,e[n]);}observeArray(t){for(let e=0,n=t.length;e<n;e++)$t(t[e]);}}function $t(t,e){if(!i(t)||t instanceof lt)return;let n;return y(t,"__ob__")&&t.__ob__ instanceof vt?n=t.__ob__:yt&&!Y()&&(Array.isArray(t)||a(t))&&Object.isExtensible(t)&&!t._isVue&&(n=new vt(t)),e&&n&&n.vmCount++,n}function _t(t,e,n,o,r){const i=new it,s=Object.getOwnPropertyDescriptor(t,e);if(s&&!1===s.configurable)return;const a=s&&s.get,c=s&&s.set;a&&!c||2!==arguments.length||(n=t[e]);let l=!r&&$t(n);Object.defineProperty(t,e,{enumerable:!0,configurable:!0,get:function(){const e=a?a.call(t):n;return it.target&&(i.depend(),l&&(l.dep.depend(),Array.isArray(e)&&function t(e){for(let n,o=0,r=e.length;o<r;o++)(n=e[o])&&n.__ob__&&n.__ob__.dep.depend(),Array.isArray(n)&&t(n);}(e))),e},set:function(e){const o=a?a.call(t):n;e===o||e!=e&&o!=o||a&&!c||(c?c.call(t,e):n=e,l=!r&&$t(e),i.notify());}});}function bt(t,e,n){if(Array.isArray(t)&&c(e))return t.length=Math.max(t.length,e),t.splice(e,1,n),n;if(e in t&&!(e in Object.prototype))return t[e]=n,n;const o=t.__ob__;return t._isVue||o&&o.vmCount?n:o?(_t(o.value,e,n),o.dep.notify(),n):(t[e]=n,n)}function wt(t,e){if(Array.isArray(t)&&c(e))return void t.splice(e,1);const n=t.__ob__;t._isVue||n&&n.vmCount||y(t,e)&&(delete t[e],n&&n.dep.notify());}const Ct=D.optionMergeStrategies;function xt(t,e){if(!e)return t;let n,o,r;const i=Object.keys(e);for(let s=0;s<i.length;s++)o=t[n=i[s]],r=e[n],y(t,n)?o!==r&&a(o)&&a(r)&&xt(o,r):bt(t,n,r);return t}function kt(t,e,n){return n?function(){const o="function"==typeof e?e.call(n,n):e,r="function"==typeof t?t.call(n,n):t;return o?xt(o,r):r}:e?t?function(){return xt("function"==typeof e?e.call(this,this):e,"function"==typeof t?t.call(this,this):t)}:e:t}function At(t,e){return e?t?t.concat(e):Array.isArray(e)?e:[e]:t}function Ot(t,e,n,o){const r=Object.create(t||null);return e?k(r,e):r}Ct.data=function(t,e,n){return n?kt(t,e,n):e&&"function"!=typeof e?t:kt(t,e)},M.forEach(t=>{Ct[t]=At;}),I.forEach(function(t){Ct[t+"s"]=Ot;}),Ct.watch=function(t,e,n,o){if(t===G&&(t=void 0),e===G&&(e=void 0),!e)return Object.create(t||null);if(!t)return e;const r={};k(r,t);for(const t in e){let n=r[t];const o=e[t];n&&!Array.isArray(n)&&(n=[n]),r[t]=n?n.concat(o):Array.isArray(o)?o:[o];}return r},Ct.props=Ct.methods=Ct.inject=Ct.computed=function(t,e,n,o){if(!t)return e;const r=Object.create(null);return k(r,t),e&&k(r,e),r},Ct.provide=kt;const St=function(t,e){return void 0===e?t:e};function Tt(t,e,n){if("function"==typeof e&&(e=e.options),function(t,e){const n=t.props;if(!n)return;const o={};let r,i,s;if(Array.isArray(n))for(r=n.length;r--;)"string"==typeof(i=n[r])&&(o[s=$(i)]={type:null});else if(a(n))for(const t in n)i=n[t],o[s=$(t)]=a(i)?i:{type:i};t.props=o;}(e),function(t,e){const n=t.inject;if(!n)return;const o=t.inject={};if(Array.isArray(n))for(let t=0;t<n.length;t++)o[n[t]]={from:n[t]};else if(a(n))for(const t in n){const e=n[t];o[t]=a(e)?k({from:t},e):{from:e};}}(e),function(t){const e=t.directives;if(e)for(const t in e){const n=e[t];"function"==typeof n&&(e[t]={bind:n,update:n});}}(e),!e._base&&(e.extends&&(t=Tt(t,e.extends,n)),e.mixins))for(let o=0,r=e.mixins.length;o<r;o++)t=Tt(t,e.mixins[o],n);const o={};let r;for(r in t)i(r);for(r in e)y(t,r)||i(r);function i(r){const i=Ct[r]||St;o[r]=i(t[r],e[r],n,r);}return o}function Nt(t,e,n,o){if("string"!=typeof n)return;const r=t[e];if(y(r,n))return r[n];const i=$(n);if(y(r,i))return r[i];const s=_(i);return y(r,s)?r[s]:r[n]||r[i]||r[s]}function Et(t,e,n,o){const r=e[t],i=!y(n,t);let s=n[t];const a=It(Boolean,r.type);if(a>-1)if(i&&!y(r,"default"))s=!1;else if(""===s||s===w(t)){const t=It(String,r.type);(t<0||a<t)&&(s=!0);}if(void 0===s){s=function(t,e,n){if(!y(e,"default"))return;const o=e.default;if(t&&t.$options.propsData&&void 0===t.$options.propsData[n]&&void 0!==t._props[n])return t._props[n];return "function"==typeof o&&"Function"!==jt(e.type)?o.call(t):o}(o,r,t);const e=yt;gt(!0),$t(s),gt(e);}return s}function jt(t){const e=t&&t.toString().match(/^\s*function (\w+)/);return e?e[1]:""}function Lt(t,e){return jt(t)===jt(e)}function It(t,e){if(!Array.isArray(e))return Lt(e,t)?0:-1;for(let n=0,o=e.length;n<o;n++)if(Lt(e[n],t))return n;return -1}function Mt(t,e,n){if(e){let o=e;for(;o=o.$parent;){const r=o.$options.errorCaptured;if(r)for(let i=0;i<r.length;i++)try{if(!1===r[i].call(o,t,e,n))return}catch(t){Dt(t,o,"errorCaptured hook");}}}Dt(t,e,n);}function Dt(t,e,n){if(D.errorHandler)try{return D.errorHandler.call(null,t,e,n)}catch(t){Pt(t,null,"config.errorHandler");}Pt(t,e,n);}function Pt(t,e,n){if(!B&&!U||"undefined"==typeof console)throw t;console.error(t);}const Ft=[];let Rt,Ht,Bt=!1;function Ut(){Bt=!1;const t=Ft.slice(0);Ft.length=0;for(let e=0;e<t.length;e++)t[e]();}let Vt=!1;if("undefined"!=typeof setImmediate&&tt(setImmediate))Ht=(()=>{setImmediate(Ut);});else if("undefined"==typeof MessageChannel||!tt(MessageChannel)&&"[object MessageChannelConstructor]"!==MessageChannel.toString())Ht=(()=>{setTimeout(Ut,0);});else{const t=new MessageChannel,e=t.port2;t.port1.onmessage=Ut,Ht=(()=>{e.postMessage(1);});}if("undefined"!=typeof Promise&&tt(Promise)){const t=Promise.resolve();Rt=(()=>{t.then(Ut),W&&setTimeout(O);});}else Rt=Ht;function zt(t,e){let n;if(Ft.push(()=>{if(t)try{t.call(e);}catch(t){Mt(t,e,"nextTick");}else n&&n(e);}),Bt||(Bt=!0,Vt?Ht():Rt()),!t&&"undefined"!=typeof Promise)return new Promise(t=>{n=t;})}const Kt=new nt;function Jt(t){!function t(e,n){let o,r;const s=Array.isArray(e);if(!s&&!i(e)||Object.isFrozen(e)||e instanceof lt)return;if(e.__ob__){const t=e.__ob__.dep.id;if(n.has(t))return;n.add(t);}if(s)for(o=e.length;o--;)t(e[o],n);else for(r=Object.keys(e),o=r.length;o--;)t(e[r[o]],n);}(t,Kt),Kt.clear();}const qt=g(t=>{const e="&"===t.charAt(0),n="~"===(t=e?t.slice(1):t).charAt(0),o="!"===(t=n?t.slice(1):t).charAt(0);return {name:t=o?t.slice(1):t,once:n,capture:o,passive:e}});function Wt(t){function e(){const t=e.fns;if(!Array.isArray(t))return t.apply(null,arguments);{const e=t.slice();for(let t=0;t<e.length;t++)e[t].apply(null,arguments);}}return e.fns=t,e}function Gt(t,n,r,i,s,a){let c,l,u,f,p;for(c in t)l=u=t[c],f=n[c],p=qt(c),e(u)||(e(f)?(e(u.fns)&&(u=t[c]=Wt(u)),o(p.once)&&(u=t[c]=s(p.name,u,p.capture)),r(p.name,u,p.capture,p.passive,p.params)):u!==f&&(f.fns=u,t[c]=f));for(c in n)e(t[c])&&i((p=qt(c)).name,n[c],p.capture);}function Zt(t,r,i){let s;t instanceof lt&&(t=t.data.hook||(t.data.hook={}));const a=t[r];function c(){i.apply(this,arguments),h(s.fns,c);}e(a)?s=Wt([c]):n(a.fns)&&o(a.merged)?(s=a).fns.push(c):s=Wt([a,c]),s.merged=!0,t[r]=s;}function Xt(t,e,o,r,i){if(n(e)){if(y(e,o))return t[o]=e[o],i||delete e[o],!0;if(y(e,r))return t[o]=e[r],i||delete e[r],!0}return !1}function Yt(t){return r(t)?[ft(t)]:Array.isArray(t)?function t(i,s){const a=[];let c,l,u,f;for(c=0;c<i.length;c++)e(l=i[c])||"boolean"==typeof l||(u=a.length-1,f=a[u],Array.isArray(l)?l.length>0&&(Qt((l=t(l,`${s||""}_${c}`))[0])&&Qt(f)&&(a[u]=ft(f.text+l[0].text),l.shift()),a.push.apply(a,l)):r(l)?Qt(f)?a[u]=ft(f.text+l):""!==l&&a.push(ft(l)):Qt(l)&&Qt(f)?a[u]=ft(f.text+l.text):(o(i._isVList)&&n(l.tag)&&e(l.key)&&n(s)&&(l.key=`__vlist${s}_${c}__`),a.push(l)));return a}(t):void 0}function Qt(t){return n(t)&&n(t.text)&&!1===t.isComment}function te(t,e){return (t.__esModule||et&&"Module"===t[Symbol.toStringTag])&&(t=t.default),i(t)?e.extend(t):t}function ee(t){return t.isComment&&t.asyncFactory}function ne(t){if(Array.isArray(t))for(let e=0;e<t.length;e++){const o=t[e];if(n(o)&&(n(o.componentOptions)||ee(o)))return o}}let oe;function re(t,e){oe.$on(t,e);}function ie(t,e){oe.$off(t,e);}function se(t,e){const n=oe;return function o(){null!==e.apply(null,arguments)&&n.$off(t,o);}}function ae(t,e,n){oe=t,Gt(e,n||{},re,ie,se),oe=void 0;}function ce(t,e){const n={};if(!t)return n;for(let o=0,r=t.length;o<r;o++){const r=t[o],i=r.data;if(i&&i.attrs&&i.attrs.slot&&delete i.attrs.slot,r.context!==e&&r.fnContext!==e||!i||null==i.slot)(n.default||(n.default=[])).push(r);else{const t=i.slot,e=n[t]||(n[t]=[]);"template"===r.tag?e.push.apply(e,r.children||[]):e.push(r);}}for(const t in n)n[t].every(le)&&delete n[t];return n}function le(t){return t.isComment&&!t.asyncFactory||" "===t.text}function ue(t,e){e=e||{};for(let n=0;n<t.length;n++)Array.isArray(t[n])?ue(t[n],e):e[t[n].key]=t[n].fn;return e}let fe=null;function pe(t){for(;t&&(t=t.$parent);)if(t._inactive)return !0;return !1}function de(t,e){if(e){if(t._directInactive=!1,pe(t))return}else if(t._directInactive)return;if(t._inactive||null===t._inactive){t._inactive=!1;for(let e=0;e<t.$children.length;e++)de(t.$children[e]);he(t,"activated");}}function he(t,e){at();const n=t.$options[e];if(n)for(let o=0,r=n.length;o<r;o++)try{n[o].call(t);}catch(n){Mt(n,t,`${e} hook`);}t._hasHookEvent&&t.$emit("hook:"+e),ct();}const me=[],ye=[];let ge={},ve=!1,$e=!1,_e=0;function be(){let t,e;for($e=!0,me.sort((t,e)=>t.id-e.id),_e=0;_e<me.length;_e++)(t=me[_e]).before&&t.before(),e=t.id,ge[e]=null,t.run();const n=ye.slice(),o=me.slice();_e=me.length=ye.length=0,ge={},ve=$e=!1,function(t){for(let e=0;e<t.length;e++)t[e]._inactive=!0,de(t[e],!0);}(n),function(t){let e=t.length;for(;e--;){const n=t[e],o=n.vm;o._watcher===n&&o._isMounted&&!o._isDestroyed&&he(o,"updated");}}(o),Q&&D.devtools&&Q.emit("flush");}let we=0;class Ce{constructor(t,e,n,o,r){this.vm=t,r&&(t._watcher=this),t._watchers.push(this),o?(this.deep=!!o.deep,this.user=!!o.user,this.lazy=!!o.lazy,this.sync=!!o.sync,this.before=o.before):this.deep=this.user=this.lazy=this.sync=!1,this.cb=n,this.id=++we,this.active=!0,this.dirty=this.lazy,this.deps=[],this.newDeps=[],this.depIds=new nt,this.newDepIds=new nt,this.expression="","function"==typeof e?this.getter=e:(this.getter=function(t){if(R.test(t))return;const e=t.split(".");return function(t){for(let n=0;n<e.length;n++){if(!t)return;t=t[e[n]];}return t}}(e),this.getter||(this.getter=O)),this.value=this.lazy?void 0:this.get();}get(){let t;at(this);const e=this.vm;try{t=this.getter.call(e,e);}catch(t){if(!this.user)throw t;Mt(t,e,`getter for watcher "${this.expression}"`);}finally{this.deep&&Jt(t),ct(),this.cleanupDeps();}return t}addDep(t){const e=t.id;this.newDepIds.has(e)||(this.newDepIds.add(e),this.newDeps.push(t),this.depIds.has(e)||t.addSub(this));}cleanupDeps(){let t=this.deps.length;for(;t--;){const e=this.deps[t];this.newDepIds.has(e.id)||e.removeSub(this);}let e=this.depIds;this.depIds=this.newDepIds,this.newDepIds=e,this.newDepIds.clear(),e=this.deps,this.deps=this.newDeps,this.newDeps=e,this.newDeps.length=0;}update(){this.lazy?this.dirty=!0:this.sync?this.run():function(t){const e=t.id;if(null==ge[e]){if(ge[e]=!0,$e){let e=me.length-1;for(;e>_e&&me[e].id>t.id;)e--;me.splice(e+1,0,t);}else me.push(t);ve||(ve=!0,zt(be));}}(this);}run(){if(this.active){const t=this.get();if(t!==this.value||i(t)||this.deep){const e=this.value;if(this.value=t,this.user)try{this.cb.call(this.vm,t,e);}catch(t){Mt(t,this.vm,`callback for watcher "${this.expression}"`);}else this.cb.call(this.vm,t,e);}}}evaluate(){this.value=this.get(),this.dirty=!1;}depend(){let t=this.deps.length;for(;t--;)this.deps[t].depend();}teardown(){if(this.active){this.vm._isBeingDestroyed||h(this.vm._watchers,this);let t=this.deps.length;for(;t--;)this.deps[t].removeSub(this);this.active=!1;}}}const xe={enumerable:!0,configurable:!0,get:O,set:O};function ke(t,e,n){xe.get=function(){return this[e][n]},xe.set=function(t){this[e][n]=t;},Object.defineProperty(t,n,xe);}function Ae(t){t._watchers=[];const e=t.$options;e.props&&function(t,e){const n=t.$options.propsData||{},o=t._props={},r=t.$options._propKeys=[];t.$parent&&gt(!1);for(const i in e){r.push(i);const s=Et(i,e,n,t);_t(o,i,s),i in t||ke(t,"_props",i);}gt(!0);}(t,e.props),e.methods&&function(t,e){t.$options.props;for(const n in e)t[n]="function"!=typeof e[n]?O:C(e[n],t);}(t,e.methods),e.data?function(t){let e=t.$options.data;a(e=t._data="function"==typeof e?function(t,e){at();try{return t.call(e,e)}catch(t){return Mt(t,e,"data()"),{}}finally{ct();}}(e,t):e||{})||(e={});const n=Object.keys(e),o=t.$options.props;t.$options.methods;let r=n.length;for(;r--;){const e=n[r];o&&y(o,e)||P(e)||ke(t,"_data",e);}$t(e,!0);}(t):$t(t._data={},!0),e.computed&&function(t,e){const n=t._computedWatchers=Object.create(null),o=Y();for(const r in e){const i=e[r],s="function"==typeof i?i:i.get;o||(n[r]=new Ce(t,s||O,O,Oe)),r in t||Se(t,r,i);}}(t,e.computed),e.watch&&e.watch!==G&&function(t,e){for(const n in e){const o=e[n];if(Array.isArray(o))for(let e=0;e<o.length;e++)Ee(t,n,o[e]);else Ee(t,n,o);}}(t,e.watch);}const Oe={lazy:!0};function Se(t,e,n){const o=!Y();"function"==typeof n?(xe.get=o?Te(e):Ne(n),xe.set=O):(xe.get=n.get?o&&!1!==n.cache?Te(e):Ne(n.get):O,xe.set=n.set||O),Object.defineProperty(t,e,xe);}function Te(t){return function(){const e=this._computedWatchers&&this._computedWatchers[t];if(e)return e.dirty&&e.evaluate(),it.target&&e.depend(),e.value}}function Ne(t){return function(){return t.call(this,this)}}function Ee(t,e,n,o){return a(n)&&(o=n,n=n.handler),"string"==typeof n&&(n=t[n]),t.$watch(e,n,o)}function je(t,e){if(t){const n=Object.create(null),o=et?Reflect.ownKeys(t).filter(e=>Object.getOwnPropertyDescriptor(t,e).enumerable):Object.keys(t);for(let r=0;r<o.length;r++){const i=o[r],s=t[i].from;let a=e;for(;a;){if(a._provided&&y(a._provided,s)){n[i]=a._provided[s];break}a=a.$parent;}if(!a&&"default"in t[i]){const o=t[i].default;n[i]="function"==typeof o?o.call(e):o;}}return n}}function Le(t,e){let o,r,s,a,c;if(Array.isArray(t)||"string"==typeof t)for(o=new Array(t.length),r=0,s=t.length;r<s;r++)o[r]=e(t[r],r);else if("number"==typeof t)for(o=new Array(t),r=0;r<t;r++)o[r]=e(r+1,r);else if(i(t))for(a=Object.keys(t),o=new Array(a.length),r=0,s=a.length;r<s;r++)c=a[r],o[r]=e(t[c],c,r);return n(o)&&(o._isVList=!0),o}function Ie(t,e,n,o){const r=this.$scopedSlots[t];let i;r?(n=n||{},o&&(n=k(k({},o),n)),i=r(n)||e):i=this.$slots[t]||e;const s=n&&n.slot;return s?this.$createElement("template",{slot:s},i):i}function Me(t){return Nt(this.$options,"filters",t)||T}function De(t,e){return Array.isArray(t)?-1===t.indexOf(e):t!==e}function Pe(t,e,n,o,r){const i=D.keyCodes[e]||n;return r&&o&&!D.keyCodes[e]?De(r,o):i?De(i,t):o?w(o)!==e:void 0}function Fe(t,e,n,o,r){if(n)if(i(n)){let i;Array.isArray(n)&&(n=A(n));for(const s in n){if("class"===s||"style"===s||d(s))i=t;else{const n=t.attrs&&t.attrs.type;i=o||D.mustUseProp(e,n,s)?t.domProps||(t.domProps={}):t.attrs||(t.attrs={});}const a=$(s);if(!(s in i||a in i)&&(i[s]=n[s],r)){(t.on||(t.on={}))[`update:${a}`]=function(t){n[s]=t;};}}}return t}function Re(t,e){const n=this._staticTrees||(this._staticTrees=[]);let o=n[t];return o&&!e?o:(Be(o=n[t]=this.$options.staticRenderFns[t].call(this._renderProxy,null,this),`__static__${t}`,!1),o)}function He(t,e,n){return Be(t,`__once__${e}${n?`_${n}`:""}`,!0),t}function Be(t,e,n){if(Array.isArray(t))for(let o=0;o<t.length;o++)t[o]&&"string"!=typeof t[o]&&Ue(t[o],`${e}_${o}`,n);else Ue(t,e,n);}function Ue(t,e,n){t.isStatic=!0,t.key=e,t.isOnce=n;}function Ve(t,e){if(e)if(a(e)){const n=t.on=t.on?k({},t.on):{};for(const t in e){const o=n[t],r=e[t];n[t]=o?[].concat(o,r):r;}}return t}function ze(t){t._o=He,t._n=u,t._s=l,t._l=Le,t._t=Ie,t._q=N,t._i=E,t._m=Re,t._f=Me,t._k=Pe,t._b=Fe,t._v=ft,t._e=ut,t._u=ue,t._g=Ve;}function Ke(e,n,r,i,s){const a=s.options;let c;y(i,"_uid")?(c=Object.create(i))._original=i:(c=i,i=i._original);const l=o(a._compiled),u=!l;this.data=e,this.props=n,this.children=r,this.parent=i,this.listeners=e.on||t,this.injections=je(a.inject,i),this.slots=(()=>ce(r,i)),l&&(this.$options=a,this.$slots=this.slots(),this.$scopedSlots=e.scopedSlots||t),a._scopeId?this._c=((t,e,n,o)=>{const r=tn(c,t,e,n,o,u);return r&&!Array.isArray(r)&&(r.fnScopeId=a._scopeId,r.fnContext=i),r}):this._c=((t,e,n,o)=>tn(c,t,e,n,o,u));}function Je(t,e,n,o,r){const i=pt(t);return i.fnContext=n,i.fnOptions=o,e.slot&&((i.data||(i.data={})).slot=e.slot),i}function qe(t,e){for(const n in e)t[$(n)]=e[n];}ze(Ke.prototype);const We={init(t,e){if(t.componentInstance&&!t.componentInstance._isDestroyed&&t.data.keepAlive){const e=t;We.prepatch(e,e);}else{(t.componentInstance=function(t,e){const o={_isComponent:!0,_parentVnode:t,parent:e},r=t.data.inlineTemplate;n(r)&&(o.render=r.render,o.staticRenderFns=r.staticRenderFns);return new t.componentOptions.Ctor(o)}(t,fe)).$mount(e?t.elm:void 0,e);}},prepatch(e,n){const o=n.componentOptions;!function(e,n,o,r,i){const s=!!(i||e.$options._renderChildren||r.data.scopedSlots||e.$scopedSlots!==t);if(e.$options._parentVnode=r,e.$vnode=r,e._vnode&&(e._vnode.parent=r),e.$options._renderChildren=i,e.$attrs=r.data.attrs||t,e.$listeners=o||t,n&&e.$options.props){gt(!1);const t=e._props,o=e.$options._propKeys||[];for(let r=0;r<o.length;r++){const i=o[r],s=e.$options.props;t[i]=Et(i,s,n,e);}gt(!0),e.$options.propsData=n;}o=o||t;const a=e.$options._parentListeners;e.$options._parentListeners=o,ae(e,o,a),s&&(e.$slots=ce(i,r.context),e.$forceUpdate());}(n.componentInstance=e.componentInstance,o.propsData,o.listeners,n,o.children);},insert(t){const{context:e,componentInstance:n}=t;var o;n._isMounted||(n._isMounted=!0,he(n,"mounted")),t.data.keepAlive&&(e._isMounted?((o=n)._inactive=!1,ye.push(o)):de(n,!0));},destroy(t){const{componentInstance:e}=t;e._isDestroyed||(t.data.keepAlive?function t(e,n){if(!(n&&(e._directInactive=!0,pe(e))||e._inactive)){e._inactive=!0;for(let n=0;n<e.$children.length;n++)t(e.$children[n]);he(e,"deactivated");}}(e,!0):e.$destroy());}},Ge=Object.keys(We);function Ze(r,s,a,c,l){if(e(r))return;const u=a.$options._base;if(i(r)&&(r=u.extend(r)),"function"!=typeof r)return;let f;if(e(r.cid)&&void 0===(r=function(t,r,s){if(o(t.error)&&n(t.errorComp))return t.errorComp;if(n(t.resolved))return t.resolved;if(o(t.loading)&&n(t.loadingComp))return t.loadingComp;if(!n(t.contexts)){const o=t.contexts=[s];let a=!0;const c=t=>{for(let t=0,e=o.length;t<e;t++)o[t].$forceUpdate();t&&(o.length=0);},l=j(e=>{t.resolved=te(e,r),a||c(!0);}),u=j(e=>{n(t.errorComp)&&(t.error=!0,c(!0));}),f=t(l,u);return i(f)&&("function"==typeof f.then?e(t.resolved)&&f.then(l,u):n(f.component)&&"function"==typeof f.component.then&&(f.component.then(l,u),n(f.error)&&(t.errorComp=te(f.error,r)),n(f.loading)&&(t.loadingComp=te(f.loading,r),0===f.delay?t.loading=!0:setTimeout(()=>{e(t.resolved)&&e(t.error)&&(t.loading=!0,c(!1));},f.delay||200)),n(f.timeout)&&setTimeout(()=>{e(t.resolved)&&u(null);},f.timeout))),a=!1,t.loading?t.loadingComp:t.resolved}t.contexts.push(s);}(f=r,u,a)))return function(t,e,n,o,r){const i=ut();return i.asyncFactory=t,i.asyncMeta={data:e,context:n,children:o,tag:r},i}(f,s,a,c,l);s=s||{},nn(r),n(s.model)&&function(t,e){const o=t.model&&t.model.prop||"value",r=t.model&&t.model.event||"input";(e.props||(e.props={}))[o]=e.model.value;const i=e.on||(e.on={}),s=i[r],a=e.model.callback;n(s)?(Array.isArray(s)?-1===s.indexOf(a):s!==a)&&(i[r]=[a].concat(s)):i[r]=a;}(r.options,s);const p=function(t,o,r){const i=o.options.props;if(e(i))return;const s={},{attrs:a,props:c}=t;if(n(a)||n(c))for(const t in i){const e=w(t);Xt(s,c,t,e,!0)||Xt(s,a,t,e,!1);}return s}(s,r);if(o(r.options.functional))return function(e,o,r,i,s){const a=e.options,c={},l=a.props;if(n(l))for(const e in l)c[e]=Et(e,l,o||t);else n(r.attrs)&&qe(c,r.attrs),n(r.props)&&qe(c,r.props);const u=new Ke(r,c,s,i,e),f=a.render.call(null,u._c,u);if(f instanceof lt)return Je(f,r,u.parent,a);if(Array.isArray(f)){const t=Yt(f)||[],e=new Array(t.length);for(let n=0;n<t.length;n++)e[n]=Je(t[n],r,u.parent,a);return e}}(r,p,s,a,c);const d=s.on;if(s.on=s.nativeOn,o(r.options.abstract)){const t=s.slot;s={},t&&(s.slot=t);}!function(t){const e=t.hook||(t.hook={});for(let t=0;t<Ge.length;t++){const n=Ge[t],o=e[n],r=We[n];o===r||o&&o._merged||(e[n]=o?Xe(r,o):r);}}(s);const h=r.options.name||l;return new lt(`vue-component-${r.cid}${h?`-${h}`:""}`,s,void 0,void 0,void 0,a,{Ctor:r,propsData:p,listeners:d,tag:l,children:c},f)}function Xe(t,e){const n=(n,o)=>{t(n,o),e(n,o);};return n._merged=!0,n}const Ye=1,Qe=2;function tn(t,s,a,c,l,u){return (Array.isArray(a)||r(a))&&(l=c,c=a,a=void 0),o(u)&&(l=Qe),function(t,r,s,a,c){if(n(s)&&n(s.__ob__))return ut();n(s)&&n(s.is)&&(r=s.is);if(!r)return ut();Array.isArray(a)&&"function"==typeof a[0]&&((s=s||{}).scopedSlots={default:a[0]},a.length=0);c===Qe?a=Yt(a):c===Ye&&(a=function(t){for(let e=0;e<t.length;e++)if(Array.isArray(t[e]))return Array.prototype.concat.apply([],t);return t}(a));let l,u;if("string"==typeof r){let e;u=t.$vnode&&t.$vnode.ns||D.getTagNamespace(r),l=D.isReservedTag(r)?new lt(D.parsePlatformTagName(r),s,a,void 0,void 0,t):s&&s.pre||!n(e=Nt(t.$options,"components",r))?new lt(r,s,a,void 0,void 0,t):Ze(e,s,t,a,r);}else l=Ze(r,s,t,a);return Array.isArray(l)?l:n(l)?(n(u)&&function t(r,i,s){r.ns=i;"foreignObject"===r.tag&&(i=void 0,s=!0);if(n(r.children))for(let a=0,c=r.children.length;a<c;a++){const c=r.children[a];n(c.tag)&&(e(c.ns)||o(s)&&"svg"!==c.tag)&&t(c,i,s);}}(l,u),n(s)&&function(t){i(t.style)&&Jt(t.style);i(t.class)&&Jt(t.class);}(s),l):ut()}(t,s,a,c,l)}let en=0;function nn(t){let e=t.options;if(t.super){const n=nn(t.super);if(n!==t.superOptions){t.superOptions=n;const o=function(t){let e;const n=t.options,o=t.extendOptions,r=t.sealedOptions;for(const t in n)n[t]!==r[t]&&(e||(e={}),e[t]=on(n[t],o[t],r[t]));return e}(t);o&&k(t.extendOptions,o),(e=t.options=Tt(n,t.extendOptions)).name&&(e.components[e.name]=t);}}return e}function on(t,e,n){if(Array.isArray(t)){const o=[];n=Array.isArray(n)?n:[n],e=Array.isArray(e)?e:[e];for(let r=0;r<t.length;r++)(e.indexOf(t[r])>=0||n.indexOf(t[r])<0)&&o.push(t[r]);return o}return t}function rn(t){this._init(t);}function sn(t){t.cid=0;let e=1;t.extend=function(t){t=t||{};const n=this,o=n.cid,r=t._Ctor||(t._Ctor={});if(r[o])return r[o];const i=t.name||n.options.name,s=function(t){this._init(t);};return (s.prototype=Object.create(n.prototype)).constructor=s,s.cid=e++,s.options=Tt(n.options,t),s.super=n,s.options.props&&function(t){const e=t.options.props;for(const n in e)ke(t.prototype,"_props",n);}(s),s.options.computed&&function(t){const e=t.options.computed;for(const n in e)Se(t.prototype,n,e[n]);}(s),s.extend=n.extend,s.mixin=n.mixin,s.use=n.use,I.forEach(function(t){s[t]=n[t];}),i&&(s.options.components[i]=s),s.superOptions=n.options,s.extendOptions=t,s.sealedOptions=k({},s.options),r[o]=s,s};}function an(t){return t&&(t.Ctor.options.name||t.tag)}function cn(t,e){return Array.isArray(t)?t.indexOf(e)>-1:"string"==typeof t?t.split(",").indexOf(e)>-1:(n=t,"[object RegExp]"===s.call(n)&&t.test(e));var n;}function ln(t,e){const{cache:n,keys:o,_vnode:r}=t;for(const t in n){const i=n[t];if(i){const s=an(i.componentOptions);s&&!e(s)&&un(n,t,o,r);}}}function un(t,e,n,o){const r=t[e];!r||o&&r.tag===o.tag||r.componentInstance.$destroy(),t[e]=null,h(n,e);}!function(e){e.prototype._init=function(e){const n=this;n._uid=en++,n._isVue=!0,e&&e._isComponent?function(t,e){const n=t.$options=Object.create(t.constructor.options),o=e._parentVnode;n.parent=e.parent,n._parentVnode=o;const r=o.componentOptions;n.propsData=r.propsData,n._parentListeners=r.listeners,n._renderChildren=r.children,n._componentTag=r.tag,e.render&&(n.render=e.render,n.staticRenderFns=e.staticRenderFns);}(n,e):n.$options=Tt(nn(n.constructor),e||{},n),n._renderProxy=n,n._self=n,function(t){const e=t.$options;let n=e.parent;if(n&&!e.abstract){for(;n.$options.abstract&&n.$parent;)n=n.$parent;n.$children.push(t);}t.$parent=n,t.$root=n?n.$root:t,t.$children=[],t.$refs={},t._watcher=null,t._inactive=null,t._directInactive=!1,t._isMounted=!1,t._isDestroyed=!1,t._isBeingDestroyed=!1;}(n),function(t){t._events=Object.create(null),t._hasHookEvent=!1;const e=t.$options._parentListeners;e&&ae(t,e);}(n),function(e){e._vnode=null,e._staticTrees=null;const n=e.$options,o=e.$vnode=n._parentVnode,r=o&&o.context;e.$slots=ce(n._renderChildren,r),e.$scopedSlots=t,e._c=((t,n,o,r)=>tn(e,t,n,o,r,!1)),e.$createElement=((t,n,o,r)=>tn(e,t,n,o,r,!0));const i=o&&o.data;_t(e,"$attrs",i&&i.attrs||t,null,!0),_t(e,"$listeners",n._parentListeners||t,null,!0);}(n),he(n,"beforeCreate"),function(t){const e=je(t.$options.inject,t);e&&(gt(!1),Object.keys(e).forEach(n=>{_t(t,n,e[n]);}),gt(!0));}(n),Ae(n),function(t){const e=t.$options.provide;e&&(t._provided="function"==typeof e?e.call(t):e);}(n),he(n,"created"),n.$options.el&&n.$mount(n.$options.el);};}(rn),function(t){const e={get:function(){return this._data}},n={get:function(){return this._props}};Object.defineProperty(t.prototype,"$data",e),Object.defineProperty(t.prototype,"$props",n),t.prototype.$set=bt,t.prototype.$delete=wt,t.prototype.$watch=function(t,e,n){const o=this;if(a(e))return Ee(o,t,e,n);(n=n||{}).user=!0;const r=new Ce(o,t,e,n);if(n.immediate)try{e.call(o,r.value);}catch(t){Mt(t,o,`callback for immediate watcher "${r.expression}"`);}return function(){r.teardown();}};}(rn),function(t){const e=/^hook:/;t.prototype.$on=function(t,n){const o=this;if(Array.isArray(t))for(let e=0,r=t.length;e<r;e++)o.$on(t[e],n);else(o._events[t]||(o._events[t]=[])).push(n),e.test(t)&&(o._hasHookEvent=!0);return o},t.prototype.$once=function(t,e){const n=this;function o(){n.$off(t,o),e.apply(n,arguments);}return o.fn=e,n.$on(t,o),n},t.prototype.$off=function(t,e){const n=this;if(!arguments.length)return n._events=Object.create(null),n;if(Array.isArray(t)){for(let o=0,r=t.length;o<r;o++)n.$off(t[o],e);return n}const o=n._events[t];if(!o)return n;if(!e)return n._events[t]=null,n;if(e){let t,n=o.length;for(;n--;)if((t=o[n])===e||t.fn===e){o.splice(n,1);break}}return n},t.prototype.$emit=function(t){const e=this;let n=e._events[t];if(n){n=n.length>1?x(n):n;const o=x(arguments,1);for(let r=0,i=n.length;r<i;r++)try{n[r].apply(e,o);}catch(n){Mt(n,e,`event handler for "${t}"`);}}return e};}(rn),function(t){t.prototype._update=function(t,e){const n=this,o=n.$el,r=n._vnode,i=fe;fe=n,n._vnode=t,n.$el=r?n.__patch__(r,t):n.__patch__(n.$el,t,e,!1),fe=i,o&&(o.__vue__=null),n.$el&&(n.$el.__vue__=n),n.$vnode&&n.$parent&&n.$vnode===n.$parent._vnode&&(n.$parent.$el=n.$el);},t.prototype.$forceUpdate=function(){const t=this;t._watcher&&t._watcher.update();},t.prototype.$destroy=function(){const t=this;if(t._isBeingDestroyed)return;he(t,"beforeDestroy"),t._isBeingDestroyed=!0;const e=t.$parent;!e||e._isBeingDestroyed||t.$options.abstract||h(e.$children,t),t._watcher&&t._watcher.teardown();let n=t._watchers.length;for(;n--;)t._watchers[n].teardown();t._data.__ob__&&t._data.__ob__.vmCount--,t._isDestroyed=!0,t.__patch__(t._vnode,null),he(t,"destroyed"),t.$off(),t.$el&&(t.$el.__vue__=null),t.$vnode&&(t.$vnode.parent=null);};}(rn),function(e){ze(e.prototype),e.prototype.$nextTick=function(t){return zt(t,this)},e.prototype._render=function(){const e=this,{render:n,_parentVnode:o}=e.$options;let r;o&&(e.$scopedSlots=o.data.scopedSlots||t),e.$vnode=o;try{r=n.call(e._renderProxy,e.$createElement);}catch(t){Mt(t,e,"render"),r=e._vnode;}return r instanceof lt||(r=ut()),r.parent=o,r};}(rn);const fn=[String,RegExp,Array];var pn={KeepAlive:{name:"keep-alive",abstract:!0,props:{include:fn,exclude:fn,max:[String,Number]},created(){this.cache=Object.create(null),this.keys=[];},destroyed(){for(const t in this.cache)un(this.cache,t,this.keys);},mounted(){this.$watch("include",t=>{ln(this,e=>cn(t,e));}),this.$watch("exclude",t=>{ln(this,e=>!cn(t,e));});},render(){const t=this.$slots.default,e=ne(t),n=e&&e.componentOptions;if(n){const t=an(n),{include:o,exclude:r}=this;if(o&&(!t||!cn(o,t))||r&&t&&cn(r,t))return e;const{cache:i,keys:s}=this,a=null==e.key?n.Ctor.cid+(n.tag?`::${n.tag}`:""):e.key;i[a]?(e.componentInstance=i[a].componentInstance,h(s,a),s.push(a)):(i[a]=e,s.push(a),this.max&&s.length>parseInt(this.max)&&un(i,s[0],s,this._vnode)),e.data.keepAlive=!0;}return e||t&&t[0]}}};!function(t){const e={get:()=>D};Object.defineProperty(t,"config",e),t.util={warn:ot,extend:k,mergeOptions:Tt,defineReactive:_t},t.set=bt,t.delete=wt,t.nextTick=zt,t.options=Object.create(null),I.forEach(e=>{t.options[e+"s"]=Object.create(null);}),t.options._base=t,k(t.options.components,pn),function(t){t.use=function(t){const e=this._installedPlugins||(this._installedPlugins=[]);if(e.indexOf(t)>-1)return this;const n=x(arguments,1);return n.unshift(this),"function"==typeof t.install?t.install.apply(t,n):"function"==typeof t&&t.apply(null,n),e.push(t),this};}(t),function(t){t.mixin=function(t){return this.options=Tt(this.options,t),this};}(t),sn(t),function(t){I.forEach(e=>{t[e]=function(t,n){return n?("component"===e&&a(n)&&(n.name=n.name||t,n=this.options._base.extend(n)),"directive"===e&&"function"==typeof n&&(n={bind:n,update:n}),this.options[e+"s"][t]=n,n):this.options[e+"s"][t]};});}(t);}(rn),Object.defineProperty(rn.prototype,"$isServer",{get:Y}),Object.defineProperty(rn.prototype,"$ssrContext",{get(){return this.$vnode&&this.$vnode.ssrContext}}),Object.defineProperty(rn,"FunctionalRenderContext",{value:Ke}),rn.version="2.5.18-beta.0";const dn=f("style,class"),hn=f("input,textarea,option,select,progress"),mn=(t,e,n)=>"value"===n&&hn(t)&&"button"!==e||"selected"===n&&"option"===t||"checked"===n&&"input"===t||"muted"===n&&"video"===t,yn=f("contenteditable,draggable,spellcheck"),gn=f("allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,translate,truespeed,typemustmatch,visible"),vn="http://www.w3.org/1999/xlink",$n=t=>":"===t.charAt(5)&&"xlink"===t.slice(0,5),_n=t=>$n(t)?t.slice(6,t.length):"",bn=t=>null==t||!1===t;function wn(t){let e=t.data,o=t,r=t;for(;n(r.componentInstance);)(r=r.componentInstance._vnode)&&r.data&&(e=Cn(r.data,e));for(;n(o=o.parent);)o&&o.data&&(e=Cn(e,o.data));return function(t,e){if(n(t)||n(e))return xn(t,kn(e));return ""}(e.staticClass,e.class)}function Cn(t,e){return {staticClass:xn(t.staticClass,e.staticClass),class:n(t.class)?[t.class,e.class]:e.class}}function xn(t,e){return t?e?t+" "+e:t:e||""}function kn(t){return Array.isArray(t)?function(t){let e,o="";for(let r=0,i=t.length;r<i;r++)n(e=kn(t[r]))&&""!==e&&(o&&(o+=" "),o+=e);return o}(t):i(t)?function(t){let e="";for(const n in t)t[n]&&(e&&(e+=" "),e+=n);return e}(t):"string"==typeof t?t:""}const An={svg:"http://www.w3.org/2000/svg",math:"http://www.w3.org/1998/Math/MathML"},On=f("html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,menuitem,summary,content,element,shadow,template,blockquote,iframe,tfoot"),Sn=f("svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view",!0),Tn=t=>On(t)||Sn(t);function Nn(t){return Sn(t)?"svg":"math"===t?"math":void 0}const En=Object.create(null);const jn=f("text,number,password,search,email,tel,url");function Ln(t){if("string"==typeof t){const e=document.querySelector(t);return e||document.createElement("div")}return t}var In=Object.freeze({createElement:function(t,e){const n=document.createElement(t);return "select"!==t?n:(e.data&&e.data.attrs&&void 0!==e.data.attrs.multiple&&n.setAttribute("multiple","multiple"),n)},createElementNS:function(t,e){return document.createElementNS(An[t],e)},createTextNode:function(t){return document.createTextNode(t)},createComment:function(t){return document.createComment(t)},insertBefore:function(t,e,n){t.insertBefore(e,n);},removeChild:function(t,e){t.removeChild(e);},appendChild:function(t,e){t.appendChild(e);},parentNode:function(t){return t.parentNode},nextSibling:function(t){return t.nextSibling},tagName:function(t){return t.tagName},setTextContent:function(t,e){t.textContent=e;},setStyleScope:function(t,e){t.setAttribute(e,"");}}),Mn={create(t,e){Dn(e);},update(t,e){t.data.ref!==e.data.ref&&(Dn(t,!0),Dn(e));},destroy(t){Dn(t,!0);}};function Dn(t,e){const o=t.data.ref;if(!n(o))return;const r=t.context,i=t.componentInstance||t.elm,s=r.$refs;e?Array.isArray(s[o])?h(s[o],i):s[o]===i&&(s[o]=void 0):t.data.refInFor?Array.isArray(s[o])?s[o].indexOf(i)<0&&s[o].push(i):s[o]=[i]:s[o]=i;}const Pn=new lt("",{},[]),Fn=["create","activate","update","remove","destroy"];function Rn(t){return t&&t.data&&t.data.domProps&&(t.data.domProps.innerHTML||t.data.domProps.textContent)}function Hn(t,r){return t.key===r.key&&(t.tag===r.tag&&t.isComment===r.isComment&&n(t.data)===n(r.data)&&!Rn(t)&&!Rn(r)&&function(t,e){if("input"!==t.tag)return !0;let o;const r=n(o=t.data)&&n(o=o.attrs)&&o.type,i=n(o=e.data)&&n(o=o.attrs)&&o.type;return r===i||jn(r)&&jn(i)}(t,r)||o(t.isAsyncPlaceholder)&&t.asyncFactory===r.asyncFactory&&e(r.asyncFactory.error))}function Bn(t,e,o){let r,i;const s={};for(r=e;r<=o;++r)n(i=t[r].key)&&(s[i]=r);return s}var Un={create:Vn,update:Vn,destroy:function(t){Vn(t,Pn);}};function Vn(t,e){(t.data.directives||e.data.directives)&&function(t,e){const n=t===Pn,o=e===Pn,r=Kn(t.data.directives,t.context),i=Kn(e.data.directives,e.context),s=[],a=[];let c,l,u;for(c in i)l=r[c],u=i[c],l?(u.oldValue=l.value,qn(u,"update",e,t),u.def&&u.def.componentUpdated&&a.push(u)):(qn(u,"bind",e,t),u.def&&u.def.inserted&&s.push(u));if(s.length){const o=()=>{for(let n=0;n<s.length;n++)qn(s[n],"inserted",e,t);};n?Zt(e,"insert",o):o();}a.length&&Zt(e,"postpatch",()=>{for(let n=0;n<a.length;n++)qn(a[n],"componentUpdated",e,t);});if(!n)for(c in r)i[c]||qn(r[c],"unbind",t,t,o);}(t,e);}const zn=Object.create(null);function Kn(t,e){const n=Object.create(null);if(!t)return n;let o,r;for(o=0;o<t.length;o++)(r=t[o]).modifiers||(r.modifiers=zn),n[Jn(r)]=r,r.def=Nt(e.$options,"directives",r.name);return n}function Jn(t){return t.rawName||`${t.name}.${Object.keys(t.modifiers||{}).join(".")}`}function qn(t,e,n,o,r){const i=t.def&&t.def[e];if(i)try{i(n.elm,t,n,o,r);}catch(o){Mt(o,n.context,`directive ${t.name} ${e} hook`);}}var Wn=[Mn,Un];function Gn(t,o){const r=o.componentOptions;if(n(r)&&!1===r.Ctor.options.inheritAttrs)return;if(e(t.data.attrs)&&e(o.data.attrs))return;let i,s,a;const c=o.elm,l=t.data.attrs||{};let u=o.data.attrs||{};for(i in n(u.__ob__)&&(u=o.data.attrs=k({},u)),u)s=u[i],(a=l[i])!==s&&Zn(c,i,s);for(i in(K||q)&&u.value!==l.value&&Zn(c,"value",u.value),l)e(u[i])&&($n(i)?c.removeAttributeNS(vn,_n(i)):yn(i)||c.removeAttribute(i));}function Zn(t,e,n){t.tagName.indexOf("-")>-1?Xn(t,e,n):gn(e)?bn(n)?t.removeAttribute(e):(n="allowfullscreen"===e&&"EMBED"===t.tagName?"true":e,t.setAttribute(e,n)):yn(e)?t.setAttribute(e,bn(n)||"false"===n?"false":"true"):$n(e)?bn(n)?t.removeAttributeNS(vn,_n(e)):t.setAttributeNS(vn,e,n):Xn(t,e,n);}function Xn(t,e,n){if(bn(n))t.removeAttribute(e);else{if(K&&!J&&("TEXTAREA"===t.tagName||"INPUT"===t.tagName)&&"placeholder"===e&&!t.__ieph){const e=n=>{n.stopImmediatePropagation(),t.removeEventListener("input",e);};t.addEventListener("input",e),t.__ieph=!0;}t.setAttribute(e,n);}}var Yn={create:Gn,update:Gn};function Qn(t,o){const r=o.elm,i=o.data,s=t.data;if(e(i.staticClass)&&e(i.class)&&(e(s)||e(s.staticClass)&&e(s.class)))return;let a=wn(o);const c=r._transitionClasses;n(c)&&(a=xn(a,kn(c))),a!==r._prevClass&&(r.setAttribute("class",a),r._prevClass=a);}var to={create:Qn,update:Qn};const eo=/[\w).+\-_$\]]/;function no(t){let e,n,o,r,i,s=!1,a=!1,c=!1,l=!1,u=0,f=0,p=0,d=0;for(o=0;o<t.length;o++)if(n=e,e=t.charCodeAt(o),s)39===e&&92!==n&&(s=!1);else if(a)34===e&&92!==n&&(a=!1);else if(c)96===e&&92!==n&&(c=!1);else if(l)47===e&&92!==n&&(l=!1);else if(124!==e||124===t.charCodeAt(o+1)||124===t.charCodeAt(o-1)||u||f||p){switch(e){case 34:a=!0;break;case 39:s=!0;break;case 96:c=!0;break;case 40:p++;break;case 41:p--;break;case 91:f++;break;case 93:f--;break;case 123:u++;break;case 125:u--;}if(47===e){let e,n=o-1;for(;n>=0&&" "===(e=t.charAt(n));n--);e&&eo.test(e)||(l=!0);}}else void 0===r?(d=o+1,r=t.slice(0,o).trim()):h();function h(){(i||(i=[])).push(t.slice(d,o).trim()),d=o+1;}if(void 0===r?r=t.slice(0,o).trim():0!==d&&h(),i)for(o=0;o<i.length;o++)r=oo(r,i[o]);return r}function oo(t,e){const n=e.indexOf("(");if(n<0)return `_f("${e}")(${t})`;{const o=e.slice(0,n),r=e.slice(n+1);return `_f("${o}")(${t}${")"!==r?","+r:r}`}}function ro(t){console.error(`[Vue compiler]: ${t}`);}function io(t,e){return t?t.map(t=>t[e]).filter(t=>t):[]}function so(t,e,n){(t.props||(t.props=[])).push({name:e,value:n}),t.plain=!1;}function ao(t,e,n){(t.attrs||(t.attrs=[])).push({name:e,value:n}),t.plain=!1;}function co(t,e,n){t.attrsMap[e]=n,t.attrsList.push({name:e,value:n});}function lo(t,e,n,o,r,i){(t.directives||(t.directives=[])).push({name:e,rawName:n,value:o,arg:r,modifiers:i}),t.plain=!1;}function uo(e,n,o,r,i,s){let a;r=r||t,"click"===n&&(r.right?(n="contextmenu",delete r.right):r.middle&&(n="mouseup")),r.capture&&(delete r.capture,n="!"+n),r.once&&(delete r.once,n="~"+n),r.passive&&(delete r.passive,n="&"+n),r.native?(delete r.native,a=e.nativeEvents||(e.nativeEvents={})):a=e.events||(e.events={});const c={value:o.trim()};r!==t&&(c.modifiers=r);const l=a[n];Array.isArray(l)?i?l.unshift(c):l.push(c):a[n]=l?i?[c,l]:[l,c]:c,e.plain=!1;}function fo(t,e,n){const o=po(t,":"+e)||po(t,"v-bind:"+e);if(null!=o)return no(o);if(!1!==n){const n=po(t,e);if(null!=n)return JSON.stringify(n)}}function po(t,e,n){let o;if(null!=(o=t.attrsMap[e])){const n=t.attrsList;for(let t=0,o=n.length;t<o;t++)if(n[t].name===e){n.splice(t,1);break}}return n&&delete t.attrsMap[e],o}function ho(t,e,n){const{number:o,trim:r}=n||{};let i="$$v";r&&(i="(typeof $$v === 'string'? $$v.trim(): $$v)"),o&&(i=`_n(${i})`);const s=mo(e,i);t.model={value:`(${e})`,expression:`"${e}"`,callback:`function ($$v) {${s}}`};}function mo(t,e){const n=function(t){if(t=t.trim(),yo=t.length,t.indexOf("[")<0||t.lastIndexOf("]")<yo-1)return ($o=t.lastIndexOf("."))>-1?{exp:t.slice(0,$o),key:'"'+t.slice($o+1)+'"'}:{exp:t,key:null};go=t,$o=_o=bo=0;for(;!Co();)xo(vo=wo())?Ao(vo):91===vo&&ko(vo);return {exp:t.slice(0,_o),key:t.slice(_o+1,bo)}}(t);return null===n.key?`${t}=${e}`:`$set(${n.exp}, ${n.key}, ${e})`}let yo,go,vo,$o,_o,bo;function wo(){return go.charCodeAt(++$o)}function Co(){return $o>=yo}function xo(t){return 34===t||39===t}function ko(t){let e=1;for(_o=$o;!Co();)if(xo(t=wo()))Ao(t);else if(91===t&&e++,93===t&&e--,0===e){bo=$o;break}}function Ao(t){const e=t;for(;!Co()&&(t=wo())!==e;);}const Oo="__r",So="__c";let To;function No(t,e,n){const o=To;return function r(){null!==e.apply(null,arguments)&&jo(t,r,n,o);}}function Eo(t,e,n,o){var r;e=(r=e)._withTask||(r._withTask=function(){Vt=!0;try{return r.apply(null,arguments)}finally{Vt=!1;}}),To.addEventListener(t,e,X?{capture:n,passive:o}:n);}function jo(t,e,n,o){(o||To).removeEventListener(t,e._withTask||e,n);}function Lo(t,o){if(e(t.data.on)&&e(o.data.on))return;const r=o.data.on||{},i=t.data.on||{};To=o.elm,function(t){if(n(t[Oo])){const e=K?"change":"input";t[e]=[].concat(t[Oo],t[e]||[]),delete t[Oo];}n(t[So])&&(t.change=[].concat(t[So],t.change||[]),delete t[So]);}(r),Gt(r,i,Eo,jo,No,o.context),To=void 0;}var Io={create:Lo,update:Lo};function Mo(t,o){if(e(t.data.domProps)&&e(o.data.domProps))return;let r,i;const s=o.elm,a=t.data.domProps||{};let c=o.data.domProps||{};for(r in n(c.__ob__)&&(c=o.data.domProps=k({},c)),a)e(c[r])&&(s[r]="");for(r in c){if(i=c[r],"textContent"===r||"innerHTML"===r){if(o.children&&(o.children.length=0),i===a[r])continue;1===s.childNodes.length&&s.removeChild(s.childNodes[0]);}if("value"===r){s._value=i;const t=e(i)?"":String(i);Do(s,t)&&(s.value=t);}else s[r]=i;}}function Do(t,e){return !t.composing&&("OPTION"===t.tagName||function(t,e){let n=!0;try{n=document.activeElement!==t;}catch(t){}return n&&t.value!==e}(t,e)||function(t,e){const o=t.value,r=t._vModifiers;if(n(r)){if(r.lazy)return !1;if(r.number)return u(o)!==u(e);if(r.trim)return o.trim()!==e.trim()}return o!==e}(t,e))}var Po={create:Mo,update:Mo};const Fo=g(function(t){const e={},n=/:(.+)/;return t.split(/;(?![^(]*\))/g).forEach(function(t){if(t){const o=t.split(n);o.length>1&&(e[o[0].trim()]=o[1].trim());}}),e});function Ro(t){const e=Ho(t.style);return t.staticStyle?k(t.staticStyle,e):e}function Ho(t){return Array.isArray(t)?A(t):"string"==typeof t?Fo(t):t}const Bo=/^--/,Uo=/\s*!important$/,Vo=(t,e,n)=>{if(Bo.test(e))t.style.setProperty(e,n);else if(Uo.test(n))t.style.setProperty(e,n.replace(Uo,""),"important");else{const o=Jo(e);if(Array.isArray(n))for(let e=0,r=n.length;e<r;e++)t.style[o]=n[e];else t.style[o]=n;}},zo=["Webkit","Moz","ms"];let Ko;const Jo=g(function(t){if(Ko=Ko||document.createElement("div").style,"filter"!==(t=$(t))&&t in Ko)return t;const e=t.charAt(0).toUpperCase()+t.slice(1);for(let t=0;t<zo.length;t++){const n=zo[t]+e;if(n in Ko)return n}});function qo(t,o){const r=o.data,i=t.data;if(e(r.staticStyle)&&e(r.style)&&e(i.staticStyle)&&e(i.style))return;let s,a;const c=o.elm,l=i.staticStyle,u=i.normalizedStyle||i.style||{},f=l||u,p=Ho(o.data.style)||{};o.data.normalizedStyle=n(p.__ob__)?k({},p):p;const d=function(t,e){const n={};let o;if(e){let e=t;for(;e.componentInstance;)(e=e.componentInstance._vnode)&&e.data&&(o=Ro(e.data))&&k(n,o);}(o=Ro(t.data))&&k(n,o);let r=t;for(;r=r.parent;)r.data&&(o=Ro(r.data))&&k(n,o);return n}(o,!0);for(a in f)e(d[a])&&Vo(c,a,"");for(a in d)(s=d[a])!==f[a]&&Vo(c,a,null==s?"":s);}var Wo={create:qo,update:qo};const Go=/\s+/;function Zo(t,e){if(e&&(e=e.trim()))if(t.classList)e.indexOf(" ")>-1?e.split(Go).forEach(e=>t.classList.add(e)):t.classList.add(e);else{const n=` ${t.getAttribute("class")||""} `;n.indexOf(" "+e+" ")<0&&t.setAttribute("class",(n+e).trim());}}function Xo(t,e){if(e&&(e=e.trim()))if(t.classList)e.indexOf(" ")>-1?e.split(Go).forEach(e=>t.classList.remove(e)):t.classList.remove(e),t.classList.length||t.removeAttribute("class");else{let n=` ${t.getAttribute("class")||""} `;const o=" "+e+" ";for(;n.indexOf(o)>=0;)n=n.replace(o," ");(n=n.trim())?t.setAttribute("class",n):t.removeAttribute("class");}}function Yo(t){if(t){if("object"==typeof t){const e={};return !1!==t.css&&k(e,Qo(t.name||"v")),k(e,t),e}return "string"==typeof t?Qo(t):void 0}}const Qo=g(t=>({enterClass:`${t}-enter`,enterToClass:`${t}-enter-to`,enterActiveClass:`${t}-enter-active`,leaveClass:`${t}-leave`,leaveToClass:`${t}-leave-to`,leaveActiveClass:`${t}-leave-active`})),tr=B&&!J,er="transition",nr="animation";let or="transition",rr="transitionend",ir="animation",sr="animationend";tr&&(void 0===window.ontransitionend&&void 0!==window.onwebkittransitionend&&(or="WebkitTransition",rr="webkitTransitionEnd"),void 0===window.onanimationend&&void 0!==window.onwebkitanimationend&&(ir="WebkitAnimation",sr="webkitAnimationEnd"));const ar=B?window.requestAnimationFrame?window.requestAnimationFrame.bind(window):setTimeout:t=>t();function cr(t){ar(()=>{ar(t);});}function lr(t,e){const n=t._transitionClasses||(t._transitionClasses=[]);n.indexOf(e)<0&&(n.push(e),Zo(t,e));}function ur(t,e){t._transitionClasses&&h(t._transitionClasses,e),Xo(t,e);}function fr(t,e,n){const{type:o,timeout:r,propCount:i}=dr(t,e);if(!o)return n();const s=o===er?rr:sr;let a=0;const c=()=>{t.removeEventListener(s,l),n();},l=e=>{e.target===t&&++a>=i&&c();};setTimeout(()=>{a<i&&c();},r+1),t.addEventListener(s,l);}const pr=/\b(transform|all)(,|$)/;function dr(t,e){const n=window.getComputedStyle(t),o=(n[or+"Delay"]||"").split(", "),r=(n[or+"Duration"]||"").split(", "),i=hr(o,r),s=(n[ir+"Delay"]||"").split(", "),a=(n[ir+"Duration"]||"").split(", "),c=hr(s,a);let l,u=0,f=0;return e===er?i>0&&(l=er,u=i,f=r.length):e===nr?c>0&&(l=nr,u=c,f=a.length):f=(l=(u=Math.max(i,c))>0?i>c?er:nr:null)?l===er?r.length:a.length:0,{type:l,timeout:u,propCount:f,hasTransform:l===er&&pr.test(n[or+"Property"])}}function hr(t,e){for(;t.length<e.length;)t=t.concat(t);return Math.max.apply(null,e.map((e,n)=>mr(e)+mr(t[n])))}function mr(t){return 1e3*Number(t.slice(0,-1).replace(",","."))}function yr(t,o){const r=t.elm;n(r._leaveCb)&&(r._leaveCb.cancelled=!0,r._leaveCb());const s=Yo(t.data.transition);if(e(s))return;if(n(r._enterCb)||1!==r.nodeType)return;const{css:a,type:c,enterClass:l,enterToClass:f,enterActiveClass:p,appearClass:d,appearToClass:h,appearActiveClass:m,beforeEnter:y,enter:g,afterEnter:v,enterCancelled:$,beforeAppear:_,appear:b,afterAppear:w,appearCancelled:C,duration:x}=s;let k=fe,A=fe.$vnode;for(;A&&A.parent;)k=(A=A.parent).context;const O=!k._isMounted||!t.isRootInsert;if(O&&!b&&""!==b)return;const S=O&&d?d:l,T=O&&m?m:p,N=O&&h?h:f,E=O&&_||y,L=O&&"function"==typeof b?b:g,I=O&&w||v,M=O&&C||$,D=u(i(x)?x.enter:x),P=!1!==a&&!J,F=$r(L),R=r._enterCb=j(()=>{P&&(ur(r,N),ur(r,T)),R.cancelled?(P&&ur(r,S),M&&M(r)):I&&I(r),r._enterCb=null;});t.data.show||Zt(t,"insert",()=>{const e=r.parentNode,n=e&&e._pending&&e._pending[t.key];n&&n.tag===t.tag&&n.elm._leaveCb&&n.elm._leaveCb(),L&&L(r,R);}),E&&E(r),P&&(lr(r,S),lr(r,T),cr(()=>{ur(r,S),R.cancelled||(lr(r,N),F||(vr(D)?setTimeout(R,D):fr(r,c,R)));})),t.data.show&&(o&&o(),L&&L(r,R)),P||F||R();}function gr(t,o){const r=t.elm;n(r._enterCb)&&(r._enterCb.cancelled=!0,r._enterCb());const s=Yo(t.data.transition);if(e(s)||1!==r.nodeType)return o();if(n(r._leaveCb))return;const{css:a,type:c,leaveClass:l,leaveToClass:f,leaveActiveClass:p,beforeLeave:d,leave:h,afterLeave:m,leaveCancelled:y,delayLeave:g,duration:v}=s,$=!1!==a&&!J,_=$r(h),b=u(i(v)?v.leave:v),w=r._leaveCb=j(()=>{r.parentNode&&r.parentNode._pending&&(r.parentNode._pending[t.key]=null),$&&(ur(r,f),ur(r,p)),w.cancelled?($&&ur(r,l),y&&y(r)):(o(),m&&m(r)),r._leaveCb=null;});function C(){w.cancelled||(!t.data.show&&r.parentNode&&((r.parentNode._pending||(r.parentNode._pending={}))[t.key]=t),d&&d(r),$&&(lr(r,l),lr(r,p),cr(()=>{ur(r,l),w.cancelled||(lr(r,f),_||(vr(b)?setTimeout(w,b):fr(r,c,w)));})),h&&h(r,w),$||_||w());}g?g(C):C();}function vr(t){return "number"==typeof t&&!isNaN(t)}function $r(t){if(e(t))return !1;const o=t.fns;return n(o)?$r(Array.isArray(o)?o[0]:o):(t._length||t.length)>1}function _r(t,e){!0!==e.data.show&&yr(e);}const br=function(t){let i,s;const a={},{modules:c,nodeOps:l}=t;for(i=0;i<Fn.length;++i)for(a[Fn[i]]=[],s=0;s<c.length;++s)n(c[s][Fn[i]])&&a[Fn[i]].push(c[s][Fn[i]]);function u(t){const e=l.parentNode(t);n(e)&&l.removeChild(e,t);}function p(t,e,r,i,s,c,u){if(n(t.elm)&&n(c)&&(t=c[u]=pt(t)),t.isRootInsert=!s,function(t,e,r,i){let s=t.data;if(n(s)){const c=n(t.componentInstance)&&s.keepAlive;if(n(s=s.hook)&&n(s=s.init)&&s(t,!1),n(t.componentInstance))return d(t,e),h(r,t.elm,i),o(c)&&function(t,e,o,r){let i,s=t;for(;s.componentInstance;)if(s=s.componentInstance._vnode,n(i=s.data)&&n(i=i.transition)){for(i=0;i<a.activate.length;++i)a.activate[i](Pn,s);e.push(s);break}h(o,t.elm,r);}(t,e,r,i),!0}}(t,e,r,i))return;const f=t.data,p=t.children,y=t.tag;n(y)?(t.elm=t.ns?l.createElementNS(t.ns,y):l.createElement(y,t),v(t),m(t,p,e),n(f)&&g(t,e),h(r,t.elm,i)):o(t.isComment)?(t.elm=l.createComment(t.text),h(r,t.elm,i)):(t.elm=l.createTextNode(t.text),h(r,t.elm,i));}function d(t,e){n(t.data.pendingInsert)&&(e.push.apply(e,t.data.pendingInsert),t.data.pendingInsert=null),t.elm=t.componentInstance.$el,y(t)?(g(t,e),v(t)):(Dn(t),e.push(t));}function h(t,e,o){n(t)&&(n(o)?l.parentNode(o)===t&&l.insertBefore(t,e,o):l.appendChild(t,e));}function m(t,e,n){if(Array.isArray(e))for(let o=0;o<e.length;++o)p(e[o],n,t.elm,null,!0,e,o);else r(t.text)&&l.appendChild(t.elm,l.createTextNode(String(t.text)));}function y(t){for(;t.componentInstance;)t=t.componentInstance._vnode;return n(t.tag)}function g(t,e){for(let e=0;e<a.create.length;++e)a.create[e](Pn,t);n(i=t.data.hook)&&(n(i.create)&&i.create(Pn,t),n(i.insert)&&e.push(t));}function v(t){let e;if(n(e=t.fnScopeId))l.setStyleScope(t.elm,e);else{let o=t;for(;o;)n(e=o.context)&&n(e=e.$options._scopeId)&&l.setStyleScope(t.elm,e),o=o.parent;}n(e=fe)&&e!==t.context&&e!==t.fnContext&&n(e=e.$options._scopeId)&&l.setStyleScope(t.elm,e);}function $(t,e,n,o,r,i){for(;o<=r;++o)p(n[o],i,t,e,!1,n,o);}function _(t){let e,o;const r=t.data;if(n(r))for(n(e=r.hook)&&n(e=e.destroy)&&e(t),e=0;e<a.destroy.length;++e)a.destroy[e](t);if(n(e=t.children))for(o=0;o<t.children.length;++o)_(t.children[o]);}function b(t,e,o,r){for(;o<=r;++o){const t=e[o];n(t)&&(n(t.tag)?(w(t),_(t)):u(t.elm));}}function w(t,e){if(n(e)||n(t.data)){let o;const r=a.remove.length+1;for(n(e)?e.listeners+=r:e=function(t,e){function n(){0==--n.listeners&&u(t);}return n.listeners=e,n}(t.elm,r),n(o=t.componentInstance)&&n(o=o._vnode)&&n(o.data)&&w(o,e),o=0;o<a.remove.length;++o)a.remove[o](t,e);n(o=t.data.hook)&&n(o=o.remove)?o(t,e):e();}else u(t.elm);}function C(t,e,o,r){for(let i=o;i<r;i++){const o=e[i];if(n(o)&&Hn(t,o))return i}}function x(t,r,i,s,c,u){if(t===r)return;n(r.elm)&&n(s)&&(r=s[c]=pt(r));const f=r.elm=t.elm;if(o(t.isAsyncPlaceholder))return void(n(r.asyncFactory.resolved)?O(t.elm,r,i):r.isAsyncPlaceholder=!0);if(o(r.isStatic)&&o(t.isStatic)&&r.key===t.key&&(o(r.isCloned)||o(r.isOnce)))return void(r.componentInstance=t.componentInstance);let d;const h=r.data;n(h)&&n(d=h.hook)&&n(d=d.prepatch)&&d(t,r);const m=t.children,g=r.children;if(n(h)&&y(r)){for(d=0;d<a.update.length;++d)a.update[d](t,r);n(d=h.hook)&&n(d=d.update)&&d(t,r);}e(r.text)?n(m)&&n(g)?m!==g&&function(t,o,r,i,s){let a,c,u,f,d=0,h=0,m=o.length-1,y=o[0],g=o[m],v=r.length-1,_=r[0],w=r[v];const k=!s;for(;d<=m&&h<=v;)e(y)?y=o[++d]:e(g)?g=o[--m]:Hn(y,_)?(x(y,_,i,r,h),y=o[++d],_=r[++h]):Hn(g,w)?(x(g,w,i,r,v),g=o[--m],w=r[--v]):Hn(y,w)?(x(y,w,i,r,v),k&&l.insertBefore(t,y.elm,l.nextSibling(g.elm)),y=o[++d],w=r[--v]):Hn(g,_)?(x(g,_,i,r,h),k&&l.insertBefore(t,g.elm,y.elm),g=o[--m],_=r[++h]):(e(a)&&(a=Bn(o,d,m)),e(c=n(_.key)?a[_.key]:C(_,o,d,m))?p(_,i,t,y.elm,!1,r,h):Hn(u=o[c],_)?(x(u,_,i,r,h),o[c]=void 0,k&&l.insertBefore(t,u.elm,y.elm)):p(_,i,t,y.elm,!1,r,h),_=r[++h]);d>m?$(t,f=e(r[v+1])?null:r[v+1].elm,r,h,v,i):h>v&&b(0,o,d,m);}(f,m,g,i,u):n(g)?(n(t.text)&&l.setTextContent(f,""),$(f,null,g,0,g.length-1,i)):n(m)?b(0,m,0,m.length-1):n(t.text)&&l.setTextContent(f,""):t.text!==r.text&&l.setTextContent(f,r.text),n(h)&&n(d=h.hook)&&n(d=d.postpatch)&&d(t,r);}function k(t,e,r){if(o(r)&&n(t.parent))t.parent.data.pendingInsert=e;else for(let t=0;t<e.length;++t)e[t].data.hook.insert(e[t]);}const A=f("attrs,class,staticClass,staticStyle,key");function O(t,e,r,i){let s;const{tag:a,data:c,children:l}=e;if(i=i||c&&c.pre,e.elm=t,o(e.isComment)&&n(e.asyncFactory))return e.isAsyncPlaceholder=!0,!0;if(n(c)&&(n(s=c.hook)&&n(s=s.init)&&s(e,!0),n(s=e.componentInstance)))return d(e,r),!0;if(n(a)){if(n(l))if(t.hasChildNodes())if(n(s=c)&&n(s=s.domProps)&&n(s=s.innerHTML)){if(s!==t.innerHTML)return !1}else{let e=!0,n=t.firstChild;for(let t=0;t<l.length;t++){if(!n||!O(n,l[t],r,i)){e=!1;break}n=n.nextSibling;}if(!e||n)return !1}else m(e,l,r);if(n(c)){let t=!1;for(const n in c)if(!A(n)){t=!0,g(e,r);break}!t&&c.class&&Jt(c.class);}}else t.data!==e.text&&(t.data=e.text);return !0}return function(t,r,i,s){if(e(r))return void(n(t)&&_(t));let c=!1;const u=[];if(e(t))c=!0,p(r,u);else{const e=n(t.nodeType);if(!e&&Hn(t,r))x(t,r,u,null,null,s);else{if(e){if(1===t.nodeType&&t.hasAttribute(L)&&(t.removeAttribute(L),i=!0),o(i)&&O(t,r,u))return k(r,u,!0),t;f=t,t=new lt(l.tagName(f).toLowerCase(),{},[],void 0,f);}const s=t.elm,c=l.parentNode(s);if(p(r,u,s._leaveCb?null:c,l.nextSibling(s)),n(r.parent)){let t=r.parent;const e=y(r);for(;t;){for(let e=0;e<a.destroy.length;++e)a.destroy[e](t);if(t.elm=r.elm,e){for(let e=0;e<a.create.length;++e)a.create[e](Pn,t);const e=t.data.hook.insert;if(e.merged)for(let t=1;t<e.fns.length;t++)e.fns[t]();}else Dn(t);t=t.parent;}}n(c)?b(0,[t],0,0):n(t.tag)&&_(t);}}var f;return k(r,u,c),r.elm}}({nodeOps:In,modules:[Yn,to,Io,Po,Wo,B?{create:_r,activate:_r,remove(t,e){!0!==t.data.show?gr(t,e):e();}}:{}].concat(Wn)});J&&document.addEventListener("selectionchange",()=>{const t=document.activeElement;t&&t.vmodel&&Tr(t,"input");});const wr={inserted(t,e,n,o){"select"===n.tag?(o.elm&&!o.elm._vOptions?Zt(n,"postpatch",()=>{wr.componentUpdated(t,e,n);}):Cr(t,e,n.context),t._vOptions=[].map.call(t.options,Ar)):("textarea"===n.tag||jn(t.type))&&(t._vModifiers=e.modifiers,e.modifiers.lazy||(t.addEventListener("compositionstart",Or),t.addEventListener("compositionend",Sr),t.addEventListener("change",Sr),J&&(t.vmodel=!0)));},componentUpdated(t,e,n){if("select"===n.tag){Cr(t,e,n.context);const o=t._vOptions,r=t._vOptions=[].map.call(t.options,Ar);if(r.some((t,e)=>!N(t,o[e]))){(t.multiple?e.value.some(t=>kr(t,r)):e.value!==e.oldValue&&kr(e.value,r))&&Tr(t,"change");}}}};function Cr(t,e,n){xr(t,e,n),(K||q)&&setTimeout(()=>{xr(t,e,n);},0);}function xr(t,e,n){const o=e.value,r=t.multiple;if(r&&!Array.isArray(o))return;let i,s;for(let e=0,n=t.options.length;e<n;e++)if(s=t.options[e],r)i=E(o,Ar(s))>-1,s.selected!==i&&(s.selected=i);else if(N(Ar(s),o))return void(t.selectedIndex!==e&&(t.selectedIndex=e));r||(t.selectedIndex=-1);}function kr(t,e){return e.every(e=>!N(e,t))}function Ar(t){return "_value"in t?t._value:t.value}function Or(t){t.target.composing=!0;}function Sr(t){t.target.composing&&(t.target.composing=!1,Tr(t.target,"input"));}function Tr(t,e){const n=document.createEvent("HTMLEvents");n.initEvent(e,!0,!0),t.dispatchEvent(n);}function Nr(t){return !t.componentInstance||t.data&&t.data.transition?t:Nr(t.componentInstance._vnode)}var Er={model:wr,show:{bind(t,{value:e},n){const o=(n=Nr(n)).data&&n.data.transition,r=t.__vOriginalDisplay="none"===t.style.display?"":t.style.display;e&&o?(n.data.show=!0,yr(n,()=>{t.style.display=r;})):t.style.display=e?r:"none";},update(t,{value:e,oldValue:n},o){if(!e==!n)return;(o=Nr(o)).data&&o.data.transition?(o.data.show=!0,e?yr(o,()=>{t.style.display=t.__vOriginalDisplay;}):gr(o,()=>{t.style.display="none";})):t.style.display=e?t.__vOriginalDisplay:"none";},unbind(t,e,n,o,r){r||(t.style.display=t.__vOriginalDisplay);}}};const jr={name:String,appear:Boolean,css:Boolean,mode:String,type:String,enterClass:String,leaveClass:String,enterToClass:String,leaveToClass:String,enterActiveClass:String,leaveActiveClass:String,appearClass:String,appearActiveClass:String,appearToClass:String,duration:[Number,String,Object]};function Lr(t){const e=t&&t.componentOptions;return e&&e.Ctor.options.abstract?Lr(ne(e.children)):t}function Ir(t){const e={},n=t.$options;for(const o in n.propsData)e[o]=t[o];const o=n._parentListeners;for(const t in o)e[$(t)]=o[t];return e}function Mr(t,e){if(/\d-keep-alive$/.test(e.tag))return t("keep-alive",{props:e.componentOptions.propsData})}const Dr=t=>t.tag||ee(t),Pr=t=>"show"===t.name;var Fr={name:"transition",props:jr,abstract:!0,render(t){let e=this.$slots.default;if(!e)return;if(!(e=e.filter(Dr)).length)return;const n=this.mode,o=e[0];if(function(t){for(;t=t.parent;)if(t.data.transition)return !0}(this.$vnode))return o;const i=Lr(o);if(!i)return o;if(this._leaving)return Mr(t,o);const s=`__transition-${this._uid}-`;i.key=null==i.key?i.isComment?s+"comment":s+i.tag:r(i.key)?0===String(i.key).indexOf(s)?i.key:s+i.key:i.key;const a=(i.data||(i.data={})).transition=Ir(this),c=this._vnode,l=Lr(c);if(i.data.directives&&i.data.directives.some(Pr)&&(i.data.show=!0),l&&l.data&&!function(t,e){return e.key===t.key&&e.tag===t.tag}(i,l)&&!ee(l)&&(!l.componentInstance||!l.componentInstance._vnode.isComment)){const e=l.data.transition=k({},a);if("out-in"===n)return this._leaving=!0,Zt(e,"afterLeave",()=>{this._leaving=!1,this.$forceUpdate();}),Mr(t,o);if("in-out"===n){if(ee(i))return c;let t;const n=()=>{t();};Zt(a,"afterEnter",n),Zt(a,"enterCancelled",n),Zt(e,"delayLeave",e=>{t=e;});}}return o}};const Rr=k({tag:String,moveClass:String},jr);function Hr(t){t.elm._moveCb&&t.elm._moveCb(),t.elm._enterCb&&t.elm._enterCb();}function Br(t){t.data.newPos=t.elm.getBoundingClientRect();}function Ur(t){const e=t.data.pos,n=t.data.newPos,o=e.left-n.left,r=e.top-n.top;if(o||r){t.data.moved=!0;const e=t.elm.style;e.transform=e.WebkitTransform=`translate(${o}px,${r}px)`,e.transitionDuration="0s";}}delete Rr.mode;var Vr={Transition:Fr,TransitionGroup:{props:Rr,beforeMount(){const t=this._update;this._update=((e,n)=>{this.__patch__(this._vnode,this.kept,!1,!0),this._vnode=this.kept,t.call(this,e,n);});},render(t){const e=this.tag||this.$vnode.data.tag||"span",n=Object.create(null),o=this.prevChildren=this.children,r=this.$slots.default||[],i=this.children=[],s=Ir(this);for(let t=0;t<r.length;t++){const e=r[t];e.tag&&null!=e.key&&0!==String(e.key).indexOf("__vlist")&&(i.push(e),n[e.key]=e,(e.data||(e.data={})).transition=s);}if(o){const r=[],i=[];for(let t=0;t<o.length;t++){const e=o[t];e.data.transition=s,e.data.pos=e.elm.getBoundingClientRect(),n[e.key]?r.push(e):i.push(e);}this.kept=t(e,null,r),this.removed=i;}return t(e,null,i)},updated(){const t=this.prevChildren,e=this.moveClass||(this.name||"v")+"-move";t.length&&this.hasMove(t[0].elm,e)&&(t.forEach(Hr),t.forEach(Br),t.forEach(Ur),this._reflow=document.body.offsetHeight,t.forEach(t=>{if(t.data.moved){const n=t.elm,o=n.style;lr(n,e),o.transform=o.WebkitTransform=o.transitionDuration="",n.addEventListener(rr,n._moveCb=function t(o){o&&o.target!==n||o&&!/transform$/.test(o.propertyName)||(n.removeEventListener(rr,t),n._moveCb=null,ur(n,e));});}}));},methods:{hasMove(t,e){if(!tr)return !1;if(this._hasMove)return this._hasMove;const n=t.cloneNode();t._transitionClasses&&t._transitionClasses.forEach(t=>{Xo(n,t);}),Zo(n,e),n.style.display="none",this.$el.appendChild(n);const o=dr(n);return this.$el.removeChild(n),this._hasMove=o.hasTransform}}}};rn.config.mustUseProp=mn,rn.config.isReservedTag=Tn,rn.config.isReservedAttr=dn,rn.config.getTagNamespace=Nn,rn.config.isUnknownElement=function(t){if(!B)return !0;if(Tn(t))return !1;if(t=t.toLowerCase(),null!=En[t])return En[t];const e=document.createElement(t);return t.indexOf("-")>-1?En[t]=e.constructor===window.HTMLUnknownElement||e.constructor===window.HTMLElement:En[t]=/HTMLUnknownElement/.test(e.toString())},k(rn.options.directives,Er),k(rn.options.components,Vr),rn.prototype.__patch__=B?br:O,rn.prototype.$mount=function(t,e){return function(t,e,n){let o;return t.$el=e,t.$options.render||(t.$options.render=ut),he(t,"beforeMount"),o=(()=>{t._update(t._render(),n);}),new Ce(t,o,O,{before(){t._isMounted&&he(t,"beforeUpdate");}},!0),n=!1,null==t.$vnode&&(t._isMounted=!0,he(t,"mounted")),t}(this,t=t&&B?Ln(t):void 0,e)},B&&setTimeout(()=>{D.devtools&&Q&&Q.emit("init",rn);},0);const zr=/\{\{((?:.|\r?\n)+?)\}\}/g,Kr=/[-.*+?^${}()|[\]\/\\]/g,Jr=g(t=>{const e=t[0].replace(Kr,"\\$&"),n=t[1].replace(Kr,"\\$&");return new RegExp(e+"((?:.|\\n)+?)"+n,"g")});var qr={staticKeys:["staticClass"],transformNode:function(t,e){e.warn;const n=po(t,"class");n&&(t.staticClass=JSON.stringify(n));const o=fo(t,"class",!1);o&&(t.classBinding=o);},genData:function(t){let e="";return t.staticClass&&(e+=`staticClass:${t.staticClass},`),t.classBinding&&(e+=`class:${t.classBinding},`),e}};var Wr={staticKeys:["staticStyle"],transformNode:function(t,e){e.warn;const n=po(t,"style");n&&(t.staticStyle=JSON.stringify(Fo(n)));const o=fo(t,"style",!1);o&&(t.styleBinding=o);},genData:function(t){let e="";return t.staticStyle&&(e+=`staticStyle:${t.staticStyle},`),t.styleBinding&&(e+=`style:(${t.styleBinding}),`),e}};let Gr;var Zr={decode:t=>((Gr=Gr||document.createElement("div")).innerHTML=t,Gr.textContent)};const Xr=f("area,base,br,col,embed,frame,hr,img,input,isindex,keygen,link,meta,param,source,track,wbr"),Yr=f("colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr,source"),Qr=f("address,article,aside,base,blockquote,body,caption,col,colgroup,dd,details,dialog,div,dl,dt,fieldset,figcaption,figure,footer,form,h1,h2,h3,h4,h5,h6,head,header,hgroup,hr,html,legend,li,menuitem,meta,optgroup,option,param,rp,rt,source,style,summary,tbody,td,tfoot,th,thead,title,tr,track"),ti=/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/,ei="[a-zA-Z_][\\w\\-\\.]*",ni=`((?:${ei}\\:)?${ei})`,oi=new RegExp(`^<${ni}`),ri=/^\s*(\/?)>/,ii=new RegExp(`^<\\/${ni}[^>]*>`),si=/^<!DOCTYPE [^>]+>/i,ai=/^<!\--/,ci=/^<!\[/,li=f("script,style,textarea",!0),ui={},fi={"&lt;":"<","&gt;":">","&quot;":'"',"&amp;":"&","&#10;":"\n","&#9;":"\t"},pi=/&(?:lt|gt|quot|amp);/g,di=/&(?:lt|gt|quot|amp|#10|#9);/g,hi=f("pre,textarea",!0),mi=(t,e)=>t&&hi(t)&&"\n"===e[0];function yi(t,e){const n=e?di:pi;return t.replace(n,t=>fi[t])}const gi=/^@|^v-on:/,vi=/^v-|^@|^:/,$i=/([\s\S]*?)\s+(?:in|of)\s+([\s\S]*)/,_i=/,([^,\}\]]*)(?:,([^,\}\]]*))?$/,bi=/^\(|\)$/g,wi=/:(.*)$/,Ci=/^:|^v-bind:/,xi=/\.[^.]+/g,ki=g(Zr.decode);let Ai,Oi,Si,Ti,Ni,Ei,ji,Li;function Ii(t,e,n){return {type:1,tag:t,attrsList:e,attrsMap:function(t){const e={};for(let n=0,o=t.length;n<o;n++)e[t[n].name]=t[n].value;return e}(e),parent:n,children:[]}}function Mi(t,e){Ai=e.warn||ro,Ei=e.isPreTag||S,ji=e.mustUseProp||S,Li=e.getTagNamespace||S,Si=io(e.modules,"transformNode"),Ti=io(e.modules,"preTransformNode"),Ni=io(e.modules,"postTransformNode"),Oi=e.delimiters;const n=[],o=!1!==e.preserveWhitespace;let r,i,s=!1,a=!1;function c(t){t.pre&&(s=!1),Ei(t.tag)&&(a=!1);for(let n=0;n<Ni.length;n++)Ni[n](t,e);}return function(t,e){const n=[],o=e.expectHTML,r=e.isUnaryTag||S,i=e.canBeLeftOpenTag||S;let s,a,c=0;for(;t;){if(s=t,a&&li(a)){let n=0;const o=a.toLowerCase(),r=ui[o]||(ui[o]=new RegExp("([\\s\\S]*?)(</"+o+"[^>]*>)","i")),i=t.replace(r,function(t,r,i){return n=i.length,li(o)||"noscript"===o||(r=r.replace(/<!\--([\s\S]*?)-->/g,"$1").replace(/<!\[CDATA\[([\s\S]*?)]]>/g,"$1")),mi(o,r)&&(r=r.slice(1)),e.chars&&e.chars(r),""});c+=t.length-i.length,t=i,p(o,c-n,c);}else{let n,o,r,i=t.indexOf("<");if(0===i){if(ai.test(t)){const n=t.indexOf("--\x3e");if(n>=0){e.shouldKeepComment&&e.comment(t.substring(4,n)),l(n+3);continue}}if(ci.test(t)){const e=t.indexOf("]>");if(e>=0){l(e+2);continue}}const n=t.match(si);if(n){l(n[0].length);continue}const o=t.match(ii);if(o){const t=c;l(o[0].length),p(o[1],t,c);continue}const r=u();if(r){f(r),mi(r.tagName,t)&&l(1);continue}}if(i>=0){for(o=t.slice(i);!(ii.test(o)||oi.test(o)||ai.test(o)||ci.test(o)||(r=o.indexOf("<",1))<0);)i+=r,o=t.slice(i);n=t.substring(0,i),l(i);}i<0&&(n=t,t=""),e.chars&&n&&e.chars(n);}if(t===s){e.chars&&e.chars(t);break}}function l(e){c+=e,t=t.substring(e);}function u(){const e=t.match(oi);if(e){const n={tagName:e[1],attrs:[],start:c};let o,r;for(l(e[0].length);!(o=t.match(ri))&&(r=t.match(ti));)l(r[0].length),n.attrs.push(r);if(o)return n.unarySlash=o[1],l(o[0].length),n.end=c,n}}function f(t){const s=t.tagName,c=t.unarySlash;o&&("p"===a&&Qr(s)&&p(a),i(s)&&a===s&&p(s));const l=r(s)||!!c,u=t.attrs.length,f=new Array(u);for(let n=0;n<u;n++){const o=t.attrs[n],r=o[3]||o[4]||o[5]||"",i="a"===s&&"href"===o[1]?e.shouldDecodeNewlinesForHref:e.shouldDecodeNewlines;f[n]={name:o[1],value:yi(r,i)};}l||(n.push({tag:s,lowerCasedTag:s.toLowerCase(),attrs:f}),a=s),e.start&&e.start(s,f,l,t.start,t.end);}function p(t,o,r){let i,s;if(null==o&&(o=c),null==r&&(r=c),t)for(s=t.toLowerCase(),i=n.length-1;i>=0&&n[i].lowerCasedTag!==s;i--);else i=0;if(i>=0){for(let t=n.length-1;t>=i;t--)e.end&&e.end(n[t].tag,o,r);n.length=i,a=i&&n[i-1].tag;}else"br"===s?e.start&&e.start(t,[],!0,o,r):"p"===s&&(e.start&&e.start(t,[],!1,o,r),e.end&&e.end(t,o,r));}p();}(t,{warn:Ai,expectHTML:e.expectHTML,isUnaryTag:e.isUnaryTag,canBeLeftOpenTag:e.canBeLeftOpenTag,shouldDecodeNewlines:e.shouldDecodeNewlines,shouldDecodeNewlinesForHref:e.shouldDecodeNewlinesForHref,shouldKeepComment:e.comments,start(t,o,l){const u=i&&i.ns||Li(t);K&&"svg"===u&&(o=function(t){const e=[];for(let n=0;n<t.length;n++){const o=t[n];Hi.test(o.name)||(o.name=o.name.replace(Bi,""),e.push(o));}return e}(o));let f=Ii(t,o,i);var p;u&&(f.ns=u),"style"!==(p=f).tag&&("script"!==p.tag||p.attrsMap.type&&"text/javascript"!==p.attrsMap.type)||Y()||(f.forbidden=!0);for(let t=0;t<Ti.length;t++)f=Ti[t](f,e)||f;if(s||(!function(t){null!=po(t,"v-pre")&&(t.pre=!0);}(f),f.pre&&(s=!0)),Ei(f.tag)&&(a=!0),s?function(t){const e=t.attrsList.length;if(e){const n=t.attrs=new Array(e);for(let o=0;o<e;o++)n[o]={name:t.attrsList[o].name,value:JSON.stringify(t.attrsList[o].value)};}else t.pre||(t.plain=!0);}(f):f.processed||(Pi(f),function(t){const e=po(t,"v-if");if(e)t.if=e,Fi(t,{exp:e,block:t});else{null!=po(t,"v-else")&&(t.else=!0);const e=po(t,"v-else-if");e&&(t.elseif=e);}}(f),function(t){null!=po(t,"v-once")&&(t.once=!0);}(f),Di(f,e)),r?n.length||r.if&&(f.elseif||f.else)&&Fi(r,{exp:f.elseif,block:f}):r=f,i&&!f.forbidden)if(f.elseif||f.else)!function(t,e){const n=function(t){let e=t.length;for(;e--;){if(1===t[e].type)return t[e];t.pop();}}(e.children);n&&n.if&&Fi(n,{exp:t.elseif,block:t});}(f,i);else if(f.slotScope){i.plain=!1;const t=f.slotTarget||'"default"';(i.scopedSlots||(i.scopedSlots={}))[t]=f;}else i.children.push(f),f.parent=i;l?c(f):(i=f,n.push(f));},end(){const t=n[n.length-1],e=t.children[t.children.length-1];e&&3===e.type&&" "===e.text&&!a&&t.children.pop(),n.length-=1,i=n[n.length-1],c(t);},chars(t){if(!i)return;if(K&&"textarea"===i.tag&&i.attrsMap.placeholder===t)return;const e=i.children;var n;if(t=a||t.trim()?"script"===(n=i).tag||"style"===n.tag?t:ki(t):o&&e.length?" ":""){let n;!s&&" "!==t&&(n=function(t,e){const n=e?Jr(e):zr;if(!n.test(t))return;const o=[],r=[];let i,s,a,c=n.lastIndex=0;for(;i=n.exec(t);){(s=i.index)>c&&(r.push(a=t.slice(c,s)),o.push(JSON.stringify(a)));const e=no(i[1].trim());o.push(`_s(${e})`),r.push({"@binding":e}),c=s+i[0].length;}return c<t.length&&(r.push(a=t.slice(c)),o.push(JSON.stringify(a))),{expression:o.join("+"),tokens:r}}(t,Oi))?e.push({type:2,expression:n.expression,tokens:n.tokens,text:t}):" "===t&&e.length&&" "===e[e.length-1].text||e.push({type:3,text:t});}},comment(t){i.children.push({type:3,text:t,isComment:!0});}}),r}function Di(t,e){!function(t){const e=fo(t,"key");e&&(t.key=e);}(t),t.plain=!t.key&&!t.attrsList.length,function(t){const e=fo(t,"ref");e&&(t.ref=e,t.refInFor=function(t){let e=t;for(;e;){if(void 0!==e.for)return !0;e=e.parent;}return !1}(t));}(t),function(t){if("slot"===t.tag)t.slotName=fo(t,"name");else{let e;"template"===t.tag?(e=po(t,"scope"),t.slotScope=e||po(t,"slot-scope")):(e=po(t,"slot-scope"))&&(t.slotScope=e);const n=fo(t,"slot");n&&(t.slotTarget='""'===n?'"default"':n,"template"===t.tag||t.slotScope||ao(t,"slot",n));}}(t),function(t){let e;(e=fo(t,"is"))&&(t.component=e);null!=po(t,"inline-template")&&(t.inlineTemplate=!0);}(t);for(let n=0;n<Si.length;n++)t=Si[n](t,e)||t;!function(t){const e=t.attrsList;let n,o,r,i,s,a,c;for(n=0,o=e.length;n<o;n++)if(r=i=e[n].name,s=e[n].value,vi.test(r))if(t.hasBindings=!0,(a=Ri(r))&&(r=r.replace(xi,"")),Ci.test(r))r=r.replace(Ci,""),s=no(s),c=!1,a&&(a.prop&&(c=!0,"innerHtml"===(r=$(r))&&(r="innerHTML")),a.camel&&(r=$(r)),a.sync&&uo(t,`update:${$(r)}`,mo(s,"$event"))),c||!t.component&&ji(t.tag,t.attrsMap.type,r)?so(t,r,s):ao(t,r,s);else if(gi.test(r))r=r.replace(gi,""),uo(t,r,s,a,!1);else{const e=(r=r.replace(vi,"")).match(wi),n=e&&e[1];n&&(r=r.slice(0,-(n.length+1))),lo(t,r,i,s,n,a);}else ao(t,r,JSON.stringify(s)),!t.component&&"muted"===r&&ji(t.tag,t.attrsMap.type,r)&&so(t,r,"true");}(t);}function Pi(t){let e;if(e=po(t,"v-for")){const n=function(t){const e=t.match($i);if(!e)return;const n={};n.for=e[2].trim();const o=e[1].trim().replace(bi,""),r=o.match(_i);r?(n.alias=o.replace(_i,"").trim(),n.iterator1=r[1].trim(),r[2]&&(n.iterator2=r[2].trim())):n.alias=o;return n}(e);n&&k(t,n);}}function Fi(t,e){t.ifConditions||(t.ifConditions=[]),t.ifConditions.push(e);}function Ri(t){const e=t.match(xi);if(e){const t={};return e.forEach(e=>{t[e.slice(1)]=!0;}),t}}const Hi=/^xmlns:NS\d+/,Bi=/^NS\d+:/;function Ui(t){return Ii(t.tag,t.attrsList.slice(),t.parent)}var Vi=[qr,Wr,{preTransformNode:function(t,e){if("input"===t.tag){const n=t.attrsMap;if(!n["v-model"])return;let o;if((n[":type"]||n["v-bind:type"])&&(o=fo(t,"type")),n.type||o||!n["v-bind"]||(o=`(${n["v-bind"]}).type`),o){const n=po(t,"v-if",!0),r=n?`&&(${n})`:"",i=null!=po(t,"v-else",!0),s=po(t,"v-else-if",!0),a=Ui(t);Pi(a),co(a,"type","checkbox"),Di(a,e),a.processed=!0,a.if=`(${o})==='checkbox'`+r,Fi(a,{exp:a.if,block:a});const c=Ui(t);po(c,"v-for",!0),co(c,"type","radio"),Di(c,e),Fi(a,{exp:`(${o})==='radio'`+r,block:c});const l=Ui(t);return po(l,"v-for",!0),co(l,":type",o),Di(l,e),Fi(a,{exp:n,block:l}),i?a.else=!0:s&&(a.elseif=s),a}}}}];const zi={expectHTML:!0,modules:Vi,directives:{model:function(t,e,n){const o=e.value,r=e.modifiers,i=t.tag,s=t.attrsMap.type;if(t.component)return ho(t,o,r),!1;if("select"===i)!function(t,e,n){let o=`var $$selectedVal = ${'Array.prototype.filter.call($event.target.options,function(o){return o.selected}).map(function(o){var val = "_value" in o ? o._value : o.value;'+`return ${n&&n.number?"_n(val)":"val"}})`};`;o=`${o} ${mo(e,"$event.target.multiple ? $$selectedVal : $$selectedVal[0]")}`,uo(t,"change",o,null,!0);}(t,o,r);else if("input"===i&&"checkbox"===s)!function(t,e,n){const o=n&&n.number,r=fo(t,"value")||"null",i=fo(t,"true-value")||"true",s=fo(t,"false-value")||"false";so(t,"checked",`Array.isArray(${e})`+`?_i(${e},${r})>-1`+("true"===i?`:(${e})`:`:_q(${e},${i})`)),uo(t,"change",`var $$a=${e},`+"$$el=$event.target,"+`$$c=$$el.checked?(${i}):(${s});`+"if(Array.isArray($$a)){"+`var $$v=${o?"_n("+r+")":r},`+"$$i=_i($$a,$$v);"+`if($$el.checked){$$i<0&&(${mo(e,"$$a.concat([$$v])")})}`+`else{$$i>-1&&(${mo(e,"$$a.slice(0,$$i).concat($$a.slice($$i+1))")})}`+`}else{${mo(e,"$$c")}}`,null,!0);}(t,o,r);else if("input"===i&&"radio"===s)!function(t,e,n){const o=n&&n.number;let r=fo(t,"value")||"null";so(t,"checked",`_q(${e},${r=o?`_n(${r})`:r})`),uo(t,"change",mo(e,r),null,!0);}(t,o,r);else if("input"===i||"textarea"===i)!function(t,e,n){const o=t.attrsMap.type,{lazy:r,number:i,trim:s}=n||{},a=!r&&"range"!==o,c=r?"change":"range"===o?Oo:"input";let l="$event.target.value";s&&(l="$event.target.value.trim()"),i&&(l=`_n(${l})`);let u=mo(e,l);a&&(u=`if($event.target.composing)return;${u}`),so(t,"value",`(${e})`),uo(t,c,u,null,!0),(s||i)&&uo(t,"blur","$forceUpdate()");}(t,o,r);else if(!D.isReservedTag(i))return ho(t,o,r),!1;return !0},text:function(t,e){e.value&&so(t,"textContent",`_s(${e.value})`);},html:function(t,e){e.value&&so(t,"innerHTML",`_s(${e.value})`);}},isPreTag:t=>"pre"===t,isUnaryTag:Xr,mustUseProp:mn,canBeLeftOpenTag:Yr,isReservedTag:Tn,getTagNamespace:Nn,staticKeys:function(t){return t.reduce((t,e)=>t.concat(e.staticKeys||[]),[]).join(",")}(Vi)};let Ki,Ji;const qi=g(function(t){return f("type,tag,attrsList,attrsMap,plain,parent,children,attrs"+(t?","+t:""))});function Wi(t,e){t&&(Ki=qi(e.staticKeys||""),Ji=e.isReservedTag||S,function t(e){e.static=function(t){if(2===t.type)return !1;if(3===t.type)return !0;return !(!t.pre&&(t.hasBindings||t.if||t.for||p(t.tag)||!Ji(t.tag)||function(t){for(;t.parent;){if("template"!==(t=t.parent).tag)return !1;if(t.for)return !0}return !1}(t)||!Object.keys(t).every(Ki)))}(e);if(1===e.type){if(!Ji(e.tag)&&"slot"!==e.tag&&null==e.attrsMap["inline-template"])return;for(let n=0,o=e.children.length;n<o;n++){const o=e.children[n];t(o),o.static||(e.static=!1);}if(e.ifConditions)for(let n=1,o=e.ifConditions.length;n<o;n++){const o=e.ifConditions[n].block;t(o),o.static||(e.static=!1);}}}(t),function t(e,n){if(1===e.type){if((e.static||e.once)&&(e.staticInFor=n),e.static&&e.children.length&&(1!==e.children.length||3!==e.children[0].type))return void(e.staticRoot=!0);if(e.staticRoot=!1,e.children)for(let o=0,r=e.children.length;o<r;o++)t(e.children[o],n||!!e.for);if(e.ifConditions)for(let o=1,r=e.ifConditions.length;o<r;o++)t(e.ifConditions[o].block,n);}}(t,!1));}const Gi=/^([\w$_]+|\([^)]*?\))\s*=>|^function\s*\(/,Zi=/^[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*|\['[^']*?']|\["[^"]*?"]|\[\d+]|\[[A-Za-z_$][\w$]*])*$/,Xi={esc:27,tab:9,enter:13,space:32,up:38,left:37,right:39,down:40,delete:[8,46]},Yi={esc:["Esc","Escape"],tab:"Tab",enter:"Enter",space:" ",up:["Up","ArrowUp"],left:["Left","ArrowLeft"],right:["Right","ArrowRight"],down:["Down","ArrowDown"],delete:["Backspace","Delete"]},Qi=t=>`if(${t})return null;`,ts={stop:"$event.stopPropagation();",prevent:"$event.preventDefault();",self:Qi("$event.target !== $event.currentTarget"),ctrl:Qi("!$event.ctrlKey"),shift:Qi("!$event.shiftKey"),alt:Qi("!$event.altKey"),meta:Qi("!$event.metaKey"),left:Qi("'button' in $event && $event.button !== 0"),middle:Qi("'button' in $event && $event.button !== 1"),right:Qi("'button' in $event && $event.button !== 2")};function es(t,e){let n=e?"nativeOn:{":"on:{";for(const e in t)n+=`"${e}":${ns(e,t[e])},`;return n.slice(0,-1)+"}"}function ns(t,e){if(!e)return "function(){}";if(Array.isArray(e))return `[${e.map(e=>ns(t,e)).join(",")}]`;const n=Zi.test(e.value),o=Gi.test(e.value);if(e.modifiers){let t="",r="";const i=[];for(const t in e.modifiers)if(ts[t])r+=ts[t],Xi[t]&&i.push(t);else if("exact"===t){const t=e.modifiers;r+=Qi(["ctrl","shift","alt","meta"].filter(e=>!t[e]).map(t=>`$event.${t}Key`).join("||"));}else i.push(t);return i.length&&(t+=function(t){return `if(!('button' in $event)&&${t.map(os).join("&&")})return null;`}(i)),r&&(t+=r),`function($event){${t}${n?`return ${e.value}($event)`:o?`return (${e.value})($event)`:e.value}}`}return n||o?e.value:`function($event){${e.value}}`}function os(t){const e=parseInt(t,10);if(e)return `$event.keyCode!==${e}`;const n=Xi[t],o=Yi[t];return "_k($event.keyCode,"+`${JSON.stringify(t)},`+`${JSON.stringify(n)},`+"$event.key,"+`${JSON.stringify(o)}`+")"}var rs={on:function(t,e){t.wrapListeners=(t=>`_g(${t},${e.value})`);},bind:function(t,e){t.wrapData=(n=>`_b(${n},'${t.tag}',${e.value},${e.modifiers&&e.modifiers.prop?"true":"false"}${e.modifiers&&e.modifiers.sync?",true":""})`);},cloak:O};class is{constructor(t){this.options=t,this.warn=t.warn||ro,this.transforms=io(t.modules,"transformCode"),this.dataGenFns=io(t.modules,"genData"),this.directives=k(k({},rs),t.directives);const e=t.isReservedTag||S;this.maybeComponent=(t=>!(e(t.tag)&&!t.component)),this.onceId=0,this.staticRenderFns=[],this.pre=!1;}}function ss(t,e){const n=new is(e);return {render:`with(this){return ${t?as(t,n):'_c("div")'}}`,staticRenderFns:n.staticRenderFns}}function as(t,e){if(t.parent&&(t.pre=t.pre||t.parent.pre),t.staticRoot&&!t.staticProcessed)return cs(t,e);if(t.once&&!t.onceProcessed)return ls(t,e);if(t.for&&!t.forProcessed)return function(t,e,n,o){const r=t.for,i=t.alias,s=t.iterator1?`,${t.iterator1}`:"",a=t.iterator2?`,${t.iterator2}`:"";return t.forProcessed=!0,`${o||"_l"}((${r}),`+`function(${i}${s}${a}){`+`return ${(n||as)(t,e)}`+"})"}(t,e);if(t.if&&!t.ifProcessed)return us(t,e);if("template"!==t.tag||t.slotTarget||e.pre){if("slot"===t.tag)return function(t,e){const n=t.slotName||'"default"',o=ds(t,e);let r=`_t(${n}${o?`,${o}`:""}`;const i=t.attrs&&`{${t.attrs.map(t=>`${$(t.name)}:${t.value}`).join(",")}}`,s=t.attrsMap["v-bind"];!i&&!s||o||(r+=",null");i&&(r+=`,${i}`);s&&(r+=`${i?"":",null"},${s}`);return r+")"}(t,e);{let n;if(t.component)n=function(t,e,n){const o=e.inlineTemplate?null:ds(e,n,!0);return `_c(${t},${fs(e,n)}${o?`,${o}`:""})`}(t.component,t,e);else{let o;(!t.plain||t.pre&&e.maybeComponent(t))&&(o=fs(t,e));const r=t.inlineTemplate?null:ds(t,e,!0);n=`_c('${t.tag}'${o?`,${o}`:""}${r?`,${r}`:""})`;}for(let o=0;o<e.transforms.length;o++)n=e.transforms[o](t,n);return n}}return ds(t,e)||"void 0"}function cs(t,e){t.staticProcessed=!0;const n=e.pre;return t.pre&&(e.pre=t.pre),e.staticRenderFns.push(`with(this){return ${as(t,e)}}`),e.pre=n,`_m(${e.staticRenderFns.length-1}${t.staticInFor?",true":""})`}function ls(t,e){if(t.onceProcessed=!0,t.if&&!t.ifProcessed)return us(t,e);if(t.staticInFor){let n="",o=t.parent;for(;o;){if(o.for){n=o.key;break}o=o.parent;}return n?`_o(${as(t,e)},${e.onceId++},${n})`:as(t,e)}return cs(t,e)}function us(t,e,n,o){return t.ifProcessed=!0,function t(e,n,o,r){if(!e.length)return r||"_e()";const i=e.shift();return i.exp?`(${i.exp})?${s(i.block)}:${t(e,n,o,r)}`:`${s(i.block)}`;function s(t){return o?o(t,n):t.once?ls(t,n):as(t,n)}}(t.ifConditions.slice(),e,n,o)}function fs(t,e){let n="{";const o=function(t,e){const n=t.directives;if(!n)return;let o,r,i,s,a="directives:[",c=!1;for(o=0,r=n.length;o<r;o++){i=n[o],s=!0;const r=e.directives[i.name];r&&(s=!!r(t,i,e.warn)),s&&(c=!0,a+=`{name:"${i.name}",rawName:"${i.rawName}"${i.value?`,value:(${i.value}),expression:${JSON.stringify(i.value)}`:""}${i.arg?`,arg:"${i.arg}"`:""}${i.modifiers?`,modifiers:${JSON.stringify(i.modifiers)}`:""}},`);}if(c)return a.slice(0,-1)+"]"}(t,e);o&&(n+=o+","),t.key&&(n+=`key:${t.key},`),t.ref&&(n+=`ref:${t.ref},`),t.refInFor&&(n+="refInFor:true,"),t.pre&&(n+="pre:true,"),t.component&&(n+=`tag:"${t.tag}",`);for(let o=0;o<e.dataGenFns.length;o++)n+=e.dataGenFns[o](t);if(t.attrs&&(n+=`attrs:{${ys(t.attrs)}},`),t.props&&(n+=`domProps:{${ys(t.props)}},`),t.events&&(n+=`${es(t.events,!1)},`),t.nativeEvents&&(n+=`${es(t.nativeEvents,!0)},`),t.slotTarget&&!t.slotScope&&(n+=`slot:${t.slotTarget},`),t.scopedSlots&&(n+=`${function(t,e){return `scopedSlots:_u([${Object.keys(t).map(n=>ps(n,t[n],e)).join(",")}])`}(t.scopedSlots,e)},`),t.model&&(n+=`model:{value:${t.model.value},callback:${t.model.callback},expression:${t.model.expression}},`),t.inlineTemplate){const o=function(t,e){const n=t.children[0];if(1===n.type){const t=ss(n,e.options);return `inlineTemplate:{render:function(){${t.render}},staticRenderFns:[${t.staticRenderFns.map(t=>`function(){${t}}`).join(",")}]}`}}(t,e);o&&(n+=`${o},`);}return n=n.replace(/,$/,"")+"}",t.wrapData&&(n=t.wrapData(n)),t.wrapListeners&&(n=t.wrapListeners(n)),n}function ps(t,e,n){if(e.for&&!e.forProcessed)return function(t,e,n){const o=e.for,r=e.alias,i=e.iterator1?`,${e.iterator1}`:"",s=e.iterator2?`,${e.iterator2}`:"";return e.forProcessed=!0,`_l((${o}),`+`function(${r}${i}${s}){`+`return ${ps(t,e,n)}`+"})"}(t,e,n);return `{key:${t},fn:${`function(${String(e.slotScope)}){`+`return ${"template"===e.tag?e.if?`(${e.if})?${ds(e,n)||"undefined"}:undefined`:ds(e,n)||"undefined":as(e,n)}}`}}`}function ds(t,e,n,o,r){const i=t.children;if(i.length){const t=i[0];if(1===i.length&&t.for&&"template"!==t.tag&&"slot"!==t.tag){const r=n&&e.maybeComponent(t)?",1":"";return `${(o||as)(t,e)}${r}`}const s=n?function(t,e){let n=0;for(let o=0;o<t.length;o++){const r=t[o];if(1===r.type){if(hs(r)||r.ifConditions&&r.ifConditions.some(t=>hs(t.block))){n=2;break}(e(r)||r.ifConditions&&r.ifConditions.some(t=>e(t.block)))&&(n=1);}}return n}(i,e.maybeComponent):0,a=r||ms;return `[${i.map(t=>a(t,e)).join(",")}]${s?`,${s}`:""}`}}function hs(t){return void 0!==t.for||"template"===t.tag||"slot"===t.tag}function ms(t,e){return 1===t.type?as(t,e):3===t.type&&t.isComment?(o=t,`_e(${JSON.stringify(o.text)})`):`_v(${2===(n=t).type?n.expression:gs(JSON.stringify(n.text))})`;var n,o;}function ys(t){let e="";for(let n=0;n<t.length;n++){const o=t[n];e+=`"${o.name}":${gs(o.value)},`;}return e.slice(0,-1)}function gs(t){return t.replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function vs(t,e){try{return new Function(t)}catch(n){return e.push({err:n,code:t}),O}}const $s=(_s=function(t,e){const n=Mi(t.trim(),e);!1!==e.optimize&&Wi(n,e);const o=ss(n,e);return {ast:n,render:o.render,staticRenderFns:o.staticRenderFns}},function(t){function e(e,n){const o=Object.create(t),r=[],i=[];if(o.warn=((t,e)=>{(e?i:r).push(t);}),n){n.modules&&(o.modules=(t.modules||[]).concat(n.modules)),n.directives&&(o.directives=k(Object.create(t.directives||null),n.directives));for(const t in n)"modules"!==t&&"directives"!==t&&(o[t]=n[t]);}const s=_s(e,o);return s.errors=r,s.tips=i,s}return {compile:e,compileToFunctions:function(t){const e=Object.create(null);return function(n,o,r){(o=k({},o)).warn,delete o.warn;const i=o.delimiters?String(o.delimiters)+n:n;if(e[i])return e[i];const s=t(n,o),a={},c=[];return a.render=vs(s.render,c),a.staticRenderFns=s.staticRenderFns.map(t=>vs(t,c)),e[i]=a}}(e)}});var _s;const{compile:bs,compileToFunctions:ws}=$s(zi);let Cs;function xs(t){return (Cs=Cs||document.createElement("div")).innerHTML=t?'<a href="\n"/>':'<div a="\n"/>',Cs.innerHTML.indexOf("&#10;")>0}const ks=!!B&&xs(!1),As=!!B&&xs(!0),Os=g(t=>{const e=Ln(t);return e&&e.innerHTML}),Ss=rn.prototype.$mount;rn.prototype.$mount=function(t,e){if((t=t&&Ln(t))===document.body||t===document.documentElement)return this;const n=this.$options;if(!n.render){let e=n.template;if(e)if("string"==typeof e)"#"===e.charAt(0)&&(e=Os(e));else{if(!e.nodeType)return this;e=e.innerHTML;}else t&&(e=function(t){if(t.outerHTML)return t.outerHTML;{const e=document.createElement("div");return e.appendChild(t.cloneNode(!0)),e.innerHTML}}(t));if(e){const{render:t,staticRenderFns:o}=ws(e,{shouldDecodeNewlines:ks,shouldDecodeNewlinesForHref:As,delimiters:n.delimiters,comments:n.comments},this);n.render=t,n.staticRenderFns=o;}}return Ss.call(this,t,e)},rn.compile=ws;

  function greenlet(n){var e=0,t={},a=new Worker("data:,$$="+n+";onmessage="+function(n){Promise.resolve(n.data[1]).then(function(n){return $$.apply($$,n)}).then(function(e){postMessage([n.data[0],0,e],[e].filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));},function(e){postMessage([n.data[0],1,""+e]);});});return a.onmessage=function(n){t[n.data[0]][n.data[1]](n.data[2]),t[n.data[0]]=null;},function(n){return n=[].slice.call(arguments),new Promise(function(){t[++e]=arguments,a.postMessage([e,n],n.filter(function(n){return n instanceof ArrayBuffer||n instanceof MessagePort||n instanceof ImageBitmap}));})}}

  const calculateAnimationBounds = greenlet(function (cgsEntry = [], frames = [], doTrim = false) {
    let xMin = Infinity, yMin = Infinity, xMax = -Infinity, yMax = -Infinity;
    cgsEntry.forEach(cgsFrame => {
      const frameData = frames[cgsFrame.frameIndex];
      const xOffset = Math.abs(cgsFrame.xOffset) || 0;
      const yOffset = Math.abs(cgsFrame.yOffset) || 0;
      frameData.parts.forEach(part => {
        // bounds are x +- width and y +- height
        const w = part.img.width, h = part.img.height;
        xMin = Math.min(xMin, part.position.x - (doTrim ? 0 : w) - xOffset);
        yMin = Math.min(yMin, part.position.y - (doTrim ? 0 : h) - yOffset);

        xMax = Math.max(xMax, part.position.x + w + xOffset);
        yMax = Math.max(yMax, part.position.y + h + yOffset);
      });
    });
    let left = 0, top = 0,
      width = xMax - xMin,
      height = yMax - yMin;
    if (!doTrim) {
      left = -(xMax + xMin) / 4; // center horizontally
      top = -(yMax + yMin) / 4; // center vertically
    } else {
      left = -(xMax + xMin) / 2;
      top = -(yMax + yMin) / 2;
    }
    return {
      x: [xMin, xMax],
      y: [yMin, yMax],
      w: width,
      h: height,
      offset: { // equivalent to padding
        left,
        top,
      },
    };
  });

  class FrameMaker {
    constructor (cggCsv = []) {
      this._frames = this._processCgg(cggCsv);
      this._animations = {};
    }

    // very specific (but main use case) for the frame maker: animate Brave Frontier units
    static async fromBraveFrontierUnit (id = '10011', server = 'gl', doTrim = false) {
      const serverUrls = {
        eu: 'http://static-bravefrontier.gumi-europe.net/content/',
        gl: 'http://2.cdn.bravefrontier.gumi.sg/content/',
        jp: 'http://cdn.android.brave.a-lim.jp/',
      };
      const filepaths = {
        cgg: 'unit/cgg/',
        cgs: 'unit/cgs/',
        anime: 'unit/img/'
      };
      const animationTypes = ['idle', 'atk', 'move', server === 'eu' && 'skill'].filter(v => v);
      const loadCsv = (path) => fetch(path)
        .then(r => {
          if (r.status !== 200) {
            throw new Error(`Fetch error: ${r.status} - ${r.statusText}`);
          }
          return r.text();
        }).then(r => r.split('\n').map(line => line.split(',')));

      const baseUrl = serverUrls[server];
      if (!baseUrl) {
        throw new Error(`Unknown server [${server}]`);
      }

      // start querying for data simultaneously
      const imagePromise = new Promise((fulfill, reject) => {
        const spritesheet = new Image();
        spritesheet.onload = () => fulfill(spritesheet);
        spritesheet.onerror = spritesheet.onabort = reject;
        spritesheet.src = `/getImage/${encodeURIComponent(baseUrl + filepaths.anime + `unit_anime_${id}.png`)}`;
      });

      const cgsCsv = {};
      const cgsPromises = animationTypes.map(type => {
        return loadCsv(`/get/${encodeURIComponent(baseUrl + filepaths.cgs + `unit_${type}_cgs_${id}.csv`)}`)
          .then(csv => { cgsCsv[type] = csv; })
          .catch(err => {
            // eslint-disable-next-line no-console
            console.warn(`Skipping CGS [${type}] due to error`, err);
            return;
          });
      });

      const maker = await loadCsv(`/get/${encodeURIComponent(baseUrl + filepaths.cgg + `unit_cgg_${id}.csv`)}`)
        .then(csv => new FrameMaker(csv));

      // add found cgs animations to maker
      await Promise.all(cgsPromises);
      for (const key in cgsCsv) {
        await maker.addAnimation(key, cgsCsv[key], doTrim);
      }

      // return the spritesheet and FrameMaker instance
      return imagePromise.then(spritesheet => ({
        maker,
        spritesheet,
      }));
    }

    _cggLineToEntry (frameLine = [], index = -1) {
      const entry = {
        anchorType: +frameLine[0],
        partCount: +frameLine[1],
        parts: [],
      };

      let curIndex = 2, partCount = 0;
      const partIsValid = (part = {}) => {
        for (const field in part) {
          if (field !== 'position' && field !== 'img' && isNaN(part[field])) {
            return false;
          }
        }
        return true;
      };

      // parse each part in the line
      while (partCount < entry.partCount) {
        const part = {
          position: { // origin is middle
            x: +frameLine[curIndex++],
            y: +frameLine[curIndex++],
          },
          flipType: +frameLine[curIndex++],
          blendMode: +frameLine[curIndex++],
          opacity: +frameLine[curIndex++],
          rotate: +frameLine[curIndex++],
          img: { // origin is top left
            x: +frameLine[curIndex++],
            y: +frameLine[curIndex++],
            width: +frameLine[curIndex++],
            height: +frameLine[curIndex++],
          },
          pageId: +frameLine[curIndex++],
        };
        if (partIsValid(part)) {
          partCount++;
          entry.parts.push(part);
        } else {
          console.warn('Encountered NaN part', part, index);
        }
      }
      return entry;
    }

    _processCgg (cggCsv = []) {
      return cggCsv
        .filter(frame => frame.length >= 2) // filter out empty frames
        .map((frame, i) => this._cggLineToEntry(frame, i));
    }

    _processCgs (cgsCsv = []) {
      return cgsCsv.map(frame => ({
        frameIndex: +frame[0], // same index in cgg
        xOffset: +frame[1],
        yOffset: +frame[2],
        frameDelay: +frame[3],
      })).filter((frame, i, fullArr) => {
        const isValid = Object.values(frame).every(v => !isNaN(v));
        if (!isValid) {
          console.warn('Ignoring NaN CGS line', frame, i, fullArr);
        }
        return isValid;
      }); // filter out unparseable frames
    }

    async addAnimation (key = 'name', csv = [], doTrim) {
      const cgsFrames = this._processCgs(csv);
      const lowercaseKey = key.toLowerCase();
      const trim = doTrim === undefined ?
        (!lowercaseKey.includes('atk') && !lowercaseKey.includes('xbb')) :
        doTrim;
      const bounds = await calculateAnimationBounds(
        cgsFrames,
        this._frames,
        trim,
      );

      this._animations[key] = {
        frames: cgsFrames,
        bounds,
        trimmed: trim,
        cachedCanvases: {},
      };
    }

    getAnimation (key = 'name') {
      return this._animations[key];
    }

    get loadedAnimations () {
      const preferredOrder = ['idle', 'move', 'atk', 'skill'];
      return Object.keys(this._animations).sort((a, b) => {
        // order so that preferred order comes first and unknown comes last
        const [aIndex, bIndex] = [preferredOrder.indexOf(a), preferredOrder.indexOf(b)];
        if (aIndex === bIndex) {
          return a < b ? -1 : 1;
        } else if (aIndex >= 0 && bIndex >= 0) {
          return aIndex - bIndex;
        } else {
          return aIndex < 0 ? 1 : -1;
        }
      });
    }

    _waitForIdleFrame () {
      return new Promise(fulfill => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(fulfill);
        } else {
          setTimeout(fulfill, 1);
        }
      });
    }

    async getFrame({
      spritesheets = [], // array of img elements containing sprite sheets
      animationName = 'name',
      animationIndex = -1,
      referenceCanvas, // referenced for dimensions on first draw, otherwise optional
      forceRedraw = false,
      drawFrameBounds = false,
    }) {
      const animationEntry = this._animations[animationName];
      if (!animationEntry) {
        throw new Error(`No animation entry found with name ${animationName}`);
      }

      const { bounds, cachedCanvases } = animationEntry;
      if (cachedCanvases[animationIndex] && !forceRedraw) {
        // console.debug(`using cached frame [cgs:${animationIndex}]`);
        return cachedCanvases[animationIndex];
      }

      const cgsFrame = animationEntry.frames[animationIndex];
      const cggFrame = this._frames[cgsFrame.frameIndex];
      // console.debug(`drawing frame [cgs:${animationIndex}, cgg:${cgsFrame.frameIndex}]`, cggFrame);

      const tempCanvasSize = (spritesheets.reduce((acc, val) => Math.max(acc, val.width, val.height), Math.max(bounds.w + Math.abs(bounds.offset.left) * 2, bounds.h + Math.abs(bounds.offset.top) * 2))) * 2;
      // used as a temp canvas for rotating/flipping parts
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = tempCanvasSize;
      tempCanvas.height = tempCanvasSize;

      // final frame rendered here, to be cached
      const frameCanvas = document.createElement('canvas');
      if (referenceCanvas) {
        frameCanvas.width = referenceCanvas.width;
        frameCanvas.height = referenceCanvas.height;
      } else {
        frameCanvas.width = bounds.w;
        frameCanvas.height = bounds.h;
      }
      frameCanvas.dataset.delay = cgsFrame.frameDelay;

      const origin = {
        x: frameCanvas.width / 2,
        y: frameCanvas.height / 2,
      };
      const tempContext = tempCanvas.getContext('2d');
      const frameContext = frameCanvas.getContext('2d');
      // render each part in reverse order onto the frameCanvas
      for (let partIndex = cggFrame.parts.length - 1; partIndex >= 0; --partIndex) {
        const part = cggFrame.parts[partIndex];
        await this._waitForIdleFrame(); // only generate frames between idle periods
        const sourceWidth = part.img.width, sourceHeight = part.img.height;
        tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempContext.globalAlpha = part.opacity / 100;

        const flipX = part.flipType === 1 || part.flipType === 3;
        const flipY = part.flipType === 2 || part.flipType === 3;

        // draw part onto center of part canvas
        tempContext.save(); 
        let tempX = tempCanvas.width / 2 - sourceWidth / 2,
          tempY = tempCanvas.height / 2 - sourceHeight / 2;
        if (flipX || flipY) {
          tempContext.translate(flipX ? sourceWidth : 0, flipY ? sourceHeight : 0);
          tempContext.scale(flipX ? -1 : 1, flipY ? -1 : 1);
          tempX -= (flipX ? tempCanvas.width - sourceWidth : 0);
          tempY -= (flipY ? tempCanvas.height - sourceHeight : 0);
        }
        // from spritesheet to part canvas
        tempContext.drawImage(
          spritesheets[part.pageId],
          part.img.x, part.img.y, sourceWidth, sourceHeight,
          tempX, tempY,
          sourceWidth, sourceHeight,
        );
        tempContext.restore();

        // blend code based off of this: http://pastebin.com/vXc0yNRh
        if (part.blendMode === 1) {
          // await this._waitForIdleFrame(); // only generate frames between idle periods
          const imgData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const pixelData = imgData.data;
          for (let p = 0; p < pixelData.length; p += 4) {
            let [r, g, b, a] = [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]];
            if (a > 0) {
              const multiplier = 1 + (a * part.opacity / 100) / 255.0;
              r = Math.min(255, Math.floor(r * multiplier));
              g = Math.min(255, Math.floor(g * multiplier));
              b = Math.min(255, Math.floor(b * multiplier));
              a = Math.floor(((r + g + b) / 3) * part.opacity / 100);

              [pixelData[p], pixelData[p + 1], pixelData[p + 2], pixelData[p + 3]] = [r, g, b, a];
            }
          }
          tempContext.putImageData(imgData, 0, 0);
        }

        // put part canvas on document body for debugging
        // const bodyCanvas = document.createElement('canvas');
        // bodyCanvas.width = tempCanvas.width;
        // bodyCanvas.height = tempCanvas.height;
        // bodyCanvas.dataset.cgsIndex = cggFrame.parts.length - 1;
        // const bodyContext = bodyCanvas.getContext('2d');
        // bodyContext.globalAlpha = part.opacity / 100;
        // bodyContext.drawImage(tempCanvas, 0, 0);
        // bodyContext.beginPath();
        // bodyContext.rect(tempCanvas.width / 2 - sourceWidth / 2, tempCanvas.height / 2 - sourceHeight / 2, sourceWidth, sourceHeight);
        // bodyContext.stroke();
        // bodyContext.fillStyle = 'red';
        // bodyContext.beginPath();
        // bodyContext.ellipse(
        //   tempCanvas.width / 2, tempCanvas.height / 2,
        //   5, 5, Math.PI / 2, 0, 2 * Math.PI
        // );
        // bodyContext.fill();
        // document.body.appendChild(bodyCanvas);

        // copy part result to frame canvas
        // await this._waitForIdleFrame(); // only generate frames between idle periods
        frameContext.save();
        const targetX = origin.x + part.position.x + sourceWidth / 2 - tempCanvasSize / 2,
          targetY = origin.y + part.position.y + sourceHeight / 2 - tempCanvasSize / 2;
        if (part.rotate !== 0) {
          // console.debug('rotating', part.rotate);
          frameContext.translate(origin.x + part.position.x + sourceWidth / 2, origin.y + part.position.y + sourceHeight / 2);
          frameContext.rotate(-part.rotate * Math.PI / 180);
          frameContext.translate(-(origin.x + part.position.x + sourceWidth / 2), -(origin.y + part.position.y + sourceHeight / 2));
        }
        frameContext.drawImage(
          tempCanvas,
          0, 0, // start at top left of temp canvas
          tempCanvas.width, tempCanvas.height,
          targetX + bounds.offset.left, targetY + bounds.offset.top,
          tempCanvas.width, tempCanvas.height,
        );
        frameContext.restore();
      }
      if (drawFrameBounds) {
        console.debug('drawing frame bounds', bounds, origin);
        frameContext.save();
        frameContext.strokeStyle = 'red';
        frameContext.beginPath();
        if (!animationEntry.trimmed) {
          frameContext.rect(
            origin.x + bounds.x[0] + bounds.offset.left * 3,
            origin.y + bounds.y[0] + bounds.offset.top * 3,
            bounds.w - bounds.offset.left * 2, bounds.h - bounds.offset.top * 2,
          );
        } else {
          frameContext.rect(
            origin.x + bounds.x[0] + bounds.offset.left,
            origin.y + bounds.y[0] + bounds.offset.top,
            bounds.w, bounds.h,
          );
        }
        frameContext.stroke();
        frameContext.restore();
      }
      cachedCanvases[animationIndex] = frameCanvas;
      tempCanvas.remove();
      console.debug(bounds, frameCanvas);
      return frameCanvas;
    }

    async drawFrame ({
      spritesheets = [], // array of img elements containing sprite sheets
      animationName = 'name', animationIndex = -1,
      targetCanvas = document.createElement('canvas'),
      forceRedraw = false,
      drawFrameBounds = false,
    }) {
      const frameCanvas = await this.getFrame({
        spritesheets,
        animationName,
        animationIndex,
        referenceCanvas: targetCanvas,
        forceRedraw,
        drawFrameBounds,
      });
      targetCanvas.getContext('2d').drawImage(frameCanvas, 0, 0);
    }
  }

  class App {
    constructor () {
      this._frameMaker = null;
      this._targetCanvas = null;
      this._frameIndex = 0;
      this._spritesheets = [];
      this._currentAnimation = null;

      this._vueData = {
        isLoading: false,
        animationReady: false,
        unitId: '',
        activeServer: 'gl',
        doTrim: false,
        formMessage: 'Input your options above then press "Generate" to start generating an animation.',
        errorOccurred: false,
        activeAnimation: '',
        animationNames: [],
        isPlaying: false,
      };
      this._vueApp = new rn({
        el: '#app',
        data: this._vueData,
        watch: {
          activeAnimation: (newValue) => {
            this._currentAnimation = newValue;
            if (newValue) {
              this.renderFrame(0);
            }
          },
        },
        methods: {
          generateAnimation: () => this.generateAnimation(),
          getFrameIndex: () => this._frameIndex,
          renderFrame: (...args) => this.renderFrame(...args),
        },
      });

      this._targetCanvas = document.querySelector('canvas#target');
    }

    async init () {
      const targetCanvas = document.querySelector('canvas#target');
      targetCanvas.width = 2000;
      targetCanvas.height = 2000;
      this._targetCanvas = targetCanvas;

      const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(850438, 'gl');
      this._frameMaker = maker;
      this._spritesheets = [spritesheet];

      this._currentAnimation = 'move';
    }

    get _formIsValid () {
      return this._vueData.unitId.length > 0 && !isNaN(this._vueData.unitId) && ['gl', 'eu', 'jp'].includes(this._vueData.activeServer);
    }

    _setLog (message = '', isLoading) {
      // eslint-disable-next-line no-console
      console.debug('[LOG]', message);
      this._vueData.formMessage = message;
      if (isLoading !== undefined) {
        this._vueData.isLoading = !!isLoading;
      }
    }

    async generateAnimation () {
      if (this._vueData.isLoading) {
        return;
      }
      console.debug(this._vueData);
      if (!this._formIsValid) {
        this._vueData.errorOccurred = true;
        this._vueData.formMessage = '<b>ERROR:</b> Form input isn\'t valid. Please try again.';
        return;
      }

      this._vueData.animationReady = false;
      this._vueData.errorOccurred = false;
      this._vueData.activeAnimation = '';
      this._frameIndex = 0;
      this._setLog('Loading spritesheets and CSVs...', true);
      await this._vueApp.$nextTick();
      // load animation data
      try {
        const { maker, spritesheet } = await FrameMaker.fromBraveFrontierUnit(this._vueData.unitId, this._vueData.activeServer, this._vueData.doTrim);
        this._frameMaker = maker;
        this._spritesheets = [spritesheet];
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        this._vueData.errorOccurred = true;
        this._setLog(`Error getting animation data for ${this._vueData.unitId}`, false);
        return;
      }

      // generate the animations
      const animationNames = this._frameMaker.loadedAnimations;
      console.debug(animationNames);
      this._vueApp.animationNames = animationNames;
      try {
        for (const name of animationNames) {
          const animation = this._frameMaker.getAnimation(name);
          const numFrames = animation.frames.length;
          for (let i = 0; i < numFrames; ++i) {
            this._setLog(`Generating frames for ${name} [${(i+1).toString().padStart(numFrames.toString().length, '0')}/${numFrames}]...`);
            // await this._waitForIdleFrame();
            await this._frameMaker.getFrame({
              spritesheets: this._spritesheets,
              animationName: name,
              animationIndex: i,
              drawFrameBounds: false, // set true for debugging
            });
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        this._vueData.errorOccurred = true;
        this._setLog(`Error getting animation data for ${this._vueData.unitId}`, false);
        return;
      }

      // notify that animations are finished
      this._vueData.animationReady = true;
      this._vueData.activeAnimation = animationNames[0];
      this._setLog(`Successfully generated animation for ${this._vueData.unitId}`, false);
    }

    async renderFrame (index, options = {}) {
      const animation = this._frameMaker.getAnimation(this._currentAnimation);
      let frameToRender = !isNaN(index) ? +index : this._frameIndex;
      if (frameToRender < 0) {
        frameToRender += animation.frames.length;
      } else if (frameToRender >= animation.frames.length) {
        frameToRender -= animation.frames.length;
      }
      console.debug(frameToRender, this._frameIndex);
      const isValidIndex = frameToRender < animation.frames.length && frameToRender >= 0;

      const frame = await this._frameMaker.getFrame({
        spritesheets: this._spritesheets,
        animationName: this._currentAnimation,
        animationIndex: isValidIndex ? frameToRender : 0,
        ...options,
      });
      console.debug(index, animation, frame);
      if (this._targetCanvas.width !== frame.width) {
        this._targetCanvas.width = frame.width;
      }
      if (this._targetCanvas.height !== frame.height) {
        this._targetCanvas.height = frame.height;
      }
      const context = this._targetCanvas.getContext('2d');
      context.clearRect(0, 0, this._targetCanvas.width, this._targetCanvas.height);
      context.drawImage(frame, 0, 0);

      // mark center of canvas
      // context.save();
      // context.fillStyle = 'red';
      // context.beginPath();
      // context.ellipse(this._targetCanvas.width / 2, this._targetCanvas.height / 2, 3, 3, Math.PI / 2, 0, Math.PI * 2);
      // context.fill();
      // context.restore();
    
      this._frameIndex = (frameToRender + 1 < animation.frames.length && frameToRender >= 0) ? frameToRender + 1 : 0;
    }

    get frameMaker () {
      return this._frameMaker;
    }
  }

  return App;

}());
//# sourceMappingURL=app-bundle.js.map
